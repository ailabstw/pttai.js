import { setup, show } from './notification'

const mockNotification = () => {
  window.Notification = function(title, options) {
    this.title = title
    this.body = options && options.body
    this.icon = options && options.icon
  }
  Notification.permission = 'denied'
  Notification.requestPermission = jest.fn(() => {
    Notification.permission = 'granted'
  }).mockReturnValue(Promise.resolve())
}


describe('setup', () => {
  it('should work without error', async (done) => {
    const executeSetup = () => setup()
    const requestPermission = () => window.Notification.requestPermission().catch(err => err)
    const asyncAsserts = []

    expect.assertions(5);

    await executeSetup().catch(err => { expect(err).toBe('Browser Not Support') })

    mockNotification()

    window.Notification.permission = 'denied'
    await executeSetup().catch(err => expect(err).toBe('Permission Denied'))

    window.Notification.permission = 'default'
    expect(executeSetup()).toStrictEqual(requestPermission())

    window.Notification.permission = undefined
    expect(executeSetup()).toStrictEqual(requestPermission())

    window.Notification.permission = 'granted'
    expect(executeSetup()).toStrictEqual(Promise.resolve())

    done()
  })
})

describe('show', () => {
  const title = 'THE_TITLE'
  const body = 'THE_BODY'
  const icon = '/path/to/icon.png'

  it('should return false if title is not passed', () => {
    window.Notification.permission = 'granted'

    expect(show()).toBe(false)
    expect(show(title)).toBe(false)

    expect(show({title})).toStrictEqual(new Notification(title))
    expect(show({title,body})).toStrictEqual(new Notification(title,{body}))
    expect(show({title,body,icon})).toStrictEqual(new Notification(title,{body,icon}))

    window.Notification.permission = 'default' // not granted
    expect(show({title})).toStrictEqual(Promise.resolve())
  })
})
