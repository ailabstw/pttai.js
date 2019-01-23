import React, { PureComponent } from 'react'
import { Link }                 from 'react-router-dom'
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome'

import styles from './FriendChatBar.css'

import * as constants              from '../constants/Constants'

class FriendChatBar extends PureComponent {

  render() {
    const { friendData, onOpenOPLogModal, onOpenFriendProfileModal } = this.props

    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']}>
            <Link to={`/friend`}>
              <div className={styles['prev-button-icon']}></div>
            </Link>
          </div>
          <div className={styles['main-content']}>
            <div className={styles['profile-pic']} onClick={onOpenFriendProfileModal}>
              <img src={friendData.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'}/>
            </div>
            <div className={styles['friend-content']}>
              <div className={styles['name']} onClick={onOpenFriendProfileModal}>
                {friendData.Name || constants.DEFAULT_USER_NAME }
              </div>
              <div hidden title={friendData.ID} className={styles['job']} onClick={onOpenOPLogModal}>
               Chat ID: {friendData.ID}
              </div>
              <div hidden className={styles['description']}>
               {friendData.description}
              </div>
            </div>
          </div>

          <div hidden className={styles['friend-name']}>
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
