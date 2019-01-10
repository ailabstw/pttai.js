import Immutable        from 'immutable'
import { createDuck }   from 'redux-duck'

import * as utils             from './utils'
import * as serverUtils       from './ServerUtils'
import * as constants         from '../constants/Constants'

import { myDuck as appDuck }    from './App'
import { EMPTY_ID }   from '../constants/Constants'

export const myClass = 'EDIT_NAME_MODAL'

export const myDuck = createDuck(myClass, 'Edit_Name_Modal')

const INIT            = myDuck.defineType('INIT')
const ADD_CHILD       = myDuck.defineType('ADD_CHILD')
const SET_ROOT        = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS   = myDuck.defineType('REMOVE_CHILDS')
const REMOVE          = myDuck.defineType('REMOVE')
const SET_DATA        = myDuck.defineType('SET_DATA')

// init
export const init = (myId, query) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, ...query}))
    dispatch(utils.setRoot(myId, myClass, appDuck))
  }
}

export const getProfile = (myId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getMe(EMPTY_ID))
      .then(({response: { result }, type, query, error}) => {
        let boardId = result.BID
        dispatch(serverUtils.getArticles(boardId, constants.EMPTY_ID, 1, constants.LIST_ORDER_PREV))
          .then(({response: resultBoard, type, query, error}) => {
            if (resultBoard.result && resultBoard.result.length > 0) {
              let articleId = resultBoard.result[0].ID
              let blockId = resultBoard.result[0].ContentBlockID
              dispatch(serverUtils.getContent(boardId, articleId, blockId, constants.CONTENT_TYPE_ARTICLE, 0, 0, constants.LIST_ORDER_PREV))
                .then(({response: resultContent, type, query, error}) => {
                  if (resultContent.result && resultContent.result.length > 0) {
                    let content = resultContent.result[0].B.reduce((acc, cur) => {
                      return acc = [acc, serverUtils.b64decode(cur)].join(' ')
                    }, '')
                    dispatch(postprocessGetProfile(myId, content))
                  }
                })
            }
            // dispatch(postprocessGetProfile(myId, result))
          })
      })
  }
}

const postprocessGetProfile = (myId, content) => {

  content = JSON.parse(content)

  console.log('doRootPage.postprocessGetProfile: ', content)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { profile: content }
  }
}

export const editProfile = (myId, profile) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getMe(EMPTY_ID))
      .then(({response: { result }, type, query, error}) => {
        let boardId = result.BID
        dispatch(serverUtils.getArticles(boardId, constants.EMPTY_ID, 1, constants.LIST_ORDER_PREV))
          .then(({response: resultBoard, type, query, error}) => {
            if (resultBoard.result && resultBoard.result.length <= 0) {
              // create and edit article
              dispatch(serverUtils.createArticle(boardId, 'profile', [JSON.stringify({})], []))
                .then(({response: resultCreate, type, query, error}) => {
                  let articleId = resultCreate.result.AID
                  dispatch(serverUtils.updateArticle(boardId, articleId, [JSON.stringify(profile)], []))
                    .then(({response: resultUpdate, type, query, error}) => {
                      dispatch(postprocessEditProfile(myId, profile))
                    })
                })
            } else {
              // edit article
              let articleId = resultBoard.result[0].ID
              dispatch(serverUtils.updateArticle(boardId, articleId, [JSON.stringify(profile)], []))
                .then(({response: resultUpdate, type, query, error}) => {
                  dispatch(postprocessEditProfile(myId, profile))
                })
            }
          })
      })
  }
}

const postprocessEditProfile = (myId, content) => {

  content = JSON.parse(content)

  console.log('doRootPage.postprocessEditProfile: ', JSON.stringify(content))

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { profile: content }
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
