import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Immutable from 'immutable'
import { FormattedMessage } from 'react-intl'

import Empty from '../components/Empty'
import FriendChatBar from '../components/FriendChatBar'
import FriendChatComponent from '../components/FriendChatComponent'
import { getRoot } from '../utils/utils'
import googleAnalytics from '../utils/googleAnalytics'

import * as doModalContainer from '../reducers/ModalContainer'
import * as doFriendChatPage from '../reducers/FriendChatPage'
import * as constants from '../constants/Constants'

import styles from './FriendChatPage.module.scss'

class FriendChatPage extends PureComponent {
  constructor (props) {
    super()
    this.refreshPageInterval = null
    this.getLatestMessage = this.getLatestMessage.bind(this)
  }

  getLatestMessage () {
    const { myId, markSeen, actions: { doFriendChatPage }, match: { params } } = this.props

    doFriendChatPage.getMessageList(myId, decodeURIComponent(params.chatId), false, constants.NUM_MESSAGE_PER_REQ)
    doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId))

    markSeen()
  }

  componentWillMount () {
    const { actions: { doFriendChatPage }, match: { params }, myId } = this.props

    // TODO: data for different chatroom should be stored into different array.
    //       Currently we are using the same array for data storing, so we need
    //       to clear the array to avoid message residual
    doFriendChatPage.clearData(myId)

    doFriendChatPage.initParams(myId, params)
    doFriendChatPage.getFriend(myId, decodeURIComponent(params.friendId))
    doFriendChatPage.getMessageList(myId, decodeURIComponent(params.chatId), true, constants.NUM_MESSAGE_PER_REQ)

    this.refreshPageInterval = setInterval(this.getLatestMessage, constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    const { actions: { doFriendChatPage }, myId } = this.props
    doFriendChatPage.clearData(myId)

    clearInterval(this.refreshPageInterval)
  }

  componentDidMount () {
    const { markSeen, actions: { doFriendChatPage }, match: { params }, myId } = this.props

    doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId))

    markSeen()
    googleAnalytics.firePageView()
  }

  render () {
    const { myId, history, friendChatPage, markSeen, actions: { doFriendChatPage, doModalContainer }, match: { params }, match } = this.props

    let userId = getRoot(this.props).getIn(['userInfo', 'userId'])

    if (!myId) return (<Empty />)

    let me = friendChatPage.get(myId, Immutable.Map())
    let friendData = me.get('friendData', Immutable.Map()).toJS()
    let messageList = me.getIn(['friendMessages', 'messageList'], Immutable.List()).toJS()

    let isLoading = me.get('isLoading', false)
    let noMessage = me.get('noMessage', false)
    let allMessagesLoaded = me.get('allMessagesLoaded', false)

    let onMessageAdded = (message) => {
      let postMessage = {
        type: constants.MESSAGE_TYPE_TEXT,
        value: message
      }
      doFriendChatPage.postMessage(myId, userId, decodeURIComponent(params.chatId), JSON.stringify(postMessage))
      doFriendChatPage.markChat(myId, decodeURIComponent(params.chatId))

      markSeen()
      googleAnalytics.fireEventOnProb('Chat', 'SendMessage', 0.1)
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
          constants.SHOW_FRIEND_PEERS_TAB
        ],
        params: {
          friendId: friendData.ID
        }
      })
      doModalContainer.openModal(constants.SHOW_OP_LOG_MODAL)
    }

    let openNameCard = () => {
      doModalContainer.setInput({
        userId: params.friendId,
        isEditable: false
      })
      doModalContainer.openModal(constants.NAME_CARD_MODAL)
    }

    const deleteFriendCallBack = (response) => {
      if (response.error) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message31'
                defaultMessage='[Failed] {data}:{chatId}'
                values={{ data: response.data, chatId: response.chatId }}
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
      } else {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message30'
                defaultMessage='[Success] Friend Deleted'
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
        doModalContainer.closeModal()
        history.push('/friend')
      }
    }

    const onDeleteFriend = (chatId) => {
      doFriendChatPage.deleteFriend(myId, chatId, deleteFriendCallBack)
    }

    let openFriendSettingMenuModal = chatId => {
      doModalContainer.setInput({
        onDeleteFriend: () => onDeleteFriend(chatId)
      })
      doModalContainer.openModal(constants.FRIEND_SETTING_MENU_MODAL)
    }

    return (
      <div className={styles['root']}>
        <FriendChatBar
          friendData={friendData}
          onOpenOPLogModal={onOpenOPLogModal}
          openNameCard={openNameCard}
          openFriendSettingMenuModal={openFriendSettingMenuModal}
        />
        <FriendChatComponent
          history={history}
          userId={userId}
          match={match}
          isLoading={isLoading}
          noMessage={noMessage}
          allMessagesLoaded={allMessagesLoaded}
          messageList={messageList}
          onJoinBoard={onJoinBoard}
          onMessageAdded={onMessageAdded}
          onGetMoreMessages={onGetMoreMessages}
          onOpenOPLogModal={onOpenOPLogModal} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doFriendChatPage: bindActionCreators(doFriendChatPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(FriendChatPage)
