import React, { PureComponent } from 'react'
import { Link }                 from 'react-router-dom'
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome'

import styles from './FriendChatBar.css'

import * as constants              from '../constants/Constants'

class FriendChatBar extends PureComponent {

  render() {
    const { friendData, /*onOpenOPLogModal,*/ onOpenFriendProfileModal } = this.props

    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']}>
            <Link to={`/friend`}>
              <div className={styles['prev-button-icon']}></div>
            </Link>
          </div>
          <div className={styles['main-content']} onClick={onOpenFriendProfileModal}>
            <div className={styles['profile-pic']}>
              <img src={friendData.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'}/>
            </div>
            <div className={styles['friend-content']}>
              <div className={styles['name']} onClick={onOpenFriendProfileModal}>
                {friendData.Name || constants.DEFAULT_USER_NAME }
              </div>
              <div title={friendData.ID} className={styles['job']} onClick={null/*onOpenOPLogModal*/}>
                {friendData.NameCard && friendData.NameCard.company ? friendData.NameCard.company : constants.DEFAULT_USER_COMPANY}
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
