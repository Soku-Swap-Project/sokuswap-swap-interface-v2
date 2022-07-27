import { ArrowDownIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, JSBI, Percent, Token, Trade as V2Trade, TradeType } from '@sushiswap/core-sdk'
import Banner from 'app/components/Banner'
import Button from 'app/components/Button'
import RecipientField from 'app/components/RecipientField'
import Typography from 'app/components/Typography'
import Web3Connect from 'app/components/Web3Connect'
import { SupportedChainId } from 'app/enums/SupportedChainId'
import ConfirmSwapModal from 'app/features/legacy/swap/ConfirmSwapModal'
import SwapCallbackError from 'app/features/legacy/swap/SwapCallbackError'
import SwapDetails from 'app/features/legacy/swap/SwapDetails'
import SwapGasFeeInputs from 'app/features/legacy/swap/SwapGasFeeInputs'
import UnsupportedCurrencyFooter from 'app/features/legacy/swap/UnsupportedCurrencyFooter'
import HeaderNew from 'app/features/trade/HeaderNew'
import SwapAssetPanel from 'app/features/trident/swap/SwapAssetPanel'
import confirmPriceImpactWithoutFee from 'app/functions/prices'
import { warningSeverity } from 'app/functions/prices'
// import { computeFiatValuePriceImpact } from 'app/functions/trade'
import { useAllTokens, useCurrency } from 'app/hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from 'app/hooks/useApproveCallback'
import useENSAddress from 'app/hooks/useENSAddress'
import useIsArgentWallet from 'app/hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from 'app/hooks/useIsSwapUnsupported'
import useRubicTradeInfo from 'app/hooks/useRubicTradeInfo'
import useSushiGuardFeature from 'app/hooks/useSushiGuardFeature'
import { useSwapCallback } from 'app/hooks/useSwapCallback'
import { useUSDCValue } from 'app/hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from 'app/hooks/useWrapCallback'
import { SwapLayout, SwapLayoutCard } from 'app/layouts/SwapLayout'
import TokenWarningModal from 'app/modals/TokenWarningModal'
import { useActiveWeb3React } from 'app/services/web3'
import { WrappedTokenInfo } from 'app/state/lists/wrappedTokenInfo'
import { Field, setRecipient } from 'app/state/swap/actions'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from 'app/state/swap/hooks'
import { useExpertModeManager, useUserSingleHopOnly } from 'app/state/user/hooks'
import { CHAIN_IDS_TO_NAMES, getChainTypeByChainId } from 'connectors/helpers'
import { NextSeo } from 'next-seo'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BlockchainName, InsufficientLiquidityError, Token as RubicToken } from 'rubic-sdk'
import { numberFormatter } from 'utils'

import { SwapProps } from '../../swap'

