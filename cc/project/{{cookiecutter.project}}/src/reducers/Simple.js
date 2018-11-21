import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import { getUUID, toCamelCase } from '../utils/utils'
import * as utils from './utils'

export const myClass = 'SIMPLE'

export const myDuck = createDuck(myClass, '{{cookiecutter.project_name}}')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')

// init
export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
  }
}

// remove
export const remove = (myId) => {
  return (dispatch, getState) => {
    dispatch(utils.remove([myId], myClass, myDuck))
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]: utils.reduceInit,
  [ADD_CHILD]: utils.reduceAddChild,
  [REMOVE_CHILDS]: utils.reduceRemoveChilds,
  [REMOVE]: utils.reduceRemove,
  [SET_DATA]: utils.reduceSetData,
}, Immutable.Map())

export default reducer
