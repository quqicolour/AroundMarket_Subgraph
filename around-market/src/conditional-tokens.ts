import {
  ApprovalForAll as ApprovalForAllEvent,
  ConditionCreation as ConditionCreationEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PayoutReported as PayoutReportedEvent,
  PositionSplit as PositionSplitEvent,
  PositionsMerged as PositionsMergedEvent,
  PositionsRedeemed as PositionsRedeemedEvent,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  URI as URIEvent,
} from "../generated/ConditionalTokens/ConditionalTokens"
import {
  ApprovalForAll,
  ConditionCreation,
  Market,
  MarketCondition,
  OwnershipTransferred,
  PayoutReported,
  PositionSplit,
  PositionsMerged,
  PositionsRedeemed,
  TransferBatch,
  TransferSingle,
  URI,
} from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleConditionCreation(event: ConditionCreationEvent): void {
  let entity = new ConditionCreation(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.conditionId = event.params.conditionId
  entity.oracle = event.params.oracle
  entity.questionId = event.params.questionId
  entity.outcomeSlotCount = event.params.outcomeSlotCount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let condition = MarketCondition.load(event.params.conditionId)
  if (condition == null) {
    return
  }

  let market = Market.load(condition.market)
  if (market == null) {
    return
  }

  market.resolved = true
  market.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent,
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePayoutReported(event: PayoutReportedEvent): void {
  let entity = new PayoutReported(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.conditionId = event.params.conditionId
  entity.payoutNumerators = event.params.payoutNumerators
  entity.winningPositionId = event.params.winningPositionId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionSplit(event: PositionSplitEvent): void {
  let entity = new PositionSplit(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.conditionId = event.params.conditionId
  entity.holder = event.params.holder
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionsMerged(event: PositionsMergedEvent): void {
  let entity = new PositionsMerged(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.conditionId = event.params.conditionId
  entity.holder = event.params.holder
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePositionsRedeemed(event: PositionsRedeemedEvent): void {
  let entity = new PositionsRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.conditionId = event.params.conditionId
  entity.owner = event.params.owner
  entity.indexSet = event.params.indexSet

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let entity = new TransferBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.ids = event.params.ids
  entity.values = event.params.values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let entity = new TransferSingle(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.operator = event.params.operator
  entity.from = event.params.from
  entity.to = event.params.to
  entity.internal_id = event.params.id
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleURI(event: URIEvent): void {
  let entity = new URI(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.value = event.params.value
  entity.internal_id = event.params.id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
