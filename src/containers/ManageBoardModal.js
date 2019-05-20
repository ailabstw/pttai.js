import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { FormattedMessage } from 'react-intl'

import { isMobile } from '../utils/utils'

import AlertComponent from '../components/AlertComponent'
import * as doManageBoardModal from '../reducers/ManageBoardModal'
import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'

import styles from './ManageBoardModal.module.css'

class ManageBoardModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      name: props.modalInput.boardName,
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
    this.onNameChange = this.onNameChange.bind(this)
  }

  onNameChange (e) {
    this.setState({ name: e.target.value })
  }

  componentWillMount () {
    const { modalInput: { boardId }, actions: { doManageBoardModal }, myId } = this.props

    doManageBoardModal.getBoardInfo(myId, boardId)
  }

  render () {
    const { modalInput: { boardId, onEditBoardName }, onModalClose, modal: { currentModal } } = this.props
    const { name, showAlert, alertData } = this.state

    let onSetBoardName = () => {
      if (JSON.stringify(name).length - 2 > constants.MAX_BOARDNAME_SIZE) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message12'
                defaultMessage='Board name cannot exceed {MAX_BOARDNAME_SIZE} characters'
                values={{ MAX_BOARDNAME_SIZE: constants.MAX_BOARDNAME_SIZE }}
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
      } else if (!name || name.replace(/\s+/g, '') === '') {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message13'
                defaultMessage='Board name cannot be empty'
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
      } else {
        onEditBoardName(boardId, name)
        onModalClose()
      }
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.manageBoardModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel='Create Board Modal'>
          <div className={styles['root']}>
            <div className={styles['modal-bar']}>
              <div className={styles['prev-arrow']}>
                <div className={styles['prev-arrow-icon']} onClick={onModalClose} />
              </div>
              <div className={styles['edit-name']}>
                <input
                  autoFocus={!isMobile()}
                  name='board-name-input'
                  className={styles['board-name-input']}
                  value={name}
                  onChange={this.onNameChange} />
              </div>
            </div>
            <div hidden className={styles['modal-bar']}>
              <div className={styles['edit-name']} />
            </div>
            <div className={styles['action-section']}>
              <div className={styles['submit-button']}>
                <div className={styles['submit-icon-subcontainer']} onClick={onSetBoardName}>
                  <div className={styles['submit-icon']} />
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <AlertComponent show={showAlert} alertData={alertData} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doManageBoardModal: bindActionCreators(doManageBoardModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ManageBoardModal)
