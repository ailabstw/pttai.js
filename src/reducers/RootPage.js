import Immutable            from 'immutable'
import { createDuck }       from 'redux-duck'

import * as utils       from './utils'
import * as serverUtils from './ServerUtils'

import { myDuck as appDuck }    from './App'
import * as doHubPage           from './HubPage'
import * as doBoardPage         from './BoardPage'
import * as doArticlePage       from './ArticlePage'
import * as doProfilePage       from './ProfilePage'
import * as doFriendListPage    from './FriendListPage'
import * as doFriendChatPage    from './FriendChatPage'
import * as doCreateBoardModal  from './CreateBoardModal'
import * as doManageBoardModal  from './ManageBoardModal'
import * as doShowOpLogModal    from './ShowOpLogModal'
// import * as doNameCardModal     from './NameCardModal'

import { getUUID }              from '../utils/utils'
import { EMPTY_ID,
         DEFAULT_USER_NAME,
         DEFAULT_USER_IMAGE,
         DEFAULT_USER_NAMECARD }   from '../constants/Constants'

export const myClass = 'ROOT_PAGE'

export const myDuck = createDuck(myClass, 'Root_Page')

const INIT            = myDuck.defineType('INIT')
const ADD_CHILD       = myDuck.defineType('ADD_CHILD')
const SET_ROOT        = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS   = myDuck.defineType('REMOVE_CHILDS')
const REMOVE          = myDuck.defineType('REMOVE')
const SET_DATA        = myDuck.defineType('SET_DATA')
const UPDATE_DATA     = myDuck.defineType('UPDATE_DATA')

/**
 * @func init
 */
export const init = (myId, query, param) => {
  let hubPageId           = getUUID()
  let boardPageId         = getUUID()
  let articlePageId       = getUUID()
  let profilePageId       = getUUID()
  let friendListPageId    = getUUID()
  let friendChatPageId    = getUUID()

  let createBoardModalId  = getUUID()
  let manageBoardModalId  = getUUID()
  let showOpLogModalId    = getUUID()
  // let nameCardModalId     = getUUID()
  // let friendProfileModalId = getUUID()

  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, ...query, ...param}))
    dispatch(utils.setRoot(myId, myClass, appDuck))

    dispatch(doHubPage.init(hubPageId, myId, myClass, myDuck))
    dispatch(doBoardPage.init(boardPageId, myId, myClass, myDuck))
    dispatch(doArticlePage.init(articlePageId, myId, myClass, myDuck))
    dispatch(doProfilePage.init(profilePageId, myId, myClass, myDuck))
    dispatch(doFriendListPage.init(friendListPageId, myId, myClass, myDuck))
    dispatch(doFriendChatPage.init(friendChatPageId, myId, myClass, myDuck))

    dispatch(doCreateBoardModal.init(createBoardModalId, myId, myClass, myDuck))
    dispatch(doManageBoardModal.init(manageBoardModalId, myId, myClass, myDuck))
    dispatch(doShowOpLogModal.init(showOpLogModalId, myId, myClass, myDuck))
    // dispatch(doNameCardModal.init(nameCardModalId, myId, myClass, myDuck))
  }
}

/**
 * @func getUserInfoById - fetch user info for getUserInfo
 * @private
 */

function getUserInfoById(userId) {
  return dispatch => Promise.all([
    dispatch(serverUtils.getUserName(userId))
      .then(({response:{result},error}) => ({
        'error': !!error,
        'key': 'userName',
        'value': error || result
      })),
    dispatch(serverUtils.getUserImg(userId))
      .then(({response:{result},error}) => ({
        'error': !!error,
        'key': 'userImg',
        'value': error || result
      })),
    dispatch(serverUtils.getNameCard(userId))
      .then(({response:{result},error}) => ({
        'error': !!error,
        'key': 'userNameCard',
        'value': error || result
      }))
  ]);
}

/**
 * @typedef Response
 * @property {string} type - done || no_user_name
 * @property {value=} id - values for no_user_name
 *
 * @typedef Error
 * @property {string} message
 * @property {object} info
 */

/**
 * @func getUserInfo - doRootPage.getUserInfo
 *
 * @param {string} myId - id for RootPage
 * @return {Function<Promise<Response|Error>>} function for dispatch
 *
 */
export const getUserInfo = myId => {
  return (dispatch, getState) => new Promise( async (resolve, reject) => {
    const {response: userInfo, error} = await dispatch(serverUtils.showMe())
    if (error) return reject({ message: "Backend no response: please try restarting PTT.ai", info: error })

    let userId = userInfo.result.ID
    let info   = userInfo.result

    let userMetaInfo = await dispatch(getUserInfoById(userId))

    let metaInfo = userMetaInfo.filter((meta) => !meta.error)
    let userNameResult = metaInfo.find((meta) => meta.key === 'userName').value

    // user exist
    if ((userNameResult && userNameResult.N && serverUtils.b64decode(userNameResult.N) !== DEFAULT_USER_NAME)) {
      resolve({ type: 'done' })
    }
    else {
      let keyInfo = await dispatch(getAllKeyInfo())
      resolve({
        type: 'no_user_name',
        value: keyInfo
      })
    }

    dispatch(postprocessGetUserInfo(myId, info, metaInfo))
  })
}

const postprocessGetUserInfo = (myId, info, metaInfo) => {

  /* deserialization */
  info = serverUtils.deserialize(info)

  console.log('doRootPage.postprocessGetUserInfo: userInfo: ',      info)
  console.log('doRootPage.postprocessGetUserInfo: userMetaInfo: ',  metaInfo)

  let userNameResult      = metaInfo.find((meta) => meta.key === 'userName').value
  let userImgResult       = metaInfo.find((meta) => meta.key === 'userImg').value
  let userNameCardResult  = metaInfo.find((meta) => meta.key === 'userNameCard').value
  let userName      = (userNameResult && userNameResult.N ) ? serverUtils.b64decode(userNameResult.N) : DEFAULT_USER_NAME
  let userImg       = (userImgResult && userImgResult.I) ? userImgResult.I : DEFAULT_USER_IMAGE
  let userNameCard  = (userNameCardResult && userNameCardResult.C) ? JSON.parse(serverUtils.b64decode(userNameCardResult.C)) : DEFAULT_USER_NAMECARD

  console.log('doRootPage.postprocessGetUserInfo: userName: ',      userName)
  console.log('doRootPage.postprocessGetUserInfo: userImg: ',       userImg)
  console.log('doRootPage.postprocessGetUserInfo: userNameCard: ',  userNameCard)

  const combinedUserInfo = {
    userId:       info.ID,
    userName:     userName,
    userImg:      userImg,
    userNameCard: userNameCard,
    createTime:   info.CT ? info.CT : utils.emptyTimeStamp(),
    updateTime:   info.UT ? info.UT : utils.emptyTimeStamp(),
    status:       info.S,
    nodeId:       info.NodeID,
  }

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { userInfo: combinedUserInfo }
  }
}

/**
 * @func getAllKeyInfo
 * @private
 */

const getAllKeyInfo = () => dispatch => Promise.all([
  dispatch(serverUtils.showMyURL())
    .then(({response:{result},error}) => ({
      'error': !!error,
      'key': 'deviceJoinKey',
      'value': error || result
    })),
  dispatch(serverUtils.showMyKey())
    .then(({response:{result},error}) => ({
      'error': !!error,
      'key': 'userPrivateKey',
      'value': error || result
    })),
  dispatch(serverUtils.showURL())
    .then(({response:{result},error}) => ({
      'error': !!error,
      'key': 'friendJoinKey',
      'value': error || result
    })),
]);

export const getKeyInfo = (myId) => {
  return (dispatch, getState) => {
    dispatch(getAllKeyInfo())
      .then( keyInfo => {
        dispatch(postprocessGetKeyInfo(myId, keyInfo))
      })
  }
}

const postprocessGetKeyInfo = (myId, keyInfo) => {

  console.log('doRootPage.postprocessGetKeyInfo: keyInfo: ', keyInfo)

  let deviceJoinKeyInfo   = keyInfo.find(({key}) => key === 'deviceJoinKey').value
  let userPrivateKeyInfo  = keyInfo.find(({key}) => key === 'userPrivateKey').value
  let friendJoinKeyInfo   = keyInfo.find(({key}) => key === 'friendJoinKey').value

  const combinedKeyInfo = {
    userPrivateKey: userPrivateKeyInfo,
    deviceJoinKey: {
      URL:          deviceJoinKeyInfo.URL,
      UpdateTS:     deviceJoinKeyInfo.UT ? deviceJoinKeyInfo.UT : utils.emptyTimeStamp(),
      expirePeriod: deviceJoinKeyInfo.e,
    },
    friendJoinKey: {
      URL:          friendJoinKeyInfo.URL,
      UpdateTS:     friendJoinKeyInfo.UT ? friendJoinKeyInfo.UT : utils.emptyTimeStamp(),
      expirePeriod: friendJoinKeyInfo.e,
    },
  }

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { keyInfo: combinedKeyInfo }
  }
}

/*                    */
/*  Get Device Info   */
/*                    */


export const getDeviceInfo = (myId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getMyNodes())
      .then(({response: { result }, error}) => {
        dispatch(postprocessGetDeviceInfo(myId, result))
      })
  }
}

