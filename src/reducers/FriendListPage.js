import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import _ from 'lodash'
import LRU from 'lru-cache'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'
import { EMPTY_ID,
  NUM_CACHE_FRIEND,
  DEFAULT_USER_NAME,
  DEFAULT_USER_IMAGE,
  DEFAULT_USER_COMPANY,
  NUM_FRIEND_PER_REQ,
  MESSAGE_TYPE_TEXT } from '../constants/Constants'

import { isUnRead,
  toJson } from '../utils/utils'

export const myClass = 'FRIEND_LIST_PAGE'

export const myDuck = createDuck(myClass, 'Friend_List_Page')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')
const PREPEND_FRIENDS = myDuck.defineType('PREPEND_FRIENDS')
const APPEND_FRIENDS = myDuck.defineType('APPEND_FRIENDS')
const ADD_FRIEND = myDuck.defineType('ADD_FRIEND')
const DELETE_FRIEND = myDuck.defineType('DELETE_FRIEND')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({ myId, myClass, myDuck, parentId, parentClass, parentDuck }))
  }
}

/*                     */
/*  Get Friend List    */
/*                     */

function getChatSummaries (chatIds) {
  return dispatch => Promise.all(
    chatIds.map((chatId, index) => {
      return dispatch(serverUtils.getMessageList(chatId, EMPTY_ID, 1))
        .then(({ response: messageResult, type, error, query }) => {
          let messageId = _.get(messageResult, 'result[0].ID', null)
          let subContentId = _.get(messageResult, 'result[0].ContentBlockID', null)
          let creatorId = _.get(messageResult, 'result[0].CreatorID', null)
          let updateTS = _.get(messageResult, 'result[0].UpdateTS', utils.emptyTimeStamp())

          return dispatch(serverUtils.getMessageBlockList(chatId, messageId, subContentId, 0, 0, 1))
            .then(({ response: { result }, type, query, error }) => {
              if (error) {
                return { 'error': true, 'key': 'messageBlock', 'value': error }
              }

              let combinedResult = (result && result.length) ? {
                UpdateTS: updateTS,
                SummaryUserID: creatorId,
                ...result[0]
              } : {}
              return { 'error': false, 'key': 'messageBlock', 'value': combinedResult }
            })

        })
    })
  )
}

const fetchFriendList = (myId, startFriendId, shouldShowLoading, limit) => (dispatch, getState) => {
  if (shouldShowLoading) {
    dispatch(preprocessSetStartLoading(myId))
  }

  Promise.all([
    dispatch(serverUtils.getFriends(startFriendId, limit)),
    dispatch(serverUtils.getFriendRequest(EMPTY_ID))
  ]).then( async ([ { response: {result: friendResult} }, { response: {result: friendReqResult} } ]) => {
    let chatIds = friendResult.map(each => each.ID)
    let creatorIds = friendResult.map(each => each.FID).filter(each => each)

    let summaryResult = await dispatch(getChatSummaries(chatIds))
    let summaries = summaryResult.map(each => each.error ? {} : each.value)
    let SummaryUserIds = summaries.map(each => each.SummaryUserID).filter(each => each)

    let usersInfo = await dispatch(serverUtils.getUsersInfo([...creatorIds, ...SummaryUserIds]))
    let postProcessFunc = startFriendId === EMPTY_ID ? postprocessGetFriendList : postprocessGetMoreFriendList
    dispatch(postProcessFunc(myId, friendResult, friendReqResult, summaries, usersInfo))
    dispatch(postprocessSetFinshLoading(myId))
  })
}

export const getFriendList = (myId, isFirstFetch, limit) => (dispatch, getState) => {
  dispatch(fetchFriendList(myId, EMPTY_ID, isFirstFetch, limit))
}

export const getMoreFriendlist = (myId, startFriendId, limit) => (dispatch, getState) => {
  dispatch(fetchFriendList(myId, startFriendId, true, limit))
}

const postprocessGetFriendList = (myId, result, reqResult, summaries, usersInfo) => {
  const friendList = friendAndResultToFriendList(result, reqResult, summaries, usersInfo)

  console.log('doFriendListPage.postprocessGetFriendList: friendList:', friendList, reqResult)

  if (friendList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { myFriends: { lru: null, offset: 0, friendList: [] }, noFriend: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_FRIENDS,
      data: { friends: friendList.sort((a, b) => a.Summary.updateTS.T - b.Summary.updateTS.T),
      noFriend: false }
    }
  }
}

