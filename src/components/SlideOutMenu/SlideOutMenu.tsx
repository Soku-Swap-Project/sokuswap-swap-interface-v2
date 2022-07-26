/* eslint-disable */
import React, { FC, useState } from 'react'
import { css } from '@emotion/css'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import SchoolIcon from '@mui/icons-material/School'
// import { NavLink } from 'react-router-dom'
import useTransak from 'app/hooks/useTransak'
import { useActiveWeb3React } from 'app/services/web3'
import useIsCoinbaseWallet from 'app/hooks/useIsCoinbaseWallet'
import Web3Network from '../Web3Network'
import { NETWORK_ICON, NETWORK_LABEL, NETWORK_LABEL_SHORT } from 'app/config/networks'
import { SupportedChainId } from 'app/enums/SupportedChainId'
import { NavLink } from 'react-router-dom'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ClaimSokuModal from '../ClaimSokuModal'
import AccountModal from '../AccountModal'
import { useWalletModalToggle } from 'app/state/application/hooks'

// import '../Menu/Menu.css'

const easeSlow = css`
  transition: all 450ms ease-in-out;
`

const menuBtn = css`
  position: relative;
  right: 35px;
  z-index: 3;
  cursor: pointer;
  ${easeSlow};
  &.closer {
    position: fixed;
    transform: rotate(180deg);
  }
`

const btnLine = css`
  width: 25px;
  height: 3px;
  margin: 0 0 5px 0;
  background-color: #05195a;
  ${easeSlow};
  &.closer {
    background-color: #05195a;
    &:nth-child(1) {
      transform: rotate(45deg) translate(4px, 0px);
      width: 12px;
    }
    &:nth-child(2) {
      transform: translateX(-14px);
    }
    &:nth-child(3) {
      transform: rotate(-45deg) translate(4px, 0px);
      width: 12px;
    }
    visibility: hidden;
  }
`

const close = css`
  display: none;
`

const menuOverlay = css`
  z-index: 2;
  position: fixed;
  top: 0;
  right: 0;
  border: none;
  // border-radius: 10px;
  height: auto;
  background: #ecf1f8;
  color: #fff;
  width: 600px;
  min-height: 100vh;
  transform: translateX(100%);
  transition: all 500ms ease-in-out;
  .test {
    padding-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  &.show {
    // background: linear-gradient(100deg, #05195a 20%, #040f31);
    transform: translateX(0%);
    box-shadow: 2px 20px 20px 3px rgb(0 0 0 / 33%);
  }

  @media (max-width: 850px) {
    width: 30vw;
  }

  @media (max-width: 550px) {
    width: 45vw;
  }
`

