import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { injectIntl,
  FormattedMessage } from 'react-intl'
import { ClipLoader } from 'react-spinners'
// import { PTTAI_URL_BASE }          from '../config'

import { doesCrossDay,
  epoch2MessageTimeFormat,
  epoch2MessageDateFormat,
  isValid,
  expiredFormat } from '../utils/utilDatetime'

import { getStatusClass,
  linkParser,
  isMobile } from '../utils/utils'

import AlertComponent from '../components/AlertComponent'
import * as constants from '../constants/Constants'

import styles from './FriendChatComponent.module.scss'

function isEmpty (message) {
  return message.replace(/\s+/g, '') === ''
}

class FriendChatComponent extends PureComponent {
  constructor (props) {
    super()
    this.topItem = null
    this.state = {
      inputMessage: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }

    this.onInputEnter = this.onInputEnter.bind(this)
    this.handleMessageSubmit = this.handleMessageSubmit.bind(this)
    this.handleAcceptInvite = this.handleAcceptInvite.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.needFetchMore = this.needFetchMore.bind(this)
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  onInputEnter (e) {
    const { inputMessage } = this.state

    /* isComposing is for 注音輸入法 */
    if (e.isComposing || (e.key && e.key !== 'Enter')) return

    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
      /* From key pressed */
      e.preventDefault()

      if (isEmpty(inputMessage)) {
        return
      } else {
        this.handleMessageSubmit(inputMessage)
      }
      this.setState({ inputMessage: '' })
    } else if (!e.key) {
      /* From button clicked */

      if (isEmpty(inputMessage)) {
        return
      } else {
        this.handleMessageSubmit(inputMessage)
      }
      this.setState({ inputMessage: '' })
    }
  }

  handleAcceptInvite (boardJoinKey) {
    const { onJoinBoard } = this.props

    let that = this
    let joinBoardCallBack = (response) => {
      if (response.error) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message7'
                defaultMessage='[Error] {data}:{boardUrl}'
                values={{ data: response.data, boardUrl: response.boardUrl }}
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
      } else {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message25'
                defaultMessage='[Success] Board Joined'
              />),
            onConfirm: () => that.setState({ showAlert: false })
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
              id='alert.message8'
              defaultMessage='Board name empty or invalid'
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else {
      onJoinBoard(boardJoinKey, joinBoardCallBack)
    }
  }

