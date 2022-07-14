import { useActiveWeb3React } from 'app/services/web3'
// import { getWeb3ProviderInstance } from 'config/web3Providers'
import { useCallback, useEffect, useState } from 'react'
import { BLOCKCHAIN_NAME, Configuration, SDK, WalletProvider } from 'rubic-sdk'

// const FEES_REWARD_WALLET_CHAIN_ID = 1
// const FEES_REWARD_WALLET = '0xeEEA4E4961d20021DE36733bF66B33d91a3F7Bc2'

export const useRubicSDK = () => {
  const { account, chainId } = useActiveWeb3React()

  const walletProvider: WalletProvider = {
    address: account as string,
    chainId: chainId as number,
    core: window.ethereum as any,
  }

  const configuration: Configuration = {
    rpcProviders: {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        mainRpc: process.env.NEXT_PUBLIC_ETH_RPC || 'https://eth-rpc.gateway.pokt.network',
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        mainRpc: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org/',
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        mainRpc: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-mainnet.public.blastapi.io	',
      },
      [BLOCKCHAIN_NAME.AVALANCHE]: {
        mainRpc: process.env.NEXT_PUBLIC_AVALANCHE_RPC!,
      },
      [BLOCKCHAIN_NAME.MOONRIVER]: {
        mainRpc:
          process.env.NEXT_PUBLIC_MOONRIVER_RPC ||
          'https://moonriver.api.onfinality.io/rpc?apikey=673e1fae-c9c9-4c7f-a3d5-2121e8274366',
      },
      [BLOCKCHAIN_NAME.FANTOM]: {
        mainRpc: process.env.NEXT_PUBLIC_FANTOM_RPC!,
      },
      [BLOCKCHAIN_NAME.HARMONY]: {
        mainRpc: process.env.NEXT_PUBLIC_HARMONY_RPC || 'https://harmony-mainnet.chainstacklabs.com	',
      },
      [BLOCKCHAIN_NAME.ARBITRUM]: {
        mainRpc: process.env.NEXT_PUBLIC_ARBITRUM_RPC!,
      },
      [BLOCKCHAIN_NAME.AURORA]: {
        mainRpc: process.env.NEXT_PUBLIC_AURORA_RPC!,
      },
    },
    providerAddress: '0x0000000000000000000000000000000000000000',
    walletProvider,
  }
  const [sdk, setSdk] = useState<SDK | null>()

  const setConfiguration = useCallback(async () => {
    const sdk = await SDK.createSDK(configuration)
    setSdk(sdk)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSdk, account, chainId])

  useEffect(() => {
    setConfiguration()
  }, [account, chainId, setConfiguration])

  return {
    sdk,
    setConfiguration,
  }
}

export default useRubicSDK
