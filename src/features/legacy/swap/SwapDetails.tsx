import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, CurrencyAmount, NATIVE } from '@sushiswap/core-sdk'
import Chip from 'app/components/Chip'
import Typography from 'app/components/Typography'
import TradePrice from 'app/features/legacy/swap/TradePrice'
import { classNames, computeRealizedLPFeePercent } from 'app/functions'
import { getTradeVersionV2, TradeVersionV2 } from 'app/functions/getTradeVersion'
import useFeeData from 'app/hooks/useFeeData'
import useSushiGuardFeature from 'app/hooks/useSushiGuardFeature'
import useSwapSlippageTolerance from 'app/hooks/useSwapSlippageTollerence'
import { useActiveWeb3React } from 'app/services/web3'
import { useSwapState } from 'app/state/swap/hooks'
import { useExpertModeManager } from 'app/state/user/hooks'
import { TradeUnion } from 'app/types'
import { useRouter } from 'next/router'
import React, { FC, Fragment, useMemo, useState } from 'react'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'
import { toWei } from 'web3-utils'

interface SwapDetailsContent {
  rubicTrade?: InstantTrade | CrossChainTrade
  trade?: TradeUnion
  recipient?: string
}

interface SwapDetails {
  inputCurrency?: Currency
  priceImpact?: number
  outputCurrency?: Currency
  recipient?: string
  trade?: TradeUnion
  rubicTrade?: InstantTrade | CrossChainTrade
  className?: string
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  minimumAmountOut?: CurrencyAmount<Currency>
  inverted?: any
  setInverted?: any
}

