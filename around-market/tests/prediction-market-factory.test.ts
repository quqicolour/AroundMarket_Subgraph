import { assert, clearStore, describe, test } from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { handleFeeRecipientUpdated } from "../src/prediction-market-factory"
import { createFeeRecipientUpdatedEvent } from "./prediction-market-factory-utils"

describe("PredictionMarketFactory business index", () => {
  test("fee recipient updates protocol aggregate", () => {
    let recipient = Address.fromString("0x0000000000000000000000000000000000000001")
    let event = createFeeRecipientUpdatedEvent(recipient)

    handleFeeRecipientUpdated(event)

    assert.entityCount("Protocol", 1)
    assert.fieldEquals("Protocol", "around-market", "feeRecipient", recipient.toHexString())

    clearStore()
  })
})
