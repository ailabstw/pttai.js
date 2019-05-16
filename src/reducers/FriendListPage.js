import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import LRU from 'lru-cache'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'
import { EMPTY_ID,
  NUM_CACHE_FRIEND,
  DEFAULT_USER_NAME,
  DEFAULT_USER_IMAGE,
  DEFAULT_USER_NAMECARD,
  NUM_FRIEND_PER_REQ,
  MESSAGE_TYPE_TEXT } from '../constants/Constants'

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
          let messageId = (messageResult.result && messageResult.result.length) ? messageResult.result[0].ID : null
          let subContentId = (messageResult.result && messageResult.result.length) ? messageResult.result[0].ContentBlockID : null
          let creatorId = (messageResult.result && messageResult.result.length) ? messageResult.result[0].CreatorID : null
          return dispatch(serverUtils.getMessageBlockList(chatId, messageId, subContentId, 0, 0, 1))
            .then(({ response: { result }, type, query, error }) => {
              if (error) {
                return { 'error': true, 'key': 'messageBlock', 'value': error }
              } else {
                let combinedResult = (result && result.length) ? {
                  UpdateTS: (messageResult.result && messageResult.result.length) ? messageResult.result[0].UpdateTS : utils.emptyTimeStamp(),
                  SummaryUserID: creatorId,
                  ...result[0]
                } : {}
                return { 'error': false, 'key': 'messageBlock', 'value': combinedResult }
              }
            })
        })
    })
  )
}

export const getFriendList = (myId, isFirstFetch, limit) => {
  return (dispatch, getState) => {
    if (isFirstFetch) {
      dispatch(preprocessSetStartLoading(myId))
    }
    dispatch(serverUtils.getFriends(EMPTY_ID, limit))
      .then(({ response: friendResult, type, query, error }) => {
        dispatch(serverUtils.getFriendRequest(EMPTY_ID))
          .then(({ response: friendReqResult, type, query, error }) => {
            let chatIds = friendResult.result.map(each => each.ID)
            dispatch(getChatSummaries(chatIds))
              .then((summaryResult) => {
                let creatorIds = friendResult.result.map(each => each.FID).filter(each => each)
                let summaries = summaryResult.map(each => {
                  if (each.error) {
                    return {}
                  } else {
                    return each.value
                  }
                })
                let SummaryUserIds = summaries.map(each => each.SummaryUserID).filter(each => each)
                dispatch(serverUtils.getUsersInfo([...creatorIds, ...SummaryUserIds]))
                  .then((usersInfo) => {
                    dispatch(postprocessGetFriendList(myId, friendResult.result, friendReqResult.result, summaries, usersInfo, isFirstFetch))
                    if (isFirstFetch) {
                      dispatch(postprocessSetFinshLoading(myId))
                    }
                  })
              })
          })
      })
  }
}

