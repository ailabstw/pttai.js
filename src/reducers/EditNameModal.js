import Immutable        from 'immutable'
import { createDuck }   from 'redux-duck'

import * as utils             from './utils'
import * as serverUtils       from './ServerUtils'

import { myDuck as appDuck }    from './App'
import { DEFAULT_USER_NAMECARD,
         DEFAULT_USER_IMAGE }   from '../constants/Constants'

export const myClass = 'EDIT_NAME_MODAL'

export const myDuck = createDuck(myClass, 'Edit_Name_Modal')

const INIT            = myDuck.defineType('INIT')
const ADD_CHILD       = myDuck.defineType('ADD_CHILD')
const SET_ROOT        = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS   = myDuck.defineType('REMOVE_CHILDS')
const REMOVE          = myDuck.defineType('REMOVE')
const SET_DATA        = myDuck.defineType('SET_DATA')
const UPDATE_DATA     = myDuck.defineType('UPDATE_DATA')

// init
export const init = (myId, query) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, ...query}))
    dispatch(utils.setRoot(myId, myClass, appDuck))
  }
}

export const getProfile = (myId, userId) => {
  return (dispatch, getState) => {
    Promise.all([
      dispatch(serverUtils.getNameCard(userId)),
      dispatch(serverUtils.getUserImg(userId))
    ]).then( data => {
      const [nameCardData, userImgData] = data

      let nameCard = nameCardData.response.result.C ? JSON.parse(serverUtils.b64decode(nameCardData.response.result.C)) : DEFAULT_USER_NAMECARD
      let userImg  = userImgData.response.result.I ? userImgData.response.result.I : DEFAULT_USER_IMAGE

      dispatch(postprocessGetProfile(myId, { ...nameCard, userImg }))
    })
  }
}

const postprocessGetProfile = (myId, profile) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { profile }
  }
}

// UPDATE

export const editProfile = (myId, profile) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.setMyNameCard(JSON.stringify(profile)))
      .then(({response: { result }, type, query, error}) => {
        dispatch(postprocessEditProfile(myId, profile))
      })
  }
}

const postprocessEditProfile = (myId, content) => {

  return {
    myId,
    myClass,
    type: UPDATE_DATA, /* UPDATE_DATA will merge the updated object with original */
    data: { profile: content }
  }
}

export const editName = (myId, name) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.editName(name))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessEditName(myId, name, result))
      })
  }
}

const postprocessEditName = (myId, name, result) => {

  result = serverUtils.deserialize(result)

  const combinedUserInfo = {
    createTime:   result.CT,
    userID:       result.ID,
    userName:     result.N,
    status:       result.S,
    updateTime:   result.UT,
    version:      result.V,
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA, /* UPDATE_DATA will merge the updated object with original */
    data: { profile: combinedUserInfo }
  }
}


export const editProfileImg = (myId, imgBase64) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.editProfileImg(imgBase64))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessEditProfileImg(myId, imgBase64))
      })
  }
}

const postprocessEditProfileImg = (myId, imgBase64) => {
  const combinedUserInfo = {
    userImg: imgBase64
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA,
    data: { profile: combinedUserInfo }
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
  [UPDATE_DATA]:    utils.reduceUpdateData,
}, Immutable.Map())

export default reducer
