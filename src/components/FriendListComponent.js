import React, { PureComponent } from 'react'
import { BeatLoader, ClipLoader } from 'react-spinners'

import { Link } from 'react-router-dom'
import { injectIntl,
  FormattedMessage } from 'react-intl'

import { getStatusClass } from '../utils/utils'
import { epoch2ReadFormat } from '../utils/utilDatetime'

import * as constants from '../constants/Constants'

import styles from './FriendListComponent.module.scss'

class FriendListComponent extends PureComponent {
  constructor (props) {
    super()
    this.topItem = null
    this.onMenuTrigger = this.onMenuTrigger.bind(this)
    this.needFetchMore = this.needFetchMore.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  needFetchMore () {
    const { isLoading, allFriendsLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allFriendsLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll () {
    if (this.needFetchMore()) {
      const { onGetMoreFriends, friendList } = this.props

      let startFriendId = friendList[0].friendID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0 ? null : this.scroller.childNodes[0].childNodes[0]
      onGetMoreFriends(startFriendId)
    }
  }

  onMenuTrigger (e, item) {
    const { openFriendSettingMenuModal } = this.props
    e.preventDefault()
    e.stopPropagation()
    openFriendSettingMenuModal(item.chatId)
  }

  render () {
    const { friendList, userName, noFriend, isLoading, intl } = this.props

    if (noFriend) {
      return (
        <div className={styles['root']} onScroll={this.handleScroll} ref={scroller => { this.scroller = scroller }}>
          <div className={styles['no-content-message']}>
            <FormattedMessage
              id='friend-list-component.message'
              defaultMessage='You have no friend yet, click below button to add'
            />
          </div>
          <div className={styles['spinner-item']}>
            <BeatLoader color={'#aaa'} size={10} loading={false} />
          </div>
        </div>
      )
    }

    let friendSortedList = friendList.sort((a, b) => b.Summary.updateTS.T - a.Summary.updateTS.T)
      .filter((friend) => friend.FriendStatus < constants.STATUS_ARRAY.indexOf('StatusDeleted'))

    return (
      <div className={styles['root']} onScroll={this.handleScroll} ref={scroller => { this.scroller = scroller }}>
        <div>
          {
            isLoading ? (
              <div className={styles['loader']}>
                <ClipLoader color={'#aaa'} size={35} loading={isLoading} />
              </div>
            ) : (null)
          }
          {
            friendSortedList.map((item, index) => {
              const { friendID, chatId, Summary, Name, Img, company, FriendStatus, joinStatus, isUnread } = item

              const friendLink = (friendID && chatId) ? `/friend/${friendID}/chat/${chatId}` : '#'

              return (
                <div className={styles['list-item'] + ' ' + (isUnread ? styles['unread'] : '')} key={index}>
                  <Link to={friendLink}>
                    <div className={styles['list-item-author']}>
                      <div className={styles['list-item-author-pic']}>
                        <img src={Img} alt={'Friend Profile'} />
                      </div>
                      <div title={constants.STATUS_ARRAY[FriendStatus]} className={styles['list-item-author-status']}>
                        <div className={styles['list-item-author-status-circle'] + ' ' + styles[getStatusClass(FriendStatus)]} />
                      </div>
                    </div>
                    <div className={styles['list-item-main']}>
                      <div className={styles['list-item-header']}>
                        <div className={styles['list-item-title']}>
                          {Name}
                          {
                            constants.JOIN_STATUS_ARRAY[joinStatus] === 'JoinStatusAccepted'
                              ? '' : `(${intl.formatMessage({ id: 'friend-list-component.syncing' })})`
                          }
                        </div>
                        <div className={styles['list-item-time']}>
                          {
                            Summary.updateTS.T ? epoch2ReadFormat(Summary.updateTS.T) : ''
                          }
                        </div>
                      </div>
                      <div className={styles['list-item-description']}>
                        { company }
                      </div>
                      <div className={styles['list-item-content']}>
                        {
                          Summary.type === constants.MESSAGE_TYPE_INVITE ? (
                            <FormattedMessage
                              id='friend-list-component.message2'
                              defaultMessage='\u2605 {INVITING_USER_NAME} invited {INVITED_USER_NAME} to join a board'
                              values={{ INVITING_USER_NAME: Summary.userName, INVITED_USER_NAME: (friendID === Summary.userID) ? userName : Name }}
                            />
                          ) : (
                            <span>{Summary.content}</span>
                          )
                        }
                      </div>
                    </div>
                    <div className={styles['list-item-meta']}>
                      <div className={styles['list-item-circle']} />
                      <div className={styles['list-item-ellipsis']} onClick={(e) => this.onMenuTrigger(e, item)} />
                    </div>
                  </Link>
                </div>
              )
            })
          }
        </div>

        <div className={styles['spinner-item']}>
          <BeatLoader color={'#aaa'} size={10} loading={false} />
        </div>
      </div>
    )
  }
}

export default injectIntl(FriendListComponent)
