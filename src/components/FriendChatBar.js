import React, { PureComponent } from 'react'
import { Link }                 from 'react-router-dom'
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome'

import styles from './FriendChatBar.css'

class FriendChatBar extends PureComponent {
  render() {
    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']}>
            <Link to={`/friend`}>
              <div className={styles['prev-button-icon']}></div>
            </Link>
          </div>
          <div className={styles['friend-name']}>
          </div>
          <div hidden className={styles['search']}>
            <FontAwesomeIcon icon="search" />
          </div>
        </div>
      </div>
    )
  }
}

export default FriendChatBar
