import * as api from '../middleware/api'
import { toCamelCase, toUnderscore } from '../utils/utils'

export const getDummy = (query=null) => {
  if(query === null) query = {}

  return {
    [api.CALL_API]: {
      endpoint: '/dummy',
      query: {},
    }
  }
}

export const postDummy = (data) => {
  return {
    [api.CALL_API]: {
      endpoint: '/dummy',
      method: 'post',
      params: data,
    }
  }
}

export const deserialize = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    r[toCamelCase(eachIdx)] = data[eachIdx]
    return r
  }, {})
}

export const serialize = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    r[toUnderscore(eachIdx)] = data[eachIdx]
    return r
  }, {})
}
