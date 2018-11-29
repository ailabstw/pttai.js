import Immutable        from 'immutable'
import { createDuck }   from 'redux-duck'

import * as utils       from './utils'
import * as serverUtils from './ServerUtils'

import {  EMPTY_ID,
          DEFAULT_USER_NAME,
          DEFAULT_USER_IMAGE }   from '../constants/Constants'

export const myClass = 'FRIEND_CHAT_PAGE'

export const myDuck = createDuck(myClass, 'Friend_Chat_Page')

const INIT              = myDuck.defineType('INIT')
const ADD_CHILD         = myDuck.defineType('ADD_CHILD')
const SET_ROOT          = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS     = myDuck.defineType('REMOVE_CHILDS')
const REMOVE            = myDuck.defineType('REMOVE')
const SET_DATA          = myDuck.defineType('SET_DATA')
const ADD_MESSAGE       = myDuck.defineType('ADD_MESSAGE')
const PREPEND_MESSAGES  = myDuck.defineType('PREPEND_MESSAGES')
const APPEND_MESSAGES   = myDuck.defineType('APPEND_MESSAGES')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
  }
}

export const initParams = (myId, params) => {
  return (dispatch, getState) => {
    dispatch({
      myId,
      myClass,
      type: SET_DATA,
      data: {
        friendId:    decodeURIComponent(params.friendId)
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
      .then(({response: {result}, type, error, query}) => {
          let creatorIds = [result.FID]
          dispatch(serverUtils.getUsersInfo(creatorIds))
            .then((usersInfo) => {
              dispatch(postprocessGetFriend(myId, result, usersInfo))
            })
      })
  }
}

const postprocessGetFriend = (myId, result, usersInfo) => {

  result = serverUtils.deserialize(result)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let userId      = result.FID
  let userNameMap = usersInfo['userName'] || {}
  let userImgMap  = usersInfo['userImg'] || {}

  let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
  let userImg   = userImgMap[userId]  ? userImgMap[userId].I : DEFAULT_USER_IMAGE

  const friendData = {
    ID:         result.ID,
    Name:       userName,
    Img:        userImg,
    BoardID:    result.BID,
    LastSeen:   result.LT ? result.LT : utils.emptyTimeStamp(),
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
      .then(({response: {result}, type, error, query}) => {
        dispatch(postprocessMarkChat(myId, result))
      })
  }
}

const postprocessMarkChat = (myId, result) => {
}

/*                      */
/*  Get Chat Content    */
/*                      */

function getMessagesContent (chatId, messageIds, subContentIds) {
  return dispatch => Promise.all(
    messageIds.map((messageId, index) => {
      return dispatch(serverUtils.getMessageBlockList(chatId, messageIds[index], subContentIds[index], 0, 0, 1))
              .then(({response: {result}, type, query, error}) => {
                if (error) {
                  return { 'error': true, 'key':'messageBlock', 'value': error }
                } else {
                  return { 'error': false, 'key':'messageBlock', 'value': result[0] }
                }
              })
    })
  )
}

export const getMessageList = (myId, chatId, latestMessageId, limit) => {
  return (dispatch, getState) => {
    if (latestMessageId === EMPTY_ID) {
      dispatch(preprocessSetStartLoading(myId))
    }
    dispatch(serverUtils.getMessageList(chatId, EMPTY_ID, limit))
      .then(({response: {result}, type, error, query}) => {
          let messageIds    = result.map(each => each.ID).filter(each => each)
          let subContentIds = result.map(each => each.ContentBlockID).filter(each => each)
          let creatorIds    = result.map(each => each.CreatorID).filter(each => each)
          dispatch(getMessagesContent(chatId, messageIds, subContentIds))
            .then((messageBlockList) => {
              dispatch(serverUtils.getUsersInfo(creatorIds))
                .then((usersInfo) => {
                  dispatch(postprocessGetMessageList(myId, creatorIds, messageIds, latestMessageId,  messageBlockList, result, usersInfo))
                  if (latestMessageId === EMPTY_ID) {
                    dispatch(postprocessSetFinshLoading(myId))
                  }
                })
            })
      })
  }
}

const postprocessGetMessageList = (myId, creatorIds, messageIds, latestMessageId, messageBlockList, result, usersInfo) => {

  messageBlockList = messageBlockList.map(block => block.value)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let messageList = messageBlockList.map((each, index) => {

    let userId      = creatorIds[index]
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      ID:             each.ID,
      MessageID:      messageIds[index],
      ArticleID:      each.AID,
      CreateTS:       result[index].CreateTS ? result[index].CreateTS: utils.emptyTimeStamp(),
      UpdateTS:       result[index].UpdateTS ? result[index].UpdateTS: utils.emptyTimeStamp(),
      CreatorID:      creatorIds[index],
      CreatorName:    userName,
      CreatorImg:     userImg,
      Status:         each.S,
      Buf:            serverUtils.b64decode(each.B),
    }
  })

  console.log('doFriendChatPage.postprocessGetMessageList: messageList:', messageList)

  let matchIndex = messageList.findIndex((each) => each.MessageID === latestMessageId)

  if (messageList.length === 0 && latestMessageId === EMPTY_ID) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { noMessage: true }
    }
  } else if (matchIndex === -1) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { messageList: messageList.reverse(), noMessage: false }
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
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getMessageList(chatId, startMessageId, limit))
      .then(({response: {result}, type, error, query}) => {
          let messageIds    = result.map(each => each.ID).filter(each => each)
          let subContentIds = result.map(each => each.ContentBlockID).filter(each => each)
          let creatorIds    = result.map(each => each.CreatorID).filter(each => each)
          dispatch(getMessagesContent(chatId, messageIds, subContentIds))
            .then((messageBlockList) => {
              dispatch(serverUtils.getUsersInfo(creatorIds))
                .then((usersInfo) => {
                  dispatch(postprocessGetMoreMessageList(myId, creatorIds, messageIds, messageBlockList, result, usersInfo))
                  dispatch(postprocessSetFinshLoading(myId))
                })
            })
      })
  }
}

const postprocessGetMoreMessageList = (myId, creatorIds, messageIds, messageBlockList, result, usersInfo) => {

  messageBlockList = messageBlockList.map(block => block.value)
  messageBlockList = messageBlockList.slice(1)

  messageIds = messageIds.slice(1)
  creatorIds = creatorIds.slice(1)
  result     = result.slice(1)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let messageList = messageBlockList.map((each, index) => {

    let userId      = creatorIds[index]
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      ID:             each.ID, /* messageID */
      MessageID:      messageIds[index],
      ArticleID:      each.AID,
      CreateTS:       result[index].CreateTS ? result[index].CreateTS : utils.emptyTimeStamp(),
      UpdateTS:       result[index].UpdateTS ? result[index].UpdateTS : utils.emptyTimeStamp(),
      CreatorID:      creatorIds[index],
      CreatorName:    userName,
      CreatorImg:     userImg,
      Status:         each.S,
      Buf:            serverUtils.b64decode(each.B),
    }
  })

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

  const {myId, data: { messages }} = action

  let messageList = state.getIn([myId, 'messageList'], Immutable.List())

  return state.setIn([myId, 'messageList'], Immutable.List(messages).concat(messageList))
}

export const _appendMessages = (state, action) => {

  const {myId, data: { messages, noMessage }} = action

  let messageList = state.getIn([myId, 'messageList'], Immutable.List()).toJS()

  let matchStartIndex = messageList.findIndex((each) => each.MessageID === messages[0].MessageID)
  let matchEndIndex   = messageList.findIndex((each) => each.MessageID === messages[messages.length-1].MessageID)

  state = state.setIn([myId, 'noMessage'], noMessage)
  return state.setIn([myId, 'messageList'], Immutable.List(messageList.slice(0, matchStartIndex)).concat(Immutable.List(messages)).concat(Immutable.List(messageList.slice(matchEndIndex + 1))))
}

/*                        */
/*  Update Chat Content   */
/*                        */

export const postMessage = (myId, userId, userName, userImg, chatId, message) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.postMessage(chatId, [message], []))
      .then(({response: {result}, type, error, query}) => {
        dispatch(postprocessPostMessage(myId, userId, userName, userImg, result, message))
      })
  }
}

const postprocessPostMessage = (myId, userId, userName, userImg, result, message) => {

  const newMessage = {
      ID:             result.cID,
      ArticleID:      result.AID,
      CreateTS:       utils.emptyTimeStamp(),
      UpdateTS:       utils.emptyTimeStamp(),
      CreatorID:      userId,
      CreatorName:    userName,
      CreatorImg:     userImg,
      Status:         0,
      Buf:            message,
  }

  console.log('doFriendChatPage.postprocessPostMessage: newMessage:', result)

  return {
    myId,
    myClass,
    type: ADD_MESSAGE,
    data: { message: newMessage, noMessage: false }
  }
}


export const _addMessage = (state, action) => {
  const {myId, data: { message, noMessage }} = action

  state = state.setIn([myId, 'noMessage'], noMessage)
  return state.updateIn([myId, 'messageList'], arr => arr.push(Immutable.Map(message)))
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
    data: { messageList: [], friendData: {} }
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
      .then(({response: {result}, type, query, error}) => {
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

    let userId      = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

    return {
      BoardType:        each.BT,
      ID:               each.ID,
      Status:           each.Status,
      Title:            each.Title,
      ArticleCreateTS:  each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(),
      UpdateTS:         each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      LastSeen:         each.LastSeen ? each.LastSeen : utils.emptyTimeStamp(),
      CreatorID:        each.CreatorID,
      creatorName:      userName,
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


/*                      */
/*  Update Board List   */
/*                      */

export const joinBoard = (myId, boardUrl, callBack) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.joinBoard(boardUrl))
      .then(({response: {result, error}, type, query }) => {
        if (error) {
          callBack({error: true, data: error.message, boardUrl: boardUrl})
        } else {
          callBack({error: false, data: result})
        }
      })
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]:             utils.reduceInit,
  [ADD_CHILD]:        utils.reduceAddChild,
  [SET_ROOT]:         utils.reduceSetRoot,
  [REMOVE_CHILDS]:    utils.reduceRemoveChilds,
  [REMOVE]:           utils.reduceRemove,
  [SET_DATA]:         utils.reduceSetData,
  [ADD_MESSAGE]:      _addMessage,
  [PREPEND_MESSAGES]: _prependMessages,
  [APPEND_MESSAGES]:  _appendMessages,
}, Immutable.Map())

export default reducer
