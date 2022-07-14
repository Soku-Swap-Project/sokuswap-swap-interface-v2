import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { HeadlessUiModal } from 'app/components/Modal'
import Typography from 'app/components/Typography'
import { classNames } from 'app/functions'
import { useCurrencyModalContext } from 'app/modals/SearchModal/CurrencySearchModal'
import React, { FC, useState } from 'react'

import CurrencyModalView from './CurrencyModalView'
import ManageLists from './ManageLists'
import ManageTokens from './ManageTokens'

const Manage: FC = () => {
  const { i18n } = useLingui()
  const { setView, onDismiss } = useCurrencyModalContext()
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <>
      <HeadlessUiModal.Header
        header={<h1 style={{ color: '#05195a' }}>Manage Lists</h1>}
        onClose={onDismiss}
        onBack={() => setView(CurrencyModalView.search)}
      />
      <div className="flex rounded border-light-800 hover:border-dark-700">
        {[i18n._(t`Lists`), i18n._(t`Tokens`)].map((title, i) => (
          <div
            key={i}
            className={classNames(
              tabIndex === i ? 'text-high-emphesis border-blue emphasized-selected' : 'border-transparent',
              'flex items-center mx-4 hover_shadow_button justify-center flex-1 px-1 py-3 rounded cursor-pointer select-none'
            )}
            onClick={() => setTabIndex(i)}
          >
            <Typography
              weight={700}
              className={classNames(tabIndex === i ? 'text-blue' : 'text-secondary', 'focus:outline-none')}
            >
              {title}
            </Typography>
          </div>
        ))}
      </div>
      {tabIndex === 0 && <ManageLists />}
      {tabIndex === 1 && <ManageTokens />}
    </>
  )
}

export default Manage
