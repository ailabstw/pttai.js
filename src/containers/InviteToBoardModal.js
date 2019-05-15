import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import Immutable from 'immutable'
import { FormattedMessage } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { epoch2ReadFormat } from '../utils/utilDatetime'

import AlertComponent from '../components/AlertComponent'
import * as doInviteToBoardModal from '../reducers/InviteToBoardModal'
import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'

import styles from './InviteToBoardModal.css'

class InviteToBoardModal extends PureComponent {
  constructor (props) {
    super()
    this.refreshBoardJoinKey = null
    this.state = {
      name: props.modalInput.boardName,
      friendInvited: {},
      qrCodeCopied: false,
      copyBoardIdText: '',
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
    this.onFriendInvited = this.onFriendInvited.bind(this)
  }

  onFriendInvited (e, friendId, chatId) {
    const { friendInvited } = this.state

    let newFriendInvited = Object.assign({}, friendInvited)

    if (friendId in newFriendInvited && newFriendInvited[friendId]) {
      /* Already Invited: do nothing */
      newFriendInvited[friendId] = null
    } else {
      newFriendInvited[friendId] = chatId
    }
    this.setState({ friendInvited: newFriendInvited })
  }

  componentWillMount () {
    const { modalInput: { boardId }, actions: { doInviteToBoardModal }, myId } = this.props

    doInviteToBoardModal.getBoardInfo(myId, boardId)
    doInviteToBoardModal.getBoardJoinKey(myId, boardId)
    doInviteToBoardModal.getFriendList(myId, boardId, constants.NUM_FRIEND_PER_REQ)

    this.refreshBoardJoinKey = setInterval(() => doInviteToBoardModal.getBoardJoinKey(myId, boardId), constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    clearInterval(this.refreshBoardJoinKey)
  }

  render () {
    const { modalInput: { boardId, onInviteFriend }, myId, inviteToBoardModal, onModalClose, modal: { currentModal } } = this.props
    const { name, qrCodeCopied, showAlert, alertData, friendInvited } = this.state

    let me = inviteToBoardModal.get(myId, Immutable.Map())

    let boardJoinKey = me.get('boardJoinKey', Immutable.Map()).toJS()
    let friendList = me.get('friendList', Immutable.List()).toJS()

    // let onOpenOPLogModal = () => {
    //   onModalSwitch(constants.SHOW_OP_LOG_MODAL, {
    //     tabs: [
    //       constants.SHOW_CONTENT_BOARD_TAB,
    //       constants.SHOW_CONTENT_MASTER_TAB,
    //       constants.SHOW_CONTENT_MEMBER_TAB,
    //       constants.SHOW_CONTENT_OPKEY_TAB,
    //       constants.SHOW_CONTENT_PEERS_TAB,
    //     ],
    //     params: {
    //       boardId: boardId,
    //     },
    //   })
    // }

    // const expTimeVal = expiredFormat(boardJoinKey.UpdateTS.T, boardJoinKey.expirePeriod)

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
                  id='invite-to-board-modal.message2'
                  defaultMessage='Invite friends'
                />
              </div>
              <div className={styles['copy-space']}>
                <CopyToClipboard text={boardJoinKey.URL}
                  onCopy={() => this.setState({ qrCodeCopied: true })}>
                  <button className={styles['manageboard-modal-copy']}>
                    {
                      qrCodeCopied ? (
                        <FormattedMessage
                          id='invite-to-board-modal.copy-node-id-2'
                          defaultMessage='Copied'
                        />
                      ) : (
                        <FormattedMessage
                          id='invite-to-board-modal.copy-my-id-1'
                          defaultMessage='Copy Group ID'
                        />
                      )
                    }
                  </button>
                </CopyToClipboard>
              </div>
            </div>
            <div className={styles['friend-list']}>
              {
                (friendList.length === 0) ? (
                  <div className={styles['no-friend-text']}>
                    <FormattedMessage
                      id='invite-to-board-modal.message1'
                      defaultMessage='You have no friend to invite to {BOARD_NAME}'
                      values={{ BOARD_NAME: name }}
                    />
                  </div>
                ) : null
              }
              {
                friendList.map((item, index) => (
                  <div className={styles['friend-item']} key={index}>
                    <div className={styles['list-item-author']}>
                      <div className={styles['list-item-author-pic']}>
                        <img alt='' src={item.Img || constants.DEFAULT_USER_IMAGE} />
                      </div>
                      <div hidden className={styles['list-item-author-name']}> {item.Name} </div>
                    </div>
                    <div className={styles['list-item-main']}>
                      <div className={styles['list-item-header']}>
                        <div className={styles['list-item-title']}> {item.Name} </div>
                      </div>
                      <div className={styles['list-item-content']}>
                        <div dangerouslySetInnerHTML={{ __html: null }} />
                      </div>
                    </div>
                    <div className={styles['list-item-meta']}>
                      {
                        item.isBoardMember ? (
                          <div className={styles['list-item-time']}>
                            <FormattedMessage
                              id='invite-to-board-modal.invite-friend-0'
                              defaultMessage='joined {JOIN_TIME}'
                              values={{ JOIN_TIME: epoch2ReadFormat(item.memberUpdateTS.T) }}
                            />
                          </div>
                        ) : (

                          ((item.friendID in friendInvited) && friendInvited[item.friendID]) ? (
                            <div className={styles['list-item-invited']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id='invite-to-board-modal.invite-friend-1'
                                defaultMessage='Invited'
                              />
                            </div>
                          ) : (
                            <div className={styles['list-item-to-invite']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id='invite-to-board-modal.invite-friend-2'
                                defaultMessage='Invite'
                              />
                            </div>
                          )
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
                  onInviteFriend(boardId, name, friendInvited)
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
    doInviteToBoardModal: bindActionCreators(doInviteToBoardModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(InviteToBoardModal)