  handleMessageSubmit (message) {
    const { onMessageAdded } = this.props

    let that = this
    let trimmedMessage = message.trim()

    if (JSON.stringify(trimmedMessage).length - 2 > constants.MAX_COMMENT_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='alert.message2'
              defaultMessage='Input message cannot exceed {MAX_COMMENT_SIZE} words'
              values={{ MAX_COMMENT_SIZE: constants.MAX_COMMENT_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else {
      onMessageAdded(trimmedMessage)
      // this.scrollToBottom("smooth")
    }
  }

  needFetchMore () {
    const { isLoading, allMessagesLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allMessagesLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll () {
    if (this.needFetchMore()) {
      const { onGetMoreMessages, messageList } = this.props

      let startMessageId = messageList[0].ID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0 ? null : this.scroller.childNodes[0].childNodes[0]

      onGetMoreMessages(startMessageId)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onInputEnter, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onInputEnter, false)
  }

  scrollToBottom (mode) {
    this.pageEnd.scrollIntoView({ behavior: mode })
  }

  componentDidUpdate (prevProps) {
    if ((prevProps.messageList.length === 0 && this.props.messageList.length > 0) ||
      (prevProps.match.path !== this.props.match.path)) {
      /* First load: wait for expand */
      setTimeout(() => this.scrollToBottom('instant'), 300)
    } else if (this.topItem && prevProps.isLoading && !this.props.isLoading) {
      /* More loaded */
      ReactDOM.findDOMNode(this.topItem).scrollIntoView()
    } else if ((prevProps.messageList.length > 0 && this.props.messageList.length === prevProps.messageList.length + 1)) {
      /* New user message */
      this.scrollToBottom('smooth')
    }
  }

  render () {
    const { intl, messageList, isLoading, noMessage } = this.props
    const { inputMessage, showAlert, alertData } = this.state

    const placeholder = intl.formatMessage({ id: 'friend-chat-component.placeholder' })


    if (noMessage) {
      return (
        <div className={styles['root']}>
          <div className={styles['chat']}
            onScroll={this.handleScroll}
            ref={(scroller) => { this.scroller = scroller }}>
              <div className={styles['no-message']}>
                <FormattedMessage
                  id='friend-chat-component.title'
                  defaultMessage='Start chatting!'
                />
              </div>
            <div className={styles['bottomElement']} ref={(el) => { this.pageEnd = el }} />
          </div>
          <div className={styles['message-input']}>
            <input
              autoFocus={!isMobile()}
              placeholder={placeholder}
              value={inputMessage}
              onChange={(e) => this.setState({ inputMessage: e.target.value })}
            />
            <div className={styles['message-action']} onClick={this.onInputEnter} />
          </div>
          <AlertComponent show={showAlert} alertData={alertData} />
        </div>
      )
    }

    return (
      <div className={styles['root']}>
        <div className={styles['chat']}
          onScroll={this.handleScroll}
          ref={(scroller) => { this.scroller = scroller }}>
            <div>
              {
                isLoading && (
                  <div>
                    <div className={styles['loader']}>
                      <ClipLoader color={'#aaa'} size={35} loading={isLoading} />
                    </div>
                  </div>
                )
              }
              <MessageListComponent
                messageList={messageList}
                boardList={this.props.boardList}
                userId={this.props.userId}
                history={this.props.history}
                handleAcceptInvite={this.handleAcceptInvite} />
            </div>
          <div className={styles['bottomElement']} ref={(el) => { this.pageEnd = el }} />
        </div>
        <div className={styles['message-input']}>
          <input
            autoFocus={!isMobile()}
            placeholder={placeholder}
            value={inputMessage}
            onChange={(e) => this.setState({ inputMessage: e.target.value })}
          />
          <div className={styles['message-action']} onClick={this.onInputEnter} />
        </div>
        <AlertComponent show={showAlert} alertData={alertData} />
      </div>
    )
  }
}

const MessageListComponent = props => {
  const { messageList } = props

  return (
    <div>
      {
        messageList.map((message, index) => {
          // Date divider
          let divider = null
          if (index > 0 && doesCrossDay(messageList[index].CreateTS.T, messageList[index - 1].CreateTS.T)) {
            divider = (
              <div className={styles['message-divider']}>
                <span>{epoch2MessageDateFormat(messageList[index].CreateTS.T)}</span>
              </div>
            )
          }

          return (
            <div key={message.ID}>
              {divider}
              <Message {...props} message={message} />
            </div>
          )
        })
      }
    </div>
  )
}

const Message = props => {
  const { message, userId } = props

  let isOwn = (message.CreatorID === userId)

  // is not invite message
  if (message.type !== constants.MESSAGE_TYPE_INVITE) {
    if (isOwn) {
      return (
        <div className={styles['user-message-item']}>
          <div className={styles['user-message-meta']}>
            <div title={constants.STATUS_ARRAY[message.Status]} className={styles['user-message-status']}>
              <div className={styles['user-message-status-circle-' + getStatusClass(message.Status)]} />
            </div>
            <div className={styles['user-message-time']}> {epoch2MessageTimeFormat(message.CreateTS.T)}</div>
          </div>
          <div className={styles['user-message-content']}>{linkParser(message.content)}</div>
        </div>
      )
    } else {
      return (
        <div className={styles['message-item']}>
          <div className={styles['message-content']}>{linkParser(message.content)}</div>
          <div className={styles['message-meta']}>
            <div title={constants.STATUS_ARRAY[message.Status]} className={styles['message-status']}>
              <div className={styles['message-status-circle-' + getStatusClass(message.Status)]} />
            </div>
            <div className={styles['message-time']}>{epoch2MessageTimeFormat(message.CreateTS.T)}</div>
          </div>
        </div>
      )
    }
  }

  // Invite message

  let inviteInfo = message.content

  if (isOwn) {
    return (
      <div className={styles['user-message-item']}>
        <div className={styles['user-message-meta']}>
          <div title={constants.STATUS_ARRAY[message.Status]} className={styles['user-message-status']}>
            <div className={styles['user-message-status-circle-' + getStatusClass(message.Status)]} />
          </div>
          <div className={styles['user-message-time']}> {epoch2MessageTimeFormat(message.CreateTS.T)}</div>
        </div>
        <div className={styles['user-message-content-invitation']}>
          <span>
            <FormattedMessage
              id='friend-chat-component.action3'
              defaultMessage='Sent Group Invitation'
            />
            <span>{inviteInfo.boardName}</span>
            <FormattedMessage
              id='friend-chat-component.action4'
              defaultMessage=' ({expTimeVal})'
              values={{ expTimeVal: expiredFormat(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration) }}
            />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['message-item']}>
      <InvitationBlock
        inviteInfo={inviteInfo}
        handleAcceptInvite={props.handleAcceptInvite}
        boardList={props.boardList}
        history={props.history} />
      <div className={styles['message-meta']}>
        <div title={constants.STATUS_ARRAY[message.Status]} className={styles['message-status']}>
          <div className={styles['message-status-circle-' + getStatusClass(message.Status)]} />
        </div>
        <div className={styles['message-time']}>{epoch2MessageTimeFormat(message.CreateTS.T)}</div>
      </div>
    </div>
  )
}

const InvitationBlock = props => {
  const { inviteInfo, boardList, handleAcceptInvite, history } = props

  var inviteBoard = boardList.find(each => each.ID === inviteInfo.boardId)
  var isJoined = inviteBoard && inviteBoard.Status < constants.STATUS_ARRAY.indexOf('StatusDeleted')

  /* TODO: Need remove-board time stamp to disable rejoin */
  if (isJoined) {
    return (
      <div className={styles['message-content-invitation']} onClick={() => history.push(`/board/${inviteInfo.boardId}`)}>
        <span>
          <FormattedMessage
            id='friend-chat-component.action1'
            defaultMessage='You Have Joined'
          />
          <span>{inviteInfo.boardName}</span>
          <FormattedMessage
            id='friend-chat-component.action1-2'
            defaultMessage='Click to go to Group'
          />
        </span>
      </div>
    )
  }

  // not joined, invitation still valid
  if (isValid(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration)) {
    return (
      <div className={styles['message-content-invitation']} onClick={() => handleAcceptInvite(inviteInfo.boardJoinKey)}>
        <span>
          <FormattedMessage
            id='friend-chat-component.action2'
            defaultMessage='Invited to' />
          <span>{inviteInfo.boardName}</span>
          <FormattedMessage
            id='friend-chat-component.action2-2'
            defaultMessage='Click to join ({expTimeVal})'
            values={{ expTimeVal: expiredFormat(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration) }} />
        </span>
      </div>
    )
  }

  return (
    <div className={`${styles['message-content-invitation']} ${styles['expired']}`} >
      <span>
        <FormattedMessage
          id='friend-chat-component.action2'
          defaultMessage='Invited to' />
        <span>{inviteInfo.boardName}</span>
        <FormattedMessage
          id='friend-chat-component.action2-2'
          defaultMessage='Click to join ({expTimeVal})'
          values={{ expTimeVal: expiredFormat(inviteInfo.keyUpdateTS_T, inviteInfo.keyExpiration) }} />
      </span>
    </div>
  )
}

export default injectIntl(FriendChatComponent)