const postprocessGetMoreFriendList = (myId, result, reqResult, summaries, usersInfo) => {
  const friendList = friendAndResultToFriendList(result, reqResult, summaries, usersInfo)

  console.log('doFriendListPage.postprocessGetMoreFriendList: friendList:', friendList, reqResult)

  if (friendList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allFriendsLoaded: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: PREPEND_FRIENDS,
      data: {
        friendList: friendList.sort((a, b) => a.Summary.updateTS.T - b.Summary.updateTS.T)
      }
    }
  }
}

const friendAndResultToFriendList = (result, reqResult, summaries, usersInfo) => {
  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const getNameById = id => serverUtils.b64decode(_.get(usersInfo, ['userName', id, 'N'], '')) || DEFAULT_USER_NAME
  const getImgById = id => _.get(usersInfo, ['userImg', id, 'I'], '') || DEFAULT_USER_IMAGE
  const getCompanyById = id => _.get(toJson(serverUtils.b64decode(_.get(usersInfo, ['userNameCard', id, 'C'], ''))), 'company') || DEFAULT_USER_COMPANY

  let friendList = result.map((each, index) => {
    let userId = each.FID
    let ArticleCreateTS = each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp()

    let Summary = toJson(serverUtils.b64decode(_.get(summaries, [index, 'B', 0], '')))
    let summaryUserId = Summary.userId = _.get(summaries, [index, 'SummaryUserID'], '')

    return {
      Name:         getNameById(userId),
      Img:          getImgById(userId),
      company:      getCompanyById(userId),
      friendID:     userId,
      chatId:       each.ID,
      FriendStatus: each.S,
      isUnread:     isUnRead(ArticleCreateTS && ArticleCreateTS.T, each.LT && each.LT.T),

      Summary: {
        type:     Summary.type || MESSAGE_TYPE_TEXT,
        userName: getNameById(summaryUserId),
        userID:   Summary.userID,
        content:  Summary.value || '',
        updateTS: summaries[index].UpdateTS ? summaries[index].UpdateTS : ArticleCreateTS
      },
      joinStatus: 3 // JoinStatusAccepted
    }
  })

  reqResult.forEach((join, index) => {
    let joinFriendIndex = friendList.findIndex((e) => e.friendID === join.C)
    if (joinFriendIndex >= 0) {
      friendList[joinFriendIndex].joinStatus = join.S
      return
    }

    let userId = join.C

    friendList.push({
      Name:         getNameById(userId),
      Img:          getImgById(userId),
      company:      getCompanyById(userId),
      friendID:     userId,
      chatId:       null,
      FriendStatus: null,
      isUnRead:     false,

      Summary: {
        type:     MESSAGE_TYPE_TEXT,
        userName: '',
        userID:   EMPTY_ID,
        content:  '',
        updateTS: utils.emptyTimeStamp()
      },

      joinStatus: join.S
    })
  })

  return friendList
}

export const _prependFriends = (state, action) => {
  const { myId, data: { friends } } = action

  let friendList = state.getIn([myId, 'myFriends', 'friendList'], Immutable.List())
  let oriOffset = state.getIn([myId, 'myFriends', 'offset'], 0)

  state = state.setIn([myId, 'myFriends', 'offset'], oriOffset + friends.length)
  state = state.setIn([myId, 'myFriends', 'friendList'], Immutable.List(friends).concat(friendList))

  return state
}

