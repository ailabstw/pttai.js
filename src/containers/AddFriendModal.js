import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Modal                    from 'react-modal'
import QRCode                   from 'qrcode.react'
import QrReader                 from 'react-qr-reader'
import QrCode                   from 'qrcode-reader'
import { CopyToClipboard }      from 'react-copy-to-clipboard';
import { FormattedMessage, injectIntl } from 'react-intl';

import * as doAddFriendModal    from '../reducers/AddFriendModal'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import { expiredFormat }        from '../utils/utilDatetime'

import styles from './AddFriendModal.css'

const SHOW_QR_CODE_TAB = 'SHOW_QR_CODE_TAB'
const SCAN_QR_CODE_TAB = 'SCAN_QR_CODE_TAB'

class AddFriendModal extends PureComponent {
  constructor(props) {
    super();
    this.refreshKeyInfoInterval = null
    this.rqScanner = new QrCode();
    this.state = {
      tab: SCAN_QR_CODE_TAB,
      friendReqId: '',
      copied: false,
    };
    this.onFriendIdChange = this.onFriendIdChange.bind(this);
    this.onSwtichTab      = this.onSwtichTab.bind(this);
    this.onScanned        = this.onScanned.bind(this);
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

  onSwtichTab(tab) {
    this.setState({tab:tab})
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
    const { friendReqId, copied, tab } = this.state

    const showQRStatus = (tab === SHOW_QR_CODE_TAB)? '-active':''
    const scanQRStatus = (tab === SCAN_QR_CODE_TAB)? '-active':''

    let onSubmitAndClose = function() {
      friend.addFriendAction(friendReqId)
    }

    const expTimeVal = expiredFormat(friend.data.friendJoinKey.UpdateTS.T, friend.data.friendJoinKey.expirePeriod)
    const placeholder = intl.formatMessage({id: 'add-friend-modal.placeholder'});

    return (
      <div>
        <Modal
          overlayClassName="AddFriendModal__Overlay"
          style={modalConstants.AddFriendModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Add Friend Modal">
        {/*
          <div className={styles['submodal-signin-container']}>
            <div className={styles['submodal-signin']}>
              <div className={styles['submodal-signin-title']}>
                <FormattedMessage
                  id="add-friend-modal.tab2"
                  defaultMessage="Add friend"
                />
              </div>
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
              <div className={styles['submodal-signin-node-id']}>
                  <textarea
                    placeholder={placeholder}
                    autoFocus
                    name='title-input'
                    value={friendReqId}
                    onChange={this.onFriendIdChange}/>
              </div>
              <div className={styles['submodal-signin-action-section']}>
                <button className={styles['submodal-signin-submit']} onClick={() => onSubmitAndClose()}>
                  <FormattedMessage
                    id="first-popup-modal.action2"
                    defaultMessage="Confirm"
                  />
                </button>
                <button className={styles['submodal-signin-cancel']} onClick={() => onModalClose()}>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
              </div>
            </div>
          </div>
        */}
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']}  onClick={onModalClose}></div>
              <div className={styles['title']}>
                <FormattedMessage
                  id="add-friend-modal.title"
                  defaultMessage="My ID"
                />
              </div>
              <div className={styles['null-space']}></div>
            </div>
            <div className={styles['tabs']}>
              <div className={styles['scan-code' + scanQRStatus]} onClick={() => this.onSwtichTab(SCAN_QR_CODE_TAB)}>
                <FormattedMessage
                  id="add-friend-modal.tab2"
                  defaultMessage="Add friend"
                />
              </div>
              <div className={styles['show-code' + showQRStatus]} onClick={() => this.onSwtichTab(SHOW_QR_CODE_TAB)}>
                <FormattedMessage
                  id="add-friend-modal.tab1"
                  defaultMessage="To be added"
                />
              </div>
            </div>
            {
              (tab === SHOW_QR_CODE_TAB) ? (
                <div className={styles['content']}>
                  <div className={styles['qr-code']}>
                    <QRCode value={friend.data.friendJoinKey.URL}
                            size={250} />
                  </div>
                  <div className={styles['join-id']}>
                      <div className={styles['expiration']}>
                        <FormattedMessage
                          id="add-friend-modal.expiration"
                          defaultMessage="Expire in {expTimeVal}"
                          values={{ expTimeVal: expTimeVal }}
                        />
                      </div>
                      <CopyToClipboard  text={friend.data.friendJoinKey.URL}
                                        onCopy={() => this.setState({ copied: true })}>
                        <button className={styles['copy-button']}>
                          <div>
                            <FormattedMessage
                              id="add-friend-modal.copy-my-id-1"
                              defaultMessage="Copy your ID"
                            />
                          </div>
                        </button>
                      </CopyToClipboard>
                    <div className={styles['text-value']}>
                      <input
                        readOnly={true}
                        value={friend.data.friendJoinKey.URL} />
                    </div>
                    <div className={styles['helper-text']}>
                    {
                      copied ? (
                        <FormattedMessage
                          id="add-friend-modal.copy-my-id-2"
                          defaultMessage="Copied, give this ID to other to become friends"
                        />
                      ):(
                        <FormattedMessage
                          id="add-friend-modal.copy-my-id-3"
                          defaultMessage="Copied, give this ID to other to become friends"
                        />
                      )
                    }
                    </div>
                  </div>
                </div>
              ):(
                <div className={styles['content']}>
                  <div className={styles['qr-code-scanner-container']}>
                    <div className={styles['qr-code-scanner']}>
                      <QrReader
                        delay={300}
                        onError={(err) => console.error(err)}
                        onScan={this.onScanned}
                        className={styles['qr-code-scanner']}
                      />
                      <div className={styles['qr-code-text']}>
                        <FormattedMessage
                          id="add-friend-modal.scan-code-title"
                          defaultMessage="Scann QR Code to add friend"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles['paste-join-id']}>
                    <textarea
                      placeholder={placeholder}
                      autoFocus
                      name='title-input'
                      value={friendReqId}
                      onChange={this.onFriendIdChange}/>
                  </div>
                  <div className={styles['action-section']}>
                    <button className={styles['submit-button']} onClick={onSubmitAndClose}>
                      <FormattedMessage
                        id="add-friend-modal.scan-code-action"
                        defaultMessage="Add"
                      />
                    </button>
                  </div>
                </div>
              )
            }
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
