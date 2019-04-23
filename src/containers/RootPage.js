import React, { PureComponent }   from 'react'
import { connect }                from 'react-redux'
import { withRouter }             from 'react-router-dom'
import { bindActionCreators }     from 'redux'
import Immutable                  from 'immutable'
import { ToastContainer, toast }  from 'react-toastify'
import { injectIntl }       from 'react-intl'

import Empty          from '../components/Empty'
import Navigator      from '../components/Navigator'

import HubPage        from '../containers/HubPage'
import BoardPage      from '../containers/BoardPage'
import ArticlePage    from '../containers/ArticlePage'
import ProfilePage    from '../containers/ProfilePage'
import FriendListPage from '../containers/FriendListPage'
import FriendChatPage from '../containers/FriendChatPage'
import ModalContainer from '../containers/ModalContainer'

import * as doRootPage        from '../reducers/RootPage'
import * as doModalContainer  from '../reducers/ModalContainer'

import * as constants         from '../constants/Constants'
import {  getUUID,
          getRootId,
          getRoot,
          getChildId,
          isUnRead,
          decodeURIObj,
          decodeBase64,
          parseQueryString  } from '../utils/utils'

import { show as showNotification } from '../utils/notification'

import { emptyTimeStamp } from '../reducers/utils'

import styles from './RootPage.css'
import 'react-toastify/dist/ReactToastify.css'

class RootPage extends PureComponent {
  constructor(props) {
    super();
    this.toastId = null
    this.browserTabInterval   = null
    this.refreshPageInterval  = null

    this.pageLastSeenTS = emptyTimeStamp()
    this.sentNotifications = []

    this.resetTitle              = this.resetTitle.bind(this)
    this.refreshPage             = this.refreshPage.bind(this)
    this.refreshBrowserTabTitle  = this.refreshBrowserTabTitle.bind(this)
    this.checkMarkFriendListSeen = this.checkMarkFriendListSeen.bind(this)
    this.checkMarkHubSeen        = this.checkMarkHubSeen.bind(this)

    this.handleBrowserTabNotification = this.handleBrowserTabNotification.bind(this)
    this.handleBrowserToast           = this.handleBrowserToast.bind(this)
  }

  componentWillMount() {
    const { location: {search}, match:{params}, actions: {doRootPage, doModalContainer} } = this.props
    const query = parseQueryString(search)

    let myId = getUUID()

    let openFirstPopupModal = (userPrivateKeyInfo, deviceJoinKeyInfo) => {
      doModalContainer.setInput({
        deviceJoinKeyInfo:  deviceJoinKeyInfo,
        userPrivateKeyInfo: userPrivateKeyInfo,
        signIn: (nodeId, pKey, addDeviceCallBackFunc, waitingCallBackFunc, signedInCallBackFunc) => {
          doRootPage.addDevice(myId, nodeId, pKey, addDeviceCallBackFunc)
          setInterval(() => {
              doRootPage.getUserInfo(myId, waitingCallBackFunc, signedInCallBackFunc)
            },
            constants.REFRESH_INTERVAL
          )
          //doModalContainer.closeModal()
        },
        signUp: (name) => {
          doRootPage.editName(myId, name)
          doModalContainer.closeModal()
        },
      })

      doModalContainer.openModal(constants.FIRST_POPUP_MODAL)
    }

    doRootPage.init(myId, query, decodeURIObj(params))

    // get user name and user image
    doRootPage.getUserInfo(myId, openFirstPopupModal, () => {})

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

    this.refreshPageInterval = setInterval(() => this.refreshPage(myId), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshPageInterval)
  }

  refreshBrowserTabTitle(sender) {
    const { intl } = this.props

    let notifyOneTitle = intl.formatMessage({id: 'site-title.notify1'}, {SENDER: sender})
    let notifyTwoTitle = intl.formatMessage({id: 'site-title.notify2'})

    if (document.title === notifyOneTitle) {
      document.title = notifyTwoTitle;
    } else {
      document.title = notifyOneTitle;
    }
  }

  refreshPage(myId) {
    const { actions: {doRootPage} } = this.props

    let onConnectionLost = (message) => {
      if (!toast.isActive(this.toastId)) {
        this.toastId = toast.error(message, { autoClose: 3000 });
      }
    }

    if (this.props.match.url === (`/hub`)) {
      doRootPage.markLogSeen(myId)
    }
    else {
      doRootPage.getLogLastSeen(myId)
    }

    if (this.props.match.url === `/friend`) { // only index send
      doRootPage.markFriendListSeen(myId)
    }
    else {
      doRootPage.getFriendListSeen(myId)
    }

    doRootPage.fetchLatestMessage(myId, 1)
    doRootPage.getLatestArticles(myId, constants.NUM_NEWS_PER_REQ)
    doRootPage.getDeviceInfo(myId)
    doRootPage.getUserInfo(myId, () => {}, () => {}, onConnectionLost)

    let me                  = getRoot(this.props)
    let latestFriendList    = me.get('latestFriendList', Immutable.List()).toJS()

    // Web browser tab notification
    this.handleBrowserTabNotification(latestFriendList)
    this.handleBrowserToast(latestFriendList)
  }

