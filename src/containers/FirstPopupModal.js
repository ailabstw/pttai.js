import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import QrReader                     from 'react-qr-reader'
import { injectIntl,
         FormattedMessage }         from 'react-intl'

import AlertComponent from '../components/AlertComponent'

import * as modalConstants    from '../constants/ModalConstants'
import * as constants         from '../constants/Constants'
import * as doFirstPopupModal from '../reducers/FirstPopupModal'

import styles from './FirstPopupModal.css'

function isEmpty(name) {
  return name.replace(/\s\s+/g, '') === ''
}

class FirstPopupModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      name: '',
      nodeId: '',
      showAlert: false,
      scannerIsOpen: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onNameChange   = this.onNameChange.bind(this);
    this.onSubmitName   = this.onSubmitName.bind(this);
    this.onScannerClose = this.onScannerClose.bind(this);
    this.onScanned      = this.onScanned.bind(this);
    this.onNodeIdChange = this.onNodeIdChange.bind(this);
    this.onSignIn       = this.onSignIn.bind(this);
  }

  onNameChange(e) {
    this.setState({ name:e.target.value })
  }

  onScannerClose() {
    this.setState({ scannerIsOpen: false })
  }

  onScanned(data) {
    if (data) {
      this.setState({
        nodeId: data
      });
      this.onSignIn(data)
    }
  }

  onNodeIdChange(e) {
    this.setState({nodeId: e.target.value})
  }

  onSubmitName() {
    const { modalInput: { signUp } } = this.props
    const { name } = this.state

    let that = this
    let trimmedName = name.trim()

    if (trimmedName === constants.DEFAULT_USER_NAME) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message17"
                defaultMessage="User name cannot be '{DEFAULT_USER_NAME}'"
                values={{ DEFAULT_USER_NAME: constants.DEFAULT_USER_NAME }}
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedName).length - 2 > constants.MAX_USER_NAME_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message18"
                defaultMessage="User name cannot exceed {MAX_USER_NAME_SIZE} characters"
                values={{ MAX_USER_NAME_SIZE: constants.MAX_USER_NAME_SIZE }}
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (isEmpty(trimmedName)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message19"
                defaultMessage="User name cannot be empty"
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      signUp(trimmedName)
    }
  }

  onSignIn(nodeId) {
    const { onModalClose, modalInput:{ userPrivateKeyInfo, signIn } } = this.props

    let inputNodeId     = nodeId
    let inputPrivateKey = userPrivateKeyInfo

    let that = this
    let addDeviceCallBack = (response) => {
      if (response.error) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message3"
                defaultMessage="[Error] {data}:{nodeId}"
                values={{ data: response.data, nodeId: response.nodeId}}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message27"
                defaultMessage="[Success] Signed In"
              />),
            onConfirm: () => {
              that.setState({showAlert: false})
              that.onScannerClose()
              onModalClose()
            }
          }
        })
      }
    }

    if (!inputNodeId || !inputNodeId.startsWith('pnode://')) {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message5"
                defaultMessage="Node id empty or invalid"
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (!inputPrivateKey) {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message6"
                defaultMessage="Private key empty or invalid"
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      signIn(inputNodeId, inputPrivateKey, addDeviceCallBack)
    }
  }

  render() {
    const { intl, onModalClose, modal: { currentModal }} = this.props
    const { name, showAlert, alertData, scannerIsOpen, nodeId } = this.state

    const placeholder = intl.formatMessage({id: 'first-popup-modal.placeholder'});
    const placeholder2 = intl.formatMessage({id: 'sign-in-scanner-modal.placeholder2'});

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.firstPopupModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="First Popup Modal">
          <div className={styles['root']}>
            <div className={styles['sign-up']}>
              <div className={styles['profile-title']}>
                <FormattedMessage
                  id="first-popup-modal.title"
                  defaultMessage="Let your friend know who you are"
                />
              </div>
              <div className={styles['profile-input']}>
                <input
                  placeholder={placeholder}
                  autoFocus
                  name='title-input'
                  className={styles['profile-input-name']}
                  value={name}
                  onChange={this.onNameChange}/>
              </div>
              <div className={styles['signup-action']}>
                <button className={styles['close-button']} hidden onClick={onModalClose}>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
                <button className={styles['submit-button']} onClick={this.onSubmitName}>
                <FormattedMessage
                  id="first-popup-modal.action2"
                  defaultMessage="Confirm"
                />
                </button>
              </div>
            </div>
            <div className={styles['divider']}>
              <span>
                <FormattedMessage
                  id="first-popup-modal.divider"
                  defaultMessage="Or"
                />
              </span>
            </div>
            <div className={styles['sign-in']}>
              <div className={styles['signin-action']}>
                <button className={styles['close-button']} hidden onClick={onModalClose}>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
                <button className={styles['signin-button']} onClick={() => this.setState({scannerIsOpen:true})}>
                <FormattedMessage
                  id="first-popup-modal.action3"
                  defaultMessage="Sign In"
                />
                </button>
              </div>
            </div>

            <Modal
              overlayClassName="SignInModal__Overlay"
              style={modalConstants.AddDeviceScannerModalStyels}
              isOpen={scannerIsOpen}
              onRequestClose={this.onScannerClose}
              contentLabel="Sign In Scanner Modal">
              <div className={styles['submodal-container']}>
                <div className={styles['submodal-top-bar']}>
                  <div className={styles['submodal-prev-button']} onClick={this.onScannerClose}></div>
                  <div className={styles['submodal-title']}>
                    <FormattedMessage
                      id="sign-in-scanner-modal.title"
                      defaultMessage="Sign in as"
                    />
                  </div>
                  <div className={styles['submodal-null-space']}></div>
                </div>
                <div className={styles['submodal-qr-code-scanner-container']}>
                  <div className={styles['submodal-qr-code-scanner']}>
                    <QrReader
                      delay={300}
                      onError={(err) => console.error(err)}
                      onScan={this.onScanned}
                      className={styles['submodal-qr-code-scanner']}
                    />
                    <div className={styles['submodal-qr-code-text']}>
                      <FormattedMessage
                        id="add-device-scanner-modal.copy-device-id-4"
                        defaultMessage="Scan QR Code to sign in"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles['submodal-paste-area-node-id']}>
                    <textarea
                      placeholder={placeholder2}
                      autoFocus
                      name='title-input'
                      value={nodeId}
                      onChange={this.onNodeIdChange}/>
                </div>
                <div className={styles['submodal-action-section']}>
                  <button className={styles['submodal-submit-button']} onClick={() => this.onSignIn(nodeId)}>
                    <FormattedMessage
                      id="alert-component.action2"
                      defaultMessage="Confirm"
                    />
                  </button>
                </div>
              </div>
            </Modal>

          </div>
        </Modal>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doFirstPopupModal: bindActionCreators(doFirstPopupModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(FirstPopupModal))
