/* eslint-disable @next/next/no-img-element */
import Container from 'app/components/Container'
import { NAV_CLASS } from 'app/components/Header/styles'
import useMenu from 'app/components/Header/useMenu'
import useIsCoinbaseWallet from 'app/hooks/useIsCoinbaseWallet'
import { useActiveWeb3React } from 'app/services/web3'
import { useNativeCurrencyBalances } from 'app/state/wallet/hooks'
// import Image from 'next/image'
import React, { FC } from 'react'

import SokuMenu from '../SokuMenu'

const HEADER_HEIGHT = 64

const Desktop: FC = () => {
  const menu = useMenu()
  const { account, chainId, library } = useActiveWeb3React()
  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const isCoinbaseWallet = useIsCoinbaseWallet()

  return (
    <>
      <header className="w-full lg:block bottom_border">
        <nav className={NAV_CLASS}>
          <Container maxWidth="full" className="mx-auto w-full">
            <div className="flex items-center justify-between gap-4 px-6">
              <div className="flex gap-4">
                <div className="flex items-center w-6 mr-4 logo_shadow">
                  <img
                    style={{ maxWidth: 'none', objectFit: 'contain', width: '72px' }}
                    src="https://bscscan.com/token/images/sokuv2_32.png"
                    alt="SokuSwap logo"
                    // layout="responsive"
                  />
                </div>
                <SokuMenu />
              </div>
            </div>
          </Container>
        </nav>
      </header>
      <div style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT }} />
    </>
  )
}

export default Desktop