  resetTitle() {
    const { intl } = this.props
    this.pageLastSeenTS = emptyTimeStamp()

    // stop showing tab notification
    if (this.browserTabInterval) {
      clearInterval(this.browserTabInterval)
      this.browserTabInterval   = null
    }

    document.title = intl.formatMessage({id: 'site-title.title'})
  }

  handleBrowserTabNotification(latestFriendList) {
    const latestMessage = latestFriendList[0]

    // user is browsing current tab
    if (!document.hidden) return this.resetTitle()

    if (isUnRead(latestMessage.createTS.T, this.pageLastSeenTS.T)) {
      this.browserTabInterval = this.browserTabInterval || setInterval(() => {
        let sender = decodeBase64(latestMessage.creatorName)
        this.refreshBrowserTabTitle(sender)
      }, constants.TITLE_FLASH_INTERVAL);
    }
  }

  handleBrowserToast(latestFriendList) {
    const { intl, match, history } = this.props
    const latestMessage = latestFriendList[0]

    if (
      !latestMessage ||
      !document.hidden ||                                         // user is browsing current tab
      this.sentNotifications.includes(latestMessage.messageID) || // noti has been sent before
      !isUnRead(latestMessage.createTS.T, this.pageLastSeenTS.T)  // msg has been read before
    ) { return }

    // prepare data for notification
    let { messageID, friendID, chatID } = latestMessage
    let creatorName = decodeBase64(latestMessage.creatorName)
    let title = intl.formatMessage({id: 'site-title.notify1'}, {SENDER: creatorName})
    let summary = latestMessage.contents
      .map( content => JSON.parse(decodeBase64(content)) )
      .filter( content => content.type === 1 ) // text only
      .map( content => content.value )
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

  checkMarkHubSeen() {
    let { myId, actions: {doRootPage}, match:{params} } = this.props

    let me             = getRoot(this.props)
    let logLastSeen    = me.get('logLastSeen',      Immutable.Map()).toJS()
    let latestArticles = me.get('latestArticles',   Immutable.List()).toJS()

    let ids = latestArticles.map(la => la.BoardID)
    let hubHasUnread = latestArticles.length > 0? isUnRead(latestArticles[0].CreateTS.T, logLastSeen.T):false;

    if (ids.includes(params.boardId) && !hubHasUnread) {
      doRootPage.markLogSeen(myId)
    }
  }

  checkMarkFriendListSeen() {
    let { myId, actions: {doRootPage}, match:{params} } = this.props

    let me                  = getRoot(this.props)
    let friendLastSeen      = me.get('friendLastSeen',   Immutable.Map()).toJS()
    let latestFriendList    = me.get('latestFriendList', Immutable.List()).toJS()

    let ids = latestFriendList.map(lf => lf.ID)
    let friendListHasUnread = latestFriendList.length > 0? isUnRead(latestFriendList[0].createTS.T, friendLastSeen.T):false;

    if (ids.includes(params.chatId) && !friendListHasUnread) {
      doRootPage.markFriendListSeen(myId)
    }
  }

  render() {
    const { match, myComponent, actions: {doRootPage, doModalContainer}} = this.props

    let myId = getRootId(this.props)
    if(!myId) return (<Empty />)

    let me               = getRoot(this.props)
    let userId           = me.getIn(['userInfo', 'userId'])
    let userName         = me.getIn(['userInfo', 'userName'])
    let userImg          = me.getIn(['userInfo', 'userImg'])
    let profile          = me.getIn(['userInfo', 'userNameCard'], Immutable.Map()).toJS()
    let keyInfo          = me.get('keyInfo',          Immutable.Map()).toJS()
    let deviceInfo       = me.get('deviceInfo',       Immutable.List()).toJS()
    let latestArticles   = me.get('latestArticles',   Immutable.List()).toJS()
    let latestFriendList = me.get('latestFriendList', Immutable.List()).toJS()
    let friendLastSeen   = me.get('friendLastSeen',   Immutable.Map()).toJS()
    let logLastSeen      = me.get('logLastSeen',      Immutable.Map()).toJS()

    let latestHasUnread = latestArticles.length > 0? isUnRead(latestArticles[0].UpdateTS.T,latestArticles[0].LastSeen.T):false;
    let hubHasUnread = latestArticles.length > 0? isUnRead(latestArticles[0].UpdateTS.T, logLastSeen.T):false;

    let friendListHasUnread = latestFriendList.length > 0? isUnRead(latestFriendList[0].createTS.T, friendLastSeen.T):false;
    let onEditNameSubmit = (name, editedProfile) => {
      doRootPage.editName(myId, name)
      doRootPage.editProfile(myId, editedProfile)
      //doModalContainer.closeModal()
    }

    let onEditImgSubmit = (imgBase64) => {
      doRootPage.editProfileImg(myId, imgBase64)
    }

    let openEditNameModule = () => {
      doModalContainer.setInput({
        userImg:  userImg,
        userName: userName,
        profile:  profile,
        editImgSubmit:   onEditImgSubmit,
        friendJoinKey:   keyInfo.friendJoinKey,
      })
      doModalContainer.setSubmit(onEditNameSubmit)
      doModalContainer.openModal(constants.EDIT_NAME_MODAL)
    }

    let onSettingClicked = () => {
      doModalContainer.setInput({
        /* For multi-device modal */
        device: {
          data: deviceInfo,
          addDeviceAction: (nodeId, pKey, callBackFunc) => doRootPage.addDevice(myId, nodeId, pKey, callBackFunc),
        },
        keyInfo: {
          data: keyInfo,
          refreshKeyInfo: () => doRootPage.getKeyInfo(myId),
        },
        /* For op log modal */
        tabs: [
          //constants.SHOW_PTT_MASTER_TAB,
          constants.SHOW_PTT_ME_TAB,
          constants.SHOW_PTT_PEERS_TAB,
          constants.SHOW_LAST_ANNOUNCE_P2P_TAB,
        ]
      })
      doModalContainer.openModal(constants.SETTING_MENU_MODAL)
    }

    let onLatestClicked = () => {
      doModalContainer.setInput({
        match:        match, /* for props to detect url path changes */
        isLoading:    false,
        articleList:  latestArticles,
        prevClicked:  () => doModalContainer.closeModal(),
        itemClicked:  () => doModalContainer.closeModal(),
      })
      doModalContainer.openModal(constants.LATEST_PAGE_MODAL)
    }
    let markHubSeen = () => {
      doRootPage.markLogSeen(myId)
    }
    let markFriendRead = () => {
      doRootPage.markFriendListSeen(myId)
    }

    const hubPageId         = getChildId(me, 'HUB_PAGE')
    const boardPageId       = getChildId(me, 'BOARD_PAGE')
    const articlePageId     = getChildId(me, 'ARTICLE_PAGE')
    const profilePageId     = getChildId(me, 'PROFILE_PAGE')
    const friendListPageId  = getChildId(me, 'FRIEND_LIST_PAGE')
    const friendChatPageId  = getChildId(me, 'FRIEND_CHAT_PAGE')

    const createBoardId       = getChildId(me, 'CREATE_BOARD_MODAL')
    const manageBoardId       = getChildId(me, 'MANAGE_BOARD_MODAL')
    const manageBoardMemberId = getChildId(me, 'MANAGE_BOARD_MEMBER_MODAL')
    const inviteToBoardId     = getChildId(me, 'INVITE_TO_BOARD_MODAL')
    const showOpLogId         = getChildId(me, 'SHOW_OP_LOG_MODAL')

    let modalIdMap = {
      'CREATE_BOARD_MODAL':         createBoardId,
      'MANAGE_BOARD_MODAL':         manageBoardId,
      'SHOW_OP_LOG_MODAL' :         showOpLogId,
      'MANAGE_BOARD_MEMBER_MODAL':  manageBoardMemberId,
      'INVITE_TO_BOARD_MODAL':      inviteToBoardId,
    }

    let MAIN_PAGE = null

    switch(myComponent) {
        case 'HubPage':
            MAIN_PAGE = (<HubPage {...this.props} markSeen={markHubSeen} myId={hubPageId}/>)
            break;
        case 'BoardPage':
            MAIN_PAGE = (<BoardPage {...this.props} markSeen={this.checkMarkHubSeen} myId={boardPageId}/>)
            break;
        case 'ArticlePage':
            MAIN_PAGE = (<ArticlePage {...this.props} myId={articlePageId}/>)
            break;
        case 'FriendListPage':
            MAIN_PAGE = (<FriendListPage {...this.props} markSeen={markFriendRead} myId={friendListPageId}/>)
            break;
        case 'FriendChatPage':
            MAIN_PAGE = (<FriendChatPage {...this.props} markSeen={this.checkMarkFriendListSeen} myId={friendChatPageId}/>)
            break;
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
          onEditName={openEditNameModule}
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
        <ModalContainer className={styles['overlay']} idMap={modalIdMap}/>
        <ToastContainer hideProgressBar={true}/>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doRootPage: bindActionCreators(doRootPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(RootPage)))
