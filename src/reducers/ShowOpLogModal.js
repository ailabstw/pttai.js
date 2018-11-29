import Immutable                from 'immutable';
import { createDuck }           from 'redux-duck'
import { EMPTY_ID }             from '../constants/Constants'

import * as utils               from './utils'
import * as serverUtils         from './ServerUtils'
import * as constants           from '../constants/Constants'

export const myClass = 'SHOW_OP_LOG_MODAL'

export const myDuck = createDuck(myClass, 'Show_Op_Log_Modal')

const INIT            = myDuck.defineType('INIT')
const ADD_CHILD       = myDuck.defineType('ADD_CHILD')
const SET_ROOT        = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS   = myDuck.defineType('REMOVE_CHILDS')
const REMOVE          = myDuck.defineType('REMOVE')
const SET_DATA        = myDuck.defineType('SET_DATA')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
  }
}

function getAllOpLogs(dispatch, myId, tabs, params) {
  return dispatch => Promise.all(
    tabs.map((item, index) => {
        switch(item) {
            case constants.SHOW_PTT_MASTER_TAB:
              return dispatch(serverUtils.getPttMasterOpLog(EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_PTT_MASTER_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_PTT_MASTER_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_PTT_ME_TAB:
              return dispatch(serverUtils.getPttMeOpLog(EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_PTT_ME_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_PTT_ME_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_CONTENT_BOARD_TAB:
              return dispatch(serverUtils.getContentBoardOpLog(params.boardId, EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_CONTENT_BOARD_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_CONTENT_BOARD_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_CONTENT_COMMENT_TAB:
              return dispatch(serverUtils.getContentCommentOpLog(params.boardId, EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_CONTENT_COMMENT_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_CONTENT_COMMENT_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_CONTENT_MASTER_TAB:
              return dispatch(serverUtils.getContentMasterOpLog(params.boardId, EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_CONTENT_MASTER_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_CONTENT_MASTER_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_CONTENT_MEMBER_TAB:
              return dispatch(serverUtils.getContentMemberOpLog(params.boardId, EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_CONTENT_MEMBER_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_CONTENT_MEMBER_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_FRIEND_FRIEND_TAB:
              return dispatch(serverUtils.getFriendFriendOpLog(EMPTY_ID, constants.NUM_OPLOG_PER_REQ))
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_FRIEND_FRIEND_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_FRIEND_FRIEND_TAB, 'value':res.result }
                                }
                              })
            case constants.SHOW_PTT_PEERS_TAB:
              return dispatch(serverUtils.getPeers())
                              .then(({ response: res }) => {
                                if (res.error) {
                                  return { 'error': true, 'type':constants.SHOW_PTT_PEERS_TAB, 'value':res.error.message }
                                } else {
                                  return { 'error': false, 'type':constants.SHOW_PTT_PEERS_TAB, 'value':res.result }
                                }
                              })
            default:
              return null
        }
      })
  );
}

export const getOpLogs = (myId, tabs, params) => {
  return (dispatch, getState) => {
    dispatch(getAllOpLogs(dispatch, myId, tabs, params))
      .then((maps) => {
        dispatch(postprocessGetOpLogs(myId, maps))
      })
  }
}

const postprocessGetOpLogs = (myId, maps) => {

  const opLogs = maps.reduce((accumulator, currentValue) => {

    if (currentValue.error) {
      return accumulator
    } else if (currentValue.type === constants.SHOW_PTT_PEERS_TAB) {
      accumulator[currentValue.type] = currentValue.value
    } else {
      accumulator[currentValue.type] = currentValue.value.map((item) => item['O'])//.map(serverUtils.deserialize)
    }
    return accumulator
  },{})

  console.log('doShowOpLogModal.postprocessGetOpLogs: opLogs:', opLogs)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { opLogs: opLogs }
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
}, Immutable.Map())

export default reducer
