import React, { PureComponent } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FormattedMessage,
  injectIntl } from 'react-intl'
import Modal from 'react-modal'

import QRScannerSubmodal from '../components/QRScannerSubmodal'
import * as modalConstants from '../constants/ModalConstants'
import * as doAddKnownBoardModal from '../reducers/AddKnownBoardModal'
import { isMobile } from '../utils/utils'

import styles from './AddKnownBoardModal.module.scss'

class AddKnownBoardModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      boardUrl: ''
    }
    this.onNameChange = this.onNameChange.bind(this)
    this.onScanned = this.onScanned.bind(this)
  }

  onNameChange (e) {
    this.setState({ boardUrl: e.target.value })
  }

  onScanned (data) {
    if (data) {
      const { modalInput: { modalJoinBoardSubmit } } = this.props

      this.setState({ boardUrl: data })

      modalJoinBoardSubmit(data)
    }
  }

  render () {
    const { intl, modalInput: { modalJoinBoardSubmit }, onModalClose, modal: { currentModal } } = this.props
    const { boardUrl } = this.state

    let onSubmitAndClose = function () {
      modalJoinBoardSubmit(boardUrl)
    }

    const placeholder = intl.formatMessage({ id: 'add-known-board-modal.placeholder' })

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.scannerModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel='Add Known Board Modal'>
          <div className={styles['add-known-board-container']}>
            <div className={styles['add-known-board']}>
              <div className={styles['add-known-board-title']}>
                <FormattedMessage
                  id='add-known-board-modal.title'
                  defaultMessage='Enter Group ID to join'
                />
              </div>
              <QRScannerSubmodal onScanned={this.onScanned} />
              <div className={styles['add-known-board-node-id']}>
                <textarea
                  placeholder={placeholder}
                  autoFocus={!isMobile()}
                  name='title-input'
                  value={boardUrl}
                  onChange={this.onNameChange} />
              </div>
              <div className={styles['add-known-board-action-section']}>
                <button className={styles['add-known-board-submit']} onClick={onSubmitAndClose}>
                  <FormattedMessage
                    id='add-known-board-modal.scan-code-action'
                    defaultMessage='Join'
                  />
                </button>
                <button className={styles['add-known-board-cancel']} onClick={onModalClose}>
                  <FormattedMessage
                    id='first-popup-modal.action1'
                    defaultMessage='Cancel'
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
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doAddKnownBoardModal: bindActionCreators(doAddKnownBoardModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddKnownBoardModal))
