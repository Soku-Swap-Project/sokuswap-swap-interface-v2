import { CogIcon } from '@heroicons/react/outline'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Percent } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import Popover from 'app/components/Popover'
import TransactionSettings from 'app/components/TransactionSettings'
import Typography from 'app/components/Typography'
import { classNames } from 'app/functions'
import useWalletSupportsSushiGuard from 'app/hooks/useWalletSupportsSushiGuard'
import { useActiveWeb3React } from 'app/services/web3'
import { useToggleSettingsMenu } from 'app/state/application/hooks'
import { useExpertModeManager, useUserSingleHopOnly, useUserSushiGuard } from 'app/state/user/hooks'
import React, { FC, useState } from 'react'

interface SettingsTabProps {
  placeholderSlippage?: Percent
  trident?: boolean
  className?: string
}

const SettingsTab: FC<SettingsTabProps> = ({ placeholderSlippage, className, trident = false }) => {
  const { i18n } = useLingui()
  const { chainId } = useActiveWeb3React()

  const toggle = useToggleSettingsMenu()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [userUseSushiGuard, setUserUseSushiGuard] = useUserSushiGuard()
  const walletSupportsSushiGuard = useWalletSupportsSushiGuard()

  return (
    <>
      <Popover
        placement="bottom-end"
        content={
          <div className="flex flex-col gap-3 p-3 rounded shadow-xl bg-dark-900 w-80">
            <div className="flex flex-col gap-4 p-3 border rounded border-light-800/60">
              <Typography variant="xxs" weight={700} className="text-blue">
                {i18n._(t`Transaction Settings`)}
              </Typography>
              <TransactionSettings placeholderSlippage={placeholderSlippage} trident={trident} />
            </div>
          </div>
        }
      >
        <div
          className={classNames(className, 'flex items-center justify-center w-10 h-10 rounded-full cursor-pointer')}
        >
          <CogIcon style={{ background: 'none' }} className="w-[26px] h-[26px] transform rotate-90 hover_shadow_icon" />
        </div>
      </Popover>
      <HeadlessUiModal.Controlled isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxWidth="md">
        <div className="flex flex-col gap-4">
          <HeadlessUiModal.Header header={i18n._(t`Confirm`)} onClose={() => setShowConfirmation(false)} />
          <HeadlessUiModal.BorderedContent className="flex flex-col gap-3 !border-yellow/40">
            <Typography variant="xs" weight={700} className="text-secondary">
              {i18n._(t`Only use this mode if you know what you are doing.`)}
            </Typography>
            <Typography variant="sm" weight={700} className="text-yellow">
              {i18n._(t`Expert mode turns off the confirm transaction prompt and allows high slippage trades
                                that often result in bad rates and lost funds.`)}
            </Typography>
          </HeadlessUiModal.BorderedContent>
          <Button
            id="confirm-expert-mode"
            color="blue"
            variant="filled"
            onClick={() => {
              toggleExpertMode()
              setShowConfirmation(false)
            }}
          >
            {i18n._(t`Enable Expert Mode`)}
          </Button>
        </div>
      </HeadlessUiModal.Controlled>
    </>
  )
}

export default SettingsTab
