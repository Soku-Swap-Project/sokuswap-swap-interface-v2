import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChainId, Currency, CurrencyAmount, Percent, Token, Trade as V2Trade, TradeType } from '@sushiswap/core-sdk'
import { SupportedChainId } from 'app/enums/SupportedChainId'
// import { currencyId } from 'app/functions'
import { tryParseAmount } from 'app/functions/parse'
import { isAddress } from 'app/functions/validate'
import { useCurrency } from 'app/hooks/Tokens'
import useENS from 'app/hooks/useENS'
import useParsedQueryString from 'app/hooks/useParsedQueryString'
import useSwapSlippageTolerance from 'app/hooks/useSwapSlippageTollerence'
import { useV2TradeExactIn as useTradeExactIn, useV2TradeExactOut as useTradeExactOut } from 'app/hooks/useV2Trades'
import { useTokenAndEtherBalanceFromContract } from 'app/lib/hooks/useCurrencyBalance'
import { useActiveWeb3React } from 'app/services/web3'
import { AppState } from 'app/state'
import { useAppDispatch, useAppSelector } from 'app/state/hooks'
import { useExpertModeManager, useUserSingleHopOnly } from 'app/state/user/hooks'
// import { useCurrencyBalances } from 'app/state/wallet/hooks'
import { useRouter } from 'next/router'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'

// import {
//   EstimatedSwapCall,
//   SuccessfulCall,
//   useSwapCallArguments,
// } from "../../hooks/useSwapCallback";
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'

