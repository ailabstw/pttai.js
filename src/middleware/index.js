import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import api from './api'

const logger = createLogger({
  level: 'info',
  collapsed: false
})

const middlerwares = [thunk, api, logger]

export default middlerwares
