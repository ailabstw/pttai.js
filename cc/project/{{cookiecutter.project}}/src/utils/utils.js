import uuid from 'node-uuid'
import Immutable from 'immutable'
import camelCase from 'camelcase'
import decamelize from 'decamelize'
import QueryString from 'query-string'

const GLOBAL_IDS = new Set()

export const getUUID = () => {
  let theID = ''
  while(true) {
    theID = uuid.v4()
    if(GLOBAL_IDS.has(theID))
      continue

    GLOBAL_IDS.add(theID)
    break

  }
  return theID
}

export const isUUID = (val) => typeof val === 'string' && val.length === 36

export const dictListToMap = (dictList, key) => {
  let theMap = dictList.reduce((o, x, i) => {
    let idx = x[key]
    o[idx] = x
    return o
  }, {})
  let theIds = Object.keys(theMap)

  return [theIds, theMap]
}

export const purifyDictListEmptyToStr = (item) => {
  if(typeof item === 'object') return ''

  return item
}

export const delay = (milliseconds) => new Promise(() => {
  setTimeout(() => {Promise.resolve()}, milliseconds)
})

export const delayFunc = (func, params, milliseconds=200) => setTimeout(() => {func(...params)}, milliseconds)

export const queryToString = (query) => {
  if(!query) return ''

  return Object.keys(query).reduce((acc, cur) => {
    if (!query[cur]) return acc
    return acc += `${cur}=${query[cur]}&`
  }, '')
}

export const parseQueryString = (str) => QueryString.parse(str)

export const getRoot = (state) => {
  const {app} = state
  let rootId = app.get('rootId', '')
  let rootClass = app.get('rootClass', '')
  let camelCasedClass = toCamelCase(rootClass)

  if(!state[camelCasedClass]) return Immutable.Map()

  return state[camelCasedClass].get(rootId, Immutable.Map())
}

export const getRootId = (state) => {
  const {app} = state
  if(!app) return ''
  return app.get('rootId', '')
}

export const getChildId = (me, child) => me.getIn(['children', child, 0], '')

export const getChildIds = (me, child) => me.getIn(['children', child], Immutable.List())

export const toCamelCase = (str) => camelCase(str)

export const toUnderscore = (str) => decamelize(str)
