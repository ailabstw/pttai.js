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
// import * as doEditNameModal     from './EditNameModal'
// import * as doFriendProfileModal from './FriendProfileModal'

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

// init
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
  // let editNameModalId     = getUUID()
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
    // dispatch(doEditNameModal.init(editNameModalId, myId, myClass, myDuck))
    // dispatch(doFriendProfileModal.init(friendProfileModalId, myId, myClass, myDuck))
  }
}

/*                    */
/*  Get User Info     */
/*                    */

function getUserInfoById(userId) {
  return dispatch => Promise.all([
    dispatch(serverUtils.getUserName(userId))
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'userName', 'value': error }
        } else {
          return { 'error': false, 'key': 'userName', 'value': result }
        }
      }),
    dispatch(serverUtils.getUserImg(userId))
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'userImg', 'value': error }
        } else {
          return { 'error': false, 'key': 'userImg', 'value': result }
        }
      }),
    dispatch(serverUtils.getNameCard(userId))
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'userNameCard', 'value': error }
        } else {
          return { 'error': false, 'key': 'userNameCard', 'value': result }
        }
      }),
  ]);
}

export const getUserInfo = (myId, noUserCallBackFunc, userCallBackFunc, connectionLostCallBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.showMe())
      .then(({response: userInfo, type, query, error}) => {
        if (error) {
          const errorMessage = "Backend no response: please try restarting ptt.ai"
          connectionLostCallBackFunc(errorMessage)

        } else {
          let userId = userInfo.result.ID
          dispatch(getUserInfoById(userId))
            .then((userMetaInfo) => {
              let info     = userInfo.result
              let metaInfo = userMetaInfo.filter((meta) => !meta.error)
              let userNameResult = metaInfo.find((meta) => meta.key === 'userName').value

              /* If no user name, pop up sign-in modal */
              if (!userNameResult || !userNameResult.N || serverUtils.b64decode(userNameResult.N) === DEFAULT_USER_NAME) {
                dispatch(getAllKeyInfo())
                  .then(( keyInfo ) => {
                    let deviceJoinKeyInfo   = keyInfo.find((key) => key.key === 'deviceJoinKey').value
                    let userPrivateKeyInfo  = keyInfo.find((key) => key.key === 'userPrivateKey').value

                    noUserCallBackFunc(userPrivateKeyInfo, {
                      URL:          deviceJoinKeyInfo.URL,
                      UpdateTS:     deviceJoinKeyInfo.UT ? deviceJoinKeyInfo.UT : utils.emptyTimeStamp(),
                      expirePeriod: deviceJoinKeyInfo.e,
                    })
                  })
              } else {
                userCallBackFunc()
              }
              dispatch(postprocessGetUserInfo(myId, info, metaInfo))
          })
        }
      })
  }
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
  let userNameCard  = (userNameCardResult && userNameCardResult.Card) ? JSON.parse(userNameCardResult.Card) : DEFAULT_USER_NAMECARD

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

/*                    */
/*  Get Key Info      */
/*                    */

function getAllKeyInfo() {
  return dispatch => Promise.all([
    dispatch(serverUtils.showMyURL())
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'deviceJoinKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'deviceJoinKey', 'value': result }
        }
      }),
    dispatch(serverUtils.showMyKey())
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'userPrivateKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'userPrivateKey', 'value': result }
        }
      }),
    dispatch(serverUtils.showURL())
      .then(({response: { result }, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key': 'friendJoinKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'friendJoinKey', 'value': result }
        }
      }),
  ]);
}

export const getKeyInfo = (myId) => {
  return (dispatch, getState) => {
    dispatch(getAllKeyInfo())
      .then(( keyInfo ) => {
        dispatch(postprocessGetKeyInfo(myId, keyInfo))
      })
  }
}

