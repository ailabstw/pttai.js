import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'
import Modal                    from 'react-modal'

import * as doBoardSettingMenuModal   from '../reducers/BoardSettingMenuModal'
import * as modalConstants            from '../constants/ModalConstants'
import * as constants                 from '../constants/Constants'

import styles from './BoardSettingMenuModal.css'

class BoardSettingMenuModal extends PureComponent {

  render() {
    const { modalInput, onModalClose, onModalSwitch, modal: { currentModal }} = this.props

    let onSwitchAndClose = function(modal) {
      onModalSwitch(modal, modalInput)
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.boardSettingMenuModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Setting Menu Modal">
          <div className={styles['root']}>
            {
              modalInput.isCreator ? (
                <div className={styles['action-section']}>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.INVITE_TO_BOARD_MODAL)}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu0"
                      defaultMessage="Invite"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.MANAGE_BOARD_MEMBER_MODAL)}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu1"
                      defaultMessage="Members"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.MANAGE_BOARD_MODAL)}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu2"
                      defaultMessage="Edit Name"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={modalInput.onDeleteBoard}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu3"
                      defaultMessage="Delete Group"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onModalClose}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu5"
                      defaultMessage="Cancel"
                    />
                  </button>
                </div>
              ):(
                <div className={styles['action-section']}>
                  <button className={styles['menu-button']} onClick={modalInput.onLeaveBoard}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu4"
                      defaultMessage="Leave Board"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onModalClose}>
                    <FormattedMessage
                      id="board-setting-menu-modal.menu5"
                      defaultMessage="Cancel"
                    />
                  </button>
                </div>
              )
            }
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
    doBoardSettingMenuModal: bindActionCreators(doBoardSettingMenuModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardSettingMenuModal)
