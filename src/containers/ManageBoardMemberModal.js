import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import Immutable from 'immutable'
import { FormattedMessage } from 'react-intl'

import { epoch2ReadFormat } from '../utils/utilDatetime'

import AlertComponent from '../components/AlertComponent'
import * as doManageBoardMemberModal from '../reducers/ManageBoardMemberModal'
import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'

import styles from './ManageBoardMemberModal.module.scss'

class ManageBoardMemberModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      name: props.modalInput.boardName,
      memberToRemove: {},
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
    this.onMemberToRemove = this.onMemberToRemove.bind(this)
  }

  onMemberToRemove (e, friendId, chatId) {
    const { memberToRemove } = this.state

    let newMemberToRemove = Object.assign({}, memberToRemove)

    if (friendId in newMemberToRemove && newMemberToRemove[friendId]) {
      /* Already Invited: do nothing */
      newMemberToRemove[friendId] = null
    } else {
      newMemberToRemove[friendId] = chatId
    }
    this.setState({ memberToRemove: newMemberToRemove })
  }

  componentWillMount () {
    const { modalInput: { boardId }, actions: { doManageBoardMemberModal }, myId } = this.props

    doManageBoardMemberModal.getBoardInfo(myId, boardId)
    doManageBoardMemberModal.getMemberList(myId, boardId, constants.NUM_FRIEND_PER_REQ)
  }

  render () {
    const { modalInput: { boardId, onRemoveMember }, myId, manageBoardMemberModal, onModalClose, modal: { currentModal } } = this.props
    const { name, showAlert, alertData, memberToRemove } = this.state

    let me = manageBoardMemberModal.get(myId, Immutable.Map())

    let memberList = me.get('memberList', Immutable.List()).toJS()

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
              <div className={styles['board-name']}>
                {name}
              </div>
              <div className={styles['null-prev-arrow']} />
            </div>
            <div className={styles['invite-title']}>
              <div className={styles['null-space']} />
              <div className={styles['invite-title-text']}>
                <FormattedMessage
                  id='manage-board-member-modal.message2'
                  defaultMessage='Manage Members'
                />
              </div>
              <div className={styles['copy-space']} />
            </div>
            <div className={styles['friend-list']}>
              {
                (memberList.length === 0) ? (
                  <div className={styles['no-friend-text']}>
                    <FormattedMessage
                      id='manage-board-member-modal.message1'
                      defaultMessage='No member in group {BOARD_NAME}'
                      values={{ BOARD_NAME: name }}
                    />
                  </div>
                ) : null
              }
              {
                memberList.map((item, index) => (
                  <div className={styles['friend-item']} key={index}>
                    <div className={styles['list-item-author']}>
                      <div className={styles['list-item-author-pic']}>
                        <img alt='' src={item.Img || constants.DEFAULT_USER_IMAGE} />
                      </div>
                    </div>
                    <div className={styles['list-item-main']}>
                      <div className={styles['list-item-title']}> {item.Name} </div>
                      <div className={styles['list-item-time']}>
                        <FormattedMessage
                          id='manage-board-member-modal.member-status'
                          defaultMessage='joined {JOIN_TIME}'
                          values={{ JOIN_TIME: epoch2ReadFormat(item.memberUpdateTS.T) }}
                        />
                      </div>
                    </div>
                    <div className={styles['list-item-meta']}>
                      {
                        ((item.friendID in memberToRemove) && memberToRemove[item.friendID]) ? (
                          <div className={styles['list-item-selected']} onClick={(e) => this.onMemberToRemove(e, item.friendID, item.chatID)}>
                            <FormattedMessage
                              id='manage-board-member-modal.remove-member-1'
                              defaultMessage='UnSelect'
                            />
                          </div>
                        ) : (
                          <div className={styles['list-item-unselect']} onClick={(e) => this.onMemberToRemove(e, item.friendID, item.chatID)}>
                            <FormattedMessage
                              id='manage-board-member-modal.remove-member-2'
                              defaultMessage='Select'
                            />
                          </div>
                        )
                      }
                    </div>
                  </div>
                ))
              }
            </div>
            <div className={styles['action-section']}>
              <div className={styles['submit-button']}>
                <div className={styles['submit-icon-subcontainer']} onClick={() => {
                  onRemoveMember(boardId, memberToRemove)
                  onModalClose()
                }}>
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
    doManageBoardMemberModal: bindActionCreators(doManageBoardMemberModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ManageBoardMemberModal)
