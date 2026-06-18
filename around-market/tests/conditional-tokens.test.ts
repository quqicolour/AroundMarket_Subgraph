import { assert, clearStore, describe, test } from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { Market, PositionToken } from "../generated/schema"
import { handleTransferSingle } from "../src/conditional-tokens"
import { createTransferSingleEvent } from "./conditional-tokens-utils"

function seedMarket(): void {
  let market = new Market("1")
  market.marketId = BigInt.fromI32(1)
  market.creator = Address.fromString("0x0000000000000000000000000000000000000011")
  market.market = Address.fromString("0x0000000000000000000000000000000000000012")
  market.collateral = Address.fromString("0x0000000000000000000000000000000000000013")
  market.conditionalTokens = Address.fromString("0x0000000000000000000000000000000000000014")
  market.settlementManager = null
  market.orderBook = Address.fromString("0x0000000000000000000000000000000000000015")
  market.matchingEngine = Address.fromString("0x0000000000000000000000000000000000000016")
  market.conditionId = Bytes.fromHexString("0x0100000000000000000000000000000000000000000000000000000000000000")
  market.yesPositionId = BigInt.fromI32(101)
  market.noPositionId = BigInt.fromI32(102)
  market.startTime = BigInt.fromI32(1)
  market.endTime = BigInt.fromI32(2)
  market.fee = BigInt.zero()
  market.question = "question"
  market.dataSource = "source"
  market.resolved = false
  market.payoutNumerators = null
  market.payoutDenominator = null
  market.winningOutcome = null
  market.createdAtBlock = BigInt.zero()
  market.createdAtTimestamp = BigInt.zero()
  market.createdTxHash = Bytes.empty()
  market.resolvedAtBlock = null
  market.resolvedAtTimestamp = null
  market.resolvedTxHash = null
  market.orderCount = BigInt.zero()
  market.activeOrderCount = BigInt.zero()
  market.tradeCount = BigInt.zero()
  market.volume = BigInt.zero()
  market.shareVolume = BigInt.zero()
  market.yesVolume = BigInt.zero()
  market.noVolume = BigInt.zero()
  market.latestPrice = null
  market.latestYesPrice = null
  market.latestNoPrice = null
  market.save()

  let token = new PositionToken("101")
  token.tokenId = BigInt.fromI32(101)
  token.market = market.id
  token.marketId = market.marketId
  token.conditionId = market.conditionId
  token.outcomeIndex = BigInt.zero()
  token.outcome = "YES"
  token.save()
}

describe("ConditionalTokens business index", () => {
  test("transfer single increases receiver user position", () => {
    seedMarket()
    let zero = Address.fromString("0x0000000000000000000000000000000000000000")
    let receiver = Address.fromString("0x0000000000000000000000000000000000000021")
    let event = createTransferSingleEvent(receiver, zero, receiver, BigInt.fromI32(101), BigInt.fromI32(7))

    handleTransferSingle(event)

    assert.entityCount("UserPosition", 1)
    assert.fieldEquals("UserPosition", receiver.toHexString() + "-1", "yesBalance", "7")
    assert.fieldEquals("UserPosition", receiver.toHexString() + "-1", "noBalance", "0")

    clearStore()
  })
})