export const _appendFriends = (state, action) => {
  /* merge the newly fetched friends to existing friend list */
  const { myId, data: { friends, noFriend } } = action

  if (!friends || friends.length <= 0) {
    return state
  }

  let myFriends = state.getIn([myId, 'myFriends'], Immutable.Map()).toJS()
  let friendList = myFriends.friendList || []
  let lruCache = myFriends.lru || new LRU(NUM_CACHE_FRIEND)
  let offset = myFriends.offset || 0

  let resultFriendList = []
  if (friendList.length === 0) {
    /* append friend */
    friends.forEach((friend, index) => {
      resultFriendList.push(friend)
      lruCache.set(friend.friendID, { index: index - offset, friend: friend })
    })
  } else {
    /* 1. find earlist start node and save to local lru */
    let localLRU = new LRU(NUM_FRIEND_PER_REQ)

    let startFriend = null
    let earlistTS = 2147483648 /* year 2038 */

    friends.forEach((friend, index) => {
      localLRU.set(friend.friendID, friend)
      if (lruCache.get(friend.friendID) && lruCache.get(friend.friendID).friend.Summary.updateTS.T < earlistTS) {
        startFriend = lruCache.get(friend.friendID)
        earlistTS = startFriend.friend.Summary.updateTS.T
      }
    })
    /* 2. start merge  */
    let oriIndex = startFriend ? startFriend.index : friendList.length - offset
    let newIndex = 0
    let mergeIndex = oriIndex

    let oriList = friendList.slice(0, offset + oriIndex)
    let mergedList = []

    while (friendList.length > offset + oriIndex || friends.length > newIndex) {
      if (friendList.length > offset + oriIndex && friends.length > newIndex) {
        let oriFriend = friendList[offset + oriIndex]
        let newFriend = friends[newIndex]
        /* both left */
        if (oriFriend.Summary.updateTS.T <= newFriend.Summary.updateTS.T) {
          if (!localLRU.get(oriFriend.friendID)) {
            mergedList.push(oriFriend)
            lruCache.set(oriFriend.friendID, { index: mergeIndex, friend: oriFriend })
            mergeIndex += 1
          }
          oriIndex += 1
        } else {
          mergedList.push(newFriend)
          lruCache.set(newFriend.friendID, { index: mergeIndex, friend: newFriend })
          mergeIndex += 1
          newIndex += 1
        }
      } else if (friendList.length > offset + oriIndex) {
        /* only ori */
        let oriFriend = friendList[offset + oriIndex]
        if (!localLRU.get(oriFriend.friendID)) {
          mergedList.push(oriFriend)
          lruCache.set(oriFriend.friendID, { index: mergeIndex, friend: oriFriend })
          mergeIndex += 1
        }
        oriIndex += 1
      } else {
        /* only new */
        let newFriend = friends[newIndex]
        mergedList.push(newFriend)
        lruCache.set(newFriend.friendID, { index: mergeIndex, friend: newFriend })
        mergeIndex += 1
        newIndex += 1
      }
    }
    resultFriendList = oriList.concat(mergedList)
    localLRU.reset()
  }

  state = state.setIn([myId, 'noFriend'], noFriend)
  state = state.setIn([myId, 'myFriends', 'offset'], offset)
  state = state.setIn([myId, 'myFriends', 'lru'], lruCache)
  state = state.setIn([myId, 'myFriends', 'friendList'], Immutable.List(resultFriendList))

  return state
}

/*                        */
/*  Update Friend List    */
/*                        */

export const addFriend = (myId, name, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.addNewFriend(name))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          return callBackFunc({ error: true, data: error.message, friendReqUrl: name })
        }

        callBackFunc({ error: false, data: result })
        dispatch(serverUtils.getUsersInfo([result.C]))
          .then((usersInfo) => {
            dispatch(postprocessAddNewFriend(myId, result, usersInfo))
          })
      })
  }
}

const postprocessAddNewFriend = (myId, result, usersInfo) => {
  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let userId = result.C

  const getNameById = id => serverUtils.b64decode(_.get(usersInfo, ['userName', id, 'N'], '')) || DEFAULT_USER_NAME
  const getImgById = id => _.get(usersInfo, ['userImg', id, 'I'], '') || DEFAULT_USER_IMAGE
  const getCompanyById = id => _.get(toJson(serverUtils.b64decode(_.get(usersInfo, ['userNameCard', id, 'C'], ''))), 'company') || DEFAULT_USER_COMPANY

  const combinedFriend = {
    Name:          getNameById(userId),
    Img:           getImgById(userId),
    company:       getCompanyById(userId),
    friendID:      userId,
    chatId:        null,
    FriendStatus:  0,
    isUnread:      false,

    Summary: {
      type:        MESSAGE_TYPE_TEXT,
      content:     '',
      userName:    '',
      userID:      null,
      updateTS:    utils.emptyTimeStamp()
    },
    joinStatus:    0
  }

  console.log('doFriendListPage.postprocessAddNewFriend: combinedFriend:', combinedFriend)

  return {
    myId,
    myClass,
    type: ADD_FRIEND,
    data: { friend: combinedFriend, noFriend: false }
  }
}

export const _addNewFriend = (state, action) => {
  const { myId, data: { friend, noFriend } } = action

  let myFriends = state.getIn([myId, 'myFriends'], Immutable.Map()).toJS()
  let friendList = myFriends.friendList || []
  let lruCache = myFriends.lru || new LRU(NUM_CACHE_FRIEND)

  lruCache.set(friend.friendID, { index: friendList.length, friend: friend })

  state = state.setIn([myId, 'noFriend'], noFriend)
  state = state.setIn([myId, 'myFriends', 'lru'], lruCache)
  state = state.updateIn([myId, 'myFriends', 'friendList'], arr => arr.push(Immutable.Map(friend)))

  return state
}

