import { SupportedChainId } from 'app/enums/SupportedChainId'
import Web3 from 'web3'

const http = require('http')
const Web3HttpProvider = require('web3-providers-http')

const options = {
  keepAlive: true,
  timeout: 20000, // milliseconds,
  headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
  withCredentials: false,
}

let EthProvider: any
export const getEthProvider = (): any => {
  if (!EthProvider) {
    // EthProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ETH_RPC as any)
    EthProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_ETH_RPC, options)
  }
  return EthProvider
}

let BSCProvider: any
export const getBSCProvider = (): any => {
  if (!BSCProvider) {
    // BSCProvider = new Web3.providers.HttpProvider(
    //   process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org/'
    // )
    BSCProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_BSC_RPC, options)
  }
  return BSCProvider
}

let PolygonProvider: any
export const getPolygonProvider = (): any => {
  if (!PolygonProvider) {
    // PolygonProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_POLYGON_RPC as any)
    PolygonProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_POLYGON_RPC, options)
  }
  return PolygonProvider
}

let AvalancheProvider: any
export const getAvalancheProvider = (): any => {
  if (!AvalancheProvider) {
    // AvalancheProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC as any)
    AvalancheProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_AVALANCHE_RPC, options)
  }
  return AvalancheProvider
}

let MoonRiverProvider: any
export const getMoonRiverProvider = (): any => {
  if (!MoonRiverProvider) {
    // MoonRiverProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_MOONRIVER_RPC as any)
    MoonRiverProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_MOONRIVER_RPC, options)
  }
  return MoonRiverProvider
}
let FantomProvider: any
export const getFantomProvider = (): any => {
  if (!FantomProvider) {
    // FantomProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_FANTOM_RPC as any)
    FantomProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_FANTOM_RPC, options)
  }
  return FantomProvider
}
let HarmonyProvider: any
export const getHarmonyProvider = (): any => {
  if (!HarmonyProvider) {
    // HarmonyProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_HARMONY_RPC as any)
    HarmonyProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_HARMONY_RPC, options)
  }
  return HarmonyProvider
}
let ArbitrumProvider: any
export const getArbitrumProvider = (): any => {
  if (!ArbitrumProvider) {
    // ArbitrumProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_ARBITRUM_RPC as any)
    ArbitrumProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_ARBITRUM_RPC, options)
  }
  return ArbitrumProvider
}
let AuroraProvider: any
export const getAuroraProvider = (): any => {
  if (!AuroraProvider) {
    // AuroraProvider = new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_AURORA_RPC as any)
    AuroraProvider = new Web3HttpProvider(process.env.NEXT_PUBLIC_AURORA_RPC, options)
  }
  return AuroraProvider
}

export const getWeb3Provider = (chainId: number | undefined) => {
  switch (chainId) {
    case SupportedChainId.BSC_MAINNET:
      return getBSCProvider()
    case SupportedChainId.MAINNET:
      return getEthProvider()
    case SupportedChainId.POLYGON:
      return getPolygonProvider()
    case SupportedChainId.AVALANCHE:
      return getAvalancheProvider()
    case SupportedChainId.MOONRIVER:
      return getMoonRiverProvider()
    case SupportedChainId.FANTOM:
      return getFantomProvider()
    case SupportedChainId.HARMONY:
      return getHarmonyProvider()
    case SupportedChainId.ARBITRUM:
      return getArbitrumProvider()
    case SupportedChainId.AURORA:
      return getAuroraProvider()
    default:
      return getBSCProvider()
  }
  // else
  //   switch (chainType) {
  //     case 'bsc':
  //       return getBSCProvider();
  //     case 'eth':
  //       return getEthProvider();
  //     case 'polygon':
  //       return getPolygonProvider();
  //     case 'avalanche':
  //       return getAvalancheProvider();
  //     case 'moonriver':
  //       return getMoonRiverProvider();
  //     case 'fantom':
  //       return getFantomProvider();
  //     case 'harmony':
  //       return getHarmonyProvider();
  //     case 'arbitrum':
  //       return getArbitrumProvider();
  //     default:
  //       return getBSCProvider();
  //   }
}

// const web3ProviderInstance: { [key: string]: any } = {};

export const getWeb3ProviderInstance = (chainId: number | undefined) => {
  let chain
  chain = chainId
  if (!chainId) {
    chain = SupportedChainId.BSC_MAINNET
  }
  const web3ProviderInstance = new Web3(getWeb3Provider(chain))

  return web3ProviderInstance
}
