import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import Immutable from 'immutable'
import { ToastContainer, toast } from 'react-toastify'
import { injectIntl } from 'react-intl'
import moment from 'moment'

import Empty from '../components/Empty'
import Navigator from '../components/Navigator'

import HubPage from '../containers/HubPage'
import BoardPage from '../containers/BoardPage'
import ArticlePage from '../containers/ArticlePage'
import ProfilePage from '../containers/ProfilePage'
import FriendListPage from '../containers/FriendListPage'
import FriendChatPage from '../containers/FriendChatPage'
import ModalContainer from '../containers/ModalContainer'

import * as doRootPage from '../reducers/RootPage'
import * as doModalContainer from '../reducers/ModalContainer'

import * as constants from '../constants/Constants'
import { getUUID,
  getRootId,
  getRoot,
  getChildId,
  isUnRead,
  decodeURIObj,
  decodeBase64,
  parseQueryString } from '../utils/utils'

import { show as showNotification } from '../utils/notification'
import googleAnalytics from '../utils/googleAnalytics'

import styles from './RootPage.module.scss'
import 'react-toastify/dist/ReactToastify.css'

class RootPage extends PureComponent {
  constructor (props) {
    super()
    this.toastId = null
    this.browserTabInterval = null
    this.refreshPageInterval = null

    this.pageLastSeenAt = moment()
    this.sentNotifications = []

    this.resetTitle = this.resetTitle.bind(this)
    this.refreshPage = this.refreshPage.bind(this)
    this.refreshBrowserTabTitle = this.refreshBrowserTabTitle.bind(this)
    this.checkMarkFriendListSeen = this.checkMarkFriendListSeen.bind(this)
    this.checkMarkHubSeen = this.checkMarkHubSeen.bind(this)

    this.handleBrowserTabNotification = this.handleBrowserTabNotification.bind(this)
    this.handleBrowserToast = this.handleBrowserToast.bind(this)
  }