export const deleteFriend = (myId, chatId, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteFriend(chatId))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          return callBackFunc({ error: true, data: error.message, chatId: chatId })
        }

        callBackFunc({ error: false, data: result })
        dispatch(serverUtils.getUsersInfo([result.C]))
          .then((usersInfo) => {
            dispatch(postprocessDeleteFriend(myId, chatId))
          })
      })
  }
}

const postprocessDeleteFriend = (myId, chatId) => {
  console.log('doFriendListPage.postprocessDeleteFriend: chatId:', chatId)

  return {
    myId,
    myClass,
    type: DELETE_FRIEND,
    data: { chatId: chatId }
  }
}

export const _deleteFriend = (state, action) => {
  const { myId, data: { chatId } } = action

  return state.updateIn([myId, 'myFriends', 'friendList'], arr => arr.filter(each => each.chatId !== chatId ))
}

/*                    */
/*  Get Key Info      */
/*                    */

function getAllKeyInfo (userId) {
  return dispatch => Promise.all([
    dispatch(serverUtils.showMyURL())
      .then(({ response: { result }, type, query, error }) => {
        if (error) {
          return { 'error': true, 'key': 'deviceJoinKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'deviceJoinKey', 'value': result }
        }
      }),
    dispatch(serverUtils.showMyKey())
      .then(({ response: { result }, type, query, error }) => {
        if (error) {
          return { 'error': true, 'key': 'userPrivateKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'userPrivateKey', 'value': result }
        }
      }),
    dispatch(serverUtils.showURL())
      .then(({ response: { result }, type, query, error }) => {
        if (error) {
          return { 'error': true, 'key': 'friendJoinKey', 'value': error }
        } else {
          return { 'error': false, 'key': 'friendJoinKey', 'value': result }
        }
      })
  ])
}

export const getKeyInfo = (myId) => {
  return (dispatch, getState) => {
    dispatch(getAllKeyInfo())
      .then((keyInfo) => {
        dispatch(postprocessGetKeyInfo(myId, keyInfo))
      })
  }
}

const postprocessGetKeyInfo = (myId, keyInfo) => {
  console.log('doFriendListPage.postprocessGetKeyInfo: keyInfo: ', keyInfo)

  let deviceJoinKeyInfo  = keyInfo.find(({key}) => key === 'deviceJoinKey').value
  let userPrivateKeyInfo = keyInfo.find(({key}) => key === 'userPrivateKey').value
  let friendJoinKeyInfo  = keyInfo.find(({key}) => key === 'friendJoinKey').value

  const combinedKeyInfo = {
    userPrivateKey: userPrivateKeyInfo,
    deviceJoinKey: {
      URL: deviceJoinKeyInfo.URL,
      UpdateTS: deviceJoinKeyInfo.UT ? deviceJoinKeyInfo.UT : utils.emptyTimeStamp(),
      expirePeriod: deviceJoinKeyInfo.e
    },
    friendJoinKey: {
      URL: friendJoinKeyInfo.URL,
      UpdateTS: friendJoinKeyInfo.UT ? friendJoinKeyInfo.UT : utils.emptyTimeStamp(),
      expirePeriod: friendJoinKeyInfo.e
    }
  }

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { keyInfo: combinedKeyInfo }
  }
}

/*             */
/*  Loading    */
/*             */

const preprocessSetStartLoading = (myId) => {
  console.log('doFriendListPage.preprocessSetStartLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: true }
  }
}

const postprocessSetFinshLoading = (myId) => {
  console.log('doFriendListPage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: false }
  }
}

export const clearData = (myId) => {
  return (dispatch, getState) => {
    dispatch(postprocessClearData(myId))
  }
}

const postprocessClearData = (myId) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { myFriends: { lru: null, offset: 0, friendList: [] }, noFriend: false, isLoading: false, allFriendsLoaded: false }
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]: utils.reduceInit,
  [ADD_CHILD]: utils.reduceAddChild,
  [SET_ROOT]: utils.reduceSetRoot,
  [REMOVE_CHILDS]: utils.reduceRemoveChilds,
  [REMOVE]: utils.reduceRemove,
  [SET_DATA]: utils.reduceSetData,
  [ADD_FRIEND]: _addNewFriend,
  [DELETE_FRIEND]: _deleteFriend,
  [PREPEND_FRIENDS]: _prependFriends,
  [APPEND_FRIENDS]: _appendFriends
}, Immutable.Map())

export default reducer
