import Immutable from 'immutable'
import { createDuck } from 'redux-duck'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

export const myClass = 'MANAGE_BOARD_MODAL'

export const myDuck = createDuck(myClass, 'Manage_Board_Modal')

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

export const getBoardJoinKey = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoardUrl(boardId))
      .then(({ response: { result }, type, query, error }) => {
        dispatch(postprocessGetBoardJoinKey(myId, result))
      })
  }
}

const postprocessGetBoardJoinKey = (myId, result) => {
  const boardJoinKey = {
    C: result.C,
    ID: result.ID,
    Pn: result.Pn,
    T: result.T,
    URL: result.URL,
    expirePeriod: result.e
  }

  console.log('doBoardPage.postprocessGetBoardJoinKey: boardJoinKey:', boardJoinKey)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardJoinKey: boardJoinKey }
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
