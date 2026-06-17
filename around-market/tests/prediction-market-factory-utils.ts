import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  FeeRecipientUpdated,
  LuckyFeeUpdated,
  MarketCreated,
  OwnershipTransferred,
  PlatformFeeUpdated,
  TemplatesUpdated
} from "../generated/PredictionMarketFactory/PredictionMarketFactory"

export function createFeeRecipientUpdatedEvent(
  newRecipient: Address
): FeeRecipientUpdated {
  let feeRecipientUpdatedEvent = changetype<FeeRecipientUpdated>(newMockEvent())

  feeRecipientUpdatedEvent.parameters = new Array()

  feeRecipientUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRecipient",
      ethereum.Value.fromAddress(newRecipient)
    )
  )

  return feeRecipientUpdatedEvent
}

export function createLuckyFeeUpdatedEvent(newFee: BigInt): LuckyFeeUpdated {
  let luckyFeeUpdatedEvent = changetype<LuckyFeeUpdated>(newMockEvent())

  luckyFeeUpdatedEvent.parameters = new Array()

  luckyFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return luckyFeeUpdatedEvent
}

export function createMarketCreatedEvent(
  marketId: BigInt,
  market: Address,
  collateral: Address,
  conditionId: Bytes,
  question: string,
  dataSource: string
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("market", ethereum.Value.fromAddress(market))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "collateral",
      ethereum.Value.fromAddress(collateral)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "conditionId",
      ethereum.Value.fromFixedBytes(conditionId)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("question", ethereum.Value.fromString(question))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("dataSource", ethereum.Value.fromString(dataSource))
  )

  return marketCreatedEvent
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

export function createPlatformFeeUpdatedEvent(
  newFee: BigInt
): PlatformFeeUpdated {
  let platformFeeUpdatedEvent = changetype<PlatformFeeUpdated>(newMockEvent())

  platformFeeUpdatedEvent.parameters = new Array()

  platformFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  )

  return platformFeeUpdatedEvent
}

export function createTemplatesUpdatedEvent(
  orderBook: Address,
  matchingEngine: Address,
  market: Address
): TemplatesUpdated {
  let templatesUpdatedEvent = changetype<TemplatesUpdated>(newMockEvent())

  templatesUpdatedEvent.parameters = new Array()

  templatesUpdatedEvent.parameters.push(
    new ethereum.EventParam("orderBook", ethereum.Value.fromAddress(orderBook))
  )
  templatesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "matchingEngine",
      ethereum.Value.fromAddress(matchingEngine)
    )
  )
  templatesUpdatedEvent.parameters.push(
    new ethereum.EventParam("market", ethereum.Value.fromAddress(market))
  )

  return templatesUpdatedEvent
}
