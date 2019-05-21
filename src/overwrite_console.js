import { IS_DEBUG } from './config'

window.console.native_log = window.console.log
window.console.log = (...args) => IS_DEBUG && window.console.native_log(...args)
