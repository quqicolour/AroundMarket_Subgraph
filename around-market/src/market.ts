import { BigInt, dataSource, log } from "@graphprotocol/graph-ts"
import {
  OrderFilled as OrderFilledEvent,
  Redeemed as RedeemedEvent,
  ShareSellOrderPlaced as ShareSellOrderPlacedEvent
} from "../generated/templates/Market/Market"
import { Market, Order, Trade } from "../generated/schema"
import {
  collateralVolume,
  ensureUser,
  eventId,
  orderIdString,
  outcomeFromIsYes,
  updateAllCandles
} from "./helpers"

function currentMarketId(): string {
  return dataSource.context().getString("marketEntityId")
}

export function handleShareSellOrderPlaced(event: ShareSellOrderPlacedEvent): void {
  let id = orderIdString(BigInt.fromString(currentMarketId()), event.params.orderId)
  let order = Order.load(id)
  if (order == null) {
    log.warning("ShareSellOrderPlaced skipped: missing order marketId={}, orderId={}", [
      currentMarketId(),
      event.params.orderId.toString()
    ])
    return
  }

  order.kind = "SHARE_SELL"
  order.shareOutcome = outcomeFromIsYes(event.params.isYes)
  order.updatedAtBlock = event.block.number
  order.updatedAtTimestamp = event.block.timestamp
  order.updatedTxHash = event.transaction.hash
  order.save()
}

export function handleOrderFilled(event: OrderFilledEvent): void {
  let market = Market.load(currentMarketId())
  if (market == null) {
    log.warning("Market OrderFilled skipped: missing market marketId={}", [currentMarketId()])
    return
  }

  let taker = ensureUser(event.params.taker)
  let volume = collateralVolume(event.params.avgPrice, event.params.filled)

  let trade = new Trade(eventId(event))
  trade.market = market.id
  trade.marketId = market.marketId
  trade.taker = event.params.taker
  trade.takerUser = taker.id
  trade.isYes = event.params.isYes
  trade.outcome = outcomeFromIsYes(event.params.isYes)
  trade.filled = event.params.filled
  trade.avgPrice = event.params.avgPrice
  trade.collateralVolume = volume
  trade.totalFee = null
  trade.blockNumber = event.block.number
  trade.blockTimestamp = event.block.timestamp
  trade.transactionHash = event.transaction.hash
  trade.logIndex = event.logIndex
  trade.save()

  taker.tradeCount = taker.tradeCount.plus(BigInt.fromI32(1))
  taker.collateralVolume = taker.collateralVolume.plus(volume)
  taker.save()

  market.tradeCount = market.tradeCount.plus(BigInt.fromI32(1))
  market.volume = market.volume.plus(volume)
  market.shareVolume = market.shareVolume.plus(event.params.filled)
  market.latestPrice = event.params.avgPrice
  if (event.params.isYes) {
    market.yesVolume = market.yesVolume.plus(volume)
    market.latestYesPrice = event.params.avgPrice
  } else {
    market.noVolume = market.noVolume.plus(volume)
    market.latestNoPrice = event.params.avgPrice
  }
  market.save()

  updateAllCandles(market, event.params.isYes, event.params.avgPrice, event.params.filled, event)
}

export function handleRedeemedNotice(event: RedeemedEvent): void {
  event
}
