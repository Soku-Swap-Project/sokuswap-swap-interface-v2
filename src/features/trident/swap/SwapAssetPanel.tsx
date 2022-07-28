import { ChevronDownIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency, Percent, Token, ZERO } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import NumericalInput from 'app/components/Input/Numeric'
import QuestionHelper from 'app/components/QuestionHelper'
import Typography from 'app/components/Typography'
import { classNames, formatNumber, tryParseAmount, warningSeverity } from 'app/functions'
// import { useBentoOrWalletBalance } from 'app/hooks/useBentoOrWalletBalance'
import { useUSDCValue } from 'app/hooks/useUSDCPrice'
import useCurrencyBalance, { useTokenAndEtherBalanceFromContract } from 'app/lib/hooks/useCurrencyBalance'
import CurrencySearchModal from 'app/modals/SearchModal/CurrencySearchModal'
import { useActiveWeb3React } from 'app/services/web3'
import { getChainIdByRubicName } from 'connectors/helpers'
import React, { FC, ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BlockchainName } from 'rubic-sdk'

import BentoBoxFundingSourceModal from '../add/BentoBoxFundingSourceModal'

interface SwapAssetPanel {
  ref?: ForwardedRef<HTMLInputElement>
  error?: boolean
  // @ts-ignore TYPE NEEDS FIXING
  header: (x) => React.ReactNode
  // @ts-ignore TYPE NEEDS FIXING
  walletToggle?: (x) => React.ReactNode
  currency?: Currency
  currencies?: string[]
  value?: string
  onChange(x?: string): void
  onSelect?(x: Currency): void
  spendFromWallet?: boolean
  selected?: boolean
  selectedChain?: any
  priceImpact?: Percent
  priceImpactCss?: string
  inputDisabled?: boolean
  disabled?: boolean
  balancePanel?: (x: Pick<SwapAssetPanel, 'disabled' | 'currency' | 'onChange' | 'spendFromWallet'>) => React.ReactNode
  hideInput?: boolean
}

const SwapAssetPanel: FC<SwapAssetPanel> = forwardRef<HTMLInputElement, SwapAssetPanel>(
  (
    {
      error,
      header,
      walletToggle,
      selectedChain,
      currency,
      value,
      onChange,
      selected,
      onSelect,
      spendFromWallet,
      priceImpact,
      priceImpactCss,
      disabled,
      inputDisabled,
      currencies,
      balancePanel,
      hideInput,
    },
    ref
  ) => {
    return (
      <div
        className={classNames(
          disabled ? 'pointer-events-none opacity-40' : '',
          error ? 'border-red-800 hover:border-red-500' : 'border-gray hover_shadow',
          'rounded-[14px] border bg-dark-900 p-3 flex flex-col gap-4'
        )}
        style={{ boxShadow: '0 0 16px rgba(33,33,33,.2)' }}
      >
        {header({
          disabled,
          selectedChain,
          onChange,
          value,
          currency,
          currencies,
          onSelect,
          walletToggle,
          spendFromWallet,
        })}
        {!hideInput && (
          <div className="flex gap-1 justify-between items-baseline px-1.5">
            <InputPanel
              {...{
                ref,
                selected,
                selectedChain,
                error,
                currency,
                currencies,
                value,
                onChange,
                inputDisabled,
                onSelect,
                priceImpact,
                priceImpactCss,
                spendFromWallet,
              }}
            />
            {balancePanel ? (
              balancePanel({ disabled, currency, onChange, spendFromWallet })
            ) : (
              <BalancePanel {...{ disabled, currency, onChange, spendFromWallet, selectedChain }} />
            )}
          </div>
        )}
      </div>
    )
  }
)

const WalletSwitch: FC<
  Pick<SwapAssetPanel, 'spendFromWallet' | 'disabled'> & {
    label: string
    onChange(x: boolean): void
    id?: string
  }
> = ({ label, onChange, id, spendFromWallet, disabled }) => {
  const { i18n } = useLingui()

  const content = (
    <Typography
      variant="xs"
      weight={700}
      component="span"
      className={classNames(disabled ? 'pointer-events-none opacity-40' : '', 'flex items-center gap-2 !justify-end')}
    >
      {label}
      <Typography
        id={id}
        role="button"
        onClick={() => onChange(!spendFromWallet)}
        variant="sm"
        weight={700}
        component="span"
        className="flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer text-high-emphesis hover:text-white hover:shadow bg-light-800 hover:bg-dark-700"
      >
        {spendFromWallet ? i18n._(t`Wallet`) : i18n._(t`BentoBox`)}
      </Typography>
      <BentoBoxFundingSourceModal />
    </Typography>
  )

  if (disabled) {
    return <QuestionHelper text={i18n._(t`Not available for legacy route`)}>{content}</QuestionHelper>
  }

  return content
}

const InputPanel: FC<
  Pick<SwapAssetPanel, 'currency' | 'value' | 'onChange' | 'priceImpact' | 'inputDisabled' | 'selectedChain'> & {
    priceImpactCss?: string
  }
