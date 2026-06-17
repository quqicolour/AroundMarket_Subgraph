import {
  FeeRecipientUpdated as FeeRecipientUpdatedEvent,
  LuckyFeeUpdated as LuckyFeeUpdatedEvent,
  MarketCreated as MarketCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  PredictionMarketFactory,
  TemplatesUpdated as TemplatesUpdatedEvent
} from "../generated/PredictionMarketFactory/PredictionMarketFactory"
import { DataSourceContext, log } from "@graphprotocol/graph-ts"
import {
  FeeRecipientUpdated,
  LuckyFeeUpdated,
  Market,
  MarketCondition,
  MarketCreated,
  OwnershipTransferred,
  PlatformFeeUpdated,
  TemplatesUpdated
} from "../generated/schema"
import {
  Market as MarketTemplate,
  OrderBook as OrderBookTemplate
} from "../generated/templates"

export function handleFeeRecipientUpdated(
  event: FeeRecipientUpdatedEvent
): void {
  let entity = new FeeRecipientUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRecipient = event.params.newRecipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLuckyFeeUpdated(event: LuckyFeeUpdatedEvent): void {
  let entity = new LuckyFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMarketCreated(event: MarketCreatedEvent): void {
  let entity = new MarketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.market = event.params.market
  entity.collateral = event.params.collateral
  entity.conditionId = event.params.conditionId
  entity.question = event.params.question
  entity.dataSource = event.params.dataSource

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let factory = PredictionMarketFactory.bind(event.address)
  let marketResult = factory.try_getMarket(event.params.marketId)
  if (marketResult.reverted) {
    log.warning("Skip Market entity creation: getMarket reverted. marketId={}, tx={}", [
      event.params.marketId.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  let data = marketResult.value
  let marketEntity = new Market(event.params.marketId.toString())
  marketEntity.marketId = event.params.marketId
  marketEntity.creator = data.creator
  marketEntity.market = data.market
  marketEntity.collateral = data.collateral
  marketEntity.conditionTokens = data.conditionTokens
  marketEntity.orderBook = data.orderBook
  marketEntity.matchingEngine = data.matchingEngine
  marketEntity.conditionId = data.conditionId
  marketEntity.startTime = data.startTime
  marketEntity.endTime = data.endTime
  marketEntity.resolved = data.resolved
  marketEntity.fee = data.fee
  marketEntity.question = data.question
  marketEntity.dataSource = data.dataSource
  marketEntity.createdAtBlock = event.block.number
  marketEntity.createdAtTimestamp = event.block.timestamp
  marketEntity.createdTxHash = event.transaction.hash
  marketEntity.save()

  let condition = new MarketCondition(data.conditionId)
  condition.market = marketEntity.id
  condition.marketId = event.params.marketId
  condition.save()

  let context = new DataSourceContext()
  context.setString("marketEntityId", marketEntity.id)
  context.setString("marketId", event.params.marketId.toString())

  MarketTemplate.createWithContext(data.market, context)
  OrderBookTemplate.createWithContext(data.orderBook, context)
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlatformFeeUpdated(event: PlatformFeeUpdatedEvent): void {
  let entity = new PlatformFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newFee = event.params.newFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTemplatesUpdated(event: TemplatesUpdatedEvent): void {
  let entity = new TemplatesUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orderBook = event.params.orderBook
  entity.matchingEngine = event.params.matchingEngine
  entity.market = event.params.market

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
