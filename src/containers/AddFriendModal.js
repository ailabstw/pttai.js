import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Modal                    from 'react-modal'
import QrReader                 from 'react-qr-reader'
import { FormattedMessage,
         injectIntl }           from 'react-intl'
import QRCode                     from 'qrcode.react'
import { CopyToClipboard }        from 'react-copy-to-clipboard'

import * as doAddFriendModal    from '../reducers/AddFriendModal'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import { isIOS, isAndroid, isMobile }      from '../utils/utils'

import styles from './AddFriendModal.css'

class AddFriendModal extends PureComponent {
  constructor(props) {
    super();
    this.refreshKeyInfoInterval = null
    this.state = {
      friendReqId: '',
      currentTab: 'display',
      qrCodeCopied: false
    };
    this.onFriendIdChange = this.onFriendIdChange.bind(this);
    this.openCamera       = this.openCamera.bind(this);
    this.onScanned        = this.onScanned.bind(this);
    this.onTabChange      = this.onTabChange.bind(this);
  }

  onTabChange(e) {
    const {id} = e && e.currentTarget && e.currentTarget.dataset;
    if (!id) return;

    this.setState({
      currentTab: id
    })
  }

  openCamera() {
    let that = this;
    if (isIOS()) {
      let iframe = document.createElement('IFRAME');
      iframe.setAttribute('src', 'opencamera://');

      window.getQRCode = code => {
        that.setState({friendReqId: code});
        iframe.remove();
      };

      document.documentElement.appendChild(iframe);
    }

    if (isAndroid) {
      // Workaround for android:
      // play() can only be initiated by a user gesture (Android)
      // ref: https://github.com/spotify/web-playback-sdk/issues/5

      let container = event.target.parentElement

      if (container.classList.contains(styles['scanner-btn'])) {
        container = container.parentElement
      }

      if (container.classList.contains(styles['scanner-btn-container'])) {
        container = container.parentElement
      }

      container.querySelector(`.${styles['scanner-btn-container']}`).remove()
      container.querySelector(`.${styles['scanner-container']}`).hidden = false
      container.querySelector('video').play()
    }
  }

  onScanned(data) {
    if (data) {
      const { modalInput:{ friend }} = this.props

      this.setState({
        friendReqId: data
      });
      friend.addFriendAction(data)
    }
  }

  onFriendIdChange(e) {
    this.setState({friendReqId:e.target.value})
  }

  componentWillMount() {
    const { modalInput:{ friend }} = this.props

    this.refreshKeyInfoInterval = setInterval(() => friend.refreshKeyInfo(), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshKeyInfoInterval)
  }

