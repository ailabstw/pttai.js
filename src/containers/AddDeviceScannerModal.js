import React, { PureComponent }       from 'react'
import { connect }                    from 'react-redux'
import { bindActionCreators }         from 'redux'
import Slider                         from 'react-slick'
import Modal                          from 'react-modal'
import QrReader                       from 'react-qr-reader'
import { CopyToClipboard }            from 'react-copy-to-clipboard'
import { FormattedMessage,
         injectIntl }                 from 'react-intl'

import AlertComponent                 from '../components/AlertComponent'
import * as doAddDeviceScannerModal   from '../reducers/AddDeviceScannerModal'
import * as modalConstants            from '../constants/ModalConstants'
import * as constants                 from '../constants/Constants'

import styles                         from './AddDeviceScannerModal.css'

class AddDeviceScannerModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      inputNodeId: '',
      inputPrivateKey:'',
      keyCopied: false,
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onNodeIdChange     = this.onNodeIdChange.bind(this);
    this.onPKeyChange       = this.onPKeyChange.bind(this);
    this.onNext             = this.onNext.bind(this)
    this.onComplete         = this.onComplete.bind(this)
    this.onScanned          = this.onScanned.bind(this);
    this.onScannerClose     = this.onScannerClose.bind(this);
  }

  onScanned(data) {
    if (data) {
      this.setState({
        inputNodeId: data
      });
      this.onNext()
    }
  }

  onScannerClose() {
    const { modalInput, onModalSwitch } = this.props

    onModalSwitch(constants.SHOW_DEVICE_INFO, modalInput)
  }

  onNext(e) {
    this.slider.slickNext();
  }

  onNodeIdChange(e) {
    this.setState({inputNodeId: e.target.value})
  }

  onPKeyChange(e) {
    this.setState({inputPrivateKey: e.target.value})
  }

  onComplete(e) {
    const { modalInput:{ device } } = this.props
    const { inputNodeId, inputPrivateKey } = this.state

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
                id="alert.message4"
                defaultMessage="[Success] Deivce Added"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
        that.onScannerClose()
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
      device.addDeviceAction(inputNodeId, inputPrivateKey, addDeviceCallBack)
    }
  }

  render() {
    const { intl, modalInput:{ keyInfo }, modal: { currentModal }} = this.props
    const { showAlert, alertData, inputNodeId, inputPrivateKey, keyCopied,  } = this.state

    const placeholder1 = intl.formatMessage({id: 'add-device-scanner-modal.placeholder1'});
    const placeholder2 = intl.formatMessage({id: 'add-device-scanner-modal.placeholder2'});

    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    return (
      <div>
        <Modal
          overlayClassName="AddDeviceScannerModal__Overlay"
          style={modalConstants.AddDeviceScannerModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={this.onScannerClose}
          contentLabel="Add Device Scanner Modal">
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']} onClick={this.onScannerClose}></div>
              <div className={styles['title']}>
                <FormattedMessage
                  id="add-device-scanner-modal.title"
                  defaultMessage="Sync with Main Device"
                />
              </div>
              <div className={styles['null-space']}></div>
            </div>
            <div className={styles['content']}>
             <div className={styles['slide-list']}>
                <Slider ref={slider => (this.slider = slider)} {...settings} initialSlide={1} rtl={true} arrows={false}>
                  <div className={styles['slide-item']}>
                    <div className={styles['container']}>
                      <div className={styles['p-key']}>
                        <CopyToClipboard text={keyInfo.data.userPrivateKey}
                                         onCopy={() => this.setState({keyCopied: true})}>
                          <button className={styles['copy-button']}>
                            {
                              keyCopied ? (
                                <FormattedMessage
                                  id="add-device-scanner-modal.copy-device-id-2"
                                  defaultMessage="Copied"
                                />
                              ):(
                                <FormattedMessage
                                  id="add-device-scanner-modal.copy-device-id-1"
                                  defaultMessage="Copy Private Key"
                                />
                              )
                            }
                          </button>
                        </CopyToClipboard>
                        <div className={styles['text-value']}>
                          <input
                            readOnly
                            value={keyInfo.data.userPrivateKey}/>
                        </div>
                        <div className={styles['helper-text']}>
                          <FormattedMessage
                            id="add-device-scanner-modal.copy-device-id-3"
                            defaultMessage="Copy the above Private key and paste below"
                          />
                         </div>
                        <div className={styles['paste-area-pkey']}>
                          <textarea
                            placeholder={placeholder1}
                            autoFocus
                            name='title-input'
                            value={inputPrivateKey}
                            onChange={this.onPKeyChange}/>
                        </div>
                        <div className={styles['action-section']}>
                          <button className={styles['submit-button']} onClick={this.onComplete}>
                            <FormattedMessage
                              id="add-device-scanner-modal.copy-device-id-action1"
                              defaultMessage="Start to sync"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles['slide-item']}>
                    <div className={styles['container']}>
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
                              id="add-device-scanner-modal.copy-device-id-4"
                              defaultMessage="Scan QR Code to sync"
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles['paste-area-node-id']}>
                          <textarea
                            placeholder={placeholder2}
                            autoFocus
                            name='title-input'
                            value={inputNodeId}
                            onChange={this.onNodeIdChange}/>
                      </div>
                      <div className={styles['action-section']}>
                        <button className={styles['submit-button']} onClick={this.onNext}>
                          <FormattedMessage
                            id="add-device-scanner-modal.copy-device-id-action2"
                            defaultMessage="Next"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </Slider>
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
    doAddDeviceScannerModal: bindActionCreators(doAddDeviceScannerModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddDeviceScannerModal))
