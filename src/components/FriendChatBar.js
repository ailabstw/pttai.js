import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './FriendChatBar.module.scss'

import * as constants from '../constants/Constants'

const FriendChatBar = props => {
  const { friendData, /* onOpenOPLogModal, */ openNameCard, openFriendSettingMenuModal } = props

  return (
    <div className={styles['root']}>
      <div className={styles['content']}>

        <div className={styles['prev-button']}>
          <Link to={`/friend`}>
            <div className={styles['prev-button-icon']} />
          </Link>
        </div>

        <div className={styles['main-content']} onClick={openNameCard}>
          <div className={styles['profile-pic']}>
            <img src={friendData.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'} />
          </div>
          <div className={styles['friend-content']}>
            <div className={styles['name']} onClick={openNameCard}>
              {friendData.Name || constants.DEFAULT_USER_NAME }
            </div>
            <div title={friendData.ID} className={styles['job']} onClick={null/* onOpenOPLogModal */}>
              {(friendData.NameCard && friendData.NameCard.company) || constants.DEFAULT_USER_COMPANY}
            </div>
            <div hidden className={styles['description']}>
              {friendData.description}
            </div>
          </div>
        </div>

        <div className={styles['menu-wrapper']}>
          <div className={styles['menu']} onClick={() => openFriendSettingMenuModal(friendData.ID)}>
            <FontAwesomeIcon icon='ellipsis-h' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendChatBar
