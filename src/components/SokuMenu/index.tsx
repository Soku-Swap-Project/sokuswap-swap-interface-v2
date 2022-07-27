/* eslint-disable @next/next/link-passhref */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
// import './Menu.css'

import GitHubIcon from '@mui/icons-material/GitHub'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import SchoolIcon from '@mui/icons-material/School'
import TelegramIcon from '@mui/icons-material/Telegram'
import TwitterIcon from '@mui/icons-material/Twitter'
import AccountModal from 'app/components/AccountModal'
import ClaimSokuModal from 'app/components/ClaimSokuModal'
import { NETWORK_ICON, NETWORK_LABEL_SHORT } from 'app/config/networks'
import { SupportedChainId } from 'app/enums/SupportedChainId'
import useTransak from 'app/hooks/useTransak'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

import Web3Status from '../Web3Status'

const SokuMenu: React.FC = (props) => {
  const { account, chainId } = useActiveWeb3React()
  const chain = chainId ?? 1
  const { launchTransak } = useTransak()
  const toggleWalletModal = useWalletModalToggle()
  const router = useRouter()
  const isTradeActive = router.pathname === '/cross-swap' || router.pathname === '/swap'
  const origin = window.location.origin

  const openHiddenLinks = () => {
    const hiddenLinks = document.getElementsByClassName('hidden_navLinks')
    // console.log(hiddenLinks)
    if (hiddenLinks[0]?.id === 'hidden_navLinks') {
      hiddenLinks[0].id = 'open'
    } else if (hiddenLinks[0]?.id === 'open') {
      hiddenLinks[0].id = 'hidden_navLinks'
    }
  }

  const MenuByChain = () => {
    if (chain === SupportedChainId.BSC_MAINNET) {
      return (
        <>
          <Link href="/swap" as="/swap">
            <span
              className={'nav_link hover_transparent' + isTradeActive ? ' emphasized-selected active_mobile_link' : ''}
            >
              <li style={{ borderRadius: '7px', padding: '7px' }}>Trade</li>
            </span>
          </Link>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bsc/#/limit-order">
            <li>Limit Orders</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bsc/#/pool">
            <li>Pool</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bridge">
            <li>Bridge</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bsc/farms">
            <li>Farms</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bsc/staking/">
            <li>Staking</li>
          </a>
          <a
            className="nav_link hover_transparent"
            onClick={() => {
              launchTransak()
            }}
          >
            <li>Deposit</li>
          </a>
        </>
      )
    } else if (chain === SupportedChainId.MAINNET) {
      return (
        <>
          <Link href="/swap" as="/swap">
            <span
              className={'nav_link hover_transparent' + isTradeActive ? ' emphasized-selected active_mobile_link' : ''}
            >
              <li style={{ borderRadius: '7px', padding: '7px' }}>Trade</li>
            </span>
          </Link>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/ethereum/#/pool">
            <li>Pool</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/bridge">
            <li>Bridge</li>
          </a>
          <a className="nav_link hover_transparent" href="https://app.sokuswap.finance/ethereum/farms">
            <li>Farms</li>
          </a>
          <a
            className="nav_link hover_transparent"
            onClick={() => {
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
          style={{ borderRadius: '7px', padding: '7px', color: '#05195a' }}
          className={'nav_link hover_transparent' + isTradeActive ? ' emphasized-selected active_mobile_link' : ''}
        >
          Trade
        </li>
      </Link>
    )
  }

  return (
    <div className="sokuswap__navbar">
      <nav className="soku_nav">
        <ul className="navbar__items">
          {/* <NavLink to="/swap">
            <img className="nav_logo" alt="Logo" src="images/Web-Corner-Logo.png" />
          </NavLink> */}
          {MenuByChain()}
        </ul>
        <ul className="connectWallet__options__DESKTOP">
          {chain && (
            <div style={{ display: 'flex', padding: '10px', fontWeight: 'bold', alignItems: 'center' }}>
              <img
                src={NETWORK_ICON[chain as number]}
                width="24px"
                height="24px"
                style={{ borderRadius: '24px', objectFit: 'contain', marginRight: '8px' }}
                alt="network icon"
              />{' '}
              {NETWORK_LABEL_SHORT[chain as number]}
            </div>
          )}

          {account ? (
            <AccountModal />
          ) : (
            <li className="hover_transparent account_modal">
              <button type="button" style={{ color: '#05195a', fontWeight: 'bold' }} onClick={toggleWalletModal}>
                Connect Wallet
              </button>
            </li>
          )}
          <div style={{ display: 'none' }}>
            <Web3Status />
          </div>
          <li className="claimSoku__nav">
            <ClaimSokuModal />
          </li>
          <li>
            <MoreHorizIcon className="hover_shadow_icon" style={{ cursor: 'pointer' }} onClick={openHiddenLinks} />
          </li>
        </ul>
        <ul className="hidden_navLinks" id="hidden_navLinks">
          {/* <li>
            <a href="/" rel="noreferrer noopener" className="disabled_link" target="_blank">
              <span className="material-icons">analytics</span>
              <p>Analytics</p>
            </a>
          </li> */}

          <li className="hidden_navLink">
            <a
              href="https://sokuswap-2.gitbook.io/sokuswap-gitbook/"
              className="hover_shadow_icon"
              rel="noreferrer noopener"
              target="_blank"
            >
              <SchoolIcon />
              <p>Docs</p>
            </a>
          </li>
          <li className="hidden_navLink">
            <a
              href="https://github.com/Soku-Swap-Project"
              className="hover_shadow_icon"
              rel="noreferrer noopener"
              target="_blank"
            >
              <GitHubIcon />
              <p>GitHub</p>
            </a>
          </li>
          <div
            className="social_icon_header"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '12px' }}
          >
            <p style={{ fontSize: '14px', marginLeft: '-5px' }} className="hidden_navLink">
              Social Links
            </p>
          </div>
          <div className="social_icon_row" style={{ display: 'flex', justifyContent: 'center' }}>
            <hr
              style={{ width: '65%', marginTop: '10px', paddingTop: '0', borderWidth: '1px' }}
              className="disabled_link"
            />
          </div>

          <li className="hidden_navLink" style={{ paddingTop: '16px' }}>
            <a href="https://t.me/SokuSwap" className="hover_shadow_icon" rel="noreferrer noopener" target="_blank">
              <TelegramIcon />
              <p>Telegram</p>
            </a>
          </li>
          <li className="hidden_navLink">
            <a
              href="https://twitter.com/sokuswap"
              className="hover_shadow_icon"
              rel="noreferrer noopener"
              target="_blank"
            >
              <TwitterIcon />
              <p>Twitter</p>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default SokuMenu
