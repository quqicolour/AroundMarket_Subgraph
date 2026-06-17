import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  ApprovalForAll,
  ConditionCreation,
  OwnershipTransferred,
  PayoutReported,
  PositionSplit,
  PositionsMerged,
  PositionsRedeemed,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/ConditionalTokens/ConditionalTokens"

export function createApprovalForAllEvent(
  account: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createConditionCreationEvent(
  conditionId: Bytes,
  oracle: Address,
  questionId: Bytes,
  outcomeSlotCount: BigInt
): ConditionCreation {
  let conditionCreationEvent = changetype<ConditionCreation>(newMockEvent())

  conditionCreationEvent.parameters = new Array()

  conditionCreationEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  conditionCreationEvent.parameters.push(
    new ethereum.EventParam("oracle", ethereum.Value.fromAddress(oracle))
  )
  conditionCreationEvent.parameters.push(
    new ethereum.EventParam(
      "questionId",
      ethereum.Value.fromFixedBytes(questionId)
    )
  )
  conditionCreationEvent.parameters.push(
    new ethereum.EventParam(
      "outcomeSlotCount",
      ethereum.Value.fromUnsignedBigInt(outcomeSlotCount)
    )
  )

  return conditionCreationEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPayoutReportedEvent(
  conditionId: Bytes,
  payoutNumerators: Array<BigInt>,
  winningPositionId: Bytes
): PayoutReported {
  let payoutReportedEvent = changetype<PayoutReported>(newMockEvent())

  payoutReportedEvent.parameters = new Array()

  payoutReportedEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  payoutReportedEvent.parameters.push(
    new ethereum.EventParam(
      "payoutNumerators",
      ethereum.Value.fromUnsignedBigIntArray(payoutNumerators)
    )
  )
  payoutReportedEvent.parameters.push(
    new ethereum.EventParam(
      "winningPositionId",
      ethereum.Value.fromFixedBytes(winningPositionId)
    )
  )

  return payoutReportedEvent
}

export function createPositionSplitEvent(
  conditionId: Bytes,
  holder: Address,
  amount: BigInt
): PositionSplit {
  let positionSplitEvent = changetype<PositionSplit>(newMockEvent())

  positionSplitEvent.parameters = new Array()

  positionSplitEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  positionSplitEvent.parameters.push(
    new ethereum.EventParam("holder", ethereum.Value.fromAddress(holder))
  )
  positionSplitEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return positionSplitEvent
}

export function createPositionsMergedEvent(
  conditionId: Bytes,
  holder: Address,
  amount: BigInt
): PositionsMerged {
  let positionsMergedEvent = changetype<PositionsMerged>(newMockEvent())

  positionsMergedEvent.parameters = new Array()

  positionsMergedEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  positionsMergedEvent.parameters.push(
    new ethereum.EventParam("holder", ethereum.Value.fromAddress(holder))
  )
  positionsMergedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return positionsMergedEvent
}

export function createPositionsRedeemedEvent(
  conditionId: Bytes,
  owner: Address,
  indexSet: BigInt
): PositionsRedeemed {
  let positionsRedeemedEvent = changetype<PositionsRedeemed>(newMockEvent())

  positionsRedeemedEvent.parameters = new Array()

  positionsRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  positionsRedeemedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  positionsRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "indexSet",
      ethereum.Value.fromUnsignedBigInt(indexSet)
    )
  )

  return positionsRedeemedEvent
}

export function createTransferBatchEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent())

  transferBatchEvent.parameters = new Array()

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "values",
      ethereum.Value.fromUnsignedBigIntArray(values)
    )
  )

  return transferBatchEvent
}

export function createTransferSingleEvent(
  operator: Address,
  from: Address,
  to: Address,
  id: BigInt,
  value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent())

  transferSingleEvent.parameters = new Array()

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferSingleEvent
}

export function createURIEvent(value: string, id: BigInt): URI {
  let uriEvent = changetype<URI>(newMockEvent())

  uriEvent.parameters = new Array()

  uriEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromString(value))
  )
  uriEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )

  return uriEvent
}
