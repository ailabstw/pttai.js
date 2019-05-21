import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import Modal from 'react-modal'

import AlertComponent from '../components/AlertComponent'

import * as doBoardSettingMenuModal from '../reducers/BoardSettingMenuModal'
import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'

import styles from './SettingMenuModal.module.scss'

class BoardSettingMenuModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
  }

  render () {
    const { modalInput, onModalClose, onModalSwitch, modal: { currentModal } } = this.props
    const { showAlert, alertData } = this.state

    let onSwitchAndClose = function (modal) {
      onModalSwitch(modal, modalInput)
    }

    let onDeleteBoard = () => {
      let that = this
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='alert.message1'
              defaultMessage='Are you sure you want to delete?'
            />),
          onConfirm: () => {
            modalInput.onDeleteBoard()
            that.setState({ showAlert: false })
          },
          onClose: () => that.setState({ showAlert: false })
        }
      })
    }

    let onLeaveBoard = () => {
      let that = this
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='alert.message35'
              defaultMessage='Are you sure you want to leave the Group?'
            />),
          onConfirm: () => {
            modalInput.onLeaveBoard()
            that.setState({ showAlert: false })
          },
          onClose: () => that.setState({ showAlert: false })
        }
      })
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.settingMenuModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel='Setting Menu Modal'>
          <div className={styles['root']}>
            {
              modalInput.isCreator ? (
                <div className={styles['action-section']}>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.INVITE_TO_BOARD_MODAL)}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu0'
                      defaultMessage='Invite'
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.MANAGE_BOARD_MEMBER_MODAL)}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu1'
                      defaultMessage='Members'
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.MANAGE_BOARD_MODAL)}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu2'
                      defaultMessage='Edit Name'
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onDeleteBoard}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu3'
                      defaultMessage='Delete Group'
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onModalClose}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu5'
                      defaultMessage='Cancel'
                    />
                  </button>
                </div>
              ) : (
                <div className={styles['action-section']}>
                  <button className={styles['menu-button']} onClick={onLeaveBoard}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu4'
                      defaultMessage='Leave Board'
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onModalClose}>
                    <FormattedMessage
                      id='board-setting-menu-modal.menu5'
                      defaultMessage='Cancel'
                    />
                  </button>
                </div>
              )
            }
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
    doBoardSettingMenuModal: bindActionCreators(doBoardSettingMenuModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardSettingMenuModal)
