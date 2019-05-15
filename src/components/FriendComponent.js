import React, { PureComponent } from 'react'

// import FriendBar            from '../components/FriendBar'
import FriendListComponent from '../components/FriendListComponent'

import styles from './FriendComponent.css'

class FriendComponent extends PureComponent {
  render () {
    const { friendList, addFriendAction, userName, isLoading, onGetMoreFriends, allFriendsLoaded, noFriend, openFriendSettingMenuModal } = this.props

    return (
      <div className={styles['root']}>
        {/*
          <FriendBar />
        */}
        <FriendListComponent
          userName={userName}
          isLoading={isLoading}
          noFriend={noFriend}
          friendList={friendList}
          onGetMoreFriends={onGetMoreFriends}
          allFriendsLoaded={allFriendsLoaded}
          openFriendSettingMenuModal={openFriendSettingMenuModal} />
        <div className={styles['add-icon-container']}>
          <div className={styles['add-icon-subcontainer']}>
            <div className={styles['add-icon-container']}>
              <div className={styles['add-icon-subcontainer']}>
                <div id='add-friend-button' className={styles['add-icon']} onClick={addFriendAction} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default FriendComponent