const postprocessGetDeviceInfo = (myId, result) => {

  result = result.map(serverUtils.deserialize)

  const combinedDeviceInfo = result.map(device => {
    return {
      userID:     device.ID,
      IP:         device.IP,
      NodeName:   device.N,
      NodeID:     device.NID,
      NodeType:   device.NT,
      Status:     device.S,
      TCP:        device.TCP,
      UDP:        device.UDP,
      CreateTime: device.CT ? device.CT : utils.emptyTimeStamp(),
      UpdateTime: device.UT ? device.UT : utils.emptyTimeStamp(),
      LastSeen:   device.L  ? device.L  : utils.emptyTimeStamp(),
      Version:    device.V,
    }
  })

  console.log('doRootPage.postprocessGetDeviceInfo: combinedDeviceInfo: ', combinedDeviceInfo)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { deviceInfo: combinedDeviceInfo }
  }
}


/*                    */
/*  Update User Info  */
/*                    */

export const editName = (myId, name) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.editName(name))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessEditName(myId, name, result))
      })
  }
}

const postprocessEditName = (myId, name, result) => {

  result = serverUtils.deserialize(result)

  console.log('doRootPage.postprocessEditName: result: ', result)

  const combinedUserInfo = {
    createTime:   result.CT,
    userID:       result.ID,
    userName:     result.N,
    status:       result.S,
    updateTime:   result.UT,
    version:      result.V,
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA, /* UPDATE_DATA will merge the updated object with original */
    data: { userInfo: combinedUserInfo }
  }
}

/*                      */
/*  Update Device Info  */
/*                      */

export const addDevice = (myId, nodeId, pKey, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.joinMe(nodeId, pKey))
      .then(({response: {result, error}, type, query}) => {
        if (error) {
          callBackFunc({error: true, data: error.message, nodeId: nodeId})
        }
        else {
          callBackFunc({error: false, data: result})
        }
      })
  }
}

/**
 * @func getBoardMetaMap
 * @private
 */
const getBoardMetaMap = boardIds => dispatch => Promise.all(
  boardIds.map( async (item, index) => {
    const {response: {result}, error} = await dispatch(serverUtils.getBoard(item))
    if (error) throw error

    return {
      ID:        result.ID,
      LastSeen:  result.LastSeen,
      Status:    result.Status,
      Title:     result.Title,
      UpdateTS:  result.UpdateTS,
      CreatorID: result.C,
      BoardType: result.BT,
    }
  })
);

const getMetaInfoMaps = (creatorIds, boardIds) => dispatch => Promise.all([
  dispatch(serverUtils.getUserNameByIds(creatorIds))
    .then(({response:{result},error}) => ({
      'error': !!error,
      'key': 'userName',
      'value': error || result
    })),
  dispatch(serverUtils.getUserImgByIds(creatorIds))
    .then(({response:{result},error}) => ({
      'error': !!error,
      'key': 'userImg',
      'value': error || result
    })),
  dispatch(getBoardMetaMap(boardIds))
    .then( result => {
      result = result.map(serverUtils.deserialize)
      let boardMap = result.reduce((acc, each) => {
        if (!(each.ID in acc)) {
          acc[each.ID] = each
        }
        return acc
      }, {})
      return { 'error': false, 'key': 'boardId', 'value': boardMap }
    }),
])

const getAllArticles = (dispatch, myId, articleIds) => dispatch => Promise.all(
  articleIds.map(async (item, index) => {
    const {response: aResult, error} = await dispatch(serverUtils.getArticles(item.boardId, item.articleId, 1))
    if (error) throw error;
    let articles = aResult.result

    if (articles && articles.length > 0) {
      let article = articles[0]
      const {response: {result}, error} = await dispatch(serverUtils.getContent(item.boardId, item.articleId, article.ContentBlockID, 0, 0, 1))

      if (error) throw error;

      let summary = (result && result.length > 0) ? result[0].B : ''
      return {
        'BoardID':        item.boardId,
        'ID':             item.articleId,
        'Title':          item.title,
        'CreatorID':      article.CreatorID,
        'ContentBlockID': article.ContentBlockID,
        'Summary':        (summary && summary.length > 0)? summary[0]:'',
        'UpdateTS':       article.UpdateTS,
        'CreateTS':       article.CreateTS,
        'LastSeen':       article.L,
        'Status':         article.S,
      }
    }
    else {
      return Promise.reject(1)
    }
  })
);

export const getLatestArticles = (myId, limit) => (dispatch, getState) => new Promise(async () => {
  const pttOpLogListRes = await dispatch(serverUtils.getPttOpLogList(EMPTY_ID, limit))
  if (pttOpLogListRes.error) throw pttOpLogListRes.error
  const {response: { result }} = pttOpLogListRes

  let articleIds = result
    .map( item => item['O'])
    .filter( item => item['O'] === 2) // PttOpTypeCreateArticle
    .map( item => ({
      boardId:    item.D.bID,
      articleId:  item.OID,
      title:      item.D.T,
    }))

  let articles = await dispatch(getAllArticles(dispatch, myId, articleIds))

  let creatorIds = articles.filter(each => each.CreatorID).map(each => each.CreatorID)
  let boardIds   = articles.filter(each => each.BoardID).map(each => each.BoardID)

  // get articles
  let maps = await dispatch(getMetaInfoMaps(creatorIds, boardIds))
  dispatch(postprocessGetLatestArticles(myId, articles, maps))
})

