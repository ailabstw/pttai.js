import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import Immutable                    from 'immutable'
import { FormattedMessage }         from 'react-intl'
import { CopyToClipboard }          from 'react-copy-to-clipboard'

import { epoch2ReadFormat }       from '../utils/utilDatetime'
import { isMobile }               from '../utils/utils'

import AlertComponent                 from '../components/AlertComponent'
import * as doManageBoardMemberModal  from '../reducers/ManageBoardMemberModal'
import * as modalConstants            from '../constants/ModalConstants'
import * as constants                 from '../constants/Constants'

import styles from './ManageBoardMemberModal.css'

class ManageBoardMemberModal extends PureComponent {
  constructor(props) {
    super();
    this.refreshBoardJoinKey = null
    this.state = {
      name: props.modalInput.boardName,
      friendInvited:{},
      qrCodeCopied: false,
      copyBoardIdText:'',
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onNameChange     = this.onNameChange.bind(this);
    this.onFriendInvited = this.onFriendInvited.bind(this);
  }

  onNameChange(e) {
    this.setState({name:e.target.value})
  }

  onFriendInvited(e, friendId, chatId) {
    //const { manageBoardMemberModal, modalInput: { boardId }, actions: { doManageBoardMemberModal }, myId } = this.props
    const { friendInvited } = this.state

    //let me = manageBoardMemberModal.get(myId, Immutable.Map())
    //let boardJoinKey  = me.get('boardJoinKey', Immutable.Map()).toJS()

    let newFriendInvited = Object.assign({},friendInvited)

    if (friendId in newFriendInvited && newFriendInvited[friendId]){
      /* Already Invited: do nothing */
      newFriendInvited[friendId] = null
    } else {
      newFriendInvited[friendId] = chatId
      // /* Construct invite message */
      // let inviteMessage = {
      //   type:   constants.MESSAGE_TYPE_INVITE,
      //   value:  `<div data-action-type="join-board" data-board-id="${boardId}" data-board-name="${name}" data-join-key="${boardJoinKey.URL}" data-update-ts="${boardJoinKey.UpdateTS.T}" data-expiration="${boardJoinKey.expirePeriod}"></div>`
      // }

      // doManageBoardMemberModal.sendFriendInvite(myId, chatId, JSON.stringify(inviteMessage))
    }
    this.setState({friendInvited: newFriendInvited})
  }

  componentWillMount() {
    const { modalInput: { boardId }, actions: { doManageBoardMemberModal }, myId } = this.props

    doManageBoardMemberModal.getBoardInfo(myId, boardId)
    doManageBoardMemberModal.getBoardJoinKey(myId, boardId)
    doManageBoardMemberModal.getFriendList(myId, boardId, constants.NUM_FRIEND_PER_REQ)

    this.refreshBoardJoinKey = setInterval(() => doManageBoardMemberModal.getBoardJoinKey(myId, boardId), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshBoardJoinKey)
  }

  render() {
    const { onModalSwitch, modalInput: { boardId, setBoardName, deleteBoard }, myId, manageBoardMemberModal, onModalClose, modal: { currentModal }} = this.props
    const { name, qrCodeCopied, showAlert, alertData, friendInvited } = this.state

    let me = manageBoardMemberModal.get(myId, Immutable.Map())

    let boardJoinKey  = me.get('boardJoinKey', Immutable.Map()).toJS()
    let friendList    = me.get('friendList', Immutable.List()).toJS()

    let onSetBoardName = () => {
      if (JSON.stringify(name).length - 2 > constants.MAX_BOARDNAME_SIZE) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message12"
                defaultMessage="Board name cannot exceed {MAX_BOARDNAME_SIZE} characters"
                values={{ MAX_BOARDNAME_SIZE: constants.MAX_BOARDNAME_SIZE }}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else if (!name || name.replace(/\s+/g, '') === '') {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message13"
                defaultMessage="Board name cannot be empty"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        setBoardName(boardId, name, friendInvited)
        onModalClose()
      }
    }

    let onOpenOPLogModal = () => {
      onModalSwitch(constants.SHOW_OP_LOG_MODAL, {
        tabs: [
          constants.SHOW_CONTENT_BOARD_TAB,
          constants.SHOW_CONTENT_MASTER_TAB,
          constants.SHOW_CONTENT_MEMBER_TAB,
          constants.SHOW_CONTENT_OPKEY_TAB,
          constants.SHOW_CONTENT_PEERS_TAB,
        ],
        params: {
          boardId: boardId,
        },
      })
    }

    let onDelete = () => {
      let that = this
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message1"
              defaultMessage="Are you sure you want to delete?"
            />),
          onConfirm: () => {
            deleteBoard(boardId)
            that.setState({showAlert: false})
            onModalClose()
          },
          onClose: () => that.setState({showAlert: false}),
        }
      })
    }

    //const expTimeVal = expiredFormat(boardJoinKey.UpdateTS.T, boardJoinKey.expirePeriod)

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.manageBoardModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Create Board Modal">
          <div className={styles['root']}>
            <div className={styles['modal-bar']}>
              <div className={styles['prev-arrow']}>
                <div className={styles['prev-arrow-icon']} onClick={onModalClose}></div>
              </div>
              <div className={styles['edit-name']}>
                <input
                  autoFocus={!isMobile()}
                  name='board-name-input'
                  className={styles['board-name-input']}
                  value={name}
                  onChange={this.onNameChange}/>
              </div>
              <div hidden className={styles['modal-title']}>
                {name}
              </div>
              <div hidden className={styles['search']} onClick={onDelete}>
                <FormattedMessage
                  id="manage-board-modal.board-action-2"
                  defaultMessage="Delete Board"
                />
              </div>
            </div>
            <div hidden className={styles['modal-bar']}>

              <div className={styles['edit-name']}>
                <FormattedMessage
                  id="manage-board-modal.board-action-1"
                  defaultMessage="Change Board Name"
                />:
                <input
                  autoFocus
                  name='board-name-input'
                  className={styles['board-name-input']}
                  value={name}
                  onChange={this.onNameChange}/>
                <button>
                  <FormattedMessage
                    id="manage-board-modal.set-board-name-submit"
                    defaultMessage="Enter"
                  />
                </button>
              </div>
              <div hidden className={styles['board-log']}>
                <button className={styles['board-log-button']} onClick={onOpenOPLogModal}>
                  <FormattedMessage
                    id="manage-board-modal.get-board-log"
                    defaultMessage="Board Log"
                  />
                </button>
              </div>
            </div>
            <div className={styles['invite-title']}>
              <div className={styles['null-space']}></div>
              <div className={styles['invite-title-text']}>
                <FormattedMessage
                  id="manage-board-modal.message2"
                  defaultMessage="Invite friends"
                />
              </div>
              <div className={styles['copy-space']}>
                <CopyToClipboard text={boardJoinKey.URL}
                                 onCopy={() => this.setState({qrCodeCopied: true})}>
                  <button className={styles['manageboard-modal-copy']}>
                    {
                      qrCodeCopied? (
                        <FormattedMessage
                          id="add-device-modal.copy-node-id-2"
                          defaultMessage="Copied"
                        />
                      ): (
                        <FormattedMessage
                          id="manage-board-modal.copy-my-id-1"
                          defaultMessage="Copy Group ID"
                        />
                      )
                    }
                  </button>
                </CopyToClipboard>
              </div>
            </div>
            <div className={styles['friend-list']}>
                {
                  (friendList.length === 0)? (
                    <div className={styles['no-friend-text']}>
                      <FormattedMessage
                        id="manage-board-modal.message1"
                        defaultMessage="You have no friend to invite to {BOARD_NAME}"
                        values={{ BOARD_NAME: name }}
                      />
                    </div>
                  ):null
                }
                {
                  friendList.map((item, index) => (
                    <div className={styles['friend-item']} key={index}>
                      <div className={styles['list-item-author']}>
                        <div className={styles['list-item-author-pic']}>
                          <img alt="" src={item.Img || constants.DEFAULT_USER_IMAGE}/>
                        </div>
                        <div hidden className={styles['list-item-author-name']}> {item.Name} </div>
                      </div>
                      <div className={styles['list-item-main']}>
                        <div className={styles['list-item-header']}>
                          <div className={styles['list-item-title']}> {item.Name} </div>
                        </div>
                        <div className={styles['list-item-content']}>
                          <div dangerouslySetInnerHTML={{__html: null }} />
                        </div>
                      </div>
                      <div className={styles['list-item-meta']}>
                      {
                        item.isBoardMember ? (
                          <div className={styles['list-item-time']}>
                            <FormattedMessage
                              id="manage-board-modal.invite-friend-0"
                              defaultMessage="joined {JOIN_TIME}"
                              values={{ JOIN_TIME: epoch2ReadFormat(item.memberUpdateTS.T)}}
                            />
                          </div>
                        ):(

                          ((item.friendID in friendInvited) && friendInvited[item.friendID])?(
                            <div className={styles['list-item-invited']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id="manage-board-modal.invite-friend-1"
                                defaultMessage="Invited"
                              />
                            </div>
                          ):(
                            <div className={styles['list-item-to-invite']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id="manage-board-modal.invite-friend-2"
                                defaultMessage="Invite"
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
                <div className={styles['submit-icon-subcontainer']} onClick={onSetBoardName}>
                  <div className={styles['submit-icon']}></div>
                </div>
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
    doManageBoardMemberModal: bindActionCreators(doManageBoardMemberModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ManageBoardMemberModal)