export const SOKU_ADDRESS = {
  [SupportedChainId.MAINNET]: '0x4C3A8ECeB656Ec63eaE80a4ebD565E4887DB6160',
  [SupportedChainId.BSC_MAINNET]: '0x0e4B5Ea0259eB3D66E6FCB7Cc8785817F8490a53',
}

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient?: string) => void
} {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  const inputCurrencyId = router.query.inputCurrency || 'ETH'
  const outputCurrencyId =
    router.query.outputCurrency || (chainId && chainId in SOKU_ADDRESS ? (SOKU_ADDRESS as any)[chainId] : undefined)

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      // if (field === Field.INPUT) {
      //   const inputCurrency = currency
      //   const newInputCurrencyId = currencyId(inputCurrency)
      //   if (outputCurrencyId === newInputCurrencyId) {
      //     if (outputCurrencyId) {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: newInputCurrencyId, outputCurrency: inputCurrencyId },
      //       })
      //     } else {
      //       router.replace({ pathname: window.location.pathname, query: { ...router.query, inputCurrency: 'ETH' } })
      //     }
      //   } else {
      //     if (outputCurrencyId) {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: newInputCurrencyId, outputCurrency: outputCurrencyId },
      //       })
      //     } else {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: newInputCurrencyId },
      //       })
      //     }
      //   }
      // }

      // if (field === Field.OUTPUT) {
      //   const outputCurrency = currency
      //   const newOutputCurrencyId = currencyId(outputCurrency)
      //   if (inputCurrencyId === newOutputCurrencyId) {
      //     if (outputCurrencyId) {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: outputCurrencyId, outputCurrency: newOutputCurrencyId },
      //       })
      //     } else {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: 'ETH', outputCurrency: newOutputCurrencyId },
      //       })
      //     }
      //   } else {
      //     if (inputCurrencyId) {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: inputCurrencyId, outputCurrency: newOutputCurrencyId },
      //       })
      //     } else {
      //       router.replace({
      //         pathname: window.location.pathname,
      //         query: { ...router.query, inputCurrency: 'ETH', outputCurrency: newOutputCurrencyId },
      //       })
      //     }
      //   }
      // }

      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken
            ? currency.address
            : currency.isNative && currency.chainId !== ChainId.CELO
            ? 'ETH'
            : '',
        })
      )
    },
    [dispatch, inputCurrencyId, outputCurrencyId, router]
  )

  const onSwitchTokens = useCallback(() => {
    router.replace({
      pathname: window.location.pathname,
      query: { ...router.query, inputCurrency: outputCurrencyId, outputCurrency: inputCurrencyId },
    })
    dispatch(switchCurrencies())
  }, [dispatch, inputCurrencyId, outputCurrencyId, router])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient?: string) => {
      dispatch(setRecipient(recipient))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

// TODO: Swtich for ours...
const BAD_RECIPIENT_ADDRESSES: { [chainId: string]: { [address: string]: true } } = {
  [ChainId.ETHEREUM]: {
    '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac': true, // v2 factory
    '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F': true, // v2 router 02
  },
}

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: V2Trade<Currency, Currency, TradeType>, checksummedAddress: string): boolean {
  const path = trade.route.path
  return (
    path.some((token) => token.address === checksummedAddress) ||
    (trade instanceof V2Trade
      ? trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
      : false)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(
  chainForTokenA?: number,
  chainForTokenB?: number,
  rubicTrade?: InstantTrade | CrossChainTrade
): {
  to?: string
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: string
  v2Trade: V2Trade<Currency, Currency, TradeType> | undefined
  allowedSlippage: Percent
} {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const [singleHopOnly] = useUserSingleHopOnly()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId, chainForTokenA)
  const outputCurrency = useCurrency(outputCurrencyId, chainForTokenB)
  const recipientLookup = useENS(recipient ?? undefined)

  const to = (recipient === undefined ? account : recipientLookup.address) ?? undefined

  // const relevantTokenBalances = useTokenAndEtherBalanceFromContract(account ?? undefined, [
  //     (inputCurrency as Token) ?? undefined,
  //     outputCurrency ?? undefined
  // ])

  const inputTokenBalance = useTokenAndEtherBalanceFromContract(
    account ?? undefined,
    (inputCurrency as Token) ?? undefined,
    chainForTokenA ?? chainId
  ) // chainForTokenA
  const outputTokenBalance = useTokenAndEtherBalanceFromContract(
    account ?? undefined,
    (outputCurrency as Token) ?? undefined,
    chainForTokenB ?? chainId
  ) // chainForTokenB

  const isExactIn: boolean = independentField === Field.INPUT

  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, {
    maxHops: singleHopOnly ? 1 : undefined,
  })

  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, {
    maxHops: singleHopOnly ? 1 : undefined,
  })

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut
  const currencyBalances = {
    [Field.INPUT]: inputTokenBalance as unknown as CurrencyAmount<Currency | Token>,
    [Field.OUTPUT]: outputTokenBalance as unknown as CurrencyAmount<Currency | Token>,
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined

  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? i18n._(t`Enter an amount`)
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? i18n._(t`Select a token`)
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? i18n._(t`Enter a recipient`)
  } else {
    if (
      // @ts-ignore TYPE NEEDS FIXING
      BAD_RECIPIENT_ADDRESSES?.[chainId]?.[formattedTo] ||
      (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? i18n._(t`Invalid recipient`)
    }
  }

  // @ts-ignore TYPE NEEDS FIXING
  const allowedSlippage = useSwapSlippageTolerance(v2Trade)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], v2Trade?.maximumAmountIn(allowedSlippage)]

  if (balanceIn && amountIn && Number(balanceIn) < Number(amountIn)) {
    inputError = i18n._(t`Insufficient Balance`)
  }

  return {
    to,
    currencies,
    currencyBalances,
    parsedAmount,
    inputError,
    v2Trade: v2Trade ?? undefined,
    allowedSlippage,
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | undefined {
  if (typeof recipient !== 'string') return undefined
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return undefined
}
export function queryParametersToSwapState(parsedQs: ParsedQs, chainIdB?: SupportedChainId): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const supportedSokuChains = [SupportedChainId.MAINNET, SupportedChainId.BSC_MAINNET]
  const eth = 'ETH'
  const soku =
    chainIdB && supportedSokuChains.includes(chainIdB) ? (SOKU_ADDRESS as any)[chainIdB as SupportedChainId] : undefined
  if (inputCurrency === '' && outputCurrency === '') {
    inputCurrency = eth
    outputCurrency = soku
  } else if (inputCurrency === '') {
    inputCurrency = outputCurrency === eth ? soku : eth
  } else if (outputCurrency === '' || inputCurrency === outputCurrency) {
    outputCurrency = inputCurrency === eth ? soku : eth
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(chainIdB?: number):
  | {
      inputCurrencyId: string | undefined
      outputCurrencyId: string | undefined
    }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()
  const [expertMode] = useExpertModeManager()
  const [result, setResult] = useState<
    | {
        inputCurrencyId: string | undefined
        outputCurrencyId: string | undefined
      }
    | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs, chainIdB)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: expertMode ? parsed.recipient : undefined,
      })
    )

    setResult({
      inputCurrencyId: parsed[Field.INPUT].currencyId,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId,
    })

    // router.replace(
    //   `/swap?inputCurrency=${parsed[Field.INPUT].currencyId}&outputCurrency=${parsed[Field.OUTPUT].currencyId}`
    // )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
