import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  Market,
  MarketCandle,
  Protocol,
  User,
  UserPosition
} from "../generated/schema"

export const ZERO = BigInt.zero()
export const ONE = BigInt.fromI32(1)
export const ONE_E18 = BigInt.fromString("1000000000000000000")
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const PROTOCOL_ID = "around-market"

export function eventId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
}

export function marketIdString(marketId: BigInt): string {
  return marketId.toString()
}

export function orderIdString(marketId: BigInt, orderId: BigInt): string {
  return marketId.toString() + "-" + orderId.toString()
}

export function userId(address: Bytes): string {
  return address.toHexString().toLowerCase()
}

export function positionId(account: Bytes, marketId: BigInt): string {
  return userId(account) + "-" + marketId.toString()
}

export function outcomeFromIsYes(isYes: boolean): string {
  return isYes ? "YES" : "NO"
}

export function outcomeFromIndex(index: BigInt): string {
  return index.equals(ZERO) ? "YES" : "NO"
}

export function collateralVolume(price: BigInt, amount: BigInt): BigInt {
  return price.times(amount).div(ONE_E18)
}

export function ensureUser(address: Bytes): User {
  let id = userId(address)
  let user = User.load(id)
  if (user == null) {
    user = new User(id)
    user.address = address
    user.orderCount = ZERO
    user.tradeCount = ZERO
    user.collateralVolume = ZERO
    user.redemptionCount = ZERO
    user.redeemedCollateral = ZERO
    user.save()
  }
  return user
}

export function ensureProtocol(factory: Address, event: ethereum.Event): Protocol {
  let protocol = Protocol.load(PROTOCOL_ID)
  if (protocol == null) {
    protocol = new Protocol(PROTOCOL_ID)
    protocol.factory = factory
    protocol.conditionalTokens = null
    protocol.settlementManager = null
    protocol.feeRecipient = null
    protocol.platformFee = ZERO
    protocol.luckyFee = ZERO
    protocol.marketCount = ZERO
  }
  protocol.updatedAtBlock = event.block.number
  protocol.updatedAtTimestamp = event.block.timestamp
  protocol.updatedTxHash = event.transaction.hash
  return protocol
}

export function ensureUserPosition(
  account: Bytes,
  market: Market,
  event: ethereum.Event
): UserPosition {
  let user = ensureUser(account)
  let id = positionId(account, market.marketId)
  let position = UserPosition.load(id)
  if (position == null) {
    position = new UserPosition(id)
    position.user = user.id
    position.account = account
    position.market = market.id
    position.marketId = market.marketId
    position.conditionId = market.conditionId
    position.yesBalance = ZERO
    position.noBalance = ZERO
    position.redeemedCollateral = ZERO
  }
  position.updatedAtBlock = event.block.number
  position.updatedAtTimestamp = event.block.timestamp
  position.updatedTxHash = event.transaction.hash
  return position
}

export function applyPositionDelta(
  account: Bytes,
  market: Market,
  outcomeIndex: BigInt,
  delta: BigInt,
  event: ethereum.Event
): void {
  if (account.toHexString().toLowerCase() == ZERO_ADDRESS) {
    return
  }

  let position = ensureUserPosition(account, market, event)
  if (outcomeIndex.equals(ZERO)) {
    position.yesBalance = position.yesBalance.plus(delta)
  } else {
    position.noBalance = position.noBalance.plus(delta)
  }
  position.save()
}

function candleId(
  marketId: BigInt,
  isYes: boolean,
  interval: string,
  periodStart: BigInt
): string {
  return marketId.toString() + "-" + outcomeFromIsYes(isYes) + "-" + interval + "-" + periodStart.toString()
}

function bucketStart(timestamp: BigInt, intervalSeconds: BigInt): BigInt {
  return timestamp.div(intervalSeconds).times(intervalSeconds)
}

function updateCandle(
  market: Market,
  isYes: boolean,
  price: BigInt,
  amount: BigInt,
  event: ethereum.Event,
  interval: string,
  intervalSeconds: BigInt
): void {
  let periodStart = bucketStart(event.block.timestamp, intervalSeconds)
  let id = candleId(market.marketId, isYes, interval, periodStart)
  let candle = MarketCandle.load(id)
  let volume = collateralVolume(price, amount)

  if (candle == null) {
    candle = new MarketCandle(id)
    candle.market = market.id
    candle.marketId = market.marketId
    candle.isYes = isYes
    candle.outcome = outcomeFromIsYes(isYes)
    candle.interval = interval
    candle.intervalSeconds = intervalSeconds
    candle.periodStart = periodStart
    candle.open = price
    candle.high = price
    candle.low = price
    candle.close = price
    candle.volume = volume
    candle.shareVolume = amount
    candle.tradeCount = ONE
    candle.firstBlockNumber = event.block.number
    candle.firstTimestamp = event.block.timestamp
    candle.firstTxHash = event.transaction.hash
  } else {
    if (price.gt(candle.high)) candle.high = price
    if (price.lt(candle.low)) candle.low = price
    candle.close = price
    candle.volume = candle.volume.plus(volume)
    candle.shareVolume = candle.shareVolume.plus(amount)
    candle.tradeCount = candle.tradeCount.plus(ONE)
  }

  candle.lastBlockNumber = event.block.number
  candle.lastTimestamp = event.block.timestamp
  candle.lastTxHash = event.transaction.hash
  candle.save()
}

export function updateAllCandles(
  market: Market,
  isYes: boolean,
  price: BigInt,
  amount: BigInt,
  event: ethereum.Event
): void {
  updateCandle(market, isYes, price, amount, event, "ONE_MINUTE", BigInt.fromI32(60))
  updateCandle(market, isYes, price, amount, event, "FIFTEEN_MINUTES", BigInt.fromI32(900))
  updateCandle(market, isYes, price, amount, event, "THIRTY_MINUTES", BigInt.fromI32(1800))
  updateCandle(market, isYes, price, amount, event, "ONE_HOUR", BigInt.fromI32(3600))
  updateCandle(market, isYes, price, amount, event, "FOUR_HOURS", BigInt.fromI32(14400))
  updateCandle(market, isYes, price, amount, event, "TWELVE_HOURS", BigInt.fromI32(43200))
  updateCandle(market, isYes, price, amount, event, "ONE_DAY", BigInt.fromI32(86400))
}
