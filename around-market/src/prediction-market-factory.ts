import { BigInt, DataSourceContext, log } from "@graphprotocol/graph-ts"
import {
  FeeRecipientUpdated as FeeRecipientUpdatedEvent,
  LuckyFeeUpdated as LuckyFeeUpdatedEvent,
  MarketCreated as MarketCreatedEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  PredictionMarketFactory,
  TemplatesUpdated as TemplatesUpdatedEvent
} from "../generated/PredictionMarketFactory/PredictionMarketFactory"
import { ConditionalTokens } from "../generated/PredictionMarketFactory/ConditionalTokens"
import { Market, PositionToken } from "../generated/schema"
import {
  MatchingEngine as MatchingEngineTemplate,
  Market as MarketTemplate,
  OrderBook as OrderBookTemplate
} from "../generated/templates"
import {
  ensureProtocol,
  marketIdString,
  outcomeFromIndex,
  ZERO
} from "./helpers"

function registerPositionToken(
  tokenId: BigInt,
  market: Market,
  outcomeIndex: BigInt
): void {
  let token = new PositionToken(tokenId.toString())
  token.tokenId = tokenId
  token.market = market.id
  token.marketId = market.marketId
  token.conditionId = market.conditionId
  token.outcomeIndex = outcomeIndex
  token.outcome = outcomeFromIndex(outcomeIndex)
  token.save()
}

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let factory = PredictionMarketFactory.bind(event.address)
  let marketResult = factory.try_getMarket(event.params.marketId)
  if (marketResult.reverted) {
    log.warning("getMarket reverted for marketId={}, tx={}", [
      event.params.marketId.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  let data = marketResult.value
  let id = marketIdString(event.params.marketId)
  let market = new Market(id)
  market.marketId = event.params.marketId
  market.creator = data.creator
  market.market = data.market
  market.collateral = data.collateral
  market.conditionalTokens = data.conditionTokens
  market.settlementManager = null
  market.orderBook = data.orderBook
  market.matchingEngine = data.matchingEngine
  market.conditionId = data.conditionId
  market.startTime = data.startTime
  market.endTime = data.endTime
  market.fee = data.fee
  market.question = data.question
  market.dataSource = data.dataSource
  market.resolved = data.resolved
  market.payoutNumerators = null
  market.payoutDenominator = null
  market.winningOutcome = null
  market.createdAtBlock = event.block.number
  market.createdAtTimestamp = event.block.timestamp
  market.createdTxHash = event.transaction.hash
  market.resolvedAtBlock = null
  market.resolvedAtTimestamp = null
  market.resolvedTxHash = null
  market.orderCount = ZERO
  market.activeOrderCount = ZERO
  market.tradeCount = ZERO
  market.volume = ZERO
  market.shareVolume = ZERO
  market.yesVolume = ZERO
  market.noVolume = ZERO
  market.latestPrice = null
  market.latestYesPrice = null
  market.latestNoPrice = null
  market.save()

  let ct = ConditionalTokens.bind(data.conditionTokens)
  let yesId = ct.try_getPositionId(data.conditionId, BigInt.fromI32(0))
  if (!yesId.reverted) {
    let yesTokenId = BigInt.fromUnsignedBytes(yesId.value)
    market.yesPositionId = yesTokenId
    registerPositionToken(yesTokenId, market, BigInt.fromI32(0))
  }
  let noId = ct.try_getPositionId(data.conditionId, BigInt.fromI32(1))
  if (!noId.reverted) {
    let noTokenId = BigInt.fromUnsignedBytes(noId.value)
    market.noPositionId = noTokenId
    registerPositionToken(noTokenId, market, BigInt.fromI32(1))
  }
  market.save()

  let protocol = ensureProtocol(event.address, event)
  protocol.conditionalTokens = data.conditionTokens
  protocol.marketCount = protocol.marketCount.plus(BigInt.fromI32(1))
  protocol.save()

  let context = new DataSourceContext()
  context.setString("marketId", event.params.marketId.toString())
  context.setString("marketEntityId", id)

  MarketTemplate.createWithContext(data.market, context)
  OrderBookTemplate.createWithContext(data.orderBook, context)
  MatchingEngineTemplate.createWithContext(data.matchingEngine, context)
}

export function handleFeeRecipientUpdated(event: FeeRecipientUpdatedEvent): void {
  let protocol = ensureProtocol(event.address, event)
  protocol.feeRecipient = event.params.newRecipient
  protocol.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let protocol = ensureProtocol(event.address, event)
  protocol.platformFee = event.params.newFee
  protocol.save()
}

export function handleLuckyFeeUpdated(event: LuckyFeeUpdatedEvent): void {
  let protocol = ensureProtocol(event.address, event)
  protocol.luckyFee = event.params.newFee
  protocol.save()
}

export function handleTemplatesUpdated(event: TemplatesUpdatedEvent): void {
  let protocol = ensureProtocol(event.address, event)
  protocol.save()
}
