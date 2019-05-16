import Immutable from 'immutable'
import { createDuck } from 'redux-duck'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

import { EMPTY_ID,
  DEFAULT_USER_NAME,
  DEFAULT_USER_IMAGE } from '../constants/Constants'

export const myClass = 'CREATE_BOARD_MODAL'

export const myDuck = createDuck(myClass, 'Create_Board_Modal')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({ myId, myClass, myDuck, parentId, parentClass, parentDuck }))
  }
}

export const getFriendList = (myId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getFriends(EMPTY_ID, limit))
      .then(({ response: { result }, type, query, error }) => {
        let friendIds = result.map((each) => each.FID)
        dispatch(serverUtils.getUsersInfo(friendIds))
          .then((usersInfo) => {
            dispatch(postprocessgetFriendList(myId, result, usersInfo))
          })
      })
  }
}

const postprocessgetFriendList = (myId, result, usersInfo) => {
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

  const friendList = result.map(each => {
    let userId = each.friendID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap = usersInfo['userImg'] || {}

    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      Name: userName,
      Img: userImg,
      friendID: each.friendID,
      chatID: each.ID,
      BoardID: each.BID,
      FriendStatus: each.S,
      LastSeen: each.LT ? each.LT : utils.emptyTimeStamp()
    }
  })

  console.log('doCreateBoardModal.postprocessgetFriends: friendList:', friendList)
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { friendList: friendList }
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]: utils.reduceInit,
  [ADD_CHILD]: utils.reduceAddChild,
  [SET_ROOT]: utils.reduceSetRoot,
  [REMOVE_CHILDS]: utils.reduceRemoveChilds,
  [REMOVE]: utils.reduceRemove,
  [SET_DATA]: utils.reduceSetData
}, Immutable.Map())

export default reducer