const postprocessGetLatestArticles = (myId, result, maps) => {

  result = result.map(serverUtils.deserialize)

  maps = maps.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const latestArticles = result.map(each => {

    let userId      = each.CreatorID
    let boardId     = each.BoardID
    let userNameMap = maps['userName'] || {}
    let userImgMap  = maps['userImg'] || {}
    let boardIdMap  = maps['boardId'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId]  ? userImgMap[userId].I : DEFAULT_USER_IMAGE
    let boardName = boardIdMap[boardId] ? boardIdMap[boardId].Title : ''

    return {
      BoardID:        each.BoardID,
      BoardName:      boardName,
      Summary:        each.Summary,
      ContentBlockID: each.ContentBlockID,
      CreatorID:      each.CID,
      CreatorName:    userName,
      CreatorImg:     userImg,
      ID:             each.ID,
      NBlock:         each.NBlock,
      NBoo:           each.NB,
      NPush:          each.NP,
      Title:          each.Title,
      LastSeen:       each.LastSeen ? each.LastSeen : utils.emptyTimeStamp(),
      CreateTS:       each.CreateTS ? each.CreateTS : utils.emptyTimeStamp(),
      UpdateTS:       each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      Status:         each.Status,
    }
  });

  console.log('doRootPage.postprocessGetLatestArticles: result:', result)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { latestArticles: latestArticles }
  }
}

export const getLogLastSeen = myId => (dispatch, getState) => {
  dispatch(serverUtils.getPttOpLogSeen())
    .then(({response: {result}, type, query, error}) => {
      dispatch(updateLogLastSeenData(myId, result))
    })
}

export const markLogSeen = myId => {
  return (dispatch, getState) => {
    dispatch(serverUtils.markPttOpLogSeen())
      .then(({response: {result}, type, query, error}) => {
        dispatch(updateLogLastSeenData(myId, result))
      })
  }
}

const updateLogLastSeenData = (myId, result) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { logLastSeen: result }
  }
}

export const fetchLatestMessage = (myId, limit) => (dispatch, getState) => new Promise( async ()=>{
  let emptyTS = utils.emptyTimeStamp();

  const friendListRes = await dispatch(serverUtils.getFriendListByMsgCreateTS(emptyTS.T, emptyTS.NT, limit))
  if (friendListRes.error) throw friendListRes.error
  const friendList = friendListRes.response.result

  if (!friendList || !friendList[0]) return

  const chatId =  friendList[0].ID
  const creatorName = friendList[0].N

  const messageListRes = await dispatch(serverUtils.getMessageList(chatId, EMPTY_ID, limit))
  if (messageListRes.error) throw messageListRes.error
  const messageList = messageListRes.response.result
  const messageBlockList = await Promise.all(messageList.map( msg =>
    dispatch(serverUtils.getMessageBlockList(chatId, msg.ID, msg.BlockID, 0, 0, 1))
  ))
  let messages = messageBlockList.map( data => data.response.result[0] )
  dispatch(postprocessGetFriendListByMsgCreateTS(myId, chatId, creatorName, messages))
})

const postprocessGetFriendListByMsgCreateTS = (myId, chatId, creatorName, messages) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {
      latestFriendList: messages.map( message => ({
        creatorName: creatorName,
        creatorID:   message.CID,
        chatID:      chatId,
        friendID:    message.CID,
        messageID:   message.AID,
        contents:    message.B,
        createTS:    message.CT
      })
    )}
  }
}

export const getFriendListSeen = myId => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getFriendListSeen())
      .then(({response: {result}, type, query, error}) => {
        dispatch(updateFriendLastSeenData(myId, result))
      })
  }
}

export const markFriendListSeen = myId => (dispatch, getState) => {
  dispatch(serverUtils.markFriendListSeen())
    .then(({response: {result}, type, query, error}) => {
      dispatch(updateFriendLastSeenData(myId, result))
    })
}

const updateFriendLastSeenData = (myId, result) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { friendLastSeen: result }
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]:           utils.reduceInit,
  [ADD_CHILD]:      utils.reduceAddChild,
  [SET_ROOT]:       utils.reduceSetRoot,
  [REMOVE_CHILDS]:  utils.reduceRemoveChilds,
  [REMOVE]:         utils.reduceRemove,
  [SET_DATA]:       utils.reduceSetData,
  [UPDATE_DATA]:    utils.reduceUpdateData,
}, Immutable.Map())

export default reducer
