import Immutable        from 'immutable';
import { createDuck }   from 'redux-duck'

import { EMPTY_ID,
         NUM_BOARD_PER_REQ,
         DEFAULT_USER_NAME,
         MESSAGE_TYPE_INVITE } from '../constants/Constants'

import * as utils       from './utils'
import * as serverUtils from './ServerUtils'

export const myClass = 'HUB_PAGE'

export const myDuck = createDuck(myClass, 'hub_page')

const INIT          = myDuck.defineType('INIT')
const ADD_CHILD     = myDuck.defineType('ADD_CHILD')
const SET_ROOT      = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE        = myDuck.defineType('REMOVE')
const SET_DATA      = myDuck.defineType('SET_DATA')
const ADD_BOARD     = myDuck.defineType('ADD_BOARD')
const ADD_BOARDS    = myDuck.defineType('ADD_BOARDS')
const DELETE_BOARD  = myDuck.defineType('DELETE_BOARD')

export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
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
      Status:           each.S,
      Title:            each.Title,
      ArticleCreateTS:  each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(),
      UpdateTS:         each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      LastSeen:         each.LastSeen ? each.LastSeen : utils.emptyTimeStamp(),
      CreatorID:        each.CreatorID,
      creatorName:      userName,
    }
  })

  console.log('doHubPage.postprocessGetBoardList: boardList:', boardList)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardList: boardList }
  }
}

export const getMoreBoards = (myId, startBoardId, limit) => {
  return (dispatch, getState) => {
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getBoards(startBoardId, limit))
      .then(({response: {result}, type, query, error}) => {
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

  const boardList = result.map(each => {

    let userId      = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

    return {
      ID:               each.ID,
      creatorName:      userName,
      Status:           each.S,
      Title:            each.Title,
      ArticleCreateTS:  each.ArticleCreateTS ? each.ArticleCreateTS : utils.emptyTimeStamp(),
      LastSeen:         each.LastSeen ? each.LastSeen : utils.emptyTimeStamp(),
      UpdateTS:         each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
    }
  })

  console.log('doHubPage.postprocessGetMoreBoards: boardList:', boardList)

  if (boardList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: {allBoardsLoaded: true}
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

  const {myId, data: { boards }} = action

  let boardList = state.getIn([myId, 'boardList'], Immutable.List())
  return state.setIn([myId, 'boardList'], boardList.concat(boards))
}


/*                      */
/*  Update Board List   */
/*                      */

export const setBoardName = (myId, boardId, name) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.setBoardName(boardId, name))
      .then(({response: {result}, type, query, error}) => {
          dispatch(serverUtils.getBoards(EMPTY_ID, NUM_BOARD_PER_REQ))
            .then(({response: {result}, type, query, error}) => {
              let creatorIds = result.map((each) => each.C)
              dispatch(serverUtils.getUsersInfo(creatorIds))
                .then((usersInfo) => {
                  dispatch(postprocessGetBoardList(myId, result, usersInfo))
                })
            })
    })
  }
}

function sentInviteMessages(inviteMessages) {
  return dispatch => Promise.all(inviteMessages.map((invite) => {
      return dispatch(serverUtils.postMessage(invite.chatId, [invite.message], []))
        .then(({response: {result}, type, query, error}) => {
          return { 'chatId': invite.chatId }
        })
  }));
}

