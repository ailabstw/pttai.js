import Immutable from 'immutable'
import { toCamelCase, toUnderscore } from '../utils/utils'

// init
export const init = ({myId, myClass, myDuck, parentId, parentClass, parentDuck, ...params}) => {
  return (dispatch, getState) => {
    dispatch(initCore({myId, myClass, myDuck, parentId, parentClass, parentDuck, ...params}))
    if(parentId)
      dispatch(addChild(parentId, parentClass, parentDuck, myId, myClass))
  }
}

const initCore = ({myId, myClass, myDuck, parentId, parentClass, parentDuck, ...params}) => ({
  myId,
  myClass,
  type: myDuck.defineType('INIT'),
  parentId,
  parentClass,
  parentDuck,
  ...params,
})

export const reduceInit = (state, action) => {
  const {myId, myClass, parentId, parentClass, parentDuck, type, ...params} = action

  let currentList = state.get('ids', Immutable.List())
  let newList = currentList.push(myId)
  
  return state.merge({ids: newList, [myId]: {myClass, parentId, parentClass, parentDuck, ...params}})
}

// set-root
export const setRoot = (myId, myClass, appDuck) => ({
  myId,
  rootClass: myClass,
  type: appDuck.defineType('SET_ROOT'),
})

export const reduceSetRoot = (state, action) => {
  const {myId, rootClass} = action
  return state.merge({rootId: myId, rootClass})
}

// addChild
export const addChild = (myId, myClass, myDuck, childId, childClass) => ({
  myId,
  myClass,
  type: myDuck.defineType('ADD_CHILD'),
  childId,
  childClass,
})

export const reduceAddChild = (state, action) => {
  const {myId, childId, childClass} = action
  let currentList = state.getIn([myId, 'children', childClass], Immutable.List())
  let newList = currentList.push(childId)
  return state.setIn([myId, 'children', childClass], newList)
}

// remove-childs
export const removeChilds = (myId, myClass, myDuck, childIds, childClass) => ({
  myId,
  myClass,
  type: myDuck.defineType('REMOVE_CHILDS'),
  childIds,
  childClass,
})

export const reduceRemoveChilds = (state, action) => {
  const {myId, childIds, childClass} = action
  let childIdSet = new Set(childIds)
  let currentList = state.getIn([myId, 'children', childClass], Immutable.List())
  let newList = currentList.filter((eachId) => !childIdSet.has(eachId))
  return state.setIn([myId, 'children', childClass], newList)
}

// remove
export const remove = (myIds, myClass, myDuck) => {
  return (dispatch, getState) => {
    let stateClass = toCamelCase(myClass)
    let state = getState()[stateClass]
    if(!state) return

    // remove children from parents
    let childIdInfosByParents = parseChildIdInfosByParents(state, myIds)
    Object.keys(childIdInfosByParents).map((eachParentId) => {
      const {parentClass, parentDuck, childIds} = childIdInfosByParents[eachParentId]
      dispatch(removeChilds(eachParentId, parentClass, parentDuck, childIds, myClass))
    })

    // remove self
    dispatch(removeCore(myIds, myClass, myDuck))
  }
}

const parseChildIdInfosByParents = (state, myIds) => {
  let childIdInfosByParents = myIds.reduce((r, eachId, i) => {
    let me = state.get(eachId)
    if(!me) return r
    let parentId = me.get('parentId')
    if(!parentId) return r
    
    if(!r.hasOwnProperty(parentId)) {
      let parentClass = me.get('parentClass')
      let parentDuck = me.get('parentDuck').toJS()
      r[parentId] = {parentClass, parentDuck, childIds: []}
    }
    
    r[parentId].childIds.push(eachId)
    return r
  }, {})

  return childIdInfosByParents
}

const removeCore = (myIds, myClass, myDuck) => ({
  myIds,
  myClass,
  type: myDuck.defineType('REMOVE'),
})

export const reduceRemove = (state, action) => {
  const {myIds} = action
  let myIdSet = new Set(myIds)
  let ids = state.get('ids', Immutable.List())
  
  // set new ids
  let newIds = ids.filter((eachId) => !myIdSet.has(eachId))
  let newState = state.set('ids', newIds)
  
  // delete items
  myIds.map((eachId) => {newState = newState.delete(eachId)})
  
  return newState
}

// set-data
export const setData = (myId, myClass, myDuck, data) => ({
  myId,
  myClass,
  type: myDuck.defineType('SET_DATA'),
  data,
})

export const reduceSetData = (state, action) => {
  const {myId, data} = action
  return state.mergeIn([myId], data)
}