const postprocessGetFriendList = (myId, result, reqResult, summaries, usersInfo, isFirstFetch) => {
  result = result.map((each) => {
    return {
      friendID: each.FID,
      ...each
    }
  })

  result = result.map(serverUtils.deserialize)
  // reqResult = reqResult.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let friendList = result.map((each, index) => {
    let userId = each.friendID
    let summaryUserId = summaries[index].SummaryUserID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap = usersInfo['userImg'] || {}
    let userNameCardMap = usersInfo['userNameCard'] || {}

    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
    let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD
    let SummaryUserName = userNameMap[summaryUserId] ? serverUtils.b64decode(userNameMap[summaryUserId].N) : DEFAULT_USER_NAME
    let SummaryUserImg = userImgMap[summaryUserId] ? userImgMap[summaryUserId].I : DEFAULT_USER_IMAGE
    let ArticleCreateTS = each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp()

    return {
      Name: userName,
      Img: userImg,
      nameCard: userNameCard,
      friendID: each.friendID,
      chatId: each.ID,
      BoardID: each.BID,
      FriendStatus: each.S,
      SummaryStatus: summaries[index].S,
      LastSeen: each.LT ? each.LT : utils.emptyTimeStamp(),
      ArticleCreateTS: ArticleCreateTS,
      SummaryUpdateTS: summaries[index].UpdateTS ? summaries[index].UpdateTS : ArticleCreateTS,
      SummaryUserID: summaryUserId,
      SummaryUserName: SummaryUserName,
      SummaryUserImg: SummaryUserImg,
      Summary: (summaries[index].B && summaries[index].B.length > 0) ? serverUtils.b64decode(summaries[index].B[0]) : JSON.stringify({ type: MESSAGE_TYPE_TEXT, value: '' }),
      joinStatus: 3
    }
  })

  let joinReqs = reqResult.map((eachJoin) => {
    return {
      CreatorID: eachJoin.C,
      NodeID: eachJoin.n,
      Name: serverUtils.b64decode(eachJoin.N),
      Status: eachJoin.S
    }
  })

  joinReqs.forEach((join, index) => {
    let joinFriendIndex = friendList.findIndex((e) => e.friendID === join.CreatorID)
    if (joinFriendIndex >= 0) {
      friendList[joinFriendIndex].joinStatus = join.Status
    } else {
      let userId = join.CreatorID
      let userNameMap = usersInfo['userName'] || {}
      let userImgMap = usersInfo['userImg'] || {}
      let userNameCardMap = usersInfo['userNameCard'] || {}

      let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
      let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
      let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD

      friendList.push({
        Name: join.Name || userName,
        Img: userImg,
        friendID: userId,
        nameCard: userNameCard,
        chatId: null,
        BoardID: EMPTY_ID,
        FriendStatus: null,
        SummaryStatus: null,
        LastSeen: utils.emptyTimeStamp(),
        ArticleCreateTS: utils.emptyTimeStamp(),
        SummaryUpdateTS: utils.emptyTimeStamp(),
        SummaryUserID: EMPTY_ID,
        SummaryUserName: '',
        SummaryUserImg: '',
        Summary: JSON.stringify({ type: MESSAGE_TYPE_TEXT, value: '' }),
        joinStatus: join.Status
      })
    }
  })

  console.log('doFriendListPage.postprocessGetFriendList: friendList:', friendList, reqResult)

  if (friendList.length === 0 && isFirstFetch) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { myFriends: { lru: null, offset: 0, friendList: [] }, noFriend: true }
    }
  } else if (friendList.length === 0 && !isFirstFetch) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: {}
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_FRIENDS,
      data: { friends: friendList.sort((a, b) => {
        if (a.SummaryUpdateTS.T < b.SummaryUpdateTS.T) {
          return -1
        } else if (a.SummaryUpdateTS.T > b.SummaryUpdateTS.T) {
          return 1
        } else {
          return 0
        }
      }),
      noFriend: false }
    }
  }
}

export const getMoreFriendlist = (myId, startFriendId, limit) => {
  return (dispatch, getState) => {
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getFriends(startFriendId, limit))
      .then(({ response: friendResult, type, query, error }) => {
        dispatch(serverUtils.getFriendRequest(EMPTY_ID))
          .then(({ response: friendReqResult, type, query, error }) => {
            let chatIds = friendResult.result.map(each => each.ID)
            dispatch(getChatSummaries(chatIds))
              .then((summaryResult) => {
                let creatorIds = friendResult.result.map(each => each.FID).filter(each => each)
                let summaries = summaryResult.map(each => {
                  if (each.error) {
                    return {}
                  } else {
                    return each.value
                  }
                })
                let SummaryUserIds = summaries.map(each => each.SummaryUserID).filter(each => each)
                dispatch(serverUtils.getUsersInfo([...creatorIds, ...SummaryUserIds]))
                  .then((usersInfo) => {
                    dispatch(postprocessGetMoreFriendList(myId, friendResult.result, friendReqResult.result, summaries, usersInfo))
                    dispatch(postprocessSetFinshLoading(myId))
                  })
              })
          })
      })
  }
}

