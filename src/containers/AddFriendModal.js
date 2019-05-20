import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { FormattedMessage,
  injectIntl } from 'react-intl'
import QRCode from 'qrcode.react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import QRScannerSubmodal from '../components/QRScannerSubmodal'

import * as doAddFriendModal from '../reducers/AddFriendModal'

import * as constants from '../constants/Constants'
import * as modalConstants from '../constants/ModalConstants'
import { isMobile } from '../utils/utils'

import styles from './AddFriendModal.module.css'

class AddFriendModal extends PureComponent {
  constructor (props) {
    super()
    this.refreshKeyInfoInterval = null
    this.state = {
      friendReqId: '',
      currentTab: 'display',
      qrCodeCopied: false
    }
    this.onFriendIdChange = this.onFriendIdChange.bind(this)
    this.onScanned = this.onScanned.bind(this)
    this.onTabChange = this.onTabChange.bind(this)
  }

  onTabChange (e) {
    const { id } = e && e.currentTarget && e.currentTarget.dataset
    if (!id) return

    this.setState({
      currentTab: id
    })
  }

  onScanned (data) {
    if (data) {
      const { modalInput: { friend } } = this.props

      this.setState({
        friendReqId: data
      })
      friend.addFriendAction(data)
    }
  }

  onFriendIdChange (e) {
    this.setState({ friendReqId: e.target.value })
  }

  componentWillMount () {
    const { modalInput: { friend } } = this.props

    this.refreshKeyInfoInterval = setInterval(() => friend.refreshKeyInfo(), constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    clearInterval(this.refreshKeyInfoInterval)
  }

  render () {
    const { intl,
      onModalClose,
      modal: { currentModal },
      modalInput: { friend } } = this.props
    const { friendReqId, currentTab, qrCodeCopied } = this.state

    // const expTimeVal = expiredFormat(friend.data.friendJoinKey.UpdateTS.T, friend.data.friendJoinKey.expirePeriod)

    return (
      <div>
        <Modal
          overlayClassName='SignInModal__Overlay'
          style={modalConstants.scannerModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel='Add Friend Scanner Modal'>
          <div className={styles['tab-pages-container']}>
            <div className={styles['tab-pages']}>
              <div className={styles['tab-pages-title']}>
                <FormattedMessage
                  id='add-friend-modal.title'
                  defaultMessage='Add friend'
                />
              </div>
              {
                (() => {
                  let displayClasses = styles['switcher-item']
                  let scannerClasses = styles['switcher-item']
                  const activeTabClass = styles['active-switcher-item']

                  if (currentTab === 'display') {
                    displayClasses += ' ' + activeTabClass
                  } else {
                    scannerClasses += ' ' + activeTabClass
                  }

                  return <div className={styles['switcher-item-container']}>
                    <div className={displayClasses} data-id='display' onClick={this.onTabChange}>
                      <FormattedMessage
                        id='add-friend-modal.show-qrcode'
                        defaultMessage='Show QR Code'
                      />
                    </div>

                    <div className={scannerClasses} data-id='scanner' onClick={this.onTabChange}>
                      <FormattedMessage
                        id='add-friend-modal.scan-qrcide'
                        defaultMessage='Scan QR Code'
                      />
                    </div>
                  </div>
                })()
              }
              {
                currentTab === 'scanner'
                  ? <ScannerPage
                    friendReqId={friendReqId}
                    intl={intl}
                    friend={friend}
                    onModalClose={onModalClose}
                    onScanned={this.onScanned}
                    onFriendIdChange={this.onFriendIdChange}
                  />
                  : <QRCodePage
                    friend={friend}
                    qrCodeCopied={qrCodeCopied}
                    onModalClose={onModalClose}
                    onCopy={() => this.setState({ qrCodeCopied: true })}
                  />
              }
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const QRCodePage = props => {
  const { friend, qrCodeCopied, onModalClose, onCopy } = props
  const addFriendUrl = friend &&
                        friend.data &&
                        friend.data.friendJoinKey &&
                        friend.data.friendJoinKey.URL
  return (
    <div className={styles['tab-page-container']}>
      <div className={styles['qr-code-container']}>
        <QRCode value={addFriendUrl} size={250} />
      </div>
      <div className={styles['tab-page']}>
        <CopyToClipboard text={addFriendUrl} onCopy={onCopy}>
          <button className={styles['copy-button']} onClick={null}>
            {
              qrCodeCopied ? (
                <FormattedMessage
                  id='add-device-modal.copy-node-id-2'
                  defaultMessage='Copied'
                />
              ) : (
                <FormattedMessage
                  id='add-friend-modal.copy-my-id-1'
                  defaultMessage='Copy your ID'
                />
              )
            }
          </button>
        </CopyToClipboard>
        <button className={styles['tab-page-cancel']} onClick={onModalClose}>
          <FormattedMessage
            id='first-popup-modal.action1'
            defaultMessage='Cancel'
          />
        </button>
      </div>
    </div>
  )
}

const ScannerPage = props => {
  const { friend, friendReqId, intl, onModalClose, onFriendIdChange, onScanned } = props

  const placeholder = intl.formatMessage({ id: 'add-friend-modal.placeholder' })
  const onSubmitAndClose = () => friend.addFriendAction(friendReqId)

  return (
    <div className={styles['tab-page-container']}>
      <QRScannerSubmodal onScanned={onScanned} />
      <div className={styles['tab-page-node-id']}>
        <textarea
          placeholder={placeholder}
          autoFocus={!isMobile()}
          name='title-input'
          value={friendReqId}
          onChange={onFriendIdChange} />
      </div>
      <div className={styles['tab-page']}>
        <button className={styles['tab-page-submit']} onClick={onSubmitAndClose}>
          <FormattedMessage
            id='add-friend-modal.scan-code-action'
            defaultMessage='Add'
          />
        </button>
        <button className={styles['tab-page-cancel']} onClick={onModalClose}>
          <FormattedMessage
            id='first-popup-modal.action1'
            defaultMessage='Cancel'
          />
        </button>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doAddFriendModal: bindActionCreators(doAddFriendModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddFriendModal))
