import { Currency, Trade as V2Trade, TradeType, TradeVersion } from '@sushiswap/core-sdk'
import { Trade as V3Trade } from '@sushiswap/trident-sdk'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'

export enum TradeVersionV2 {
  INSTANT_TRADE = 0,
  CROSSCHAIN_TRADE = 1,
}

export function getTradeVersion(
  trade?: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
): TradeVersion | undefined {
  if (!trade) return undefined
  if (trade instanceof V2Trade) return TradeVersion.V2TRADE
  return TradeVersion.V3TRADE
}

export function getTradeVersionV2(trade?: InstantTrade | CrossChainTrade): TradeVersionV2 | undefined {
  if (!trade) return undefined
  if (trade instanceof CrossChainTrade) return TradeVersionV2.CROSSCHAIN_TRADE
  return TradeVersionV2.INSTANT_TRADE
}
