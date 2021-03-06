import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import _ from 'lodash'
import moment from 'moment'

import { EMPTY_ID,
  STATUS_ARRAY,
  // NUM_BOARD_PER_REQ,
  DEFAULT_USER_NAME,
  MESSAGE_TYPE_INVITE,
  BOARD_TYPE_PRIVATE } from '../constants/Constants'
import { isUnRead } from '../utils/utils'
import { unixToMoment } from '../utils/utilDatetime'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

export const myClass = 'HUB_PAGE'

export const myDuck = createDuck(myClass, 'hub_page')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')
const ADD_BOARD = myDuck.defineType('ADD_BOARD')
const ADD_BOARDS = myDuck.defineType('ADD_BOARDS')

export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({ myId, myClass, myDuck, parentId, parentClass, parentDuck }))
  }
}

/*                    */
/*  Get Board List    */
/*                    */

export const getBoardList = (myId, isFirstFetch, limit) => {
  return (dispatch, getState) => {
    if (isFirstFetch) {
      dispatch(preprocessSetStartLoading(myId))
    }

    return Promise.all([
      dispatch(serverUtils.getBoards(EMPTY_ID, limit)),
      dispatch(serverUtils.getBoardRequest(EMPTY_ID))
    ]).then( async ([{ response: { result } }, { response: reqResult }]) => {
      let creatorIds = result.map((each) => each.C)

      const usersInfo = await dispatch(serverUtils.getUsersInfo(creatorIds))
      dispatch(postprocessGetBoardList(myId, result, reqResult.result, usersInfo))
      dispatch(postprocessSetFinshLoading(myId))
    })
  }
}

const postprocessGetBoardList = (myId, result, reqResult, usersInfo) => {
  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const getNameById = id => serverUtils.b64decode(_.get(usersInfo, ['userName', id, 'N'], '')) || DEFAULT_USER_NAME

  let boardList = result.map(each => {
    let userId = each.C
    let userName = getNameById(userId)
    let title = serverUtils.b64decode(each.Title)

    let noArticleInBoard = utils.isNullTimeStamp(each.ArticleCreateTS)
    let neverSeen = utils.isNullTimeStamp(each.LastSeen)

    let articleCreateAt = unixToMoment(each.ArticleCreateTS)
    let lastSeenAt = unixToMoment(each.LastSeen)
    let updateAt = noArticleInBoard ? unixToMoment(each.UpdateTS) : articleCreateAt

    let isUnread = false;
    if (noArticleInBoard) {
      isUnread = false
    }
    else {
      if (neverSeen) {
        isUnread = true
      }
      else {
        isUnread = isUnRead(articleCreateAt, lastSeenAt)
      }
    }

    return {
      BoardType:   each.BT,
      ID:          each.ID,
      Status:      each.S,
      Title:       title,
      isUnread:    isUnread,
      CreatorID:   each.CreatorID,
      creatorName: userName,
      updateAt:    updateAt,
      joinStatus:  3
    }
  })

  let joinReqs = reqResult.map((eachJoin) => {
    return {
      CreatorID: eachJoin.C,
      NodeID: eachJoin.n,
      Name: eachJoin.N,
      Status: eachJoin.S
    }
  })

  joinReqs.forEach((join, index) => {
    let joinBoardIndex = boardList.findIndex((e) => e.ID === join.CreatorID)
    if (joinBoardIndex >= 0) {
      boardList[joinBoardIndex].joinStatus = join.Status
    } else {
      let title = serverUtils.b64decode(join.Title)

      boardList.push({
        BoardType:   BOARD_TYPE_PRIVATE,
        ID:          EMPTY_ID,
        Status:      0,
        Title:       title,
        isUnread:    false,
        CreatorID:   join.CreatorID,
        creatorName: DEFAULT_USER_NAME,
        updateAt:    moment(0),
        joinStatus:  join.Status
      })
    }
  })

  boardList = boardList.filter((each) => each.Status !== STATUS_ARRAY.indexOf('StatusMigrated') )
  boardList = boardList.filter((each) => each.BoardType === BOARD_TYPE_PRIVATE )

  if (boardList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { boardList: [], noBoard: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { boardList: boardList, noBoard: false }
    }
  }
}

export const getMoreBoards = (myId, startBoardId, limit) => {
  return (dispatch, getState) => {
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getBoards(startBoardId, limit))
      .then(({ response: { result }, type, query, error }) => {
        if (!result) {
          dispatch(postprocessGetMoreBoards(myId, null, null))
          dispatch(postprocessSetFinshLoading(myId))
        }

        let creatorIds = result.map((each) => each.C)
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessGetMoreBoards(myId, result, usersInfo))
            dispatch(postprocessSetFinshLoading(myId))
          })
      })
  }
}

