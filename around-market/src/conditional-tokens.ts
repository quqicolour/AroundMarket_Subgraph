import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent
} from "../generated/ConditionalTokens/ConditionalTokens"
import { Market, PositionToken } from "../generated/schema"
import { applyPositionDelta } from "./helpers"

function applyTransfer(
  from: Bytes,
  to: Bytes,
  id: BigInt,
  value: BigInt,
  event: TransferSingleEvent
): void {
  let token = PositionToken.load(id.toString())
  if (token == null) return

  let market = Market.load(token.market)
  if (market == null) return

  applyPositionDelta(from, market, token.outcomeIndex, value.neg(), event)
  applyPositionDelta(to, market, token.outcomeIndex, value, event)
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  applyTransfer(
    event.params.from,
    event.params.to,
    event.params.id,
    event.params.value,
    event
  )
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  for (let i = 0; i < event.params.ids.length; i++) {
    let token = PositionToken.load(event.params.ids[i].toString())
    if (token == null) continue

    let market = Market.load(token.market)
    if (market == null) continue

    applyPositionDelta(
      event.params.from,
      market,
      token.outcomeIndex,
      event.params.values[i].neg(),
      event
    )
    applyPositionDelta(
      event.params.to,
      market,
      token.outcomeIndex,
      event.params.values[i],
      event
    )
  }
}

