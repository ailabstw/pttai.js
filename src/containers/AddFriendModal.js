import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Modal                    from 'react-modal'
import QrReader                 from 'react-qr-reader'
import { FormattedMessage,
         injectIntl }           from 'react-intl'

import * as doAddFriendModal    from '../reducers/AddFriendModal'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import { isIOS, isMobile }      from '../utils/utils'

import styles from './AddFriendModal.css'

class AddFriendModal extends PureComponent {
  constructor(props) {
    super();
    this.refreshKeyInfoInterval = null
    this.state = {
      friendReqId: '',
    };
    this.onFriendIdChange = this.onFriendIdChange.bind(this);
    this.openCamera       = this.openCamera.bind(this);
    this.onScanned        = this.onScanned.bind(this);
  }

  openCamera() {
    window.getQRCode = code => {
      this.setState({friendReqId: code});
    };

    let url = 'opencamera://';
    var iframe = document.createElement("IFRAME");
    iframe.setAttribute("src", url);
    document.documentElement.appendChild(iframe);
    iframe = null;
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
    const { friendReqId } = this.state

    let onSubmitAndClose = function() {
      friend.addFriendAction(friendReqId)
    }

    // const expTimeVal = expiredFormat(friend.data.friendJoinKey.UpdateTS.T, friend.data.friendJoinKey.expirePeriod)
    const placeholder = intl.formatMessage({id: 'add-friend-modal.placeholder'});

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
                isIOS() ?
                  <div className={styles['scan-btn-container']} onClick={this.openCamera} >
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
                        onScan={this.onScanned}
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
                  onChange={this.onFriendIdChange}/>
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
          </div>
        </Modal>
      </div>
    )
  }
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