const SlideOutMenu: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  const { launchTransak } = useTransak()
  const { account, chainId, library } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const isCoinbaseWallet = useIsCoinbaseWallet()
  const router = useRouter()
  const isTradeActive = router.pathname === '/cross-swap' || router.pathname === '/swap'
  const origin = window.location.origin

  const MenuByChain = () => {
    if (chainId === SupportedChainId.BSC_MAINNET) {
      return (
        <>
          <Link href="/swap" as="/swap">
            <li
              style={{ borderRadius: '7px', padding: '14px' }}
              className="nav_link_mobile hover_shadow emphasized-selected active_mobile_link"
            >
              Trade
            </li>
          </Link>
          <a className="nav_link_mobile" href={`${origin}/bsc/#/limit-order`}>
            <li>Limit Orders</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/bsc/#/pool`}>
            <li>Pool</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/bridge`}>
            <li>Bridge</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/bsc/farms`}>
            <li>Farms</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/bsc/staking/`}>
            <li>Staking</li>
          </a>
          <a
            className="nav_link_mobile"
            onClick={() => {
              toggleMenu()
              launchTransak()
            }}
          >
            <li>Deposit</li>
          </a>
        </>
      )
    } else if (chainId === SupportedChainId.MAINNET) {
      return (
        <>
          <Link href="/swap" as="/swap">
            <li
              style={{ borderRadius: '7px', padding: '14px' }}
              className="nav_link_mobile hover_shadow emphasized-selected active_mobile_link"
            >
              Trade
            </li>
          </Link>
          <a className="nav_link_mobile" href={`${origin}/ethereum/#/pool`}>
            <li>Pool</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/bridge`}>
            <li>Bridge</li>
          </a>
          <a className="nav_link_mobile" href={`${origin}/ethereum/farms`}>
            <li>Farms</li>
          </a>
          <a
            className="nav_link_mobile"
            onClick={() => {
              toggleMenu()
              launchTransak()
            }}
          >
            <li>Deposit</li>
          </a>
        </>
      )
    }
    return (
      <Link href="/swap" as="/swap">
        <li
          style={{ borderRadius: '7px', padding: '14px' }}
          className={'nav_link_mobile hover_shadow emphasized-selected active_mobile_link'}
        >
          Trade
        </li>
      </Link>
    )
  }

  return (
    <nav className="mobile_navbar">
      <div>
        <div className="mobile_menu_logo">
          <div className="flex items-center w-6 mr-4 logo_shadow">
            <img
              style={{ maxWidth: 'none', objectFit: 'contain', width: '30px' }}
              src="https://i.ibb.co/sm60Zb7/Soku-Logo-400x400.png"
              alt="SokuSwap logo"
              // layout="responsive"
            />
          </div>
        </div>
      </div>
      {/* 
      <div>
        <div className={`${menuBtn} ${isMenuOpen ? 'closer' : null}`} onClick={toggleMenu}>
          <div className={`${btnLine} ${isMenuOpen ? 'closer' : null}`} />
          <div className={`${btnLine} ${isMenuOpen ? 'closer' : null}`} />
          <div className={`${btnLine} ${isMenuOpen ? 'closer' : null}`} />
        </div>
      </div> */}

      <MenuIcon fontSize="medium" onClick={toggleMenu} />

      <div onClick={toggleMenu} className={`${menuOverlay} ${isMenuOpen ? 'show' : null} z-20`}>
        {/* <CloseIcon onClick={toggleMenu} /> */}
        <div className="mobile_menu_header">
          <h1>Menu</h1>
        </div>
        <div>
          <ul>
            <div className="flex flex-col gap-4 px-6">
              {library && (
                <div
                  style={{
                    display: 'flex',
                    padding: '10px',
                    fontWeight: 'bold',
                    alignItems: 'center',
                    color: '#05195a',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={NETWORK_ICON[chainId as number]}
                    width="24px"
                    height="24px"
                    style={{ borderRadius: '24px', objectFit: 'contain', marginRight: '8px' }}
                    alt="network icon"
                  />{' '}
                  {NETWORK_LABEL_SHORT[chainId as number]}
                </div>
              )}
            </div>
            <div className="mobile_menu_list">
              {MenuByChain()}
              <hr style={{ height: '1px', border: 0, backgroundColor: '#05195a', opacity: '0.2', margin: '20px' }} />
              <a
                style={{ display: 'flex', color: '#05195a' }}
                href="https://sokuswap-2.gitbook.io/sokuswap-gitbook/"
                className="hover_shadow_icon"
                rel="noreferrer noopener"
                target="_blank"
              >
                <SchoolIcon />
                <p className="pl-4">Docs</p>
              </a>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {account ? (
                  <AccountModal />
                ) : (
                  <li className="hover_shadow account_modal">
                    <button
                      type="button"
                      style={{ color: '#05195a', fontWeight: 'bold', paddingBottom: '14px' }}
                      onClick={toggleWalletModal}
                    >
                      Connect Wallet
                    </button>
                  </li>
                )}
                <li className="claimSoku__nav">
                  <ClaimSokuModal />
                </li>
              </div>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default SlideOutMenu
