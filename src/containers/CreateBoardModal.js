import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import Immutable                    from 'immutable'
import { injectIntl,
         FormattedMessage }         from 'react-intl'
import { FontAwesomeIcon }          from '@fortawesome/react-fontawesome'

import AlertComponent           from '../components/AlertComponent'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import * as doCreateBoardModal  from '../reducers/CreateBoardModal'

import styles from './CreateBoardModal.css'

class CreateBoardModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      name: '',
      friendInvited:{},
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onNameChange       = this.onNameChange.bind(this);
    this.onFriendInvited = this.onFriendInvited.bind(this);
  }

  onNameChange(e) {
    this.setState({name:e.target.value})
  }

  onFriendInvited(e, friendId, chatId) {
    const { friendInvited } = this.state

    let newFriendInvited = Object.assign({},friendInvited)

    if (friendId in newFriendInvited && newFriendInvited[friendId]){
      newFriendInvited[friendId] = null
    } else {
      newFriendInvited[friendId] = chatId
    }
    this.setState({friendInvited: newFriendInvited})
  }

  componentWillMount() {
    const { actions: { doCreateBoardModal }, myId } = this.props
    doCreateBoardModal.getFriendList(myId, constants.NUM_FRIEND_PER_REQ)
  }

  render() {
    const { intl, modalInput: {modalAddBoardSubmit}, myId, createBoardModal, onModalClose, modal: { currentModal }} = this.props
    const { name, friendInvited, showAlert, alertData } = this.state

    const placeholder = intl.formatMessage({id: 'create-board-modal.placeholder'});

    let me = createBoardModal.get(myId, Immutable.Map())

    let friendList       = me.get('friendList', Immutable.List()).toJS()

    let onSubmitAndClose = () => {
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
        modalAddBoardSubmit(name, friendInvited)
        onModalClose()
      }
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.createBoardModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Create Board Modal">
          <div className={styles['root']}>
            <div className={styles['title-header']}>
              <div className={styles['prev-arrow']}>
                <FontAwesomeIcon icon="arrow-left" onClick={onModalClose} />
              </div>
              <div className={styles['header-text']}>
                <FormattedMessage
                  id="create-board-modal.title"
                  defaultMessage="Create New Board"
                />
              </div>
              <div className={styles['search']}></div>
            </div>
            <div className={styles['title-section']}>
              <input
                placeholder={placeholder}
                autoFocus
                name='title-input'
                className={styles['title-input']}
                value={name}
                onChange={this.onNameChange}/>
            </div>

            <div className={styles['invite-title']}>
              <FormattedMessage
                id="manage-board-modal.message2"
                defaultMessage="Invite friends"
              />
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
                          ((item.friendID in friendInvited) && friendInvited[item.friendID])?(
                            <div className={styles['list-item-invited']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id="create-board-modal.invite-friend-1"
                                defaultMessage="Select"
                              />
                            </div>
                          ):(
                            <div className={styles['list-item-to-invite']} onClick={(e) => this.onFriendInvited(e, item.friendID, item.chatID)}>
                              <FormattedMessage
                                id="create-board-modal.invite-friend-2"
                                defaultMessage="UnSelect"
                              />
                            </div>
                          )
                      }
                      </div>
                    </div>
                  ))
                }
            </div>

            <div hidden className={styles['friend-list']}>
              <div className={styles['friend-list-text']}>
                邀請朋友
              </div>
              <div className={styles['friend-list-items']}>
                {
                  (!friendList || friendList.length === 0)? (
                    <div className={styles['no-friend-text']}>{/*目前沒有朋友可以邀請入板*/}</div>
                  ):null
                }
                {
                  // friendList.map((item, index) => (
                  //   <div className={styles['friend-item']} key={index} onClick={(e) => this.onFriendSelected(e, item.friendID)}>
                  //     <div className={styles['list-item-author']}>
                  //       <div className={styles['list-item-author-pic']}>
                  //         <img src={ item.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'}/>
                  //       </div>
                  //       <div className={styles['list-item-author-name']}>
                  //         {null}
                  //       </div>
                  //     </div>
                  //     <div className={styles['list-item-main']}>
                  //       <div className={styles['list-item-header']}>
                  //         <div className={styles['list-item-title']}>
                  //           {item.Name}
                  //         </div>
                  //         <div className={styles['list-item-time']}>
                  //           {/*epoch2Now(Math.round((new Date()).getTime() / 1000))*/}
                  //         </div>
                  //       </div>
                  //       <div className={styles['list-item-content']}>
                  //         <div dangerouslySetInnerHTML={{__html: null }} />
                  //       </div>
                  //     </div>
                  //     <div className={styles['list-item-meta']}>
                  //     {
                  //       ((item.friendID in friendInvited) && friendInvited[item.friendID])?(
                  //         <div className={styles['list-item-invited']}>
                  //           <FormattedMessage
                  //             id="create-board-modal.invite-friend-1"
                  //             defaultMessage="Invited"
                  //           />
                  //         </div>
                  //       ):(
                  //         <div className={styles['list-item-to-invite']}>
                  //           <FormattedMessage
                  //             id="create-board-modal.invite-friend-1"
                  //             defaultMessage="Invited"
                  //           />
                  //         </div>
                  //       )
                  //     }
                  //     </div>
                  //   </div>
                  // ))
                }
              </div>
            </div>
            <div className={styles['action-section']}>
              <div className={styles['add-icon-container']}>
                <div className={styles['add-icon-subcontainer']}>
                  <div className={styles['add-icon']} onClick={onSubmitAndClose}></div>
                </div>
              </div>
            </div>
            <AlertComponent show={showAlert} alertData={alertData}/>
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
    doCreateBoardModal: bindActionCreators(doCreateBoardModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CreateBoardModal))
