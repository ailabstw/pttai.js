import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import { injectIntl,
         FormattedMessage }         from 'react-intl'

import AlertComponent        from '../components/AlertComponent'
import QRScannerSubmodal     from '../components/QRScannerSubmodal'

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
      //scannerIsOpen: false,
      submodalType: 'Sign-up',
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onKeydown      = this.onKeydown.bind(this);
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

  onKeydown(e) {
    if (e && !e.isComposing && e.keyCode === 13) { // press enter
      this.onSubmitName();
    }
  }

  onSignInSubmodal() {
    this.setState({ submodalType: 'Sign-in' })
  }

  onSignUpSubmodal() {
    this.setState({ submodalType: 'Sign-up' })
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

    let waitingCallBack = () => {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message28"
              defaultMessage="[Wait] Signing..."
            />),
        }
      })
    }

    let addDeviceCallBackFunc = (response) => {
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
                id="alert.message28"
                defaultMessage="[Wait] Signing..."
              />),
          }
        })
      }
    }

    let signedInCallBackFunc = (userPrivateKeyInfo, deviceJoinKeyInfo) => {
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
      signIn(inputNodeId, inputPrivateKey, addDeviceCallBackFunc, waitingCallBack, signedInCallBackFunc)
    }
  }

  render() {
    const { intl, onModalClose, modal: { currentModal }} = this.props
    const { name, showAlert, alertData, submodalType, nodeId } = this.state

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
            <div className={styles['sign-in']}>
              <div className={styles['signin-action']}>
                <div className={styles['profile-title']}>
                  <FormattedMessage
                    id="first-popup-modal.title"
                    defaultMessage="Sign in with existing account"
                  />
                </div>
                <button className={styles['signin-button']} onClick={() => this.setState({ submodalType: 'Sign-in' })}>
                <FormattedMessage
                  id="first-popup-modal.action3"
                  defaultMessage="Sign In"
                />
                </button>
              </div>
            </div>

            <div className={styles['divider']}>
              <FormattedMessage
                id="first-popup-modal.divider"
                defaultMessage="Or"
              />
            </div>

            <div className={styles['sign-up']}>
              <div className={styles['signup-action']}>
                <button className={styles['close-button']} hidden onClick={onModalClose}>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
                <button className={styles['submit-button']} onClick={() => this.setState({ submodalType: 'Sign-up' })}>
                <FormattedMessage
                  id="first-popup-modal.action4"
                  defaultMessage="Sign up as new user"
                />
                </button>
              </div>
            </div>

            <Modal
              overlayClassName="SignUpModal__Overlay"
              style={modalConstants.SignupModalStyels}
              isOpen={submodalType === 'Sign-up'}
              onRequestClose={this.onScannerClose}
              contentLabel="Sign Up Scanner Modal">
              <div className={styles['submodal-signup-container']}>
                <div className={styles['submodal-signup']}>
                  <div className={styles['submodal-signup-title']}>
                    <FormattedMessage
                      id="first-popup-modal.title2"
                      defaultMessage="Let others know your name"
                    />
                  </div>
                  <div className={styles['submodal-signup-profile-input']}>
                    <input
                      placeholder={placeholder}
                      autoFocus
                      name='title-input'
                      className={styles['profile-input-name']}
                      value={name}
                      onKeyDown={this.onKeydown}
                      onChange={this.onNameChange}/>
                  </div>
                  <div className={styles['submodal-signup-action-section']}>
                    <button className={styles['submodal-signup-confirm']} onClick={() => this.onSubmitName() }>
                      <FormattedMessage
                        id="alert-component.action2"
                        defaultMessage="Confirm"
                      />
                    </button>
                    <button hidden={true} className={styles['submodal-signup-cancel']} onClick={() => this.setState({ submodalType: null })}>
                      <FormattedMessage
                        id="first-popup-modal.action1"
                        defaultMessage="Cancel"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              overlayClassName="SignInModal__Overlay"
              style={modalConstants.AddDeviceScannerModalStyels}
              isOpen={submodalType === 'Sign-in'}
              onRequestClose={this.onScannerClose}
              contentLabel="Sign In Scanner Modal">
              <div className={styles['submodal-signin-container']}>
                <div className={styles['submodal-signin']}>
                  <div className={styles['submodal-signin-title']}>
                    <FormattedMessage
                      id="first-popup-modal.title"
                      defaultMessage="Sign in with existing account"
                    />
                  </div>
                  <QRScannerSubmodal onScanned={this.onScanned} />
                  <div className={styles['submodal-signin-node-id']}>
                      <textarea
                        placeholder={placeholder2}
                        autoFocus
                        name='title-input'
                        value={nodeId}
                        onChange={this.onNodeIdChange}/>
                  </div>
                  <div className={styles['submodal-signin-action-section']}>
                    <button className={styles['submodal-signin-submit']} onClick={() => this.onSignIn(nodeId)}>
                      <FormattedMessage
                        id="first-popup-modal.action2"
                        defaultMessage="Confirm"
                      />
                    </button>
                    <button className={styles['submodal-signin-cancel']} onClick={() => this.setState({ submodalType: null })}>
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
