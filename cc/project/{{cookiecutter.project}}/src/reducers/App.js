import { createDuck } from 'redux-duck'
import Immutable from 'immutable'

import { getUUID, toCamelCase } from '../utils/utils'
import * as utils from './utils'

import * as doSimple from './Simple'

export const myClass = 'APP'

export const myDuck = createDuck(myClass, '{{cookiecutter.project_name}}')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')
const INCREASE_COUNT = myDuck.defineType('INCREASE_COUNT')

// init
export const init = (myId, query) => {
  let simpleId = getUUID()
  
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, count: 0, ...query}))
    dispatch(utils.setRoot(myId, myClass, myDuck))

    dispatch(doSimple.init(simpleId, myId, myClass, myDuck))
  }
}

// increase count
export const increaseCount = (myId) => ({
  myId,
  myClass,
  type: INCREASE_COUNT,
})

const _increaseCount = (state, action) => {
  const {myId} = action
  let count = state.getIn([myId, 'count'], 0)
  return state.setIn([myId, 'count'], count + 1)
}

// increase count2
export const increaseCount2 = (myId) => {
  return (dispatch, getState) => {
    let stateClass = toCamelCase(myClass)
    let state = getState()[stateClass]
    if(!state) return
    let me = state.get(myId)
    if(!me) return
    let count = me.get('count', 0) + 1
    dispatch(utils.setData(myId, myClass, myDuck, {count}))
  }
}

// add simple
export const addSimple = (myId) => {
  let simpleId = getUUID()
  
  return (dispatch, getState) => {
    dispatch(doSimple.init(simpleId, myId, myClass, myDuck))
  }
}

// remove simple
export const removeSimples = (myId, simpleIds) => {
  return (dispatch, getState) => {
    dispatch(utils.removeChilds(myId, myClass, myDuck, simpleIds, doSimple.myClass))
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
  [INCREASE_COUNT]: _increaseCount,
}, Immutable.Map())

export default reducer