const postprocessGetMoreFriendList = (myId, result, reqResult, summaries, usersInfo) => {
  result = result.map((each) => {
    return {
      friendID: each.FID,
      ...each
    }
  })

  result = result.map(serverUtils.deserialize)
  reqResult = reqResult.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let friendList = result.map((each, index) => {
    let userId = each.friendID
    let summaryUserId = summaries[index].SummaryUserID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap = usersInfo['userImg'] || {}
    let userNameCardMap = usersInfo['userNameCard'] || {}

    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
    let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD
    let SummaryUserName = userNameMap[summaryUserId] ? serverUtils.b64decode(userNameMap[summaryUserId].N) : DEFAULT_USER_NAME
    let SummaryUserImg = userImgMap[summaryUserId] ? userImgMap[summaryUserId].I : DEFAULT_USER_IMAGE
    let ArticleCreateTS = each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp()

    return {
      Name: userName,
      Img: userImg,
      nameCard: userNameCard,
      friendID: each.friendID,
      chatId: each.ID,
      BoardID: each.BID,
      FriendStatus: each.S,
      SummaryStatus: summaries[index].S,
      LastSeen: each.LT ? each.LT : utils.emptyTimeStamp(),
      ArticleCreateTS: ArticleCreateTS,
      SummaryUpdateTS: summaries[index].UpdateTS ? summaries[index].UpdateTS : ArticleCreateTS,
      SummaryUserID: summaryUserId,
      SummaryUserName: SummaryUserName,
      SummaryUserImg: SummaryUserImg,
      Summary: (summaries[index].B && summaries[index].B.length > 0) ? serverUtils.b64decode(summaries[index].B[0]) : JSON.stringify({ type: MESSAGE_TYPE_TEXT, value: '' }),
      joinStatus: 3
    }
  })

  let joinReqs = reqResult.map((eachJoin) => {
    return {
      CreatorID: eachJoin.C,
      NodeID: eachJoin.n,
      Name: serverUtils.b64decode(eachJoin.N),
      Status: eachJoin.S
    }
  })

  joinReqs.forEach((join, index) => {
    let joinFriendIndex = friendList.findIndex((e) => e.friendID === join.CreatorID)
    if (joinFriendIndex >= 0) {
      friendList[joinFriendIndex].joinStatus = join.Status
    } else {
      let userId = join.CreatorID
      let userNameMap = usersInfo['userName'] || {}
      let userImgMap = usersInfo['userImg'] || {}
      let userNameCardMap = usersInfo['userNameCard'] || {}

      let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
      let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
      let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD

      friendList.push({
        Name: join.Name || userName,
        Img: userImg,
        friendID: userId,
        nameCard: userNameCard,
        chatId: null,
        BoardID: EMPTY_ID,
        FriendStatus: null,
        SummaryStatus: null,
        LastSeen: utils.emptyTimeStamp(),
        ArticleCreateTS: utils.emptyTimeStamp(),
        SummaryUpdateTS: utils.emptyTimeStamp(),
        SummaryUserID: EMPTY_ID,
        SummaryUserName: '',
        SummaryUserImg: '',
        Summary: JSON.stringify({ type: MESSAGE_TYPE_TEXT, value: '' }),
        joinStatus: join.Status
      })
    }
  })

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
      data: { friendList: friendList.sort((a, b) => {
        if (a.SummaryUpdateTS.T < b.SummaryUpdateTS.T) {
          return -1
        } else if (a.SummaryUpdateTS.T > b.SummaryUpdateTS.T) {
          return 1
        } else {
          return 0
        }
      })
      }
    }
  }
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
      if (lruCache.get(friend.friendID) && lruCache.get(friend.friendID).friend.SummaryUpdateTS.T < earlistTS) {
        startFriend = lruCache.get(friend.friendID)
        earlistTS = startFriend.friend.SummaryUpdateTS.T
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
        if (oriFriend.SummaryUpdateTS.T <= newFriend.SummaryUpdateTS.T) {
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
          callBackFunc({ error: true, data: error.message, friendReqUrl: name })
        } else {
          callBackFunc({ error: false, data: result })
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

  // result = serverUtils.deserialize(result)

  let userId = result.C
  let userImgMap = usersInfo['userImg'] || {}
  let userNameCardMap = usersInfo['userNameCard'] || {}

  let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE
  let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD

  const combinedFriend = {
    Name: serverUtils.b64decode(result.N),
    Img: userImg,
    friendID: userId,
    nameCard: userNameCard,
    chatId: null,
    BoardID: null,
    FriendStatus: 0,
    SummaryStatus: 0,
    LastSeen: utils.emptyTimeStamp(),
    ArticleCreateTS: utils.emptyTimeStamp(),
    SummaryUpdateTS: utils.emptyTimeStamp(),
    SummaryUserID: null,
    Summary: JSON.stringify({
      type: MESSAGE_TYPE_TEXT,
      value: ''
    }),
    joinStatus: 0
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
          callBackFunc({ error: true, data: error.message, chatId: chatId })
        } else {
          callBackFunc({ error: false, data: result })
          dispatch(serverUtils.getUsersInfo([result.C]))
            .then((usersInfo) => {
              dispatch(postprocessDeleteFriend(myId, chatId))
            })
        }
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

  return state.updateIn([myId, 'myFriends', 'friendList'], arr => arr.filter(each => { return each.chatId !== chatId }))
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

  let deviceJoinKeyInfo = keyInfo.find((key) => key.key === 'deviceJoinKey').value
  let userPrivateKeyInfo = keyInfo.find((key) => key.key === 'userPrivateKey').value
  let friendJoinKeyInfo = keyInfo.find((key) => key.key === 'friendJoinKey').value

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
