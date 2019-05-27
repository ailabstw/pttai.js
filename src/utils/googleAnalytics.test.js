jest.mock('react-ga');

import googleAnalytics, {GA_KEY} from './googleAnalytics'
import {GA_TRACKING_ID} from '../config'

// googleAnalytics.clearConfig()
// googleAnalytics.saveConfig(userId, gaAgree)

describe('googleAnalytics initialize', () => {
  /**
   * localStorage.GA_KEY {track, userId}
   * track: should be set in firstPopupModal or PrivacySettingModal
   */

  afterEach(() => {
    localStorage.clear()
  })

  it('should return false if GA_KEY not in localStorage', () => {
    const userId = 'ID_FOR_TEST'
    expect(googleAnalytics.initialize(userId)).toBe(false)
  })

  it('should return false if GA_KEY is not well-parsed', () => {
    const userId = 'ID_FOR_TEST'
    localStorage.setItem(GA_KEY, GA_TRACKING_ID)

    expect(googleAnalytics.initialize(userId)).toBe(false)
  })

  it('should return false if track is set to false', () => {
    const userId = "ID_FOR_TEST"
    const track = false

    localStorage.setItem(GA_KEY, `{"track":"${track}","userId":"${userId}"}`)
    expect(googleAnalytics.initialize(userId)).toBe(track)
  })

  it('should return true and initialize without any error if userId is not passed and not set', () => {
    const track = true

    localStorage.setItem(GA_KEY, `{"track":"${track}"}`)
    expect(googleAnalytics.initialize()).toBe(track)
    // should check wheather value of GA_KEY become 'no-user-id'
  })

  it('should return true and initialize without any error if track is well-set', () => {
    const userId = "ID_FOR_TEST"
    const track = true

    localStorage.setItem(GA_KEY, `{"track":"${track}","userId":"${userId}"}`)
    expect(googleAnalytics.initialize(userId)).toBe(track)
  })
})

describe('googleAnalytics config-modified functions', () => {
  const userId = 'ID_FOR_TEST'
  const GA_VALUE = `{"track":"true","userId":"${userId}"}`
  const setup = () => {
    localStorage.setItem(GA_KEY, GA_VALUE)
    googleAnalytics.initialize(userId)
  }

  const clear = () => localStorage.clear()

  afterEach(clear)

  it('isConfigured should work as expected', () => {
    // without init
    expect(googleAnalytics.isConfigured()).toBe(false)

    setup()
    expect(googleAnalytics.isConfigured()).toBe(true)
  })

  it('getConfig should work as expected', () => {
    // without init
    expect(googleAnalytics.getConfig()).toStrictEqual({})

    setup()
    expect(googleAnalytics.getConfig()).toStrictEqual(JSON.parse(GA_VALUE))
  })

  it('saveConfig should work as expected', () => {
    const newUserId = 'NEW_ID'

    // without init
    googleAnalytics.saveConfig(newUserId, true)
    expect(googleAnalytics.getConfig().userId).toBe(newUserId)
    expect(googleAnalytics.getConfig().track).toBe('true')
    clear()

    setup()
    googleAnalytics.saveConfig(newUserId, false)
    expect(googleAnalytics.getConfig().track).toBe('false')
    clear()

    setup()
    googleAnalytics.saveConfig(newUserId, true)
    expect(googleAnalytics.getConfig().track).toBe('true')
    clear()
  })

  it('clearConfig should work as expected', () => {
    setup()
    googleAnalytics.clearConfig()
    expect(localStorage[GA_KEY]).toBe(undefined)

    // duplicated executed
    googleAnalytics.clearConfig()
    expect(localStorage[GA_KEY]).toBe(undefined)
  })
})

describe('googleAnalytics event functions', () => {
  const userId = 'ID_FOR_TEST'
  const GA_VALUE = `{"track":"true","userId":"${userId}"}`
  const category = 'category'
  const action = 'action'

  const setup = () => {
    localStorage.setItem(GA_KEY, GA_VALUE)
    googleAnalytics.initialize(userId)
  }

  const clear = () => localStorage.clear()

  afterEach(clear)

  it('test firePageView without init', () => {
    expect(googleAnalytics.firePageView()).toBe(false)
    expect(googleAnalytics.firePageView('/whatever/path/')).toBe(false)
  })

  it('test fireEventOnProb without init', () => {
    expect(googleAnalytics.fireEventOnProb(category, action, 0)).toBe(false) // always not send
    expect(googleAnalytics.fireEventOnProb(category, action, 1)).toBe(false) // always send
    expect(googleAnalytics.fireEventOnProb(category, undefined, 1)).toBe(false) // always send
  })

  it('test fireEvent without init', () => {
    expect(googleAnalytics.fireEvent(category, action)).toBe(false)
    expect(googleAnalytics.fireEvent(category, undefined)).toBe(false) // always send
  })

  it('test firePageView', () => {
    setup()
    googleAnalytics.saveConfig('user_id', false)
    expect(googleAnalytics.firePageView()).toBe(false)
    expect(googleAnalytics.firePageView('/whatever/path/')).toBe(false)

    googleAnalytics.saveConfig('user_id', true)
    expect(googleAnalytics.firePageView()).toBe(true)
    expect(googleAnalytics.firePageView('/whatever/path/')).toBe(true)
  })

  it('test fireEventOnProb', () => {
    setup()
    expect(googleAnalytics.fireEventOnProb(category, action, 0)).toBe(false) // always not send
    expect(googleAnalytics.fireEventOnProb(category, action, 1)).toBe(true) // always send
    expect(googleAnalytics.fireEventOnProb(category, undefined, 1)).toBe(true) // always send

    googleAnalytics.saveConfig('user_id', false)
    expect(googleAnalytics.fireEventOnProb(category, action, 0)).toBe(false) // always not send
    expect(googleAnalytics.fireEventOnProb(category, action, 1)).toBe(false) // always send
    expect(googleAnalytics.fireEventOnProb(category, undefined, 1)).toBe(false) // always send
  })

  it('test fireEvent without init', () => {
    googleAnalytics.saveConfig('user_id', true)
    expect(googleAnalytics.fireEvent(category, action)).toBe(true)
    expect(googleAnalytics.fireEvent(category, undefined)).toBe(true) // always send
  })
})
