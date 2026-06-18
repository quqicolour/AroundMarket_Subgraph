import { BigInt, dataSource, log } from "@graphprotocol/graph-ts"
import {
  OrderCancelled as OrderCancelledEvent,
  OrderFilled as OrderFilledEvent,
  OrderPlaced as OrderPlacedEvent
} from "../generated/templates/OrderBook/OrderBook"
import { Market, Order, OrderFill } from "../generated/schema"
import {
  collateralVolume,
  ensureUser,
  eventId,
  orderIdString,
  outcomeFromIsYes,
  ZERO
} from "./helpers"

function currentMarketId(): string {
  return dataSource.context().getString("marketEntityId")
}

export function handleOrderPlaced(event: OrderPlacedEvent): void {
  let market = Market.load(event.params.marketId.toString())
  if (market == null) {
    log.warning("OrderPlaced skipped: missing market marketId={}, orderId={}", [
      event.params.marketId.toString(),
      event.params.id.toString()
    ])
    return
  }

  let maker = ensureUser(event.params.maker)
  let order = new Order(orderIdString(event.params.marketId, event.params.id))
  order.orderId = event.params.id
  order.market = market.id
  order.marketId = event.params.marketId
  order.orderBook = event.address
  order.maker = event.params.maker
  order.makerUser = maker.id
  order.isYes = event.params.isYes
  order.outcome = outcomeFromIsYes(event.params.isYes)
  order.price = event.params.price
  order.amount = event.params.amount
  order.filled = ZERO
  order.remaining = event.params.amount
  order.status = "ACTIVE"
  order.kind = "COLLATERAL_BUY"
  order.shareOutcome = null
  order.createdAtBlock = event.block.number
  order.createdAtTimestamp = event.block.timestamp
  order.createdTxHash = event.transaction.hash
  order.updatedAtBlock = event.block.number
  order.updatedAtTimestamp = event.block.timestamp
  order.updatedTxHash = event.transaction.hash
  order.cancelledAtBlock = null
  order.cancelledAtTimestamp = null
  order.cancelledTxHash = null
  order.save()

  maker.orderCount = maker.orderCount.plus(BigInt.fromI32(1))
  maker.save()

  market.orderCount = market.orderCount.plus(BigInt.fromI32(1))
  market.activeOrderCount = market.activeOrderCount.plus(BigInt.fromI32(1))
  market.save()
}

export function handleOrderCancelled(event: OrderCancelledEvent): void {
  let id = orderIdString(BigInt.fromString(currentMarketId()), event.params.id)
  let order = Order.load(id)
  if (order == null) {
    log.warning("OrderCancelled skipped: missing order marketId={}, orderId={}", [
      currentMarketId(),
      event.params.id.toString()
    ])
    return
  }

  let wasActive = order.status == "ACTIVE" || order.status == "PARTIALLY_FILLED"
  order.status = "CANCELLED"
  order.remaining = order.amount.minus(order.filled)
  order.updatedAtBlock = event.block.number
  order.updatedAtTimestamp = event.block.timestamp
  order.updatedTxHash = event.transaction.hash
  order.cancelledAtBlock = event.block.number
  order.cancelledAtTimestamp = event.block.timestamp
  order.cancelledTxHash = event.transaction.hash
  order.save()

  if (wasActive) {
    let market = Market.load(order.market)
    if (market != null && market.activeOrderCount.gt(ZERO)) {
      market.activeOrderCount = market.activeOrderCount.minus(BigInt.fromI32(1))
      market.save()
    }
  }
}

export function handleOrderFilled(event: OrderFilledEvent): void {
  let id = orderIdString(BigInt.fromString(currentMarketId()), event.params.orderId)
  let order = Order.load(id)
  if (order == null) {
    log.warning("OrderFilled skipped: missing order marketId={}, orderId={}", [
      currentMarketId(),
      event.params.orderId.toString()
    ])
    return
  }

  let fill = new OrderFill(eventId(event))
  fill.order = order.id
  fill.orderId = order.orderId
  fill.market = order.market
  fill.marketId = order.marketId
  fill.maker = order.maker
  fill.makerUser = order.makerUser
  fill.isYes = order.isYes
  fill.outcome = order.outcome
  fill.price = event.params.fillPrice
  fill.amount = event.params.fillAmount
  fill.collateralVolume = collateralVolume(event.params.fillPrice, event.params.fillAmount)
  fill.blockNumber = event.block.number
  fill.blockTimestamp = event.block.timestamp
  fill.transactionHash = event.transaction.hash
  fill.logIndex = event.logIndex
  fill.save()

  let wasActive = order.status == "ACTIVE" || order.status == "PARTIALLY_FILLED"
  order.filled = order.filled.plus(event.params.fillAmount)
  if (order.filled.ge(order.amount)) {
    order.filled = order.amount
    order.remaining = ZERO
    order.status = "FILLED"
  } else {
    order.remaining = order.amount.minus(order.filled)
    order.status = "PARTIALLY_FILLED"
  }
  order.updatedAtBlock = event.block.number
  order.updatedAtTimestamp = event.block.timestamp
  order.updatedTxHash = event.transaction.hash
  order.save()

  if (wasActive && order.status == "FILLED") {
    let market = Market.load(order.market)
    if (market != null && market.activeOrderCount.gt(ZERO)) {
      market.activeOrderCount = market.activeOrderCount.minus(BigInt.fromI32(1))
      market.save()
    }
  }
}
