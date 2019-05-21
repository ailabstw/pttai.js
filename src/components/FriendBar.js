import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './FriendBar.module.scss'

class FriendBar extends PureComponent {
  render () {
    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']} />
          <div className={styles['board-name']}>
            <FormattedMessage
              id='friendbar.title'
              defaultMessage='Friend List'
            />
          </div>
          <div hidden className={styles['search']}>
            <FontAwesomeIcon icon='search' />
          </div>
        </div>
      </div>
    )
  }
}

export default FriendBar
