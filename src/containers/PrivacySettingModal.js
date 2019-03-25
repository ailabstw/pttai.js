import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import { injectIntl,
         FormattedMessage }         from 'react-intl'

import AlertComponent        from '../components/AlertComponent'

import * as constants         from '../constants/Constants'
import * as modalConstants    from '../constants/ModalConstants'
import * as doPrivacySettingModal from '../reducers/PrivacySettingModal'

import googleAnalytics from '../utils/googleAnalytics'

import styles from './PrivacySettingModal.css'

class PrivacySettingModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      showAlert: false,
      fromSignInPage: props.modalInput && props.modalInput.fromSignInPage,
      termsAgree: props.modalInput && typeof props.modalInput.fromSignInPage === "boolean" && props.modalInput.fromSignInPage ? props.modalInput.termsAgree : true,
      gaAgree: (props.modalInput && props.modalInput.gaAgree !== undefined) ? props.modalInput.gaAgree : googleAnalytics.getConfig().track === 'true',
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit() {
    const { modalInput: { userId, firstPopUpInput }, onModalClose, onModalSwitch } = this.props
    const { fromSignInPage, gaAgree, termsAgree } = this.state

    if (fromSignInPage) {
      onModalSwitch(constants.FIRST_POPUP_MODAL, {
        ...firstPopUpInput,
        gaAgree: gaAgree,
        termsAgree: termsAgree,
      })
    } else {
      googleAnalytics.clearConfig()
      googleAnalytics.saveConfig(userId, gaAgree)

      onModalClose()
    }
  }

  onCancel() {
    const { onModalClose, onModalSwitch, modalInput: {firstPopUpInput} } = this.props
    const { fromSignInPage } = this.state

    if (fromSignInPage) {
      onModalSwitch(constants.FIRST_POPUP_MODAL, firstPopUpInput)
    } else {
      onModalClose()
    }
  }

  render() {
    const { modal: { currentModal }} = this.props
    const { showAlert, alertData, fromSignInPage, termsAgree, gaAgree } = this.state

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.privacySettingModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Privacy Setting Modal">
          <div className={styles['root']}>
            <div className={styles['ga-bar']}>
              <div className={styles['prev-button']} onClick={() => this.onCancel()}>
                <div className={styles['prev-button-icon']}></div>
              </div>
              <div className={styles['ga-title']}>
                <FormattedMessage
                    id="privacy-modal.title1"
                    defaultMessage="Terms and Conditions & Google Analytics Tracking"
                />
              </div>
              <div className={styles['null-space']}>
              </div>
            </div>
            <div className={styles['ga-agreement']}>

              <div className={styles['ga-agreement-content']}>
                <div className={styles['ga-agreement-paragraph']}>
                  <FormattedMessage
                      id="privacy-modal.content1"
                      defaultMessage=""
                  />
                </div>
                <div className={styles['ga-agreement-paragraph']}>
                  <FormattedMessage
                      id="privacy-modal.content2"
                      defaultMessage=""
                  />
                </div>
                <div className={styles['ga-agreement-paragraph']}>
                  <FormattedMessage
                      id="privacy-modal.content3"
                      defaultMessage=""
                  />
                  &nbsp;
                  <a href='https://ptt.ai/terms-of-use/' target="_blank" rel="noopener noreferrer">https://ptt.ai/terms-of-use/</a>
                </div>
                <div className={styles['ga-agreement-paragraph']}>
                  <FormattedMessage
                      id="privacy-modal.content4"
                      defaultMessage=""
                  />
                </div>
              </div>

              <div className={fromSignInPage? styles['ga-agreement-item'] : styles['ga-agreement-item-disabled']}>
                <label className={styles['checkmark-container']}>
                  <FormattedMessage
                    id="first-popup-modal.title3"
                    defaultMessage="Let us collect your data"
                  />
                  <input type="radio"
                         name="terms-agreemenet"
                         disabled={!fromSignInPage}
                         checked={termsAgree}
                         onClick={() => { this.setState({ termsAgree: !termsAgree })}}
                  />
                  <span className={styles['checkmark']}></span>
                </label>
              </div>

              <div className={styles['ga-agreement-item']}>
                <label className={styles['checkmark-container']}>
                  <FormattedMessage
                    id="first-popup-modal.title4"
                    defaultMessage="Agree to user tracking for improving Ptt.ai's service"
                  />
                  <input type="radio"
                         checked={gaAgree}
                         onClick={() => this.setState({ gaAgree: !gaAgree })} />
                  <span className={styles['checkmark']}></span>
                </label>
              </div>

              <div className={styles['action-section']}>
                <button className={styles['confirm']} onClick={() => this.onSubmit() }>
                  <FormattedMessage
                    id="alert-component.action2"
                    defaultMessage="Confirm"
                  />
                </button>
                <button hidden className={styles['cancel']} onClick={() => this.onCancel()}>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
              </div>

            </div>
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
    doPrivacySettingModal: bindActionCreators(doPrivacySettingModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PrivacySettingModal))
