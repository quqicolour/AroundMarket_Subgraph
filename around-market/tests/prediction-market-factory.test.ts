import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { FeeRecipientUpdated } from "../generated/schema"
import { FeeRecipientUpdated as FeeRecipientUpdatedEvent } from "../generated/PredictionMarketFactory/PredictionMarketFactory"
import { handleFeeRecipientUpdated } from "../src/prediction-market-factory"
import { createFeeRecipientUpdatedEvent } from "./prediction-market-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let newRecipient = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newFeeRecipientUpdatedEvent =
      createFeeRecipientUpdatedEvent(newRecipient)
    handleFeeRecipientUpdated(newFeeRecipientUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("FeeRecipientUpdated created and stored", () => {
    assert.entityCount("FeeRecipientUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FeeRecipientUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newRecipient",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