  render() {
    const { intl,
            onModalClose,
            modal: { currentModal },
            modalInput:{ friend } } = this.props
    const { friendReqId, currentTab, qrCodeCopied } = this.state

    // const expTimeVal = expiredFormat(friend.data.friendJoinKey.UpdateTS.T, friend.data.friendJoinKey.expirePeriod)

    return (
      <div>
        <Modal
          overlayClassName="SignInModal__Overlay"
          style={modalConstants.AddDeviceScannerModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Add Friend Scanner Modal">
          <div className={styles['submodal-signin-container']}>
            <div className={styles['submodal-signin']}>
              <div className={styles['submodal-signin-title']}>
                <FormattedMessage
                  id="add-friend-modal.title"
                  defaultMessage="Add friend"
                />
              </div>
              {
                (() => {
                  let displayClasses = styles['tab-container-tab']
                  let scannerClasses = styles['tab-container-tab']
                  const activeTabClass = styles['active-tab']

                  if (currentTab === 'display') {
                    displayClasses += ' ' + activeTabClass
                  }
                  else {
                    scannerClasses += ' ' + activeTabClass
                  }

                  return <div className={styles['tab-container']}>
                    <div className={displayClasses} data-id="display" onClick={this.onTabChange}>
                      <FormattedMessage
                        id="add-friend-modal.show-qrcode"
                        defaultMessage="Show QR Code"
                      />
                    </div>

                    <div className={scannerClasses} data-id="scanner" onClick={this.onTabChange}>
                      <FormattedMessage
                        id="add-friend-modal.scan-qrcide"
                        defaultMessage="Scan QR Code"
                      />
                    </div>
                  </div>
                })()
              }
              {
                currentTab === 'scanner' ?
                  <ScannerPage
                    friendReqId={friendReqId}
                    intl={intl}
                    friend={friend}
                    onModalClose={onModalClose}
                    onScanned={this.onScanned}
                    onFriendIdChange={this.onFriendIdChange}
                    openCamera={this.openCamera}
                  /> :
                  <QRCodePage
                    friend={friend}
                    qrCodeCopied={qrCodeCopied}
                    onModalClose={onModalClose}
                    onCopy={() => this.setState({qrCodeCopied: true})}
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
  const addFriendUrl =  friend &&
                        friend.data &&
                        friend.data.friendJoinKey &&
                        friend.data.friendJoinKey.URL;
  return (
    <div className={styles['tab-page']}>
      <div className={styles['qr-code']}>
        <QRCode value={addFriendUrl} size={250} />
      </div>
      <div className={styles['submodal-signin-action-section']}>
        <CopyToClipboard text={addFriendUrl} onCopy={onCopy}>
          <button className={styles['copy-button']} onClick={null}>
            {
              qrCodeCopied? (
                <FormattedMessage
                  id="add-device-modal.copy-node-id-2"
                  defaultMessage="Copied"
                />
              ): (
                <FormattedMessage
                  id="add-friend-modal.copy-my-id-1"
                  defaultMessage="Copy your ID"
                />
              )
            }
          </button>
        </CopyToClipboard>
        <button className={styles['submodal-signin-cancel']} onClick={onModalClose}>
          <FormattedMessage
            id="first-popup-modal.action1"
            defaultMessage="Cancel"
          />
        </button>
      </div>
    </div>
  )
}

const ScannerPage = props => {
  const { friend, friendReqId, intl, onModalClose, onScanned, onFriendIdChange, openCamera } = props

  const placeholder = intl.formatMessage({id: 'add-friend-modal.placeholder'})
  const onSubmitAndClose = () => friend.addFriendAction(friendReqId)

  return (
    <div className={styles['tab-page']}>
      {
        isIOS() || isAndroid() ?
          <div className={styles['scan-btn-container']} onClick={openCamera} >
            <div className={styles['scan-btn']}>
              <FormattedMessage
                id="qrcode-scanner.tap-to-scan"
                defaultMessage="Tap to scan QR Code"
              />
            </div>
          </div>
          :
          <div className={styles['submodal-signin-scanner-container']}>
            <div className={styles['submodal-qr-code-scanner']}>
              <QrReader
                delay={300}
                onError={(err) => console.error(err)}
                onScan={onScanned}
                className={styles['submodal-qr-code-scanner']}
              />
              <div className={styles['submodal-qr-code-text']}>
                <FormattedMessage
                  id="add-friend-modal.scan-code-title"
                  defaultMessage="Scann QR Code to add friend"
                />
              </div>
            </div>
          </div>
      }
      <div className={styles['submodal-signin-node-id']}>
        <textarea
          placeholder={placeholder}
          autoFocus={!isMobile()}
          name='title-input'
          value={friendReqId}
          onChange={onFriendIdChange}/>
      </div>
      <div className={styles['submodal-signin-action-section']}>
        <button className={styles['submodal-signin-submit']} onClick={onSubmitAndClose}>
          <FormattedMessage
            id="add-friend-modal.scan-code-action"
            defaultMessage="Add"
          />
        </button>
        <button className={styles['submodal-signin-cancel']} onClick={onModalClose}>
          <FormattedMessage
            id="first-popup-modal.action1"
            defaultMessage="Cancel"
          />
        </button>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doAddFriendModal: bindActionCreators(doAddFriendModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddFriendModal))
