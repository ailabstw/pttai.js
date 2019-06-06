import React, { PureComponent } from 'react'
import { BeatLoader, ClipLoader } from 'react-spinners'

import { Link } from 'react-router-dom'
import { injectIntl,
  FormattedMessage } from 'react-intl'

import { isUnRead,
  getStatusClass,
  toJson } from '../utils/utils'
import { epoch2ReadFormat } from '../utils/utilDatetime'

import * as constants from '../constants/Constants'

import styles from './FriendListComponent.module.scss'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';


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
    const { friendList, userName, noFriend, isLoading, intl, addFriendAction } = this.props

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

    let friendSortedList = friendList.sort((a, b) => b.SummaryUpdateTS.T - a.SummaryUpdateTS.T)
      .filter((friend) => friend.FriendStatus < constants.STATUS_ARRAY.indexOf('StatusDeleted'))

    return (
      <div className={styles['root']} onScroll={this.handleScroll} ref={scroller => { this.scroller = scroller }}>
        <List>
          <ListSubheader classes={{root: styles['list-title']}}>
              Friends <span onClick={addFriendAction}>+</span>
          </ListSubheader>
          {
            // FIXME: just for layout dev
            // [1,1,1,1,1].map( () =>

              friendSortedList.map((item, index) => {
                const friendLink = (item.friendID && item.chatId) ? `/friend/${item.friendID}/chat/${item.chatId}` : '#'
                const summaryObj = toJson(item.Summary)
                const isFriendUnread = isUnRead(item.ArticleCreateTS && item.ArticleCreateTS.T, item.LastSeen && item.LastSeen.T)

                return (
                  <Link to={friendLink} key={index}>
                    <ListItem button>
                      <ListItemText primary={item.Name} />
                    </ListItem>
                  </Link>
                )
              })
            // )
          }
        </List>

        <div className={styles['spinner-item']}>
          <BeatLoader color={'#aaa'} size={10} loading={false} />
        </div>
      </div>
    )
  }
}

export default injectIntl(FriendListComponent)
