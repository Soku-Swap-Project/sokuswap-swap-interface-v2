import { SupportedChainId } from 'app/enums/SupportedChainId'
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk'

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: BLOCKCHAIN_NAME.ETHEREUM,
  [SupportedChainId.ROPSTEN]: 'ropsten',
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.GOERLI]: 'goerli',
  [SupportedChainId.KOVAN]: 'kovan',
  [SupportedChainId.BSC_MAINNET]: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  [SupportedChainId.POLYGON]: BLOCKCHAIN_NAME.POLYGON,
  [SupportedChainId.AVALANCHE]: BLOCKCHAIN_NAME.AVALANCHE,
  [SupportedChainId.MOONRIVER]: BLOCKCHAIN_NAME.MOONRIVER,
  [SupportedChainId.FANTOM]: BLOCKCHAIN_NAME.FANTOM,
  [SupportedChainId.HARMONY]: BLOCKCHAIN_NAME.HARMONY,
  [SupportedChainId.ARBITRUM]: BLOCKCHAIN_NAME.ARBITRUM,
  [SupportedChainId.AURORA]: BLOCKCHAIN_NAME.AURORA,
}

export const getChainIdByRubicName = (chain: BlockchainName) => {
  switch (chain) {
    case BLOCKCHAIN_NAME.ETHEREUM:
      return SupportedChainId.MAINNET
    case BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN:
      return SupportedChainId.BSC_MAINNET
    case BLOCKCHAIN_NAME.POLYGON:
      return SupportedChainId.POLYGON
    case BLOCKCHAIN_NAME.AVALANCHE:
      return SupportedChainId.AVALANCHE
    case BLOCKCHAIN_NAME.MOONRIVER:
      return SupportedChainId.MOONRIVER
    case BLOCKCHAIN_NAME.FANTOM:
      return SupportedChainId.FANTOM
    case BLOCKCHAIN_NAME.HARMONY:
      return SupportedChainId.HARMONY
    case BLOCKCHAIN_NAME.ARBITRUM:
      return SupportedChainId.ARBITRUM
    case BLOCKCHAIN_NAME.AURORA:
      return SupportedChainId.AURORA
    default:
      return null
  }
}

export const getChainTypeByChainId = (chainId: number) => {
  switch (chainId) {
    case SupportedChainId.MAINNET:
      return BLOCKCHAIN_NAME.ETHEREUM
    case SupportedChainId.BSC_MAINNET:
      return BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    case SupportedChainId.POLYGON:
      return BLOCKCHAIN_NAME.POLYGON
    case SupportedChainId.AVALANCHE:
      return BLOCKCHAIN_NAME.AVALANCHE
    case SupportedChainId.MOONRIVER:
      return BLOCKCHAIN_NAME.MOONRIVER
    case SupportedChainId.FANTOM:
      return BLOCKCHAIN_NAME.FANTOM
    case SupportedChainId.HARMONY:
      return BLOCKCHAIN_NAME.HARMONY
    case SupportedChainId.ARBITRUM:
      return BLOCKCHAIN_NAME.ARBITRUM
    case SupportedChainId.AURORA:
      return BLOCKCHAIN_NAME.AURORA
    default:
      return null
  }
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]
