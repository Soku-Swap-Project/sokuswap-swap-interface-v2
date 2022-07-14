import { ChevronRightIcon } from '@heroicons/react/outline'
import React, { Fragment, memo } from 'react'
import { CrossChainTrade, InstantTrade } from 'rubic-sdk'

const SwapRoute = memo(({ trade }: { trade: InstantTrade | CrossChainTrade }) => {
  return (
    <div className="flex flex-wrap items-center justify-end">
      {trade?.path.map((token: any, i: any, path: any) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          <Fragment key={i}>
            <div className="flex flex-end space-x-2">
              <div className="text-sm font-bold  text-high-emphesis" style={{ color: '#05195a' }}>
                {trade?.path[i]?.symbol}
              </div>
            </div>
            {isLastItem ? null : <ChevronRightIcon width={12} height={12} />}
          </Fragment>
        )
      })}
    </div>
  )
})

SwapRoute.displayName = 'SwapRoute'

export default SwapRoute
