// import './AccountModal.css'

import Modal from '@material-ui/core/Modal'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getExplorerLink } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import React from 'react'

/* eslint-disable */

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[10],
        padding: theme.spacing(2, 4, 3)
    }
}))

export default function AccountModal() {
    const classes = useStyles()
    const [open, setOpen] = React.useState(false)
    // const { login, logout } = useAuth()
    const { account, chainId } = useActiveWeb3React()

    const truncatedFirstHalf = account?.substring(0, 5)
    const truncatedLastHalf = account?.substring(account.length - 5, account.length)
    const truncatedAddress = `${truncatedFirstHalf}...${truncatedLastHalf}`

        const isMobile = window.innerWidth <= 1000


    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    // const logoutAccount = () => {
    //     localStorage.removeItem('redux_localstorage_simple_user')
    //     return deactivate
    // }

    const body = (
        <div className="flex flex-col gap-6 network_modal">
            <div className="modal_header">
            <h1 className="text-blue font-bold">Account Details</h1>
                <CloseIcon className='hover_shadow_icon' style={{color: '#05195a', cursor: 'pointer'}} onClick={handleClose} />
            </div>
            <hr />
            <div className="account__modal_details">
                <div className="wallet_info">
                    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Wallet: {truncatedAddress}</p>
                    <img
                        className="nav_logo"
                        alt="Logo"
                        src="https://bscscan.com/token/images/sokuv2_32.png"
                        style={{ height: '20px', marginLeft: '5px' }}
                    />
                </div>

                <a target="_blank" className="view_on_scan hover_shadow" style={{ color:'#fff', background: '#05195a', padding: '12px 24px', borderRadius: '14px'}} href={getExplorerLink(chainId, account, 'address')}>
                    <h2 className='pr-2'>View on Etherscan</h2>
                    <OpenInNewIcon />
                </a>
                {/* <button className="account_logout" onClick={logoutAccount()}>
                    <h2>Log Out</h2>
                    <span className="material-icons ">logout</span>
                </button> */}
            </div>
        </div>
    )

    return (
        <>
            <li type="button" className={isMobile ? 'account_modal_mobile' : 'account_modal' + " hover_shadow p-3"} onClick={handleOpen}>
                <span>Account:</span>
                {truncatedAddress}
            </li>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className="network_modal_container"
            >
                {body}
            </Modal>
        </>
    )
}
