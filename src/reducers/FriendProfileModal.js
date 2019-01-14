import Immutable        from 'immutable'
import { createDuck }   from 'redux-duck'

import * as utils             from './utils'
import * as serverUtils       from './ServerUtils'
import * as constants         from '../constants/Constants'

import { myDuck as appDuck }    from './App'
//import { EMPTY_ID }   from '../constants/Constants'

export const myClass = 'FRIEND_PROFILE_MODAL'

export const myDuck = createDuck(myClass, 'Friend_Profile_Modal')

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

export const getFriendProfile = (myId, userId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getNameCard(userId))
      .then(({response: { result }, type, query, error}) => {
        dispatch(postprocessGetProfile(myId, result.Card))
      })
  }
}

const postprocessGetProfile = (myId, content) => {

  content = JSON.parse(content)

  console.log('doFriendProfileModal.postprocessGetProfile: ', content)

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
