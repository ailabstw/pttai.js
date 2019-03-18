import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Immutable                    from 'immutable'

import Empty                    from '../components/Empty'
import FriendChatBar            from '../components/FriendChatBar'
import FriendChatComponent      from '../components/FriendChatComponent'
import { getRoot }              from '../utils/utils'

import * as doModalContainer    from '../reducers/ModalContainer'
import * as doFriendChatPage    from '../reducers/FriendChatPage'
import * as constants           from '../constants/Constants'

import styles from './FriendChatPage.css'

class FriendChatPage extends PureComponent {

  constructor(props) {
    super();
    this.refreshPageInterval = null
    this.getLatestMessage = this.getLatestMessage.bind(this)
  }

  getLatestMessage() {
    const { myId, actions: {doFriendChatPage}, match: {params} } = this.props

    doFriendChatPage.getMessageList(myId, decodeURIComponent(params.chatId), false, constants.NUM_MESSAGE_PER_REQ)
    doFriendChatPage.getBoardList(myId, constants.NUM_BOARD_PER_REQ)
    doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId));
  }

  componentWillMount() {
    const {actions: {doFriendChatPage}, match: {params}, myId} = this.props

    doFriendChatPage.initParams(myId, params)
    doFriendChatPage.getFriend(myId, decodeURIComponent(params.friendId))
    doFriendChatPage.getMessageList(myId, decodeURIComponent(params.chatId), true, constants.NUM_MESSAGE_PER_REQ)
    doFriendChatPage.getBoardList(myId, constants.NUM_BOARD_PER_REQ)

    this.refreshPageInterval = setInterval(this.getLatestMessage, constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    const {actions: {doFriendChatPage}, myId} = this.props
    doFriendChatPage.clearData(myId)

    clearInterval(this.refreshPageInterval)
  }

  componentDidMount() {
    const {actions: {doFriendChatPage}, match: {params}, myId} = this.props

    doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId));
  }

  render() {
    const { myId, history, friendChatPage, actions: {doFriendChatPage, doModalContainer}, match: {params}, match } = this.props

    let userId   = getRoot(this.props).getIn(['userInfo','userId'])
    let userName = getRoot(this.props).getIn(['userInfo','userName'])
    let userImg  = getRoot(this.props).getIn(['userInfo','userImg'])

    if(!myId) return (<Empty />)

    let me = friendChatPage.get(myId, Immutable.Map())
    let friendData          = me.get('friendData',  Immutable.Map()).toJS()
    let messageList         = me.getIn(['friendMessages', 'messageList'], Immutable.List()).toJS()

    let boardList           = me.get('boardList', Immutable.List()).toJS()
    let isLoading           = me.get('isLoading', false)
    let noMessage           = me.get('noMessage', false)
    let allMessagesLoaded   = me.get('allMessagesLoaded', false)

    let onMessageAdded = (message) => {
      let postMessage = {
        type:   constants.MESSAGE_TYPE_TEXT,
        value:  message,
      }
      doFriendChatPage.postMessage(myId, userId, userName, userImg, decodeURIComponent(params.chatId), JSON.stringify(postMessage))
      doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId));
    }

    let onGetMoreMessages = (startMessageId) => {
      doFriendChatPage.getMoreMessageList(myId, decodeURIComponent(params.chatId), startMessageId, constants.NUM_MESSAGE_PER_REQ)
    }

    let onJoinBoard = (boardJoinKey, callBackFunc) => {
      doFriendChatPage.joinBoard(myId, boardJoinKey, callBackFunc)
    }

    let onOpenOPLogModal = () => {
      doModalContainer.setInput({
        tabs: [
          constants.SHOW_FRIEND_FRIEND_TAB,
          constants.SHOW_FRIEND_MASTER_TAB,
          constants.SHOW_FRIEND_MEMBER_TAB,
          constants.SHOW_FRIEND_OPKEY_TAB,
          constants.SHOW_FRIEND_PEERS_TAB,
        ],
        params: {
          friendId: friendData.ID,
        },
      })
      doModalContainer.openModal(constants.SHOW_OP_LOG_MODAL)
    }

    let onOpenFriendProfileModal = () => {
      doModalContainer.setInput({
        FriendID: params.friendId,
        ...friendData
      })
      doModalContainer.openModal(constants.FRIEND_PROFILE_MODAL)
    }

    return (
      <div className={styles['root']}>
        <FriendChatBar
          friendData={friendData}
          onOpenOPLogModal={onOpenOPLogModal}
          onOpenFriendProfileModal={onOpenFriendProfileModal}
        />
        <FriendChatComponent
          history={history}
          userId={userId}
          match={match}
          friendData={friendData}
          isLoading={isLoading}
          noMessage={noMessage}
          allMessagesLoaded={allMessagesLoaded}
          boardList={boardList}
          messageList={messageList}
          onJoinBoard={onJoinBoard}
          onMessageAdded={onMessageAdded}
          onGetMoreMessages={onGetMoreMessages}
          onOpenOPLogModal={onOpenOPLogModal}
          onOpenFriendProfileModal={onOpenFriendProfileModal}
          />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doFriendChatPage: bindActionCreators(doFriendChatPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(FriendChatPage)
