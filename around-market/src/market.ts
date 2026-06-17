import { BigInt, ByteArray, Bytes, crypto, dataSource, log } from "@graphprotocol/graph-ts"
import { ShareSellOrderPlaced as ShareSellOrderPlacedEvent } from "../generated/templates/Market/Market"
import { LimitOrder } from "../generated/schema"

function currentOrderEntityId(orderId: BigInt): Bytes {
  let value = "order-" + dataSource.context().getString("marketEntityId") + "-" + orderId.toString()
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(value)))
}

export function handleShareSellOrderPlaced(
  event: ShareSellOrderPlacedEvent
): void {
  let entity = LimitOrder.load(currentOrderEntityId(event.params.orderId))
  if (entity == null) {
    log.warning("Skip ShareSellOrderPlaced: order entity is missing. marketId={}, orderId={}, tx={}", [
      dataSource.context().getString("marketEntityId"),
      event.params.orderId.toString(),
      event.transaction.hash.toHexString()
    ])
    return
  }

  entity.kind = "SHARE_SELL"
  entity.shareOutcomeIsYes = event.params.isYes
  entity.updatedAtBlock = event.block.number
  entity.updatedAtTimestamp = event.block.timestamp
  entity.updatedTxHash = event.transaction.hash
  entity.save()
}
