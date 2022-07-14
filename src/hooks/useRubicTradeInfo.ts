import useRubicSDK from 'hooks/useRubicSDK'
import { useCallback, useEffect, useState } from 'react'
// import { useLocation } from 'react-router-dom'
import { BlockchainName, CrossChainTrade, InstantTrade, RubicSdkError } from 'rubic-sdk'

export const useRubicTradeInfo = (
  fromBlockchain: BlockchainName,
  fromAddress: string,
  fromAmt: number,
  toAddress: string,
  slippage: number,
  isCrossChain?: boolean,
  toBlockchain?: BlockchainName
) => {
  const [rubicTrade, setRubicTrade] = useState<InstantTrade | CrossChainTrade>()
  const [crossChainTradeError, setCrossChainTradeError] = useState<RubicSdkError>()
  const [availableTrades, setAvailableTrades] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // const location = useLocation()
  // const isCrossChain = location.pathname === '/cross-chain-swap'

  const { sdk } = useRubicSDK()
  const blockchain = fromBlockchain
  // const slippageToPercentage = slippage / 100

  // console.log(sdk, 'general sdk')

  const getTrade = useCallback(async () => {
    if (fromAddress && fromAmt && toAddress && !isCrossChain && !toBlockchain) {
      try {
        setIsLoading(true)
        const trades = await sdk?.instantTrades.calculateTrade(
          { blockchain, address: fromAddress },
          fromAmt,
          toAddress,
          {
            gasCalculation: 'rubicOptimisation',
            slippageTolerance: slippage,
            disabledProviders: [
              'ONE_INCH_ETHEREUM',
              // 'UNISWAP_V2',
              'UNI_SWAP_V3_ETHEREUM',
              'ONE_INCH_BSC',
              'SUSHI_SWAP_BSC',
            ],
          }
        )

        const supportedTrades: any = []

        trades?.map((trade: any) => {
          if (!trade?.error) {
            supportedTrades.push(trade)
          }
          return []
        })
        setAvailableTrades(trades)
        const bestTrade = supportedTrades ? supportedTrades[0] : undefined
        setRubicTrade(bestTrade)

        // explore trades info
        if (trades) {
          Object.entries(trades).forEach(([tradeType, trade]) => {
            // console.log(tradeType, `to amount: ${(trade as any)?.to.tokenAmount.toFormat(3)}`)
          })
        }
      } catch (e) {
        console.log(e, 'instant trade error')
      }
    }
    if (isCrossChain && toBlockchain && fromAddress && fromAmt && toAddress) {
      try {
        setIsLoading(true)
        const fromBlockchain = blockchain
        const fromTokenAddress = fromAddress
        const fromAmount = fromAmt
        const toTokenAddress = toAddress

        const wrappedTrades = await sdk?.crossChain.calculateTrade(
          { blockchain: fromBlockchain, address: fromTokenAddress },
          fromAmount,
          { blockchain: toBlockchain, address: toTokenAddress }
        )

        setAvailableTrades(wrappedTrades)
        const bestTrade = wrappedTrades ? wrappedTrades[0] : undefined
        setRubicTrade(bestTrade?.trade)
        setCrossChainTradeError(bestTrade?.error)

        if (wrappedTrades) {
          Object.entries(wrappedTrades).forEach((wrappedTrade: CrossChainTrade) => {
            if (wrappedTrade.error) {
            }
          })
        }
      } catch (e) {
        console.log(e, 'cross chain error')
      }
    }
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromAddress,
    fromAmt,
    toAddress,
    isCrossChain,
    toBlockchain,
    // sdk?.instantTrades,
    // sdk?.crossChain,
    blockchain,
    slippage,
  ])

  useEffect(() => {
    getTrade()
  }, [getTrade])

  return { rubicTrade, availableTrades, isLoading, crossChainTradeError }
}

export default useRubicTradeInfo
