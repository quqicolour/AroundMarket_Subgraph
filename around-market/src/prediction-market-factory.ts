import {
  FeeRecipientUpdated as FeeRecipientUpdatedEvent,
  LuckyFeeUpdated as LuckyFeeUpdatedEvent,
  MarketCreated as MarketCreatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PlatformFeeUpdated as PlatformFeeUpdatedEvent,
  TemplatesUpdated as TemplatesUpdatedEvent
} from "../generated/PredictionMarketFactory/PredictionMarketFactory"
import {
  FeeRecipientUpdated,
  LuckyFeeUpdated,
  MarketCreated,
  OwnershipTransferred,
  PlatformFeeUpdated,
  TemplatesUpdated
} from "../generated/schema"

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
