import React, { PureComponent }   from 'react'
import { bindActionCreators }     from 'redux'
import { connect }                from 'react-redux'
import { FormattedMessage,
         injectIntl }             from 'react-intl'
import Modal                      from 'react-modal'
import QrReader                   from 'react-qr-reader'

import * as modalConstants        from '../constants/ModalConstants'
import * as doAddKnownBoardModal  from '../reducers/AddKnownBoardModal'
import { isIOS, isMobile }        from '../utils/utils'

import styles from './AddKnownBoardModal.css'

class AddKnownBoardModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      boardUrl: '',
    };
    this.onNameChange = this.onNameChange.bind(this);
    this.openCamera   = this.openCamera.bind(this);
    this.onScanned    = this.onScanned.bind(this);
  }

  openCamera() {
    window.getQRCode = code => {
      this.setState({boardUrl: code});
    };

    let url = 'opencamera://';
    var iframe = document.createElement("IFRAME");
    iframe.setAttribute("src", url);
    document.documentElement.appendChild(iframe);
    iframe = null;
  }

  onNameChange(e) {
    this.setState({boardUrl:e.target.value})
  }

  onScanned(data) {
    if (data) {
      const { modalInput:{ modalJoinBoardSubmit }} = this.props

      this.setState({boardUrl:data})

      modalJoinBoardSubmit(data)
    }
  }

  render() {
    const { intl, modalInput: {modalJoinBoardSubmit},  onModalClose, modal: { currentModal }} = this.props
    const { boardUrl } = this.state

    let onSubmitAndClose = function() {
      modalJoinBoardSubmit(boardUrl)
    }

    const placeholder = intl.formatMessage({id: 'add-known-board-modal.placeholder'});

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.AddDeviceScannerModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Add Known Board Modal">
          <div className={styles['add-known-board-container']}>
            <div className={styles['add-known-board']}>
              <div className={styles['add-known-board-title']}>
                <FormattedMessage
                  id="add-known-board-modal.title"
                  defaultMessage="Enter Group ID to join"
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
                  <div className={styles['add-known-board-scanner-container']}>
                    <div className={styles['submodal-qr-code-scanner']}>
                      <QrReader
                        delay={300}
                        onError={(err) => console.error(err)}
                        onScan={this.onScanned}
                        className={styles['submodal-qr-code-scanner']}
                      />
                      <div className={styles['submodal-qr-code-text']}>
                        <FormattedMessage
                          id="add-known-board-modal.scan-code-title"
                          defaultMessage="Scann QR Code to join Group"
                        />
                      </div>
                    </div>
                  </div>
              }
              <div className={styles['add-known-board-node-id']}>
                <textarea
                  placeholder={placeholder}
                  autoFocus={!isMobile()}
                  name='title-input'
                  value={boardUrl}
                  onChange={this.onNameChange}/>
              </div>
              <div className={styles['add-known-board-action-section']}>
                <button className={styles['add-known-board-submit']} onClick={onSubmitAndClose}>
                  <FormattedMessage
                    id="add-known-board-modal.scan-code-action"
                    defaultMessage="Join"
                  />
                </button>
                <button className={styles['add-known-board-cancel']} onClick={onModalClose}>
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
    doAddKnownBoardModal: bindActionCreators(doAddKnownBoardModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddKnownBoardModal))
