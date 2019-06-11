import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import LRU from 'lru-cache'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

import { EMPTY_ID,
  DEFAULT_USER_NAME,
  DEFAULT_USER_IMAGE,
  DEFAULT_USER_NAMECARD,
  DEFAULT_USER_COMPANY,
  NUM_MESSAGE_PER_REQ,
  NUM_CACHE_MESSAGE } from '../constants/Constants'

import { toJson } from '../utils/utils'

export const myClass = 'FRIEND_CHAT_PAGE'

export const myDuck = createDuck(myClass, 'Friend_Chat_Page')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')
const ADD_MESSAGE = myDuck.defineType('ADD_MESSAGE')
const PREPEND_MESSAGES = myDuck.defineType('PREPEND_MESSAGES')
const APPEND_MESSAGES = myDuck.defineType('APPEND_MESSAGES')
const DELETE_FRIEND = myDuck.defineType('DELETE_FRIEND')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({ myId, myClass, myDuck, parentId, parentClass, parentDuck }))
  }
}

export const initParams = (myId, params) => {
  return (dispatch, getState) => {
    dispatch({
      myId,
      myClass,
      type: SET_DATA,
      data: {
        friendId: decodeURIComponent(params.friendId)
      }
    })
  }
}

/*                      */
/*  Get Friend Info     */
/*                      */

export const getFriend = (myId, friendId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getFriend(friendId))
      .then(({ response: { result }, type, error, query }) => {
        if (error) return console.warn('getFriend got error', error)

        let creatorIds = [result.FID]
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then(usersInfo => dispatch(postprocessGetFriend(myId, result, usersInfo)))
      })
  }
}

const postprocessGetFriend = (myId, result, usersInfo) => {
  result = serverUtils.deserialize(result)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let userId = result.FID
  let userNameMap = usersInfo['userName'] || {}
  let userImgMap = usersInfo['userImg'] || {}
  let userNameCardMap = usersInfo['userNameCard'] || {}

  let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
  let userImg = userImgMap[userId] && userImgMap[userId].I ? userImgMap[userId].I : DEFAULT_USER_IMAGE
  let userNameCard = userNameCardMap[userId] && userNameCardMap[userId].C ? JSON.parse(serverUtils.b64decode(userNameCardMap[userId].C)) : DEFAULT_USER_NAMECARD

  const friendData = {
    ID: result.ID,
    Name: userName,
    Img: userImg,
    company: userNameCard.company || DEFAULT_USER_COMPANY
  }

  console.log('doFriendChatPage.postprocessGetFriend: friendData:', friendData)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { friendData: friendData }
  }
}

/*                      */
/*  Update Friend Info  */
/*                      */

export const markChat = (myId, chatId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.markFriendSeen(chatId))
      .then(({ response: { result }, type, error, query }) => {
        dispatch(postprocessMarkChat(myId, result))
      })
  }
}

const postprocessMarkChat = (myId, result) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

/*                      */
/*  Get Chat Content    */
/*                      */

function getMessagesContent (chatId, messageIds, subContentIds) {
  return dispatch => Promise.all(
    messageIds.map((messageId, index) => {
      return dispatch(serverUtils.getMessageBlockList(chatId, messageIds[index], subContentIds[index], 0, 0, 1))
        .then(({ response: { result }, type, query, error }) => {
          if (error) {
            return { 'error': true, 'key': 'messageBlock', 'value': error }
          }
          if (result && result.length > 0) {
            return { 'error': false, 'key': 'messageBlock', 'value': result[0] }
          }
          console.warn('getMessageBlockList for messageId = ', messageIds[index], ' return empty result :', result)
          return { 'error': true, 'key': 'messageBlock', 'value': {} }
        })
    })
  )
}

const fetchMessageList = (myId, chatId, startMessageId, shouldShowLoading, limit) => {
  return (dispatch, getState) => {
    if (shouldShowLoading) {
      dispatch(preprocessSetStartLoading(myId))
    }

    dispatch(serverUtils.getMessageList(chatId, startMessageId, limit))
      .then(({ response: { result }, type, error, query }) => {
        let validResult = (result && result.length > 0) ? result.filter(each => (each && each.ID && each.BlockID && each.CreatorID)) : []

        let messageIds = validResult.map(each => each.ID)
        let subContentIds = validResult.map(each => each.BlockID)
        let creatorIds = validResult.map(each => each.CreatorID)

        dispatch(getMessagesContent(chatId, messageIds, subContentIds))
          .then((messageBlockList) => {
            if (startMessageId === EMPTY_ID) {
              dispatch(postprocessGetMessageList(myId, creatorIds, messageIds, messageBlockList, validResult))
            }
            else {
              dispatch(postprocessGetMoreMessageList(myId, creatorIds, messageIds, messageBlockList, validResult))
            }
            dispatch(postprocessSetFinshLoading(myId))
          })
      })
  }
}