const Swap = ({ banners }: SwapProps) => {
  const { i18n } = useLingui()

  const loadedUrlParams = useDefaultsFromURLSearch()
  const { account, chainId } = useActiveWeb3React()
  const defaultTokens = useAllTokens()

  const [isExpertMode] = useExpertModeManager()
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, parsedAmount, currencies, inputError: swapInputError, allowedSlippage, to } = useDerivedSwapInfo()
  const slippageFloat = parseFloat(allowedSlippage.toSignificant(3))
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const selectedChain = getChainTypeByChainId(chainId ?? 56)

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = useMemo(
    () =>
      showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount,
          }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
          },
    [independentField, parsedAmount, showWrap, trade]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useUSDCValue(parsedAmounts[Field.OUTPUT])
  // const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)
  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V2Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? /* @ts-ignore TYPE NEEDS FIXING */
        parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const userHasSpecifiedInputOutput = Boolean(
    /* @ts-ignore TYPE NEEDS FIXING */
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )

  const fromIsNative = currencies[Field.INPUT]?.isNative
  const toIsNative = currencies[Field.OUTPUT]?.isNative

  const inputTokenWrapped = currencies[Field.INPUT]
  const outputTokenWrapped = currencies[Field.OUTPUT]

  const fromAddress = fromIsNative
    ? '0x0000000000000000000000000000000000000000'
    : (currencies[Field.INPUT] as WrappedTokenInfo)?.address
  const toAddress = toIsNative
    ? '0x0000000000000000000000000000000000000000'
    : (currencies[Field.OUTPUT] as WrappedTokenInfo)?.address

  const fromAmount = parseFloat(formattedAmounts[Field.INPUT])

  const { rubicTrade, availableTrades, isLoading } = useRubicTradeInfo(
    CHAIN_IDS_TO_NAMES[chainId as SupportedChainId] as BlockchainName,
    fromAddress,
    fromAmount,
    toAddress,
    slippageFloat
  )

  const fromToken = rubicTrade?.from as RubicToken
  const toToken = rubicTrade?.to as RubicToken

  const hasTradeError = rubicTrade?.error
  // console.log(hasTradeError ? rubicTrade?.error : rubicTrade, 'testing')

  const rubicTradeError = () => {
    if (rubicTrade?.error instanceof InsufficientLiquidityError) {
      return 'Insufficient Liquidity'
    } else {
      // console.log('No')
    }
  }

  const hasPriceImpact = rubicTrade?.priceImpact

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const priceImpact = new Percent(hasPriceImpact ? parseInt(rubicTrade?.priceImpact) : 0)
  const priceImpactNum = parseFloat(priceImpact.toSignificant(3)) / 100
  const priceImpactRaw = rubicTrade?.priceImpact

  // const priceImpactWithoutFee = rubicTrade && priceImpact ? priceImpact : 0
  const estimatedRecievedAmount = hasTradeError ? 0 : rubicTrade?.to?.tokenAmount
  const estimatedReceivedAmountAsString = numberFormatter(estimatedRecievedAmount?.toString())
  const routeNotFound = !rubicTrade?.path

  const minAmountReceived = rubicTrade?.toTokenAmountMin?.tokenAmount

  console.log(minAmountReceived?.toString(), estimatedReceivedAmountAsString)

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  const signatureData = undefined

  const handleApprove = useCallback(async () => {
    await approveCallback()
    // if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //   try {
    //     await gatherPermitSignature()
    //   } catch (error) {
    //     // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //     if (error?.code !== USER_REJECTED_TRANSACTION) {
    //       await approveCallback()
    //     }
    //   }
    // } else {
    //   await approveCallback()
    // }
  }, [approveCallback])
  // }, [approveCallback, gatherPermitSignature, signatureState])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  // Checks if user has enabled the feature and if the wallet supports it
  const sushiGuardEnabled = useSushiGuardFeature()

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    allowedSlippage,
    to,
    signatureData,
    /* @ts-ignore TYPE NEEDS FIXING */
    null,
    sushiGuardEnabled
  )

  const [singleHopOnly] = useUserSingleHopOnly()

  // console.log(availableTrades)

  const handleSwap = useCallback(async () => {
    if (!rubicTrade) {
      return
    }
    if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
      return
    }
    setSwapState({
      attemptingTxn: true,
      tradeToConfirm,
      showConfirm,
      swapErrorMessage: undefined,
      txHash: undefined,
    })
    await rubicTrade
      ?.swap()
      .then((res: any) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: undefined,
          txHash: res.transactionHash,
        })

        gtag(
          'event',
          recipient === null
            ? 'Swap w/o Send'
            : (recipientAddress ?? recipient) === account
            ? 'Swap w/o Send + recipient'
            : 'Swap w/ Send',
          {
            event_category: 'Swap',
            event_label: [fromToken?.symbol, toToken?.symbol, singleHopOnly ? 'SH' : 'MH'].join('/'),
          }
        )

        gtag('event', singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled', {
          event_category: 'Routing',
        })
      })
      .catch((error: any) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [
    rubicTrade,
    priceImpact,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    fromToken?.symbol,
    toToken?.symbol,
    singleHopOnly,
  ])

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);
  const priceImpactSeverity = useMemo(() => {
    const executionPriceImpact = rubicTrade?.priceImpact
    return warningSeverity(priceImpactNum)
  }, [priceImpactNum, rubicTrade])

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({
      showConfirm: false,
      tradeToConfirm,
      attemptingTxn,
      swapErrorMessage,
      txHash,
    })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({
      tradeToConfirm: trade,
      swapErrorMessage,
      txHash,
      attemptingTxn,
      showConfirm,
    })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )

  const swapIsUnsupported = useIsSwapUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const priceImpactCss = useMemo(() => {
    switch (priceImpactSeverity) {
      case 0:
      case 1:
      case 2:
      default:
        return 'text-low-emphesis'
      case 3:
        return 'text-yellow'
      case 4:
        return 'text-red'
    }
  }, [priceImpactSeverity])

  return (
    <div style={{ marginTop: '-20px' }}>
      <NextSeo title="Swap" />
      <ConfirmSwapModal
        isOpen={showConfirm}
        trade={trade}
        rubicTrade={rubicTrade}
        originalTrade={tradeToConfirm}
        onAcceptChanges={handleAcceptChanges}
        attemptingTxn={attemptingTxn}
        txHash={txHash}
        // @ts-ignore TYPE NEEDS FIXING
        recipient={recipient}
        allowedSlippage={allowedSlippage}
        onConfirm={handleSwap}
        swapErrorMessage={swapErrorMessage}
        onDismiss={handleConfirmDismiss}
        toToken={toToken}
        fromToken={fromToken}
        inputTokenWrapped={inputTokenWrapped}
        outputTokenWrapped={outputTokenWrapped}
        minAmount={minAmountReceived}
        priceImpact={priceImpactRaw}
      />
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />

      <SwapLayoutCard>
        <div className="px-2">
          <HeaderNew inputCurrency={currencies[Field.INPUT]} outputCurrency={currencies[Field.OUTPUT]} />
        </div>
        <div className="flex flex-col gap-3">
          <SwapAssetPanel
            spendFromWallet={true}
            header={SwapAssetPanel.Header}
            currency={currencies[Field.INPUT]}
            value={formattedAmounts[Field.INPUT]}
            onChange={handleTypeInput}
            onSelect={handleInputSelect}
            selectedChain={selectedChain}
          />
          <div className="z-0 flex justify-center -mt-1 -mb-1">
            <div
              role="button"
              className="p-1.5 rounded-full shadow-md hover_shadow"
              onClick={() => {
                setApprovalSubmitted(false) // reset 2 step UI for approvals
                onSwitchTokens()
              }}
            >
              <ArrowDownIcon width={14} style={{ color: '#05195a' }} className="text-high-emphesis" />
            </div>
          </div>
          <SwapAssetPanel
            spendFromWallet={true}
            header={SwapAssetPanel.Header}
            currency={currencies[Field.OUTPUT]}
            value={
              independentField !== formattedAmounts[Field.OUTPUT] &&
              userHasSpecifiedInputOutput &&
              !isNaN(estimatedRecievedAmount)
                ? (estimatedReceivedAmountAsString as any)
                : hasTradeError
                ? null
                : formattedAmounts[Field.OUTPUT]
            }
            onChange={handleTypeOutput}
            onSelect={handleOutputSelect}
            priceImpact={priceImpact}
            priceImpactCss={priceImpactCss}
            selectedChain={selectedChain}
          />
          {sushiGuardEnabled && <SwapGasFeeInputs />}
          {isExpertMode && <RecipientField recipient={recipient} action={setRecipient} />}
          {Boolean(rubicTrade) && userHasSpecifiedInputOutput && (
            <SwapDetails
              inputCurrency={currencies[Field.INPUT]}
              outputCurrency={currencies[Field.OUTPUT]}
              rubicTrade={rubicTrade}
              priceImpact={priceImpactRaw}
              trade={trade}
              recipient={recipient ?? undefined}
              outputAmount={estimatedRecievedAmount}
            />
          )}

          {rubicTrade && routeNotFound && userHasSpecifiedInputOutput && (
            <Typography variant="xs" className="py-2 text-center">
              {i18n._(t`Insufficient liquidity for this trade.`)}{' '}
              {singleHopOnly && i18n._(t`Try enabling multi-hop trades`)}
            </Typography>
          )}

          {swapIsUnsupported ? (
            <Button color="red" disabled fullWidth className="rounded-2xl md:rounded">
              {i18n._(t`Unsupported Asset`)}
            </Button>
          ) : !account ? (
            <Web3Connect color="blue" variant="filled" fullWidth className="rounded-2xl md:rounded" />
          ) : showWrap ? (
            <Button
              fullWidth
              color="blue"
              disabled={Boolean(wrapInputError)}
              onClick={onWrap}
              className="rounded-2xl md:rounded"
            >
              {wrapInputError ??
                (wrapType === WrapType.WRAP
                  ? i18n._(t`Wrap`)
                  : wrapType === WrapType.UNWRAP
                  ? i18n._(t`Unwrap`)
                  : null)}
            </Button>
          ) : (
            //     : showApproveFlow ? (
            // <div>
            //   {approvalState !== ApprovalState.APPROVED && (
            //     <Button
            //       fullWidth
            //       loading={approvalState === ApprovalState.PENDING}
            //       onClick={handleApprove}
            //       disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            //       className="rounded-2xl md:rounded"
            //     >
            //       {i18n._(t`Approve ${currencies[Field.INPUT]?.symbol}`)}
            //     </Button>
            //   )}
            //   {approvalState === ApprovalState.APPROVED && (
            //     <Button
            //       color={isValid && priceImpactSeverity > 2 ? 'red' : 'gradient'}
            //       onClick={() => {
            //         if (isExpertMode) {
            //           handleSwap()
            //         } else {
            //           setSwapState({
            //             tradeToConfirm: trade,
            //             attemptingTxn: false,
            //             swapErrorMessage: undefined,
            //             showConfirm: true,
            //             txHash: undefined,
            //           })
            //         }
            //       }}
            //       fullWidth
            //       id="swap-button"
            //       disabled={
            //         !isValid || approvalState !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
            //       }
            //       className="rounded-2xl md:rounded"
            //     >
            //       {priceImpactSeverity > 3 && !isExpertMode
            //         ? i18n._(t`Price Impact High`)
            //         : priceImpactSeverity > 2
            //         ? i18n._(t`Swap Anyway`)
            //         : i18n._(t`Swap`)}
            //     </Button>
            //   )}
            // </div>
            //     )
            <Button
              // color={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'red' : 'gradient'}
              fullWidth
              style={{
                marginTop: '12px',
                background: isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'red' : '#04bbfb',
              }}
              onClick={() => {
                if (isExpertMode) {
                  handleSwap()
                } else {
                  setSwapState({
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                  })
                }
              }}
              id="swap-button"
              disabled={
                !rubicTrade ||
                (priceImpactSeverity > 3 && !isExpertMode) ||
                hasTradeError ||
                isLoading ||
                !userHasSpecifiedInputOutput
              }
              className="rounded-2xl md:rounded emphasize_swap_button"
            >
              {hasTradeError
                ? rubicTradeError()
                : priceImpactSeverity > 3 && !isExpertMode
                ? i18n._(t`Price Impact Too High`)
                : priceImpactSeverity > 2
                ? i18n._(t`Swap Anyway`)
                : userHasSpecifiedInputOutput && !rubicTrade
                ? 'No Trade Available'
                : i18n._(t`Swap`)}
            </Button>
          )}
          {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          {swapIsUnsupported ? <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} /> : null}
        </div>
      </SwapLayoutCard>
      <Banner banners={banners} />
    </div>
  )
}

Swap.Layout = SwapLayout('swap-page')
export default Swap
