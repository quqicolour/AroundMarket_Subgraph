import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketRegistered as MarketRegisteredEvent,
  MarketResolved as MarketResolvedEvent,
  Redeemed as RedeemedEvent
} from "../generated/SettlementManager/SettlementManager"
import { Market, MarketResolution, Redemption, UserPosition } from "../generated/schema"
import {
  ensureProtocol,
  ensureUser,
  ensureUserPosition,
  eventId,
  outcomeFromIndex,
  positionId,
  ZERO
} from "./helpers"

function winningOutcome(numerators: Array<BigInt>): string {
  if (numerators.length > 0 && numerators[0].gt(ZERO)) {
    return "YES"
  }
  return "NO"
}

export function handleMarketRegistered(event: MarketRegisteredEvent): void {
  let protocol = ensureProtocol(event.address, event)
  protocol.settlementManager = event.address
  protocol.save()

  let market = Market.load(event.params.marketId.toString())
  if (market != null) {
    market.settlementManager = event.address
    market.market = event.params.market
    market.save()
  }
}

export function handleMarketResolved(event: MarketResolvedEvent): void {
  let market = Market.load(event.params.marketId.toString())
  if (market == null) return

  let outcome = winningOutcome(event.params.payoutNumerators)
  market.resolved = true
  market.payoutNumerators = event.params.payoutNumerators
  market.payoutDenominator = event.params.payoutDenominator
  market.winningOutcome = outcome
  market.resolvedAtBlock = event.block.number
  market.resolvedAtTimestamp = event.block.timestamp
  market.resolvedTxHash = event.transaction.hash
  market.save()

  let resolution = new MarketResolution(eventId(event))
  resolution.market = market.id
  resolution.marketId = market.marketId
  resolution.conditionId = event.params.conditionId
  resolution.payoutNumerators = event.params.payoutNumerators
  resolution.payoutDenominator = event.params.payoutDenominator
  resolution.winningOutcome = outcome
  resolution.blockNumber = event.block.number
  resolution.blockTimestamp = event.block.timestamp
  resolution.transactionHash = event.transaction.hash
  resolution.logIndex = event.logIndex
  resolution.save()
}

export function handleRedeemed(event: RedeemedEvent): void {
  let market = Market.load(event.params.marketId.toString())
  if (market == null) return

  let user = ensureUser(event.params.user)
  let redemption = new Redemption(eventId(event))
  redemption.user = user.id
  redemption.account = event.params.user
  redemption.market = market.id
  redemption.marketId = market.marketId
  redemption.conditionId = event.params.conditionId
  redemption.collateralOut = event.params.collateralOut
  redemption.blockNumber = event.block.number
  redemption.blockTimestamp = event.block.timestamp
  redemption.transactionHash = event.transaction.hash
  redemption.logIndex = event.logIndex
  redemption.save()

  user.redemptionCount = user.redemptionCount.plus(BigInt.fromI32(1))
  user.redeemedCollateral = user.redeemedCollateral.plus(event.params.collateralOut)
  user.save()

  let userPosition = ensureUserPosition(event.params.user, market, event)
  userPosition.redeemedCollateral = userPosition.redeemedCollateral.plus(event.params.collateralOut)
  userPosition.save()
}
