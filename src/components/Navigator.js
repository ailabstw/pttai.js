import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import styles from './Navigator.module.css'

class Navigator extends PureComponent {
  render () {
    const { hubHasUnread, friendListHasUnread, onHubClicked, onFriendClicked, isChatRoom } = this.props

    // for chatpage collapse
    let rootClass = styles['root']
    if (isChatRoom) { rootClass += ' ' + styles['collapsed'] }

    // for active tab state change
    let tabOneClass = 'inactive'
    let tabTwoClass = 'inactive'
    if (this.props.match.url.indexOf(`/hub`) === 0 ||
        this.props.match.url.indexOf(`/board`) === 0) {
      tabOneClass = 'active'
    } else {
      tabTwoClass = 'active'
    }

    let tabOneClasses = [styles[tabOneClass]]
    let tabTwoClasses = [styles[tabTwoClass]]

    if (hubHasUnread) {
      tabOneClasses += ' ' + styles['unread']
    }

    if (friendListHasUnread) {
      tabTwoClasses += ' ' + styles['unread']
    }

    return (
      <div className={rootClass}>
        <div className={styles['content']}>

          <ul className={styles['tabs']}>
            <li className={tabTwoClasses} onClick={onFriendClicked}>
              <Link id='friend-tab' to={`/friend`} className={styles['content-block']}>
                <div className={styles['tab2-icon']} />
                <div className={styles['tab2-text']}>
                  <FormattedMessage
                    id='navigator.tab2'
                    defaultMessage='Friends'
                  />
                </div>
              </Link>
            </li>
            <li className={tabOneClasses} onClick={onHubClicked}>
              <Link to={`/hub`} className={styles['content-block']}>
                <div className={styles['tab1-icon']} />
                <div className={styles['tab1-text']}>
                  <FormattedMessage
                    id='navigator.tab1'
                    defaultMessage='Latest'
                  />
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Navigator
