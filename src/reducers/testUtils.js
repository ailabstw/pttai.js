import { createStore,
         applyMiddleware }  from 'redux'
import { FlushThunks }      from 'redux-testkit'
import thunk                from 'redux-thunk'

import { reducers }         from './index'
import { CALL_API,
         API_TYPES }        from '../middleware/api'

const callMockApi = (mockdata, endpoint, { query, method = 'get', params, files, json }, isWithCredentials=true) => {

    return new Promise(function(resolve, reject) {
      if (true) {
        resolve({
            result: mockdata[json['method']]
        });
      } else {
        reject({});
      }
    });
}

const mockApi = (mockdata) => store => next => action => {

  const callAPI = action[CALL_API]

  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint, method, query, params, files, json } = callAPI
  const { bailout } = callAPI
  let types = typeof callAPI.types === 'undefined' ? API_TYPES : callAPI.types

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }

  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }

  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings. types:', types)
  }

  if (typeof bailout !== 'undefined' && typeof bailout !== 'function') {
    throw new Error('Expected bailout to either be undefined or a function.')
  }

  if (bailout && bailout(store.getState())) {
    return Promise.resolve()
  }

  let actionWith = (data) => {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [requestType, successType, failureType] = types

  next(actionWith({ type: requestType }))

  return callMockApi(mockdata, endpoint, { method, query, params, files, json }).then(
    response => {
      return next(actionWith({
        response,
        query,
        type: successType
      }))
    },
    error => {
      return next(actionWith({
        type: failureType,
        error: error.message || 'Something bad happened'
      }))
    }
  )
}


export const setupStore = (mockdata) => {
    const middlerwares = [FlushThunks.createMiddleware(), thunk, mockApi(mockdata)]
    const store = createStore(reducers, applyMiddleware(...middlerwares));

    return store
}