export const getMessageList = (myId, chatId, isFirstFetch, limit) => {
  return (dispatch, getState) => {
    dispatch(fetchMessageList(myId, chatId, EMPTY_ID, isFirstFetch, limit))
  }
}

const messageToMessageList = (creatorIds, messageIds, messageBlockList, result, loadingMore) => {
  let messageList = []
  messageBlockList.forEach((each, index) => {
    if (each.error || (loadingMore && index === 0)) {
      return
    }

    let messageObj = toJson(serverUtils.b64decode(each.value.B))

    messageList.push({
      ID:          messageIds[index],
      CreateTS:    result[index].CreateTS ? result[index].CreateTS : utils.emptyTimeStamp(),
      CreatorID:   creatorIds[index],
      Status:      each.value.S,
      type:        messageObj.type,
      content:     messageObj.value
    })
  })

  return messageList
}

const postprocessGetMessageList = (myId, creatorIds, messageIds, messageBlockList, result) => {
  const messageList = messageToMessageList(creatorIds, messageIds, messageBlockList, result)

  console.log('doFriendChatPage.postprocessGetMessageList: messageList:', messageList)

  // let matchIndex = messageList.findIndex((each) => each.MessageID === latestMessageId)

  if (messageList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { friendMessages: { lru: null, offset: 0, messageList: [] }, noMessage: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_MESSAGES,
      data: { messages: messageList.reverse(), noMessage: false }
    }
  }
}

export const getMoreMessageList = (myId, chatId, startMessageId, limit) => {
  return (dispatch, getState) => {
    dispatch(fetchMessageList(myId, chatId, startMessageId, true, limit))
  }
}

const postprocessGetMoreMessageList = (myId, creatorIds, messageIds, messageBlockList, result) => {
  const messageList = messageToMessageList(creatorIds, messageIds, messageBlockList, result, true)

  console.log('doFriendChatPage.postprocessGetMoreMessageList: messageList:', messageList)

  if (messageList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allMessagesLoaded: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: PREPEND_MESSAGES,
      data: { messages: messageList.reverse() }
    }
  }
}

export const _prependMessages = (state, action) => {
  const { myId, data: { messages } } = action

  let messageList = state.getIn([myId, 'friendMessages', 'messageList'], Immutable.List())
  let oriOffset = state.getIn([myId, 'friendMessages', 'offset'], 0)

  state = state.setIn([myId, 'friendMessages', 'offset'], oriOffset + messages.length)
  state = state.setIn([myId, 'friendMessages', 'messageList'], Immutable.List(messages).concat(messageList))
  return state
}

export const _appendMessages = (state, action) => {
  /* merge the newly fetched messages to existing message list */
  const { myId, data: { messages, noMessage } } = action

  if (!messages || messages.length <= 0) {
    return state
  }

  let friendMessages = state.getIn([myId, 'friendMessages'], Immutable.Map()).toJS()
  let messageList = friendMessages.messageList || []
  let lruCache = friendMessages.lru || new LRU(NUM_CACHE_MESSAGE)
  let offset = friendMessages.offset || 0

  let resultMessageList = []
  if (messageList.length === 0) {
    /* append message */
    messages.forEach((message, index) => {
      resultMessageList.push(message)
      lruCache.set(message.ID, { index: index - offset, message: message })
    })
  } else {
    /* 1. find earlist start node and save to local lru */
    let localLRU = new LRU(NUM_MESSAGE_PER_REQ)

    let startMessage = null
    let earlistTS = 2147483648 /* year 2038 */
    messages.forEach((message, index) => {
      localLRU.set(message.ID, message)
      if (lruCache.get(message.ID) && lruCache.get(message.ID).message.CreateTS.T < earlistTS) {
        startMessage = lruCache.get(message.ID)
        earlistTS = startMessage.message.CreateTS.T
      }
    })
    /* 2. start merge  */
    let oriIndex = startMessage ? startMessage.index : messageList.length - offset
    let newIndex = 0
    let mergeIndex = oriIndex

    let oriList = messageList.slice(0, offset + oriIndex)
    let mergedList = []

    while (messageList.length > offset + oriIndex || messages.length > newIndex) {
      if (messageList.length > offset + oriIndex && messages.length > newIndex) {
        let oriMessage = messageList[offset + oriIndex]
        let newMessage = messages[newIndex]
        /* both left */
        if (oriMessage.CreateTS.T <= newMessage.CreateTS.T) {
          if (!localLRU.get(oriMessage.ID)) {
            mergedList.push(oriMessage)
            lruCache.set(oriMessage.ID, { index: mergeIndex, message: oriMessage })
            mergeIndex += 1
          }
          oriIndex += 1
        } else {
          mergedList.push(newMessage)
          lruCache.set(newMessage.ID, { index: mergeIndex, message: newMessage })
          mergeIndex += 1
          newIndex += 1
        }
      } else if (messageList.length > offset + oriIndex) {
        /* only ori */
        let oriMessage = messageList[offset + oriIndex]
        if (!localLRU.get(oriMessage.ID)) {
          mergedList.push(oriMessage)
          lruCache.set(oriMessage.ID, { index: mergeIndex, message: oriMessage })
          mergeIndex += 1
        }
        oriIndex += 1
      } else {
        /* only new */
        let newMessage = messages[newIndex]
        mergedList.push(newMessage)
        lruCache.set(newMessage.ID, { index: mergeIndex, message: newMessage })
        mergeIndex += 1
        newIndex += 1
      }
    }
    resultMessageList = oriList.concat(mergedList)
    localLRU.reset()
  }

  state = state.setIn([myId, 'noMessage'], noMessage)
  state = state.setIn([myId, 'friendMessages', 'offset'], offset)
  state = state.setIn([myId, 'friendMessages', 'lru'], lruCache)
  state = state.setIn([myId, 'friendMessages', 'messageList'], Immutable.List(resultMessageList))

  return state
}

