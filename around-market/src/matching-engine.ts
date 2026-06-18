import {
  MatchExecuted as MatchExecutedEvent
} from "../generated/templates/MatchingEngine/MatchingEngineEvents"
import { Market, MatchExecution } from "../generated/schema"
import { ensureUser, eventId } from "./helpers"

export function handleMatchExecuted(event: MatchExecutedEvent): void {
  let market = Market.load(event.params.marketId.toString())
  if (market == null) return

  let taker = ensureUser(event.params.taker)
  let execution = new MatchExecution(eventId(event))
  execution.market = market.id
  execution.marketId = market.marketId
  execution.taker = event.params.taker
  execution.takerUser = taker.id
  execution.filled = event.params.filled
  execution.limitPrice = event.params.price
  execution.totalFee = event.params.totalFee
  execution.blockNumber = event.block.number
  execution.blockTimestamp = event.block.timestamp
  execution.transactionHash = event.transaction.hash
  execution.logIndex = event.logIndex
  execution.save()
}