const postprocessGetMoreBoards = (myId, result, usersInfo) => {
  if (!result || result.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allBoardsLoaded: true }
    }
  }

  result = result.map((each) => {
    return {
      CreatorID: each.C,
      ...each
    }
  })

  result = result.map(serverUtils.deserialize)
  result = result.slice(1)

  let boardList = result.map(each => {
    let userId = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

    let noArticleInBoard = utils.isNullTimeStamp(each.ArticleCreateTS)
    let neverSeen = utils.isNullTimeStamp(each.LastSeen)

    let articleCreateAt = unixToMoment(each.ArticleCreateTS)
    let LastSeen = unixToMoment(each.LastSeen)
    let updateAt = each.ArticleCreateTS ? articleCreateAt : unixToMoment(each.UpdateTS)

    let isUnread = false;
    if (noArticleInBoard) {
      isUnread = false
    }
    else {
      if (neverSeen) {
        isUnread = true
      }
      else {
        isUnread = isUnRead(articleCreateAt, LastSeen)
      }
    }

    return {
      BoardType:   each.BT,
      ID:          each.ID,
      Status:      each.S,
      Title:       each.Title,
      isUnread:    isUnread,
      CreatorID:   each.CreatorID,
      creatorName: userName,
      updateAt:    updateAt,
      joinStatus:  3,
    }
  })

  boardList = boardList.filter((each) => each.Status !== STATUS_ARRAY.indexOf('StatusMigrated'))
  boardList = boardList.filter((each) => each.BoardType === BOARD_TYPE_PRIVATE)

  if (boardList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allBoardsLoaded: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: ADD_BOARDS,
      data: { boards: boardList }
    }
  }
}

export const _addMoreBoards = (state, action) => {
  const { myId, data: { boards } } = action

  let boardList = state.getIn([myId, 'boardList'], Immutable.List())
  return state.setIn([myId, 'boardList'], boardList.concat(boards))
}

/*                      */
/*  Update Board List   */
/*                      */

function sentInviteMessages (inviteMessages) {
  return dispatch => Promise.all(inviteMessages.map((invite) => {
    return dispatch(serverUtils.postMessage(invite.chatId, [invite.message], []))
      .then(({ response: { result }, type, query, error }) => {
        return { 'chatId': invite.chatId }
      })
  }))
}

export const addBoard = (myId, name, userName, friendInvited) => {
  return (dispatch, getState) => new Promise(async () => {
    const { response: { result }} = await dispatch(serverUtils.createBoard(name))
    const boardId = result.ID

    const { response: { result: boardUrlResult }} = await dispatch(serverUtils.getBoardUrl(boardId))
    const { URL, UpdateTS: {T}, expirePeriod } = boardUrlResult

    // FIXME: why html dom tree ?
    let inviteMessages = Object.keys(friendInvited).filter(fID => friendInvited[fID]).map(friendId => {
      let chatId = friendInvited[friendId]
      let message = {
        type: MESSAGE_TYPE_INVITE,
        value: `<div data-action-type="join-board"
          data-board-id="${boardId}"
          data-board-name="${name}"
          data-join-key="${URL}"
          data-update-ts="${T}"
          data-expiration="${expirePeriod}">
        </div>`
      }
      return {
        chatId: chatId,
        message: JSON.stringify(message)
      }
    })

    await dispatch(sentInviteMessages(inviteMessages))
    dispatch(postprocessCreateBoard(myId, name, result, userName))
  })
}

const postprocessCreateBoard = (myId, name, result, userName) => {
  result = serverUtils.deserialize(result)

  const newBoard = {
    BoardType:   BOARD_TYPE_PRIVATE,
    ID:          result.ID,
    Status:      0,
    Title:       name,
    isUnread:    false,
    CreatorID:   EMPTY_ID, // FIXME: userId,
    creatorName: userName,
    updateAt:    moment(0),
    joinStatus:  3,
  }

  return {
    myId,
    myClass,
    type: ADD_BOARD,
    data: { board: newBoard, noBoard: false }
  }
}

export const _addBoard = (state, action) => {
  const { myId, data: { board, noBoard } } = action

  state = state.setIn([myId, 'noBoard'], noBoard)
  state = state.updateIn([myId, 'boardList'], arr => arr.push(Immutable.Map(board)))

  return state
}

export const joinBoard = (myId, boardUrl, callBack) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.joinBoard(boardUrl))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          callBack({ error: true, data: error.message, boardUrl: boardUrl })
        } else {
          callBack({ error: false, data: result })
        }
        let creatorIds = [result.C]
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessJoinBoard(myId, boardUrl, result, usersInfo))
          })
      })
  }
}

const postprocessJoinBoard = (myId, boardUrl, result, usersInfo) => {
  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let userId = result.C
  let userNameMap = usersInfo['userName'] || {}
  let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

  const joinedBoard = {
    BoardType:   BOARD_TYPE_PRIVATE,
    ID:          result.n,
    Status:      result.S,
    Title:       serverUtils.b64decode(result.N),
    isUnread:    true,
    CreatorID:   userId,
    creatorName: userName,
    updateAt:    moment(0),
    joinStatus:  0
  }

  return {
    myId,
    myClass,
    type: ADD_BOARD,
    data: { board: joinedBoard }
  }
}

/*             */
/*  Loading    */
/*             */

export const preprocessSetStartLoading = (myId) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: true }
  }
}

export const postprocessSetFinshLoading = (myId) => {
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
    data: { boardList: [], noBoard: false, isLoading: false, allBoardsLoaded: false }
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
  [ADD_BOARD]: _addBoard,
  [ADD_BOARDS]: _addMoreBoards
}, Immutable.Map())

export default reducer