/*                        */
/*  Update Chat Content   */
/*                        */

export const postMessage = (myId, userId, chatId, message) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.postMessage(chatId, [message], []))
      .then(({ response: { result }, type, error, query }) => {
        console.info('result', result)
        dispatch(postprocessPostMessage(myId, userId, result, message))
      })
  }
}

const postprocessPostMessage = (myId, userId, result, message) => {
  const messageObj = JSON.parse(message)
  const newMessage = {
    ID:        result.AID,
    CreateTS:  utils.emptyTimeStamp(),
    CreatorID: userId,
    Status:    0,
    type:      messageObj.type,
    content:   messageObj.value
  }

  console.log('doFriendChatPage.postprocessPostMessage: newMessage:', newMessage)

  return {
    myId,
    myClass,
    type: ADD_MESSAGE,
    data: { message: newMessage, noMessage: false }
  }
}

export const _addMessage = (state, action) => {
  const { myId, data: { message, noMessage } } = action

  if (!message || !message.ID) {
    return state
  }

  let friendMessages = state.getIn([myId, 'friendMessages'], Immutable.Map()).toJS()

  let lruCache = friendMessages.lru || new LRU(NUM_CACHE_MESSAGE)
  let offset = friendMessages.offset || 0
  let messageList = friendMessages.messageList || []

  lruCache.set(message.ID, { index: messageList.length - offset, message: message })

  state = state.setIn([myId, 'noMessage'], noMessage)
  state = state.setIn([myId, 'friendMessages', 'lru'], lruCache)
  state = state.updateIn([myId, 'friendMessages', 'messageList'], arr => arr.push(Immutable.Map(message)))

  return state
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
    data: {
      friendMessages: { lru: null, offset: 0, messageList: [] },
      friendData: {},
      allMessagesLoaded: false,
      friendId: '',
      boardList: [] }
  }
}

/*             */
/*  Loading    */
/*             */

const preprocessSetStartLoading = (myId) => {
  console.log('doFriendChatPage.preprocessSetStartLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: true }
  }
}

const postprocessSetFinshLoading = (myId) => {
  console.log('doFriendChatPage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: false }
  }
}

/*                    */
/*  Get Board List    */
/*                    */

export const getBoardList = (myId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoards(EMPTY_ID, limit))
      .then(({ response: { result }, type, query, error }) => {
        let creatorIds = result.map((each) => each.C)
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessGetBoardList(myId, result, usersInfo))
          })
      })
  }
}

const postprocessGetBoardList = (myId, result, usersInfo) => {
  result = result.map((each) => {
    return {
      CreatorID: each.C,
      ...each
    }
  })

  result = result.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const boardList = result.map(each => {
    let userId = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

    return {
      BoardType: each.BT,
      ID: each.ID,
      Status: each.S,
      Title: each.Title,
      ArticleCreateTS: each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(),
      UpdateTS: each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      LastSeen: each.LastSeen ? each.LastSeen : utils.emptyTimeStamp(),
      CreatorID: each.CreatorID,
      creatorName: userName
    }
  })

  console.log('doFriendChatPage.postprocessGetBoardList: boardList:', boardList)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardList: boardList }
  }
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
  // console.log('doFriendListPage.postprocessDeleteFriend: chatId:', chatId)

  return {
    myId,
    myClass,
    type: DELETE_FRIEND,
    data: { chatId: chatId }
  }
}

/*                      */
/*  Update Board List   */
/*                      */

export const joinBoard = (myId, boardUrl, callBack) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.joinBoard(boardUrl))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          callBack({ error: true, data: error.message, boardUrl: boardUrl })
        } else {
          callBack({ error: false, data: result })
        }
      })
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
  [ADD_MESSAGE]: _addMessage,
  [PREPEND_MESSAGES]: _prependMessages,
  [APPEND_MESSAGES]: _appendMessages
}, Immutable.Map())

export default reducer
