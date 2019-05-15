import config from 'config'
import ReactGA from 'react-ga'

const GA_KEY = 'ga_is_on_for_pttai'

let googleAnalytics = (() => {
  let _initialized = false

  let _shouldTrack = () => {
    return localStorage.hasOwnProperty(GA_KEY) && JSON.parse(localStorage.getItem(GA_KEY)).track === 'true'
  }

  let _initialize = (userId) => {
    // Make sure it is initialized only once
    if (!_shouldTrack()) return false

    if (_initialized) return true

    let gaUserId = userId || (
      localStorage.hasOwnProperty(GA_KEY) ? JSON.parse(localStorage.getItem(GA_KEY)).userId : 'no-user-id'
    )

    ReactGA.initialize(config.GA_TRACKING_ID, {
      debug: true,
      titleCase: false,
      testMode: false,
      gaOptions: {
        userId: gaUserId
      }
    })

    _initialized = true
    console.log('[GA] setup with ', gaUserId)

    return true
  }

  return {

    isConfigured: () => {
      return localStorage.hasOwnProperty(GA_KEY)
    },
    getConfig: () => {
      if (localStorage.hasOwnProperty(GA_KEY)) {
        return JSON.parse(localStorage.getItem(GA_KEY))
      }
      return {}
    },
    saveConfig: (userId, doTrack) => {
      localStorage.setItem(GA_KEY, JSON.stringify({
        track: doTrack.toString(),
        userId: userId
      }))
      console.log('[GA] config saved to localStorage: ', userId, ', track:', doTrack)
    },
    clearConfig: () => {
      if (localStorage.hasOwnProperty(GA_KEY)) {
        localStorage.removeItem(GA_KEY)
        console.log('[GA] cleared on localStorage')
      }
    },
    initialize: (userId) => {
      return _initialize(userId)
    },
    firePageView: (path) => {
      if (!_shouldTrack()) return

      if (!_initialized) _initialize()

      let urlPath = path || window.location.pathname + window.location.search

      ReactGA.pageview(urlPath)
      console.log('[GA] pageview: ', urlPath)
    },
    fireEventOnProb: (category, action, probability) => {
      if (Math.random() > probability) return

      if (!_shouldTrack()) return

      if (!_initialized) _initialize()

      ReactGA.event({
        category: category,
        action: action || 'no-action-name'
      })
      console.log('[GA] event: ', category, action)
    },
    fireEvent: (category, action) => {
      if (!_shouldTrack()) return

      if (!_initialized) _initialize()

      ReactGA.event({
        category: category,
        action: action || 'no-action-name'
      })
      console.log('[GA] event: ', category, action)
    }
  }
})()

export default googleAnalytics
