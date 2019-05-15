import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import { FormattedMessage } from 'react-intl'

import * as doAddDeviceModal from '../reducers/AddDeviceModal'
import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'
import { expiredFormat } from '../utils/utilDatetime'

import styles from './AddDeviceModal.css'

class AddDeviceModal extends PureComponent {
  constructor (props) {
    super()
    this.refreshKeyInfoInterval = null
    this.state = {
      copied: false
    }
  }

  componentWillMount () {
    const { modalInput: { keyInfo } } = this.props

    this.refreshKeyInfoInterval = setInterval(() => keyInfo.refreshKeyInfo(), constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    clearInterval(this.refreshKeyInfoInterval)
  }

  render () {
    const { modalInput: { device, keyInfo }, onModalSwitch, modal: { currentModal } } = this.props
    const { copied } = this.state

    let onSwtichToMultiDevices = function () {
      onModalSwitch(constants.SHOW_DEVICE_INFO, { device: device, keyInfo: keyInfo })
    }

    const expTimeVal = expiredFormat(keyInfo.data.deviceJoinKey.UpdateTS.T, keyInfo.data.deviceJoinKey.expirePeriod)

    return (
      <div>
        <Modal
          overlayClassName='AddDeviceModal__Overlay'
          style={modalConstants.addDeviceModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onSwtichToMultiDevices}
          contentLabel='Add Device Modal'>
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']} onClick={onSwtichToMultiDevices} />
              <div className={styles['title']}>
                <FormattedMessage
                  id='add-device-modal.title'
                  defaultMessage='Add Device'
                />
              </div>
              <div className={styles['null-space']} />
            </div>
            <div className={styles['content']}>
              <div hidden className={styles['content-title']}>Node ID</div>
              <div className={styles['qr-code']}>
                <QRCode value={keyInfo.data.deviceJoinKey.URL} size={250} />
              </div>
              <div className={styles['node-id']}>
                <div className={styles['expiration']}>
                  <FormattedMessage
                    id='add-device-modal.expiration'
                    defaultMessage='{expTimeVal}'
                    values={{ expTimeVal: expTimeVal }}
                  />
                </div>
                <CopyToClipboard text={keyInfo.data.deviceJoinKey.URL}
                  onCopy={() => this.setState({ copied: true })}>
                  <button className={styles['copy-button']}>
                    {
                      copied ? (
                        <FormattedMessage
                          id='add-device-modal.copy-node-id-2'
                          defaultMessage='Copied'
                        />
                      ) : (
                        <FormattedMessage
                          id='add-device-modal.copy-node-id-1'
                          defaultMessage='Copy Node ID'
                        />
                      )
                    }
                  </button>
                </CopyToClipboard>
                <div className={styles['text-value']}>
                  <input
                    readOnly
                    value={keyInfo.data.deviceJoinKey.URL}
                  />
                </div>
                <div className={styles['helper-text']}>
                  <FormattedMessage
                    id='add-device-modal.copy-node-id-3'
                    defaultMessage='Scan QR Code or send the above Node ID'
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doAddDeviceModal: bindActionCreators(doAddDeviceModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(AddDeviceModal)
