export const setup = () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notification')
    return Promise.reject('Browser Not Support')
  }

  if (Notification.permission === 'denied') {
    return Promise.reject('Permission Denied')
  }

  if (Notification.permission === 'default' || Notification.permission === undefined) {
    return Notification.requestPermission()
  }

  // granted
  return Promise.resolve()
}

export const show = (params) => {
  const { title, body, icon } = params || {}

  if (!title) {
    console.error(`TypeError: Wrong format. Param should be an object: {
      title: <String>,
      body: <String>,
      icon: <URL>,
      tag: <noti_id>
    }`)

    return false
  }

  const createNoti = () => new Notification(title, { body, icon })

  if (Notification.permission !== 'granted') {
    return setup().then(createNoti)
  }

  return createNoti()
}
