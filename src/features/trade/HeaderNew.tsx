import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Currency } from '@sushiswap/core-sdk'
import NavLink from 'app/components/NavLink'
import Settings from 'app/components/Settings'
import Typography from 'app/components/Typography'
import MyOrders from 'app/features/legacy/limit-order/MyOrders'
import { useRouter } from 'next/router'
import React, { FC } from 'react'

const getQuery = (input?: Currency, output?: Currency) => {
  if (!input && !output) return

  if (input && !output) {
    // @ts-ignore
    return { inputCurrency: input.address || 'ETH' }
  } else if (input && output) {
    // @ts-ignore
    return { inputCurrency: input.address, outputCurrency: output.address }
  }
}

interface HeaderNewProps {
  inputCurrency?: Currency
  outputCurrency?: Currency
  trident?: boolean
}

const HeaderNew: FC<HeaderNewProps> = ({ inputCurrency, outputCurrency, trident = false }) => {
  const { i18n } = useLingui()
  const { asPath } = useRouter()
  const isLimitOrder = asPath.startsWith('/limit-order')

  return (
    <div className="flex items-center pt-4 justify-between gap-1">
      <div className="flex gap-4">
        <NavLink
          activeClassName="text-high-emphesis emphasized-selected"
          href={{
            pathname: '/swap',
            // query: getQuery(inputCurrency, outputCurrency),
          }}
        >
          <Typography
            weight={700}
            style={{ padding: '12px', color: '#05195a', borderRadius: '14px' }}
            className="text-secondary hover_shadow_button hover:text-white"
          >
            {i18n._(t`Swap`)}
          </Typography>
        </NavLink>
        <NavLink
          activeClassName="text-high-emphesis emphasized-selected"
          href={{
            pathname: '/cross-swap',
            // query: getQuery(inputCurrency, outputCurrency),
          }}
        >
          <Typography
            weight={700}
            style={{ padding: '12px', color: '#05195a', borderRadius: '14px' }}
            className="text-secondary hover_shadow_button hover:text-white"
          >
            {i18n._(t`Cross-Swap`)}
          </Typography>
        </NavLink>
        {/* <NavLink
          activeClassName="text-high-emphesis"
          href={{
            pathname: '/limit-order',
            query: getQuery(inputCurrency, outputCurrency),
          }}
        >
          <Typography weight={700} className="text-secondary hover:text-white">
            {i18n._(t`Limit`)}
          </Typography>
        </NavLink> */}
      </div>
      <div className="flex gap-4">
        {isLimitOrder && <MyOrders />}
        <Settings className="!w-6 !h-6" trident={trident} />
      </div>
    </div>
  )
}

export default HeaderNew
