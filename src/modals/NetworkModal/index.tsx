import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Modal from '@material-ui/core/Modal'
import { ChainId } from '@sushiswap/core-sdk'
import { ButtonDotted } from 'app/components/Button'
import Typography from 'app/components/Typography'
import { NETWORK_ICON, NETWORK_LABEL } from 'app/config/networks'
import { SupportedChainId } from 'app/enums/SupportedChainId'
import { classNames } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { useModalOpen, useNetworkModalToggle } from 'app/state/application/hooks'
import { ApplicationModal } from 'app/state/application/reducer'
import { getChainIdByRubicName } from 'connectors/helpers'
import Image from 'next/image'
import React, { FC } from 'react'
import { BLOCKCHAIN_NAME } from 'rubic-sdk'

export const SUPPORTED_NETWORKS: Record<
  number,
  {
    chainId: string
    chainName: string
    rubicName?: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
> = {
  [ChainId.ETHEREUM]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    rubicName: BLOCKCHAIN_NAME.ETHEREUM,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com'],
  },
  [ChainId.ROPSTEN]: {
    chainId: '0x3',
    chainName: 'Ropsten',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ropsten.infura.io/v3'],
    blockExplorerUrls: ['https://ropsten.etherscan.com'],
  },
  [ChainId.RINKEBY]: {
    chainId: '0x4',
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rinkeby.infura.io/v3'],
    blockExplorerUrls: ['https://rinkeby.etherscan.com'],
  },
  [ChainId.GÖRLI]: {
    chainId: '0x5',
    chainName: 'Görli',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3'],
    blockExplorerUrls: ['https://goerli.etherscan.com'],
  },
  [ChainId.KOVAN]: {
    chainId: '0x2A',
    chainName: 'Kovan',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://kovan.infura.io/v3'],
    blockExplorerUrls: ['https://kovan.etherscan.com'],
  },
  [ChainId.FANTOM]: {
    chainId: '0xfa',
    chainName: 'Fantom',
    rubicName: BLOCKCHAIN_NAME.FANTOM,
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpcapi.fantom.network'],
    blockExplorerUrls: ['https://ftmscan.com'],
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    rubicName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.MATIC]: {
    chainId: '0x89',
    chainName: 'Matic',
    rubicName: BLOCKCHAIN_NAME.POLYGON,
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'], // ['https://matic-mainnet.chainstacklabs.com/'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  [ChainId.HECO]: {
    chainId: '0x80',
    chainName: 'Heco',
    nativeCurrency: {
      name: 'Heco Token',
      symbol: 'HT',
      decimals: 18,
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
    blockExplorerUrls: ['https://hecoinfo.com'],
  },
  [ChainId.XDAI]: {
    chainId: '0x64',
    chainName: 'xDai',
    nativeCurrency: {
      name: 'xDai Token',
      symbol: 'xDai',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.gnosischain.com'],
    blockExplorerUrls: ['https://blockscout.com/poa/xdai'],
  },
  [ChainId.HARMONY]: {
    chainId: '0x63564C40',
    chainName: 'Harmony',
    rubicName: BLOCKCHAIN_NAME.HARMONY,
    nativeCurrency: {
      name: 'One Token',
      symbol: 'ONE',
      decimals: 18,
    },
    rpcUrls: [
      'https://api.harmony.one',
      'https://s1.api.harmony.one',
      'https://s2.api.harmony.one',
      'https://s3.api.harmony.one',
    ],
    blockExplorerUrls: ['https://explorer.harmony.one/'],
  },
  [ChainId.AVALANCHE]: {
    chainId: '0xA86A',
    chainName: 'Avalanche Mainnet C-Chain',
    rubicName: BLOCKCHAIN_NAME.AVALANCHE,
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://snowtrace.io'],
  },
  [ChainId.OKEX]: {
    chainId: '0x42',
    chainName: 'OKEx',
    nativeCurrency: {
      name: 'OKEx Token',
      symbol: 'OKT',
      decimals: 18,
    },
    rpcUrls: ['https://exchainrpc.okex.org'],
    blockExplorerUrls: ['https://www.oklink.com/okexchain'],
  },
  [ChainId.ARBITRUM]: {
    chainId: '0xA4B1',
    chainName: 'Arbitrum',
    rubicName: BLOCKCHAIN_NAME.ARBITRUM,
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  [ChainId.CELO]: {
    chainId: '0xA4EC',
    chainName: 'Celo',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
    rpcUrls: ['https://forno.celo.org'],
    blockExplorerUrls: ['https://explorer.celo.org'],
  },
  [ChainId.MOONRIVER]: {
    chainId: '0x505',
    chainName: 'Moonriver',
    rubicName: BLOCKCHAIN_NAME.MOONRIVER,
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
    blockExplorerUrls: ['https://moonriver.moonscan.io'],
  },
  [ChainId.FUSE]: {
    chainId: '0x7A',
    chainName: 'Fuse',
    nativeCurrency: {
      name: 'Fuse',
      symbol: 'FUSE',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.fuse.io'],
    blockExplorerUrls: ['https://explorer.fuse.io'],
  },
  [ChainId.TELOS]: {
    chainId: '0x28',
    chainName: 'Telos',
    nativeCurrency: {
      name: 'Telos',
      symbol: 'TLOS',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.telos.net/evm'],
    blockExplorerUrls: ['https://rpc1.us.telos.net/v2/explore'],
  },
  [ChainId.PALM]: {
    chainId: '0x2A15C308D',
    chainName: 'Palm',
    nativeCurrency: {
      name: 'Palm',
      symbol: 'PALM',
      decimals: 18,
    },
    rpcUrls: ['https://palm-mainnet.infura.io/v3/da5fbfafcca14b109e2665290681e267'],
    blockExplorerUrls: ['https://explorer.palm.io'],
  },
  [ChainId.MOONBEAM]: {
    chainId: '0x504',
    chainName: 'Moonbeam',
    nativeCurrency: {
      name: 'Glimmer',
      symbol: 'GLMR',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.api.moonbeam.network'],
    blockExplorerUrls: ['https://moonbeam.moonscan.io'],
  },
  [ChainId.OPTIMISM]: {
    chainId: '0xA',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  // [SupportedChainId.AURORA]: {
  //   // chainId: '0xA', incorrect
  //   chainName: 'Aurora',
  //   nativeCurrency: {
  //     name: 'Ether',
  //     symbol: 'ETH',
  //     decimals: 18,
  //   },
  //   rpcUrls: ['https://mainnet.aurora.dev'],
  //   blockExplorerUrls: ['https://aurorascan.dev/'],
  // },
}

interface Props {
  selectedChain?: any
  setSelectedChain?: any
  disabled?: boolean
}

const NetworkModal: FC<Props> = ({ selectedChain, setSelectedChain, disabled }) => {
  const { i18n } = useLingui()
  const { chainId, library, account } = useActiveWeb3React()
  const networkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const toggleNetworkModal = useNetworkModalToggle()
  const selectedChainId = getChainIdByRubicName(selectedChain)

  const networkTest = () => {
    if (selectedChain && !networkModalOpen) {
      return NETWORK_LABEL[selectedChainId as number]
    } else if (networkModalOpen) {
      return 'Selecting Network'
    } else {
      return 'Select Network'
    }
  }

  if (!chainId) return null

  return (
    <div>
      <ButtonDotted
        style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          background: 'transparent',
          color: '#05195a',
          borderRadius: '32px',
        }}
        className="network_modal_button"
        disabled={disabled}
        onClick={toggleNetworkModal}
        pending={networkModalOpen}
      >
        {selectedChain && (
          <Image
            src={`${NETWORK_ICON[selectedChainId as number]}`}
            alt="Network Icon"
            height="24px"
            width="24px"
            style={{ borderRadius: '24px' }}
          />
        )}
        <Typography style={{ paddingLeft: '4px', fontWeight: 'bolder' }}>{networkTest()}</Typography>
      </ButtonDotted>
      {networkModalOpen && (
        <Modal className="network_modal_container" open={networkModalOpen} onClose={toggleNetworkModal}>
          <div className="flex flex-col gap-6 network_modal">
            <h1 className="text-blue font-bold">Select Network</h1>
            <div className="grid grid-flow-row-dense p-4 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
              {[
                SupportedChainId.MAINNET,
                SupportedChainId.POLYGON,
                SupportedChainId.ARBITRUM,
                SupportedChainId.AVALANCHE,
                // SupportedChainId.AURORA,
                SupportedChainId.MOONRIVER,
                SupportedChainId.FANTOM,
                SupportedChainId.BSC_MAINNET,
                SupportedChainId.HARMONY,
              ]
                // .sort((key) => (chainId === key ? -1 : 0))
                .map((key: number, i: number) => {
                  if (chainId === key) {
                    return (
                      <div
                        key={i}
                        className="network_selector focus:outline-none flex items-center gap-4 w-full px-4 py-3 rounded border border-lightBlue cursor-default"
                      >
                        <Image
                          // @ts-ignore TYPE NEEDS FIXING
                          src={NETWORK_ICON[key]}
                          alt="Switch Network"
                          className="rounded-full"
                          width="32px"
                          height="32px"
                        />
                        <Typography weight={700} className="text-blue">
                          {NETWORK_LABEL[key]}
                        </Typography>
                      </div>
                    )
                  }
                  return (
                    <button
                      key={i}
                      onClick={async () => {
                        setSelectedChain(SUPPORTED_NETWORKS[key].rubicName)
                        console.debug(`Switching to chain ${key}`, SUPPORTED_NETWORKS[key])
                        toggleNetworkModal()
                        const params = SUPPORTED_NETWORKS[key]
                        try {
                          if (selectedChain) {
                            console.log(selectedChain, 'selected')
                          }
                          // else {
                          //   await library?.send('wallet_switchEthereumChain', [
                          //     { chainId: `0x${key.toString(16)}` },
                          //     account,
                          //   ])
                          // }

                          gtag('event', 'Switch', {
                            event_category: 'Chain',
                            event_label: params.chainName,
                          })
                        } catch (switchError) {
                          // This error code indicates that the chain has not been added to MetaMask.
                          // @ts-ignore TYPE NEEDS FIXING
                          if (switchError.code === 4902) {
                            try {
                              await library?.send('wallet_addEthereumChain', [params, account])
                            } catch (addError) {
                              // handle "add" error
                              console.error(`Add chain error ${addError}`)
                            }
                          }
                          console.error(`Switch chain error ${switchError}`)
                          // handle other "switch" errors
                        }
                      }}
                      className={classNames(
                        'network_selector focus:outline-none flex items-center gap-4 w-full px-4 py-3 rounded border border-[#ebebeb] hover_shadow'
                      )}
                    >
                      {/*@ts-ignore TYPE NEEDS FIXING*/}
                      <Image
                        src={NETWORK_ICON[key]}
                        alt="Switch Network"
                        className="rounded-full"
                        width="32px"
                        height="32px"
                      />
                      <Typography weight={700} className="text-blue">
                        {NETWORK_LABEL[key]}
                      </Typography>
                    </button>
                  )
                })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NetworkModal
