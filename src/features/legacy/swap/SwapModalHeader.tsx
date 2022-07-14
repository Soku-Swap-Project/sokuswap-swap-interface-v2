import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount, ZERO } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import Typography from 'app/components/Typography'
import SwapDetails from 'app/features/legacy/swap/SwapDetails'
import { useUSDCValue } from 'app/hooks/useUSDCPrice'
import { TradeUnion } from 'app/types'
import React, { FC } from 'react'
import { ArrowDown } from 'react-feather'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'

interface SwapModalHeader {
  trade?: TradeUnion
  rubicTrade: InstantTrade | CrossChainTrade
  recipient?: string
  showAcceptChanges: boolean
  onAcceptChanges: () => void
  toToken?: any
  fromToken?: any
  inputTokenWrapped?: Currency
  outputTokenWrapped?: Currency
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  minimumAmountOut?: CurrencyAmount<Currency>
  maximumAmountIn?: CurrencyAmount<Currency>
  minAmount?: any
  priceImpact?: any
}

const SwapModalHeader: FC<SwapModalHeader> = ({
  trade,
  rubicTrade,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
  toToken,
  fromToken,
  inputAmount,
  minimumAmountOut,
  outputAmount,
  maximumAmountIn,
  inputTokenWrapped,
  outputTokenWrapped,
  minAmount,
  priceImpact,
}) => {
  const { i18n } = useLingui()
  const fiatValueInput = useUSDCValue(inputAmount)
  const fiatValueOutput = useUSDCValue(outputAmount)

  const change =
    ((Number(fiatValueOutput?.toExact()) - Number(fiatValueInput?.toExact())) / Number(fiatValueInput?.toExact())) * 100

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-5">
        <HeadlessUiModal.BorderedContent className="bg-light border border-gray shadow rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <Typography variant="h3" weight={700} className="text-blue">
                  {inputAmount?.toFixed(6)}{' '}
                </Typography>
                {fiatValueInput?.greaterThan(ZERO) && (
                  <Typography className="text-secondary">${fiatValueInput.toFixed(2)}</Typography>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyLogo currency={inputTokenWrapped} size={18} className="!rounded-full overflow-hidden" />
              <Typography variant="lg" weight={700} className="text-blue">
                {fromToken?.symbol}
              </Typography>
            </div>
          </div>
        </HeadlessUiModal.BorderedContent>
        <div className="flex justify-center -mt-3 -mb-3">
          <div className="border-2 border-light-800 shadow-md rounded-full p-1 backdrop-blur-[20px] z-10">
            <ArrowDown size={18} />
          </div>
        </div>
        <HeadlessUiModal.BorderedContent className="bg-light border border-gray shadow rounded">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <Typography variant="h3" weight={700} className="text-blue">
                  {outputAmount?.toFixed(6)}{' '}
                </Typography>
                {fiatValueOutput?.greaterThan(ZERO) && (
                  <Typography className="text-secondary">
                    ${fiatValueOutput?.toFixed(2)}{' '}
                    <Typography variant="xs" component="span">
                      ({change.toFixed(2)}%)
                    </Typography>
                  </Typography>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyLogo currency={outputTokenWrapped} size={18} className="!rounded-full overflow-hidden" />
              <Typography variant="lg" weight={700} className="text-blue">
                {toToken?.symbol}
              </Typography>
            </div>
          </div>
        </HeadlessUiModal.BorderedContent>
      </div>
      <SwapDetails
        rubicTrade={rubicTrade}
        trade={trade}
        recipient={recipient}
        inputCurrency={inputTokenWrapped}
        outputCurrency={outputTokenWrapped}
        inputAmount={inputAmount}
        outputAmount={outputAmount}
        minimumAmountOut={minimumAmountOut}
        priceImpact={priceImpact}
        className="!border-light-800 hover_shadow"
      />

      {showAcceptChanges && (
        <HeadlessUiModal.BorderedContent className="border !border-light-800">
          <div className="flex items-center justify-between">
            <Typography variant="sm" weight={700}>
              {i18n._(t`Price Updated`)}
            </Typography>
            <Button variant="outlined" size="xs" color="blue" onClick={onAcceptChanges}>
              {i18n._(t`Accept`)}
            </Button>
          </div>
        </HeadlessUiModal.BorderedContent>
      )}
      <div className="justify-start text-sm text-center text-secondary py-2">
        <Typography variant="xs" className="text-secondary">
          {i18n._(t`Output is estimated. You will receive at least`)}{' '}
          <Typography variant="xs" className="text-lightBlue" weight={700} component="span">
            {minAmount?.toFixed(6)} {outputTokenWrapped?.symbol}
          </Typography>{' '}
          {i18n._(t`or the transaction will revert.`)}
        </Typography>
      </div>
    </div>
  )
}

export default SwapModalHeader