const postprocessGetKeyInfo = (myId, keyInfo) => {

  console.log('doRootPage.postprocessGetKeyInfo: keyInfo: ', keyInfo)

  let deviceJoinKeyInfo   = keyInfo.find((key) => key.key === 'deviceJoinKey').value
  let userPrivateKeyInfo  = keyInfo.find((key) => key.key === 'userPrivateKey').value
  let friendJoinKeyInfo   = keyInfo.find((key) => key.key === 'friendJoinKey').value

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
      .then(({response: { result }, type, query, error}) => {
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

export const editProfile = (myId, profile) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.setMyNameCard(JSON.stringify(profile)))
      .then(({response: { result }, type, query, error}) => {
        dispatch(postprocessEditProfile(myId, profile))
      })
  }
}

const postprocessEditProfile = (myId, content) => {

  console.log('doRootPage.postprocessEditProfile: ', JSON.stringify(content))

  const combinedUserInfo = {
    userNameCard: content
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA, /* UPDATE_DATA will merge the updated object with original */
    data: { userInfo: combinedUserInfo }
  }
}

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


export const editProfileImg = (myId, imgBase64) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.editProfileImg(imgBase64))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessEditProfileImg(myId, imgBase64))
      })
  }
}

const postprocessEditProfileImg = (myId, imgBase64) => {

  const combinedUserInfo = {
    userImg: imgBase64
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA,
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
        } else {
          callBackFunc({error: false, data: result})
        }
      })
  }
}


/*                        */
/*  Get Latest Articles   */
/*                        */



function getBoardMetaMap(boardIds) {
  return dispatch => Promise.all(
    boardIds.map((item, index) => {
          return dispatch(serverUtils.getBoard(item))
              .then(({response: {result}, type, query, error}) => {
                return {
                    ID:               result.ID,
                    LastSeen:         result.LastSeen,
                    Status:           result.Status,
                    Title:            result.Title,
                    UpdateTS:         result.UpdateTS,
                    CreatorID:        result.C,
                    BoardType:        result.BT,
                }
              })
      })
  );
}

function getMetaInfoMaps(creatorIds, boardIds) {
  return dispatch => {
      return Promise.all([
      dispatch(serverUtils.getUserNameByIds(creatorIds))
        .then(({response: { result }, type, query, error}) => {
          if (error) {
            return { 'error': true, 'key': 'userName', 'value': error }
          } else {
            return { 'error': false, 'key': 'userName', 'value': result }
          }
        }),
      dispatch(serverUtils.getUserImgByIds(creatorIds))
        .then(({response: { result }, type, query, error}) => {
          if (error) {
            return { 'error': true, 'key': 'userImg', 'value': error }
          } else {
            return { 'error': false, 'key': 'userImg', 'value': result }
          }
        }),
      dispatch(getBoardMetaMap(boardIds))
        .then((result) => {
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
  }
}

function getAllArticles(dispatch, myId, articleIds) {
  return dispatch => Promise.all(
    articleIds.map((item, index) => {
      return dispatch(serverUtils.getArticles(item.boardId, item.articleId, 1))
              .then(({response: aResult, type, query, error}) => {
                let articles = aResult.result
                if (articles.length > 0) {
                  let article = articles[0]
                  return dispatch(serverUtils.getContent(item.boardId, item.articleId, article.ContentBlockID, 0, 0, 1))
                          .then(({response: { result }, type, query, error}) => {
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
                          })
                }
              })
      })
  );
}

export const getLatestArticles = (myId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getPttOpLogList(EMPTY_ID, limit))
      .then(({response: {result}, type, query, error}) => {
        let articleIds = result.map((item) => {
                            return item['O']
                         }).filter((item2) => {
                            /* PttOpTypeCreateArticle == 2 */
                            return item2['O'] === 2
                         }).map((item3) => {
                            return {
                              'boardId':    item3.D.bID,
                              'articleId':  item3.OID,
                              'title':      item3.D.T,
                            }
                         })

        dispatch(getAllArticles(dispatch, myId, articleIds))
          .then((result) => {
            let creatorIds = result.map(each => each.CreatorID)
            let boardIds   = result.map(each => each.BoardID)

            // get articles
            dispatch(getMetaInfoMaps(creatorIds, boardIds))
              .then((maps) => {
                  dispatch(postprocessGetLatestArticles(myId, result, maps))
                })
          })
      })
  }
}

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
