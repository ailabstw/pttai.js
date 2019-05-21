import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import api from './api'
import { IS_DEBUG } from './../config'

const middlerwares = [thunk, api]

if (IS_DEBUG) {
  const logger = createLogger({
    level: 'info',
    collapsed: false
  })

  middlerwares.push(logger)
}

export default middlerwares
