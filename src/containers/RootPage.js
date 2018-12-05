import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Immutable                from 'immutable'

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
          parseQueryString  } from '../utils/utils'

import styles from './RootPage.css'

class RootPage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval = null

    this.refreshPage = this.refreshPage.bind(this)
  }

  componentWillMount() {
    const { location: {search}, match:{params}, actions: {doRootPage, doModalContainer} } = this.props
    const query = parseQueryString(search)

    let myId = getUUID()

    let openFirstPopupModal = (userPrivateKeyInfo, deviceJoinKeyInfo) => {
      doModalContainer.setInput({
        deviceJoinKeyInfo:  deviceJoinKeyInfo,
        userPrivateKeyInfo: userPrivateKeyInfo,
        signIn: (nodeId, pKey, callBackFunc) => {
          doRootPage.addDevice(myId, nodeId, pKey, callBackFunc)
          doModalContainer.closeModal()
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
    doRootPage.getUserInfo(myId, openFirstPopupModal)

    // get join keys for multi-device and friend
    doRootPage.getKeyInfo(myId)

    // get user devices
    doRootPage.getDeviceInfo(myId)

    // get latest articles
    doRootPage.getLatestArticles(myId, constants.NUM_NEWS_PER_REQ)

    this.refreshPageInterval = setInterval(() => this.refreshPage(myId), constants.REFRESH_INTERVAL);
  }


  componentWillUnmount() {
    clearInterval(this.refreshPageInterval)
  }

  refreshPage(myId) {
    const { actions: {doRootPage} } = this.props

    doRootPage.getLatestArticles(myId, constants.NUM_NEWS_PER_REQ)
  }

  render() {
    const { match, myComponent, actions: {doRootPage, doModalContainer}} = this.props

    let myId = getRootId(this.props)
    if(!myId) return (<Empty />)

    let me          = getRoot(this.props)
    let userName    = me.getIn(['userInfo', 'userName'])
    let userImg     = me.getIn(['userInfo', 'userImg'])
    let keyInfo     = me.get('keyInfo',         Immutable.Map()).toJS()
    let deviceInfo  = me.get('deviceInfo',      Immutable.List()).toJS()
    let latest      = me.get('latestArticles',  Immutable.List()).toJS()

    let latestHasUnread = latest.length > 0? isUnRead(latest[0].UpdateTS.T,latest[0].LastSeen.T):false;

    let onEditNameSubmit = (name) => {
      doRootPage.editName(myId, name)
      doModalContainer.closeModal()
    }

    let onEditImgSubmit = (imgBase64) => {
      doRootPage.editProfileImg(myId, imgBase64)
    }

    let openEditNameModule = () => {
      doModalContainer.setInput({ userImg: userImg, userName: userName })
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
        articleList:  latest,
        prevClicked:  () => doModalContainer.closeModal(),
        itemClicked:  () => doModalContainer.closeModal(),
      })
      doModalContainer.openModal(constants.LATEST_PAGE_MODAL)
    }

    const hubPageId         = getChildId(me, 'HUB_PAGE')
    const boardPageId       = getChildId(me, 'BOARD_PAGE')
    const articlePageId     = getChildId(me, 'ARTICLE_PAGE')
    const profilePageId     = getChildId(me, 'PROFILE_PAGE')
    const friendListPageId  = getChildId(me, 'FRIEND_LIST_PAGE')
    const friendChatPageId  = getChildId(me, 'FRIEND_CHAT_PAGE')

    const createBoardId     = getChildId(me, 'CREATE_BOARD_MODAL')
    const manageBoardId     = getChildId(me, 'MANAGE_BOARD_MODAL')
    const showOpLogId       = getChildId(me, 'SHOW_OP_LOG_MODAL')

    let modalIdMap = {
      'CREATE_BOARD_MODAL': createBoardId,
      'MANAGE_BOARD_MODAL': manageBoardId,
      'SHOW_OP_LOG_MODAL' : showOpLogId,
    }

    let MAIN_PAGE = null

    switch(myComponent) {
        case 'HubPage':
            MAIN_PAGE = (<HubPage {...this.props} myId={hubPageId}/>)
            break;
        case 'BoardPage':
            MAIN_PAGE = (<BoardPage {...this.props} myId={boardPageId}/>)
            break;
        case 'ArticlePage':
            MAIN_PAGE = (<ArticlePage {...this.props} myId={articlePageId}/>)
            break;
        case 'FriendListPage':
            MAIN_PAGE = (<FriendListPage {...this.props} myId={friendListPageId}/>)
            break;
        case 'FriendChatPage':
            MAIN_PAGE = (<FriendChatPage {...this.props} myId={friendChatPageId}/>)
            break;
        default:
            MAIN_PAGE = null
    }

    return (
      <div className={styles['root']}>
        <ProfilePage
          myId={profilePageId}
          userName={userName}
          userImg={userImg}
          onEditName={openEditNameModule}
          onEditImg={onEditImgSubmit}
          onSettingClicked={onSettingClicked}
          onLatestClicked={onLatestClicked}
          hasUnread={latestHasUnread} />
        <Navigator {...this.props} />
        { MAIN_PAGE }
        <ModalContainer className={styles['overlay']} idMap={modalIdMap}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(RootPage)
