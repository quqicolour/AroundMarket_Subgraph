import { BigInt, ByteArray, Bytes, crypto, dataSource, log } from "@graphprotocol/graph-ts"
import {
  OrderCancelled as OrderCancelledEvent,
  OrderFilled as OrderFilledEvent,
  OrderPlaced as OrderPlacedEvent
} from "../generated/templates/OrderBook/OrderBook"
import { LimitOrder, Market, MarketCandle, OrderCancellation } from "../generated/schema"

const ONE_E18 = BigInt.fromString("1000000000000000000")
const ONE = BigInt.fromI32(1)

function marketEntityId(): string {
  return dataSource.context().getString("marketEntityId")
}

function entityBytesId(value: string): Bytes {
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(value)))
}

function orderEntityId(marketId: BigInt, orderId: BigInt): Bytes {
  return entityBytesId("order-" + marketId.toString() + "-" + orderId.toString())
}

function currentOrderEntityId(orderId: BigInt): Bytes {
  return entityBytesId("order-" + marketEntityId() + "-" + orderId.toString())
}

function candleSideId(isYes: boolean): string {
  return isYes ? "YES" : "NO"
}

function candleId(
  marketId: BigInt,
  isYes: boolean,
  interval: string,
  periodStart: BigInt
): string {
  return marketId.toString() + "-" + candleSideId(isYes) + "-" + interval + "-" + periodStart.toString()
}

function candleEntityId(
  marketId: BigInt,
  isYes: boolean,
  interval: string,
  periodStart: BigInt
): Bytes {
  return entityBytesId("candle-" + candleId(marketId, isYes, interval, periodStart))
}

function bucketStart(timestamp: BigInt, intervalSeconds: BigInt): BigInt {
  return timestamp.div(intervalSeconds).times(intervalSeconds)
}

function updateCandle(
  order: LimitOrder,
  event: OrderFilledEvent,
  interval: string,
  intervalSeconds: BigInt
): void {
  let periodStart = bucketStart(event.block.timestamp, intervalSeconds)
  let id = candleEntityId(order.marketId, order.isYes, interval, periodStart)
  let candle = MarketCandle.load(id)
  let price = event.params.fillPrice
  let shareVolume = event.params.fillAmount
  let volume = shareVolume.times(price).div(ONE_E18)

  if (candle == null) {
    candle = new MarketCandle(id)
    candle.market = order.market
    candle.marketId = order.marketId
    candle.isYes = order.isYes
    candle.interval = interval
    candle.intervalSeconds = intervalSeconds
    candle.periodStart = periodStart
    candle.open = price
    candle.high = price
    candle.low = price
    candle.close = price
    candle.volume = volume
    candle.shareVolume = shareVolume
    candle.tradeCount = ONE
    candle.firstBlockNumber = event.block.number
    candle.firstTimestamp = event.block.timestamp
    candle.firstTxHash = event.transaction.hash
  } else {
    if (price.gt(candle.high)) {
      candle.high = price
    }
    if (price.lt(candle.low)) {
      candle.low = price
    }
    candle.close = price
    candle.volume = candle.volume.plus(volume)
    candle.shareVolume = candle.shareVolume.plus(shareVolume)
    candle.tradeCount = candle.tradeCount.plus(ONE)
  }

  candle.lastBlockNumber = event.block.number
  candle.lastTimestamp = event.block.timestamp
  candle.lastTxHash = event.transaction.hash
  candle.save()
}

function updateAllCandles(order: LimitOrder, event: OrderFilledEvent): void {
  updateCandle(order, event, "ONE_MINUTE", BigInt.fromI32(60))
  updateCandle(order, event, "FIFTEEN_MINUTES", BigInt.fromI32(900))
  updateCandle(order, event, "THIRTY_MINUTES", BigInt.fromI32(1800))
  updateCandle(order, event, "ONE_HOUR", BigInt.fromI32(3600))
  updateCandle(order, event, "FOUR_HOURS", BigInt.fromI32(14400))
  updateCandle(order, event, "TWELVE_HOURS", BigInt.fromI32(43200))
  updateCandle(order, event, "ONE_DAY", BigInt.fromI32(86400))
}

export function handleOrderPlaced(event: OrderPlacedEvent): void {
  let marketId = event.params.marketId.toString()
  let market = Market.load(marketId)
  if (market == null) {
    log.warning("Skip OrderPlaced: market entity is missing. marketId={}, orderId={}, tx={}", [
      marketId,
      event.params.id.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  let entity = new LimitOrder(
    orderEntityId(event.params.marketId, event.params.id)
  )

  entity.orderId = event.params.id
  entity.market = market.id
  entity.marketId = event.params.marketId
  entity.orderBook = event.address
  entity.maker = event.params.maker
  entity.isYes = event.params.isYes
  entity.price = event.params.price
  entity.amount = event.params.amount
  entity.filled = BigInt.zero()
  entity.remaining = event.params.amount
  entity.status = "ACTIVE"
  entity.kind = "COLLATERAL_BUY"
  entity.createdAtBlock = event.block.number
  entity.createdAtTimestamp = event.block.timestamp
  entity.createdTxHash = event.transaction.hash
  entity.updatedAtBlock = event.block.number
  entity.updatedAtTimestamp = event.block.timestamp
  entity.updatedTxHash = event.transaction.hash

  entity.save()
}

export function handleOrderCancelled(event: OrderCancelledEvent): void {
  let id = currentOrderEntityId(event.params.id)
  let entity = LimitOrder.load(id)
  if (entity == null) {
    log.warning("Skip OrderCancelled: order entity is missing. marketId={}, orderId={}, tx={}", [
      marketEntityId(),
      event.params.id.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  entity.status = "CANCELLED"
  entity.remaining = entity.amount.minus(entity.filled)
  entity.updatedAtBlock = event.block.number
  entity.updatedAtTimestamp = event.block.timestamp
  entity.updatedTxHash = event.transaction.hash
  entity.cancelledAtBlock = event.block.number
  entity.cancelledAtTimestamp = event.block.timestamp
  entity.cancelledTxHash = event.transaction.hash
  entity.save()

  let cancellation = new OrderCancellation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  cancellation.order = entity.id
  cancellation.orderId = entity.orderId
  cancellation.market = entity.market
  cancellation.marketId = entity.marketId
  cancellation.maker = entity.maker
  cancellation.blockNumber = event.block.number
  cancellation.blockTimestamp = event.block.timestamp
  cancellation.transactionHash = event.transaction.hash
  cancellation.save()
}

export function handleOrderFilled(event: OrderFilledEvent): void {
  let entity = LimitOrder.load(currentOrderEntityId(event.params.orderId))
  if (entity == null) {
    log.warning("Skip OrderFilled: order entity is missing. marketId={}, orderId={}, tx={}", [
      marketEntityId(),
      event.params.orderId.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  let market = Market.load(entity.market)
  if (market == null) {
    log.warning("Skip OrderFilled: market entity is missing. marketId={}, orderId={}, tx={}", [
      entity.market,
      event.params.orderId.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  updateAllCandles(entity, event)

  entity.filled = entity.filled.plus(event.params.fillAmount)
  if (entity.filled.ge(entity.amount)) {
    entity.filled = entity.amount
    entity.remaining = BigInt.zero()
    entity.status = "FILLED"
  } else {
    entity.remaining = entity.amount.minus(entity.filled)
    entity.status = "PARTIALLY_FILLED"
  }

  entity.updatedAtBlock = event.block.number
  entity.updatedAtTimestamp = event.block.timestamp
  entity.updatedTxHash = event.transaction.hash
  entity.save()
}