  componentWillMount () {
    const { location: { search }, match: { params }, actions: { doRootPage, doModalContainer } } = this.props
    const query = parseQueryString(search)

    let myId = getUUID()

    let openFirstPopupModal = (userId, keyInfo) => {
      // let deviceJoinKeyInfo = keyInfo.find(({ key }) => key === 'deviceJoinKey').value
      let userPrivateKeyInfo = keyInfo.find(({ key }) => key === 'userPrivateKey').value

      doModalContainer.setInput({
        userPrivateKeyInfo: userPrivateKeyInfo,
        userId: userId,
        // TODO: comment this because multidevice function is currenly disable.
        //
        // deviceJoinKeyInfo: deviceJoinKeyInfo,
        // signIn: (nodeId, pKey, addDeviceCallBackFunc, waitingCallBackFunc, signedInCallBackFunc) => {
        //   doRootPage.addDevice(myId, nodeId, pKey, addDeviceCallBackFunc)
        //   setInterval(() => {
        //     doRootPage.getUserInfo(myId).then( res => {
        //       if (res.type === 'done') { return signedInCallBackFunc() }
        //       // no user name
        //       let keyInfo = res.value;
        //       let deviceJoinKeyInfo   = keyInfo.find((key) => key.key === 'deviceJoinKey').value
        //       let userPrivateKeyInfo  = keyInfo.find((key) => key.key === 'userPrivateKey').value
        //       waitingCallBackFunc(userPrivateKeyInfo, {
        //         URL:          deviceJoinKeyInfo.URL,
        //         UpdateTS:     deviceJoinKeyInfo.UT ? deviceJoinKeyInfo.UT : emptyTimeStamp(),
        //         expirePeriod: deviceJoinKeyInfo.e,
        //       })
        //     })
        //   }, constants.REFRESH_INTERVAL)
        // },
        signUp: (name) => {
          doRootPage.signup(myId, name)
          doModalContainer.closeModal()
        }
      })

      doModalContainer.openModal(constants.FIRST_POPUP_MODAL)
    }

    let openPrivacySettingModal = (userId) => {
      doModalContainer.setInput({
        userId: userId
      })

      doModalContainer.openModal(constants.PRIVACY_SETTING_MODAL)
    }

    doRootPage.init(myId, query, decodeURIObj(params))

    // get user name and user image
    doRootPage.getUserInfo(myId).then(res => {
      if (res.type === 'no_user_name') openFirstPopupModal(res.userId, res.value)
      else if (!googleAnalytics.isConfigured()) openPrivacySettingModal(res.userId)
    })

    // get join keys for multi-device and friend
    doRootPage.getKeyInfo(myId)

    // get user devices
    doRootPage.getDeviceInfo(myId)

    // get latest articles
    doRootPage.getLatestArticles(myId, constants.NUM_NEWS_PER_REQ)

    // get frined list , sorted by last message created time
    doRootPage.fetchLatestMessage(myId, 1) // we just need the latest message to check unread or not

    // get log last seen
    doRootPage.getLogLastSeen(myId)

    // get friend list last seen
    doRootPage.getFriendListSeen(myId)

    this.refreshPageInterval = setInterval(() => this.refreshPage(myId), constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    clearInterval(this.refreshPageInterval)
  }

  refreshBrowserTabTitle (sender) {
    const { intl } = this.props

    let notifyOneTitle = intl.formatMessage({ id: 'site-title.notify1' }, { SENDER: sender })
    let notifyTwoTitle = intl.formatMessage({ id: 'site-title.notify2' })

    if (document.title === notifyOneTitle) {
      document.title = notifyTwoTitle
    } else {
      document.title = notifyOneTitle
    }
  }

  refreshPage (myId) {
    const { actions: { doRootPage } } = this.props

    let onConnectionLost = (message) => {
      if (!toast.isActive(this.toastId)) {
        this.toastId = toast.error(message, { autoClose: 3000 })
      }
    }

    if (this.props.match.url === (`/hub`)) {
      doRootPage.markLogSeen(myId)
    } else {
      doRootPage.getLogLastSeen(myId)
    }

    if (this.props.match.url === `/friend`) { // only index send
      doRootPage.markFriendListSeen(myId)
    } else {
      doRootPage.getFriendListSeen(myId)
    }

    doRootPage.fetchLatestMessage(myId, 1)
    doRootPage.getLatestArticles(myId, constants.NUM_NEWS_PER_REQ)
    doRootPage.getDeviceInfo(myId)
    doRootPage.getUserInfo(myId).catch(err => {
      console.error(err.info)
      onConnectionLost(err.message)
    })

    let me = getRoot(this.props)
    let userId = me.getIn(['userInfo', 'userId'])
    let latestMessage = me.getIn(['latestFriendList', '0'], Immutable.Map()).toJS()

    if (!latestMessage || latestMessage.creatorID === userId) { return }

    // Web browser tab notification
    this.handleBrowserTabNotification(latestMessage)
    this.handleBrowserToast(latestMessage)
  }

  resetTitle () {
    const { intl } = this.props
    this.pageLastSeenAt = moment()

    // stop showing tab notification
    if (this.browserTabInterval) {
      clearInterval(this.browserTabInterval)
      this.browserTabInterval = null
    }

    document.title = intl.formatMessage({ id: 'site-title.title' })
  }

  handleBrowserTabNotification (latestMessage) {
    // user is browsing current tab
    if (!document.hidden) return this.resetTitle()

    if (isUnRead(latestMessage.createAt, this.pageLastSeenAt)) {
      this.browserTabInterval = this.browserTabInterval || setInterval(() => {
        let sender = decodeBase64(latestMessage.creatorName)
        this.refreshBrowserTabTitle(sender)
      }, constants.TITLE_FLASH_INTERVAL)
    }
  }

  handleBrowserToast (latestMessage) {
    const { intl, match, history } = this.props

    if (
      !document.hidden || // user is browsing current tab
      this.sentNotifications.includes(latestMessage.messageID) || // noti has been sent before
      !isUnRead(latestMessage.createAt, this.pageLastSeenAt) // msg has been read before
    ) { return }

    // prepare data for notification
    let { messageID, friendID, chatID } = latestMessage
    let creatorName = decodeBase64(latestMessage.creatorName)
    let title = intl.formatMessage({ id: 'site-title.notify1' }, { SENDER: creatorName })
    let summary = latestMessage.contents
      .map(content => JSON.parse(decodeBase64(content)))
      .filter(content => content.type === 1) // text only
      .map(content => content.value)
      .join(' ').substr(0, 20)

    // send notification
    let noti = showNotification({ title: title, body: summary, tag: `message${messageID}` })
    if (noti) {
      this.sentNotifications.push(messageID)
      noti.addEventListener('click', event => {
        window.focus()
        noti.close()

        if (match.url !== `/friend/${friendID}/chat/${chatID}/`) {
          history.push(`/friend/`) // to trigger page re-render
          history.push(`/friend/${friendID}/chat/${chatID}/`)
        }
      })
    }
  }

  checkMarkHubSeen () {
    let { myId, actions: { doRootPage }, match: { params } } = this.props

    let me = getRoot(this.props)
    let logLastSeenAt = me.get('logLastSeenAt')
    let latestArticles = me.get('latestArticles', Immutable.List()).toJS()

    let ids = latestArticles.map(la => la.BoardID)
    let hubHasUnread = latestArticles.length > 0 ? isUnRead(latestArticles[0].createAt, logLastSeenAt) : false

    if (ids.includes(params.boardId) && !hubHasUnread) {
      doRootPage.markLogSeen(myId)
    }
  }

  checkMarkFriendListSeen () {
    let { myId, actions: { doRootPage }, match: { params } } = this.props

    let me = getRoot(this.props)
    let friendLastSeen = me.get('friendLastSeen')
    let latestFriendList = me.get('latestFriendList', Immutable.List()).toJS()

    let ids = latestFriendList.map(lf => lf.ID)
    let friendListHasUnread = latestFriendList.length > 0 ? isUnRead(latestFriendList[0].createAt, friendLastSeen) : false

    if (ids.includes(params.chatId) && !friendListHasUnread) {
      doRootPage.markFriendListSeen(myId)
    }
  }

  render () {
    const { match, myComponent, actions: { doRootPage, doModalContainer } } = this.props

    let myId = getRootId(this.props)
    if (!myId) return (<Empty />)

    let me = getRoot(this.props)

    if (!me.getIn) return (<Empty />)

    let userId = me.getIn(['userInfo', 'userId'])
    let userName = me.getIn(['userInfo', 'userName'])
    let userImg = me.getIn(['userInfo', 'userImg'])
    let keyInfo = me.get('keyInfo', Immutable.Map()).toJS()
    let deviceInfo = me.get('deviceInfo', Immutable.List()).toJS()
    let latestArticles = me.get('latestArticles', Immutable.List()).toJS()
    let latestFriendList = me.get('latestFriendList', Immutable.List()).toJS()
    let friendLastSeen = me.get('friendLastSeen')
    let logLastSeenAt = me.get('logLastSeenAt')

    let latestHasUnread = latestArticles.length > 0 ? isUnRead(latestArticles[0].updateAt, latestArticles[0].lastSeenAt) : false
    let hubHasUnread = latestArticles.length > 0 ? isUnRead(latestArticles[0].updateAt, logLastSeenAt) : false

    let friendListHasUnread = latestFriendList.length > 0 ? isUnRead(latestFriendList[0].createAt, friendLastSeen) : false

    let openNameCard = () => {
      doModalContainer.setInput({
        userId: userId,
        isEditable: true
      })
      doModalContainer.openModal(constants.NAME_CARD_MODAL)
    }

    let onSettingClicked = () => {
      doModalContainer.setInput({
        /* For multi-device modal */
        device: {
          data: deviceInfo,
          addDeviceAction: (nodeId, pKey, callBackFunc) => doRootPage.addDevice(myId, nodeId, pKey, callBackFunc)
        },
        keyInfo: {
          data: keyInfo,
          refreshKeyInfo: () => doRootPage.getKeyInfo(myId)
        },
        /* For op log modal */
        tabs: [
          // constants.SHOW_PTT_MASTER_TAB,
          constants.SHOW_PTT_ME_TAB,
          constants.SHOW_PTT_PEERS_TAB,
          constants.SHOW_LAST_ANNOUNCE_P2P_TAB
        ],
        userId: userId
      })
      doModalContainer.openModal(constants.SETTING_MENU_MODAL)
    }

    let onLatestClicked = () => {
      doModalContainer.setInput({
        match: match, /* for props to detect url path changes */
        isLoading: false,
        articleList: latestArticles,
        prevClicked: () => doModalContainer.closeModal(),
        itemClicked: () => doModalContainer.closeModal()
      })
      doModalContainer.openModal(constants.LATEST_PAGE_MODAL)
    }
    let markHubSeen = () => {
      doRootPage.markLogSeen(myId)
    }
    let markFriendRead = () => {
      doRootPage.markFriendListSeen(myId)
    }

    const hubPageId = getChildId(me, 'HUB_PAGE')
    const boardPageId = getChildId(me, 'BOARD_PAGE')
    const articlePageId = getChildId(me, 'ARTICLE_PAGE')
    const profilePageId = getChildId(me, 'PROFILE_PAGE')
    const friendListPageId = getChildId(me, 'FRIEND_LIST_PAGE')
    const friendChatPageId = getChildId(me, 'FRIEND_CHAT_PAGE')

    const createBoardId = getChildId(me, 'CREATE_BOARD_MODAL')
    const manageBoardId = getChildId(me, 'MANAGE_BOARD_MODAL')
    const manageBoardMemberId = getChildId(me, 'MANAGE_BOARD_MEMBER_MODAL')
    const inviteToBoardId = getChildId(me, 'INVITE_TO_BOARD_MODAL')
    const showOpLogId = getChildId(me, 'SHOW_OP_LOG_MODAL')

    let modalIdMap = {
      'CREATE_BOARD_MODAL': createBoardId,
      'MANAGE_BOARD_MODAL': manageBoardId,
      'SHOW_OP_LOG_MODAL': showOpLogId,
      'MANAGE_BOARD_MEMBER_MODAL': manageBoardMemberId,
      'INVITE_TO_BOARD_MODAL': inviteToBoardId
    }

    let MAIN_PAGE = null

    switch (myComponent) {
      case 'HubPage':
        MAIN_PAGE = (<HubPage {...this.props} markSeen={markHubSeen} myId={hubPageId} />)
        break
      case 'BoardPage':
        MAIN_PAGE = (<BoardPage {...this.props} markSeen={this.checkMarkHubSeen} myId={boardPageId} />)
        break
      case 'ArticlePage':
        MAIN_PAGE = (<ArticlePage {...this.props} myId={articlePageId} />)
        break
      case 'FriendListPage':
        MAIN_PAGE = (<FriendListPage {...this.props} markSeen={markFriendRead} myId={friendListPageId} />)
        break
      case 'FriendChatPage':
        MAIN_PAGE = (<FriendChatPage {...this.props} markSeen={this.checkMarkFriendListSeen} myId={friendChatPageId} />)
        break
      default:
        MAIN_PAGE = null
    }

    let isChatRoom = myComponent === 'FriendChatPage'

    return (
      <div className={styles['root']}>
        <ProfilePage
          myId={profilePageId}
          userId={userId}
          userName={userName}
          userImg={userImg}
          openNameCard={openNameCard}
          onSettingClicked={onSettingClicked}
          onLatestClicked={onLatestClicked}
          isChatRoom={isChatRoom}
          hasUnread={latestHasUnread} />
        <Navigator {...this.props}
          hubHasUnread={hubHasUnread}
          friendListHasUnread={friendListHasUnread}
          onHubClicked={markHubSeen}
          isChatRoom={isChatRoom}
          onFriendClicked={markFriendRead} />
        { MAIN_PAGE }
        <ModalContainer className={styles['overlay']} idMap={modalIdMap} />
        <ToastContainer hideProgressBar />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doRootPage: bindActionCreators(doRootPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch)
  }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(RootPage)))