export const addBoard = (myId, name, userName, friendInvited) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.createBoard(name))
      .then(({response: {result}, type, query, error}) => {
        const boardId = result.ID
        dispatch(serverUtils.getBoardUrl(boardId))
          .then(({response: boardUrlResult, type, query, error}) => {

            const boardJoinKey = {
              C:            boardUrlResult.result.C,
              ID:           boardUrlResult.result.ID,
              Pn:           boardUrlResult.result.Pn,
              T:            boardUrlResult.result.T,
              URL:          boardUrlResult.result.URL,
              UpdateTS:     boardUrlResult.result.UT ? boardUrlResult.result.UT : utils.emptyTimeStamp(),
              expirePeriod: boardUrlResult.result.e,
            }

            let inviteMessages = Object.keys(friendInvited).filter(fID => friendInvited[fID]).map(friendId => {
              let chatId = friendInvited[friendId]
              let message = {
                type:   MESSAGE_TYPE_INVITE,
                value:  `<div data-action-type="join-board" data-board-id="${boardId}" data-board-name="${name}" data-join-key="${boardJoinKey.URL}" data-update-ts="${boardJoinKey.UpdateTS.T}" data-expiration="${boardJoinKey.expirePeriod}"></div>`
              }
              return {
                chatId: chatId,
                message: JSON.stringify(message),
              }
            })

            dispatch(sentInviteMessages(inviteMessages))
              .then(({response: inviteResult, type, error, query}) => {
                dispatch(postprocessCreateBoard(myId, name, result, userName))
              })
          })
      })
  }
}

const postprocessCreateBoard = (myId, name, result, userName) => {

  result = serverUtils.deserialize(result)

  const newBoard = {
      ID:               result.ID,
      Status:           0,
      Title:            name,
      creatorName:      userName,
      ArticleCreateTS:  utils.emptyTimeStamp(),
      UpdateTS:         utils.emptyTimeStamp(),
      LastSeen:         utils.emptyTimeStamp(),
  }

  console.log('doHubPage.postprocessCreateBoard: newBoard:', newBoard)

  return {
    myId,
    myClass,
    type: ADD_BOARD,
    data: { board: newBoard }
  }
}

export const _addBoard = (state, action) => {

  const {myId, data: { board }} = action

  let boardList = state.getIn([myId, 'boardList'], Immutable.List())
  return state.setIn([myId, 'boardList'], boardList.push(Immutable.Map(board)))
}

export const joinBoard = (myId, boardUrl, callBack) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.joinBoard(boardUrl))
      .then(({response: {result, error}, type, query }) => {
        if (error) {
          callBack({error: true, data: error.message, boardUrl: boardUrl})
        } else {
          callBack({error: false, data: result})
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

  let userId      = result.C
  let userNameMap = usersInfo['userName'] || {}
  let userName    = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME

  const joinedBoard = {
      ID:               result.n,
      Status:           result.S,
      creatorName:      userName,
      Title:            serverUtils.b64decode(result.N),
      ArticleCreateTS:  utils.emptyTimeStamp(),
      LastSeen:         utils.emptyTimeStamp(),
      CreateTS:         utils.emptyTimeStamp(),
      UpdateTS:         utils.emptyTimeStamp(),
  }

  console.log('doHubPage.postprocessJoinBoard: joinedBoard:', joinedBoard)

  return {
    myId,
    myClass,
    type: ADD_BOARD,
    data: { board: joinedBoard }
  }
}

export const deleteBoard = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteBoard(boardId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessDeleteBoard(myId, boardId))
      })
  }
}

const postprocessDeleteBoard = (myId, boardId) => {

  return {
    myId,
    myClass,
    type: DELETE_BOARD,
    data: { boardId: boardId }
  }
}

export const _deleteBoard = (state, action) => {
  const {myId, data:{boardId}} = action

  let boardList = state.getIn([myId, 'boardList'], Immutable.List())
  boardList = boardList.filter(each => { return each.get('ID') !== boardId })

  return state.setIn([myId, 'boardList'], boardList)
}

/*             */
/*  Loading    */
/*             */


const preprocessSetStartLoading = (myId) => {
  console.log('doHubPage.preprocessSetStartLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: true }
  }
}

const postprocessSetFinshLoading = (myId) => {
  console.log('doHubPage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: false }
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
  [ADD_BOARD]:      _addBoard,
  [ADD_BOARDS]:     _addMoreBoards,
  [DELETE_BOARD]:   _deleteBoard,
}, Immutable.Map())

export default reducer