> = forwardRef(({ currency, value, onChange, inputDisabled, priceImpact, priceImpactCss, selectedChain }, ref) => {
  const usdcValue = useUSDCValue(tryParseAmount(value || '1', currency))
  const span = useRef<HTMLSpanElement | null>(null)
  const [width, setWidth] = useState(0)

  const priceImpactNum = parseFloat(priceImpact?.toSignificant(3) as string) / 100

  const priceImpactClassName = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return 'text-green'
    const severity = warningSeverity(priceImpactNum)
    if (severity < 1) return 'text-primary'
    if (severity < 3) return 'text-yellow'
    return 'text-red'
  }, [priceImpact, priceImpactNum])

  useEffect(() => {
    if (span.current) {
      setWidth(value ? span?.current?.clientWidth + 8 : 60)
    }
  }, [value])

  return (
    <Typography weight={700} variant="h3" className="relative flex items-baseline flex-grow gap-3 overflow-hidden">
      <NumericalInput
        ref={ref}
        disabled={inputDisabled}
        value={value || ''}
        onUserInput={onChange}
        placeholder="0.00"
        className="leading-[36px] focus:placeholder:text-low-emphesis flex-grow w-full text-left bg-transparent text-inherit disabled:cursor-not-allowed"
        autoFocus
      />
      {!ref && (
        <>
          <Typography
            variant="xs"
            className="text-secondary absolute bottom-1.5 pointer-events-none"
            component="span"
            style={{ left: width }}
          >
            {usdcValue?.greaterThan(ZERO) && <>~{formatNumber(usdcValue?.toFixed(), true, true, 2)} </>}
            {priceImpact && value && <span className={priceImpactClassName}>({priceImpactNum * -1}%)</span>}
          </Typography>
          {/*This acts as a reference to get input width*/}
          <Typography variant="h3" weight={700} className="relative flex flex-row items-baseline">
            <span ref={span} className="opacity-0 absolute pointer-events-none tracking-[0]">
              {`${value ? value : '0.00'}`}
            </span>
          </Typography>
        </>
      )}
    </Typography>
  )
})

const BalancePanel: FC<
  Pick<SwapAssetPanel, 'disabled' | 'currency' | 'onChange' | 'spendFromWallet' | 'selectedChain'>
> = ({ disabled, currency, onChange, spendFromWallet, selectedChain }) => {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()
  const selectedChainId = getChainIdByRubicName(selectedChain as BlockchainName)
  const isNative = currency?.isNative
  const nativeBal = useCurrencyBalance(account as string, currency)
  const nativeBalFormatted = Number(nativeBal?.toSignificant(6))
  const balance = useTokenAndEtherBalanceFromContract(
    account ?? undefined,
    currency as Token,
    selectedChainId ?? chainId
  )

  const handleClick = useCallback(() => {
    if (disabled || !balance || !onChange) return
    onChange(balance.toString())
  }, [balance, disabled, onChange])

  return (
    <Typography role="button" onClick={handleClick} variant="sm" className="flex text-secondary whitespace-nowrap">
      {i18n._(t`Balance:`)}{' '}
      {isNative && selectedChainId === chainId && !isNaN(nativeBalFormatted)
        ? nativeBalFormatted
        : balance
        ? balance.toFixed(6)
        : '0.00'}
    </Typography>
  )
}

const SwapAssetPanelHeader: FC<
  Pick<
    SwapAssetPanel,
    | 'currency'
    | 'currencies'
    | 'onSelect'
    | 'walletToggle'
    | 'spendFromWallet'
    | 'disabled'
    | 'onChange'
    | 'value'
    | 'selectedChain'
  > & { label: string; id?: string; selectLabel?: string; hideSearchModal?: boolean }
> = ({
  label,
  selectLabel,
  walletToggle,
  currency,
  onSelect,
  spendFromWallet,
  id,
  currencies,
  hideSearchModal,
  selectedChain,
}) => {
  const { i18n } = useLingui()

  const trigger = currency ? (
    <div
      id={id}
      className={classNames(
        hideSearchModal ? '' : 'bg-light-800 network_modal_button cursor-pointer',
        'flex items-center gap-2 px-2 py-1 rounded-full shadow-md text-high-emphesis'
      )}
    >
      <CurrencyLogo currency={currency} className="!rounded-full overflow-hidden" size={20} />
      {label && (
        <Typography variant="sm" className="!text-xl" weight={700}>
          {label}
        </Typography>
      )}
      <Typography variant="sm" className="!text-xl text-blue" weight={700}>
        {!spendFromWallet ? currency.wrapped.symbol : currency.symbol}
      </Typography>
      {!hideSearchModal && <ChevronDownIcon style={{ color: '#05195a' }} width={18} />}
    </div>
  ) : (
    <Button
      style={{ background: 'transparent', color: '#05195a', borderRadius: '14px' }}
      variant="filled"
      size="sm"
      id={id}
      className="!rounded-full !px-2 !py-0 !h-[32px] !pl-3 network_modal_button"
    >
      {selectLabel || i18n._(t`Select a Token`)}
      <ChevronDownIcon width={18} />
    </Button>
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center">
        {!hideSearchModal ? (
          <CurrencySearchModal
            selectedCurrency={currency}
            onCurrencySelect={(currency) => onSelect && onSelect(currency)}
            trigger={trigger}
            currencyList={currencies}
            selectedChain={selectedChain}
          />
        ) : (
          trigger
        )}
      </div>
      {walletToggle && walletToggle({ spendFromWallet })}
    </div>
  )
}

export default Object.assign(SwapAssetPanel, { Header: SwapAssetPanelHeader, Switch: WalletSwitch })
