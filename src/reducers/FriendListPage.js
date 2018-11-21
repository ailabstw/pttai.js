import Immutable        from 'immutable'
import { createDuck }   from 'redux-duck'

import * as utils         from './utils'
import * as serverUtils   from './ServerUtils'
import {  EMPTY_ID,
          DEFAULT_USER_NAME,
          DEFAULT_USER_IMAGE,
          MESSAGE_TYPE_TEXT }       from '../constants/Constants'

export const myClass  = 'FRIEND_LIST_PAGE'

export const myDuck   = createDuck(myClass, 'Friend_List_Page')

const INIT          = myDuck.defineType('INIT')
const ADD_CHILD     = myDuck.defineType('ADD_CHILD')
const SET_ROOT      = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE        = myDuck.defineType('REMOVE')
const SET_DATA      = myDuck.defineType('SET_DATA')
const ADD_FRIEND    = myDuck.defineType('ADD_FRIEND')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
  }
}

/*                     */
/*  Get Friend List    */
/*                     */

function getChatSummaries (chatIds) {
  return dispatch => Promise.all(
    chatIds.map((chatId, index) => {
      return dispatch(serverUtils.getMessageList(chatId, EMPTY_ID, 1))
              .then(({response: messageResult, type, error, query}) => {
                let messageId    = (messageResult.result && messageResult.result.length) ? messageResult.result[0].ID : null
                let subContentId = (messageResult.result && messageResult.result.length) ? messageResult.result[0].ContentBlockID : null
                let creatorId    = (messageResult.result && messageResult.result.length) ? messageResult.result[0].CreatorID : null
                return dispatch(serverUtils.getMessageBlockList(chatId, messageId, subContentId, 0, 0, 1))
                        .then(({response: {result}, type, query, error}) => {
                          if (error) {
                            return { 'error': true, 'key':'messageBlock', 'value': error }
                          } else {
                            let combinedResult = (result && result.length) ? {
                              UpdateTS: (messageResult.result && messageResult.result.length) ? messageResult.result[0].UpdateTS : utils.emptyTimeStamp(),
                              SummaryUserID: creatorId,
                              ...result[0]
                            } : {}
                            return { 'error': false, 'key':'messageBlock', 'value': combinedResult }
                          }
                        })
                      })
    })
  )
}

export const getFriendList = (myId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getFriends(EMPTY_ID, limit))
      .then(({response: friendResult, type, query, error}) => {
        let chatIds = friendResult.result.map(each => each.ID)
        dispatch(getChatSummaries(chatIds))
          .then((summaryResult) => {
            let creatorIds = friendResult.result.map(each => each.FID).filter(each => each)
            let summaries  = summaryResult.map(each => {
              if (each.error) {
                return {}
              } else {
                return each.value
              }
            })
            let SummaryUserIds = summaries.map(each => each.SummaryUserID).filter(each => each)
            dispatch(serverUtils.getUsersInfo([...creatorIds, ...SummaryUserIds]))
              .then((usersInfo) => {
                dispatch(postprocessGetFriendList(myId, friendResult.result, summaries, usersInfo))
              })
          })
      })
  }
}

const postprocessGetFriendList = (myId, result, summaries, usersInfo) => {

  result = result.map((each) => {
    return {
      friendID: each.FID,
      ...each
    }
  })

  result = result.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const friendList = result.map((each, index) => {

    let userId          = each.friendID
    let summaryUserId   = summaries[index].SummaryUserID
    let userNameMap     = usersInfo['userName'] || {}
    let userImgMap      = usersInfo['userImg'] || {}

    let userName        = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg         = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
    let SummaryUserName = userNameMap[summaryUserId] ? serverUtils.b64decode(userNameMap[summaryUserId].N) : DEFAULT_USER_NAME
    let SummaryUserImg  = userImgMap[summaryUserId] ? userImgMap[summaryUserId].I : DEFAULT_USER_IMAGE

    return {
      Name:             userName,
      Img:              userImg,
      friendID:         each.friendID,
      chatId:           each.ID,
      BoardID:          each.BID,
      FriendStatus:     each.S,
      SummaryStatus:    summaries[index].S,
      LastSeen:         each.LT ? each.LT : utils.emptyTimeStamp(),
      ArticleCreateTS:  each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(),
      SummaryUpdateTS:  summaries[index].UpdateTS ? summaries[index].UpdateTS : utils.emptyTimeStamp(),
      SummaryUserID:    summaryUserId,
      SummaryUserName:  SummaryUserName,
      SummaryUserImg:   SummaryUserImg,
      Summary:          (summaries[index].B && summaries[index].B.length > 0) ? serverUtils.b64decode(summaries[index].B[0]) : JSON.stringify({ type:  MESSAGE_TYPE_TEXT, value: '' }),
    }
  })

  console.log('doFriendListPage.postprocessGetFriendList: friendList:', friendList)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { friendList: friendList }
  }
}

/*                        */
/*  Update Friend List    */
/*                        */

export const addFriend = (myId, name, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.addNewFriend(name))
      .then(({response: {result, error}, type, query}) => {
        if (error) {
          callBackFunc({error: true, data: error.message, friendReqUrl: name})
        } else {
          callBackFunc({error: false, data: result})
          dispatch(serverUtils.getUsersInfo([result.C]))
            .then((usersInfo) => {
              dispatch(postprocessAddNewFriend(myId, result, usersInfo))
            })
        }
      })
  }
}

const postprocessAddNewFriend = (myId, result, usersInfo) => {

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  result = serverUtils.deserialize(result)

  let userId      = result.C
  let userImgMap  = usersInfo['userImg'] || {}
  let userImg     = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

  const combinedFriend = {
    Name:             result.N,
    Img:              userImg,
    friendID:         null,
    chatId:           null,
    BoardID:          null,
    FriendStatus:     null,
    SummaryStatus:    null,
    LastSeen:         utils.emptyTimeStamp(),
    ArticleCreateTS:  utils.emptyTimeStamp(),
    SummaryUpdateTS:  utils.emptyTimeStamp(),
    SummaryUserID:    null,
    Summary:          JSON.stringify({
      type:  MESSAGE_TYPE_TEXT,
      value: '',
    }),
  }

  console.log('doFriendListPage.postprocessAddNewFriend: combinedFriend:', combinedFriend)

  return {
    myId,
    myClass,
    type: ADD_FRIEND,
    data: { friend: combinedFriend }
  }
}

export const _addNewFriend = (state, action) => {
  const {myId, data:{friend}} = action

  let friendList = state.getIn([myId, 'friendList'], [])
  return state.setIn([myId, 'friendList'], friendList.push(friend))
}

/*                    */
/*  Get Key Info      */
/*                    */

function getAllKeyInfo(userId) {
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

  console.log('doFriendListPage.postprocessGetKeyInfo: keyInfo: ', keyInfo)

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


// reducers
const reducer = myDuck.createReducer({
  [INIT]:           utils.reduceInit,
  [ADD_CHILD]:      utils.reduceAddChild,
  [SET_ROOT]:       utils.reduceSetRoot,
  [REMOVE_CHILDS]:  utils.reduceRemoveChilds,
  [REMOVE]:         utils.reduceRemove,
  [SET_DATA]:       utils.reduceSetData,
  [ADD_FRIEND]:     _addNewFriend,
}, Immutable.Map())

export default reducer
