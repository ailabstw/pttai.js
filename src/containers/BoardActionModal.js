import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import { FormattedMessage }         from 'react-intl'
import Modal                        from 'react-modal'

import * as doBoardActionModal      from '../reducers/BoardActionModal'
import * as modalConstants          from '../constants/ModalConstants'
import * as constants               from '../constants/Constants'

import styles from './BoardActionModal.css'

class BoardActionModal extends PureComponent {
  render() {
    const { modalInput, onModalClose, onModalSwitch, modal: { currentModal }} = this.props

    let onSwitchAndClose = function(modal) {
      onModalSwitch(modal, modalInput)
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.boardActionModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Baord Action Modal">
          <div className={styles['root']}>
            <div className={styles['action-section']}>
              <button className={styles['join-board-button']} onClick={() => onSwitchAndClose(constants.ADD_KNOWN_BOARD_MODAL)}>
                <FormattedMessage
                  id="board-action-modal.action1"
                  defaultMessage="Join board"
                />
              </button>
              <button className={styles['create-board-button']} onClick={() => onSwitchAndClose(constants.CREATE_BOARD_MODAL)}>
                <FormattedMessage
                  id="board-action-modal.action2"
                  defaultMessage="Create board"
                />
              </button>
              <button className={styles['close-button']} onClick={onModalClose}>
                <FormattedMessage
                  id="board-action-modal.action3"
                  defaultMessage="Cancel"
                />
              </button>
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
    doBoardActionModal: bindActionCreators(doBoardActionModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardActionModal)
