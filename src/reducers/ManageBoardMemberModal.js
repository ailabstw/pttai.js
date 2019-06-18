import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import moment from 'moment'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

import { EMPTY_ID,
  STATUS_ARRAY,
  DEFAULT_USER_IMAGE,
  DEFAULT_USER_NAME,
  NUM_MEMBER_PER_REQ } from '../constants/Constants'

import { unixToMoment } from '../utils/utilDatetime'

export const myClass = 'MANAGE_BOARD_MEMBER_MODAL'

export const myDuck = createDuck(myClass, 'Manage_Board_Member_Modal')

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

/*                          */
/*  Get Board level Info    */
/*                          */

export const getBoardInfo = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoard(boardId))
      .then(({ response: { result }, type, query, error }) => {
        dispatch(postprocessGetBoardInfo(myId, result))
      })
  }
}

const postprocessGetBoardInfo = (myId, result) => {
  result = serverUtils.deserialize(result)

  const boardInfo = {
    ArticleCreateTS: result.ArticleCreateTS ? result.ArticleCreateTS : utils.emptyTimeStamp(),
    ID: result.ID,
    LastSeen: result.LastSeen ? result.LastSeen : utils.emptyTimeStamp(),
    Status: result.Status,
    Title: result.Title
  }

  console.log('doBoardPage.postprocessGetBoardInfo: boardInfo:', boardInfo)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardInfo: boardInfo }
  }
}

/*                     */
/*  Get Member Info    */
/*                     */

export const getMemberList = (myId, boardId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getFriends(EMPTY_ID, limit))
      .then(({ response: friendResult, type, query, error }) => {
        /* Get member list to match friends in this board */
        dispatch(serverUtils.getMemberList(boardId, EMPTY_ID, NUM_MEMBER_PER_REQ))
          .then(({ response: memberResult, type, query, error }) => {
            let friendIds = friendResult.result.map((each) => each.FID)
            let memeberIds = memberResult.result.map((each) => each.b.ID)
            dispatch(serverUtils.getUsersInfo([...friendIds, ...memeberIds]))
              .then((usersInfo) => {
                dispatch(postprocessGetMembers(myId, friendResult.result, memberResult.result, usersInfo))
              })
          })
      })
  }
}

const postprocessGetMembers = (myId, friendListResult, memeberListResult, usersInfo) => {
  friendListResult = friendListResult.map((each) => {
    return {
      friendID: each.FID,
      ...each
    }
  })

  friendListResult = friendListResult.map(serverUtils.deserialize)

  let memberMap = memeberListResult.reduce((acc, each) => {
    acc[each.b.ID] = { updateAt: unixToMoment(each.UT), ...each.b }
    return acc
  }, {})

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const memberList = friendListResult.filter(friend => { return (friend.friendID in memberMap) && memberMap[friend.friendID].S < STATUS_ARRAY.indexOf('StatusDeleted') }).map(each => {
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
      LastSeen: each.LT ? each.LT : utils.emptyTimeStamp(),
      isBoardMember: true,
      memberStatus: (userId in memberMap) ? memberMap[userId].S : null,
      memberUpdateAt: (userId in memberMap) ? memberMap[userId].updateAt : moment()
      /* ArticleCreateTS:  each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(), */
    }
  })

  console.log('doManageBoardMemberModal.postprocessGetMembers: memberList:', memberList)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { memberList: memberList }
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
