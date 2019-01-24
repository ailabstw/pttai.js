import React, { PureComponent }    from 'react'
import ReactDOM                    from 'react-dom'
import { injectIntl,
         FormattedMessage }        from 'react-intl'
import $                           from 'jquery'
import { ClipLoader }              from 'react-spinners'

import { doesCrossDay,
         epoch2MessageTimeFormat,
         epoch2MessageDateFormat,
         expiredFormat           } from '../utils/utilDatetime'
import { getStatusClass, toJson }  from '../utils/utils'

import AlertComponent              from '../components/AlertComponent'
import * as constants              from '../constants/Constants'

import styles from './FriendChatComponent.css'

function isEmpty(message) {
  return message.replace(/\s+/g, '') === ''
}

class FriendChatComponent extends PureComponent {
  constructor(props) {
    super();
    this.topItem = null
    this.state = {
      inputMessage: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onInputEnter         = this.onInputEnter.bind(this);
    this.handleMessageSubmit  = this.handleMessageSubmit.bind(this);
    this.handleAcceptInvite   = this.handleAcceptInvite.bind(this);
    this.handleScroll         = this.handleScroll.bind(this);
    this.needFetchMore        = this.needFetchMore.bind(this);
    this.scrollToBottom       = this.scrollToBottom.bind(this);
  }

  onInputEnter(e) {
    const { inputMessage } = this.state

    /* isComposing is for 注音輸入法 */
    if (e.isComposing || (e.key && e.key !== "Enter")) return

    if (e.key === "Enter" && $(':focus').is('input')) {
      /* From key pressed */
      e.preventDefault()

      if (isEmpty(inputMessage)) {
        return
      } else {
        this.handleMessageSubmit(inputMessage)
      }
      this.setState({inputMessage:''})

    } else if (!e.key) {
      /* From button clicked */

      if (isEmpty(inputMessage)) {
        return
      } else {
        this.handleMessageSubmit(inputMessage)
      }
      this.setState({inputMessage:''})
    }
  }

  handleAcceptInvite(boardJoinKey) {
    const { onJoinBoard } = this.props

    let that = this
    let joinBoardCallBack = (response) => {
      if (response.error) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message7"
                defaultMessage="[Error] {data}:{boardUrl}"
                values={{ data: response.data, boardUrl: response.boardUrl}}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message25"
                defaultMessage="[Success] Board Joined"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      }
    }

    if (!boardJoinKey || !boardJoinKey.startsWith('pnode://')) {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message8"
              defaultMessage="Board name empty or invalid"
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      onJoinBoard(boardJoinKey, joinBoardCallBack)
    }
  }

