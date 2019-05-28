import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import QrReader from 'react-qr-reader'
import { FormattedMessage } from 'react-intl'
import { isIOS, isAndroid } from '../utils/utils'

import styles from './QRScannerSubmodal.module.scss'

/*
 * [required] onScanned(code: <String>): used when Scanner got QRCode
*/

export class AndroidScanner extends PureComponent {
  constructor (props) {
    super()
    this.openCamera = this.openCamera.bind(this)
  }

  openCamera (event) {
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

  render () {
    const { onScanned } = this.props

    return (
      <div>
        <div className={styles['scanner-btn-container']}>
          <div className={styles['scanner-btn']} onClick={this.openCamera}>
            <FormattedMessage
              id='qrcode-scanner.tap-to-scan'
              defaultMessage='Tap to scan QR Code'
            />
          </div>
        </div>

        <div hidden className={styles['scanner-container']}>
          <QrReader
            delay={300}
            onError={(err) => console.error(err)}
            onScan={onScanned}
            className={styles['scanner']}
          />
          <div className={styles['scanner-text']}>
            <FormattedMessage
              id='add-friend-modal.scan-code-title'
              defaultMessage='Scan QR Code to add friend'
            />
          </div>
        </div>
      </div>
    )
  }
}

export class IosScanner extends PureComponent {
  constructor (props) {
    super()
    this.openCamera = this.openCamera.bind(this)
  }
  openCamera () {
    let iframe = document.createElement('IFRAME')
    iframe.setAttribute('src', 'opencamera://')

    window.getQRCode = code => {
      this.props.onScanned(code)
      iframe.remove()
    }

    document.documentElement.appendChild(iframe)
  }
  render () {
    return (
      <div>
        <div className={styles['scanner-btn-container']} onClick={this.openCamera}>
          <div className={styles['scanner-btn']}>
            <FormattedMessage
              id='qrcode-scanner.tap-to-scan'
              defaultMessage='Tap to scan QR Code'
            />
          </div>
        </div>
      </div>
    )
  }
}

export const WebScanner = props => (
  <div>
    <div className={styles['scanner-container']}>
      <QrReader
        delay={300}
        onError={(err) => console.error(err)}
        onScan={props.onScanned}
        className={styles['scanner']}
      />
      <div className={styles['scanner-text']}>
        <FormattedMessage
          id='add-friend-modal.scan-code-title'
          defaultMessage='Scan QR Code to add friend'
        />
      </div>
    </div>
  </div>
)

const QRScannerSubmodal = props => (
  <div className={styles['submodal-wrapper']}>
    {
      (() => {
        if (isAndroid()) {
          return <AndroidScanner {...props} />
        } else if (isIOS()) {
          return <IosScanner {...props} />
        } else {
          return <WebScanner {...props} />
        }
      })()
    }
  </div>
)

QRScannerSubmodal.propTypes = {
  onScanned: PropTypes.func.isRequired,
}

export default QRScannerSubmodal
