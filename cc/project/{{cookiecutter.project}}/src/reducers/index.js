import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import middleware from '../middleware/'
import DevTools from '../DevTools'

import app from './App'
import simple from './Simple'

const reducers = combineReducers({
  app,
  simple,
})

const enhancer = compose(
  applyMiddleware(...middleware),
  DevTools.instrument(),
)

const configure = (initialState) => {
  const store = createStore(reducers, initialState, enhancer)

  if (module.hot) {
    module.hot.accept('./', () => {
      const nextReducer = require('./').default

      store.replaceReducer(nextReducer)
    })
  }

  return store
}

export default configure
