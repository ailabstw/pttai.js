import Immutable from 'immutable';
import { createDuck } from 'redux-duck'
import { fromJS } from 'immutable'
import { getUUID, toCamelCase } from '../utils/utils'
import * as utils from './utils'
import * as serverUtils from './ServerUtils'

import { myDuck as appDuck } from './App'

export const myClass = '{{cookiecutter.MODULE}}'

export const myDuck = createDuck(myClass, '{{cookiecutter.project_name}}')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')

// init
export const init = (myId, query) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, ...query}))
    dispatch(utils.setRoot(myId, myClass, appDuck))
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
}, Immutable.Map())

export default reducer
