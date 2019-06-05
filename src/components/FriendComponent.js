import React, { PureComponent } from 'react'

// import FriendBar            from '../components/FriendBar'
import FriendListComponent from '../components/FriendListComponent'

import styles from './FriendComponent.module.scss'

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
          openFriendSettingMenuModal={openFriendSettingMenuModal}
          addFriendAction={addFriendAction}
        />
      </div>
    )
  }
}

export default FriendComponent
