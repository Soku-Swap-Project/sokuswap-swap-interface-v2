import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, Percent } from '@sushiswap/core-sdk'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'app/modals/TransactionConfirmationModal'
import { TradeUnion } from 'app/types'
import React, { FC, useMemo } from 'react'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'

import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers(...args: [TradeUnion, TradeUnion]): boolean {
  const [tradeA, tradeB] = args
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

interface ConfirmSwapModal {
  isOpen: boolean
  trade?: TradeUnion
  rubicTrade?: InstantTrade | CrossChainTrade
  originalTrade?: TradeUnion
  attemptingTxn: boolean
  allowedSlippage: Percent
  onAcceptChanges(): void
  onConfirm(): void
  onDismiss(): void
  txHash?: string
  recipient?: string
  swapErrorMessage?: string
  inputTokenWrapped?: Currency
  outputTokenWrapped?: Currency
  toToken?: any
  fromToken?: any
  minAmount?: any
  priceImpact?: any
}

const ConfirmSwapModal: FC<ConfirmSwapModal> = ({
  trade,
  rubicTrade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  toToken,
  fromToken,
  inputTokenWrapped,
  outputTokenWrapped,
  minAmount,
  priceImpact,
}) => {
  const { i18n } = useLingui()
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const inputAmountRaw = rubicTrade?.from?.tokenAmount
  const inputAmount = inputAmountRaw

  const outputAmountRaw = rubicTrade?.to?.tokenAmount
  const outputAmount = outputAmountRaw

  const pendingText = `Swapping ${inputAmount?.toFixed(6)} ${inputTokenWrapped?.symbol} for ${outputAmount?.toFixed(
    6
  )} ${outputTokenWrapped?.symbol}`

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={
        swapErrorMessage ? (
          <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
        ) : (
          <ConfirmationModalContent
            title={i18n._(t`Confirm Swap`)}
            onDismiss={onDismiss}
            topContent={
              <SwapModalHeader
                trade={trade}
                rubicTrade={rubicTrade}
                recipient={recipient}
                showAcceptChanges={showAcceptChanges}
                onAcceptChanges={onAcceptChanges}
                inputAmount={inputAmount}
                outputAmount={outputAmount}
                // maximumAmountIn={maximumAmountIn}
                // minimumAmountOut={minimumAmountOut}
                toToken={toToken}
                fromToken={fromToken}
                inputTokenWrapped={inputTokenWrapped}
                outputTokenWrapped={outputTokenWrapped}
                minAmount={minAmount}
                priceImpact={priceImpact}
              />
            }
            bottomContent={
              <SwapModalFooter
                onConfirm={onConfirm}
                disabledConfirm={showAcceptChanges}
                swapErrorMessage={swapErrorMessage}
              />
            }
          />
        )
      }
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  )
}

export default ConfirmSwapModal