const SwapDetails: FC<SwapDetails> = ({
  inputCurrency,
  outputCurrency,
  recipient,
  trade,
  priceImpact,
  rubicTrade,
  inputAmount,
  outputAmount,
  minimumAmountOut,
  className,
}) => {
  const [inverted, setInverted] = useState(false)

  return (
    <Disclosure as="div">
      {({ open }) => (
        <div
          className={classNames(
            open ? 'bg-dark-900' : '',
            'flex flex-col gap-2 py-2 rounded px-2 border border-gray transition hover_shadow',
            className
          )}
          style={{ boxShadow: '0 0 16px rgba(33,33,33,.2)' }}
        >
          <div className="flex items-center justify-between gap-2 pl-2">
            Transaction Details
            {/* <div>
              <TradePrice
                inputCurrency={inputCurrency}
                outputCurrency={outputCurrency}
                price={trade?.executionPrice}
                showInverted={inverted}
                setShowInverted={setInverted}
              />
            </div> */}
            <Disclosure.Button as={Fragment}>
              <div className="flex items-center justify-end flex-grow gap-2 p-1 rfounded cursor-pointer">
                <Chip
                  size="sm"
                  id="trade-type"
                  label={getTradeVersionV2(rubicTrade) === TradeVersionV2.CROSSCHAIN_TRADE ? 'Cross-Chain' : 'Regular'}
                  color={getTradeVersionV2(rubicTrade) === TradeVersionV2.CROSSCHAIN_TRADE ? 'lightBlue' : 'blue'}
                />
                <ChevronDownIcon width={20} className={classNames(open ? 'transform rotate-180' : '')} />
              </div>
            </Disclosure.Button>
          </div>
          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            unmount={false}
          >
            <Disclosure.Panel static className="px-1 pt-2">
              <SwapDetailsContent
                trade={trade}
                rubicTrade={rubicTrade}
                recipient={recipient}
                inputAmount={inputAmount}
                priceImpact={priceImpact}
                outputAmount={outputAmount}
                minimumAmountOut={minimumAmountOut}
                inputCurrency={inputCurrency}
                outputCurrency={outputCurrency}
                inverted={inverted}
                setInverted={setInverted}
              />
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  )
}

const SwapDetailsContent: FC<SwapDetails> = ({
  trade,
  rubicTrade,
  priceImpact,
  inputAmount,
  outputAmount,
  inputCurrency,
  outputCurrency,
  inverted,
  setInverted,
  minimumAmountOut,
}) => {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()
  const router = useRouter()
  const isCrossChain = router.route === '/cross-swap'

  const allowedSlippage = useSwapSlippageTolerance(trade)
  const minReceived = isCrossChain ? rubicTrade?.toTokenAmountMin : rubicTrade?.toTokenAmountMin?.tokenAmount
  const minReceivedAsNumber = parseFloat(minReceived?.toString())
  // const minReceived = minimumAmountOut || trade?.minimumAmountOut(allowedSlippage)
  const realizedLpFeePercent = trade ? computeRealizedLPFeePercent(trade) : undefined
  const sushiGuardEnabled = useSushiGuardFeature()
  const [expertMode] = useExpertModeManager()
  const { maxFeePerGas, maxPriorityFeePerGas } = useFeeData()
  const { maxFee, maxPriorityFee } = useSwapState()

  const _outputAmount = outputAmount || trade?.outputAmount
  const _inputAmount = inputAmount || trade?.inputAmount

  const _maxFee = expertMode && maxFee ? maxFee : maxFeePerGas
  const _maxPriorityFee = expertMode && maxPriorityFee ? maxPriorityFee : maxPriorityFeePerGas

  const path = useMemo(() => {
    if (rubicTrade) {
      return rubicTrade.path
    }
    return []
  }, [rubicTrade])

  // const priceImpact = useMemo(() => {
  //   if (trade instanceof LegacyTrade) {
  //     const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
  //     const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)
  //     return priceImpact
  //   } else if (trade instanceof TridentTrade) {
  //     return Number(trade.route.priceImpact) * 100
  //   }
  //   return 0
  // }, [trade])

  const priceImpactClassName = useMemo(() => {
    if (!priceImpact) return undefined
    if (typeof priceImpact === 'number') {
      if (priceImpact < 0) return 'text-green'
      if (priceImpact < 0.01) return 'text-primary'
      if (priceImpact < 0.03) return 'text-yellow'
    }

    return 'text-red'
  }, [priceImpact])

  return (
    <div className="flex flex-col divide-y divide-dark-850">
      <div className="flex flex-col gap-1 pb-2">
        {isCrossChain || !trade?.executionPrice ? null : (
          <div>
            <TradePrice
              inputCurrency={inputCurrency}
              outputCurrency={outputCurrency}
              price={trade?.executionPrice}
              showInverted={inverted}
              setShowInverted={setInverted}
            />
          </div>
        )}
        <div className="flex justify-between gap-4">
          <Typography variant="xs">{i18n._(t`Expected Output`)}</Typography>
          <Typography weight={700} variant="xs" className="text-right">
            {_outputAmount?.toFixed(6)} {rubicTrade?.to?.symbol}
          </Typography>
        </div>
        <div className="flex justify-between gap-4">
          <Typography variant="xs">{i18n._(t`Price Impact`)}</Typography>
          <Typography variant="xs" className={classNames('text-right', priceImpactClassName)}>
            {/* {priceImpact?.toFixed(2)}% */}
            {/* {priceImpact instanceof Percent ? `${priceImpact.multiply(-1).toFixed(2)}%` : null} */}
            {typeof priceImpact === 'number' && priceImpact > 0
              ? `${-priceImpact?.toFixed(2)}%`
              : (priceImpact as number) === 0
              ? `<0.01%`
              : null}
          </Typography>
        </div>
        {/* {recipient && isAddress(recipient) && (
          <div className="flex justify-between gap-4">
            <Typography variant="xs">{i18n._(t`Recipient`)}</Typography>
            <Typography variant="xs" className="text-right">
              {shortenAddress(recipient)}
            </Typography>
          </div>
        )} */}
      </div>
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex justify-between gap-4">
          <Typography variant="xs" className="text-secondary">
            {i18n._(t`Minimum received after slippage`)} ({allowedSlippage.toFixed(2)}%)
          </Typography>
          <Typography variant="xs" className="text-right text-secondary">
            {minReceivedAsNumber.toLocaleString('en-US')} {rubicTrade?.to?.symbol}
          </Typography>
        </div>
        {/* {realizedLpFeePercent && (
          <div className="flex justify-between gap-4">
            <Typography variant="xs" className="text-secondary">
              {i18n._(t`Liquidity provider fee`)}
            </Typography>
            <Typography variant="xs" className="text-right text-secondary">
              {realizedLpFeePercent.toFixed(2)}%
            </Typography>
          </div>
        )} */}
        {path && (
          <div className="grid grid-cols-2 gap-4">
            <Typography variant="xs" className="text-secondary">
              {i18n._(t`Route`)}
            </Typography>
            <Typography variant="xs" className="text-right text-secondary">
              {path.map((token: any) => token.symbol).join(' > ')}
            </Typography>
          </div>
        )}
      </div>
      {sushiGuardEnabled && (
        <div className="flex flex-col gap-1 py-2">
          {/* <div className="grid grid-cols-2 gap-4">
            <Typography variant="xs" className="text-secondary">
              {i18n._(t`SushiGuard Gas Rebate`)}
            </Typography>
            <Link href="https://docs.openmev.org/" passHref={true}>
              <a target="_blank">
                <Typography variant="xs" className="flex items-center justify-end gap-1 text-right text-blue">
                  {i18n._(t`Enabled`)}
                  <ExternalLinkIcon width={12} />
                </Typography>
              </a>
            </Link>
          </div> */}
          <div className="grid grid-cols-2 gap-4">
            <Typography variant="xs" className="text-secondary">
              {i18n._(t`Max Fee`)}
            </Typography>
            <Typography variant="xs" className="text-right text-secondary">
              {chainId &&
                _maxFee &&
                CurrencyAmount.fromRawAmount(NATIVE[chainId], toWei(_maxFee.toString(), 'gwei'))?.toSignificant(6)}{' '}
              GWEI
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Typography variant="xs" className="text-secondary">
              {i18n._(t`Max Priority Fee`)}
            </Typography>
            <Typography variant="xs" className="text-right text-secondary">
              {chainId &&
                _maxPriorityFee &&
                CurrencyAmount.fromRawAmount(NATIVE[chainId], toWei(_maxPriorityFee.toString(), 'gwei'))?.toSignificant(
                  6
                )}{' '}
              GWEI
            </Typography>
          </div>
        </div>
      )}
    </div>
  )
}

export default SwapDetails