  handleMessageSubmit(message) {
    const { onMessageAdded } = this.props

    let that = this
    let trimmedMessage = message.trim()

    if (JSON.stringify(trimmedMessage).length - 2 > constants.MAX_COMMENT_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message2"
              defaultMessage="Input message cannot exceed {MAX_COMMENT_SIZE} words"
              values={{ MAX_COMMENT_SIZE: constants.MAX_COMMENT_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      onMessageAdded(trimmedMessage)
      //this.scrollToBottom("smooth")
    }
  }

  needFetchMore() {
    const { isLoading, allMessagesLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allMessagesLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll() {
    if (this.needFetchMore()) {
      const { onGetMoreMessages, messageList } = this.props

      let startMessageId = messageList[0].MessageID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0? null : this.scroller.childNodes[0].childNodes[0];

      onGetMoreMessages(startMessageId)
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.onInputEnter, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.onInputEnter, false);
  }

  scrollToBottom(mode) {
    this.pageEnd.scrollIntoView({ behavior: mode });
  }

  componentDidUpdate(prevProps) {

    if ((prevProps.messageList.length === 0 && this.props.messageList.length > 0) ||
        (prevProps.match.path !== this.props.match.path)) {
      /* First load */
      this.scrollToBottom("instant")
    } else if (this.topItem && prevProps.isLoading && !this.props.isLoading) {
      /* More loaded */
      ReactDOM.findDOMNode(this.topItem).scrollIntoView();
    } else if ((prevProps.messageList.length > 0 && this.props.messageList.length === prevProps.messageList.length + 1)) {
      /* New user message */
      this.scrollToBottom("smooth")
    }
  }

  render() {
    const { intl, messageList, isLoading, userId, noMessage, boardList } = this.props
    const { inputMessage, showAlert, alertData } = this.state

    const placeholder = intl.formatMessage({id: 'friend-chat-component.placeholder'});

    return (
      <div className={styles['root']}>
    {/*
        <div className={styles['main-content']}>
          <div className={styles['profile-pic']} onClick={onOpenFriendProfileModal}>
            <img src={friendData.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'}/>
          </div>
          <div className={styles['content']}>
            <div className={styles['name']} onClick={onOpenFriendProfileModal}>
              {friendData.Name || constants.DEFAULT_USER_NAME }
            </div>
            <div title={friendData.ID} className={styles['job']} onClick={onOpenOPLogModal}>
             Chat ID: {friendData.ID}
            </div>
            <div hidden className={styles['description']}>
             {friendData.description}
            </div>
          </div>
        </div>
    */}
        <div className={styles['chat']}
             onScroll={this.handleScroll}
             ref={(scroller) => {
               this.scroller = scroller;
             }}>
          {
            (noMessage) ? (
              <div className={styles['no-message']}>
                <FormattedMessage
                  id="friend-chat-component.title"
                  defaultMessage="Start chatting!"
                />
              </div>
            ):(
              <div>
                {
                  isLoading? (
                    <div className={styles['loader']}>
                      <ClipLoader color={'#aaa'} size={35} loading={isLoading}/>
                    </div>
                  ):(null)
                }
                {
                  messageList.map((message, index) => {

                    /*               */
                    /* Date divider  */
                    /*               */
                    let divider = null

                    if (index > 0 && doesCrossDay(messageList[index].CreateTS.T,messageList[index-1].CreateTS.T)) {
                      divider = <div className={styles['message-divider']}>
                                  <span>
                                    {epoch2MessageDateFormat(messageList[index].CreateTS.T)}
                                  </span>
                                </div>
                    }

                    /*                */
                    /* Invite message */
                    /*                */
                    let messageObj  = toJson(message.Buf)
                    let messageHtml = messageObj.value
                    let isUser      = (message.CreatorID === userId)
                    let inviteInfo  = {}

                    if (messageObj.type === constants.MESSAGE_TYPE_INVITE) {

                      let invite = $(messageObj.value)
                      inviteInfo.inviteType    = invite.data('action-type')
                      inviteInfo.boardId       = invite.data('board-id')
                      inviteInfo.boardName     = invite.data('board-name')
                      inviteInfo.boardJoinKey  = invite.data('join-key')
                      inviteInfo.keyUpdateTS_T = invite.data('update-ts')
                      inviteInfo.keyExpiration = invite.data('expiration')

                      if (!isUser && boardList.findIndex(each => each.ID === inviteInfo.boardId) >= 0) {
                        messageHtml = (<span>
                          <FormattedMessage
                            id="friend-chat-component.action1"
                            defaultMessage="Board [{BOARD_NAME}] invitation: Joined"
                            values={{ BOARD_NAME: inviteInfo.boardName}}
                          />
                        </span>)
                      } else if (!isUser){
                        messageHtml = (<span>
                          <FormattedMessage
                            id="friend-chat-component.action2"
                            defaultMessage="Board [{BOARD_NAME}] invitation: Click to join"
                            values={{ BOARD_NAME: inviteInfo.boardName}}
                          />
                          <FormattedMessage
                            id="friend-chat-component.action4"
                            defaultMessage=" (Expired in {expTimeVal})"
                            values={{ expTimeVal: expiredFormat(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration) }}
                          />
                        </span>)
                      } else {
                        messageHtml = (<span>
                          <FormattedMessage
                            id="friend-chat-component.action3"
                            defaultMessage="Board [{BOARD_NAME}] invitation: Sent"
                            values={{ BOARD_NAME: inviteInfo.boardName}}
                          />
                          <FormattedMessage
                            id="friend-chat-component.action4"
                            defaultMessage=" (Expired in {expTimeVal})"
                            values={{ expTimeVal: expiredFormat(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration) }}
                          />
                        </span>)
                      }
                    }

                    /*          */
                    /* Messages */
                    /*          */
                    if (isUser) {
                      return (
                        <div key={messageList.length - index}>
                          {divider}
                          <div className={styles['user-message-item']}>
                            <div className={styles['user-message-meta']}>
                              <div title={constants.STATUS_ARRAY[message.Status]} className={styles['user-message-status']}>
                                <div className={styles['user-message-status-circle-' + getStatusClass(message.Status)]}>
                                </div>
                              </div>
                              <div className={styles['user-message-time']}> {epoch2MessageTimeFormat(message.CreateTS.T)}</div>
                            </div>
                            {
                              messageObj.type === constants.MESSAGE_TYPE_INVITE ? (
                                <div className={styles['user-message-content-invitation']}>{messageHtml}</div>
                              ):(
                                <div className={styles['user-message-content']}>{messageObj.value}</div>
                              )
                            }
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div key={messageList.length - index}>
                          {divider}
                          <div className={styles['message-item']}>
                            {
                              messageObj.type === constants.MESSAGE_TYPE_INVITE ? (
                                boardList.findIndex(each => each.ID === inviteInfo.boardId) >= 0 ? (
                                  <div className={styles['message-content-invitation']}>
                                    {messageHtml}
                                  </div>
                                ):(
                                  <div className={styles['message-content-invitation']}
                                       onClick={() => this.handleAcceptInvite(inviteInfo.boardJoinKey)}>
                                    {messageHtml}
                                  </div>
                                )
                              ):(
                                <div className={styles['message-content']}>{messageObj.value}</div>
                              )
                            }
                            <div className={styles['message-meta']}>
                              <div title={constants.STATUS_ARRAY[message.Status]} className={styles['message-status']}>
                                <div className={styles['message-status-circle-' + getStatusClass(message.Status)]}>
                                </div>
                              </div>
                              <div className={styles['message-time']}>{epoch2MessageTimeFormat(message.CreateTS.T)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })
                }
              </div>
            )
          }
          <div className={styles['bottomElement']}
             ref={(el) => {
              this.pageEnd = el;
            }}>
          </div>
        </div>
        <div className={styles['message-input']}>
          <input
            autoFocus
            placeholder={placeholder}
            value={inputMessage}
            onChange={(e) => this.setState({inputMessage:e.target.value})}
          />
          <div className={styles['message-action']} onClick={this.onInputEnter}></div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

export default injectIntl(FriendChatComponent)
