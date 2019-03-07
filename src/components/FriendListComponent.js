import React, { PureComponent }   from 'react'
import { BeatLoader, ClipLoader } from 'react-spinners'

import { Link }                   from 'react-router-dom'
import { FormattedMessage }       from 'react-intl'

import AlertComponent             from '../components/AlertComponent'
import { isUnRead,
         getStatusClass,
         toJson }                 from '../utils/utils'
import { epoch2ReadFormat }       from '../utils/utilDatetime'

import * as constants             from '../constants/Constants'

import styles                     from './FriendListComponent.css'

class FriendListComponent extends PureComponent {

  constructor(props) {
    super();
    this.topItem = null
    this.state = {
      sliderInIndex: -1,
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onSliderClick    = this.onSliderClick.bind(this)
    this.onListItemClick  = this.onListItemClick.bind(this)

    this.needFetchMore    = this.needFetchMore.bind(this)
    this.handleScroll     = this.handleScroll.bind(this)
  }

  needFetchMore() {
    const { isLoading, allFriendsLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allFriendsLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll() {
    if (this.needFetchMore()) {
      const { onGetMoreFriends, friendList } = this.props

      let startFriendId = friendList[0].friendID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0? null : this.scroller.childNodes[0].childNodes[0];
      onGetMoreFriends(startFriendId)
    }
  }

  onSliderClick(e, index) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({sliderInIndex: index})
  }

  onListItemClick(e, index) {
    const { sliderInIndex } = this.state
    if (sliderInIndex !== -1) {
      this.setState({sliderInIndex: -1})
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  render() {
    const { friendList, userName, noFriend, isLoading, onFriendDelete } = this.props
    const { sliderInIndex, showAlert, alertData } = this.state

    let that = this
    let friendSortedList = friendList.sort((a,b) => {
      return b.SummaryUpdateTS.T - a.SummaryUpdateTS.T
    })

    return (
      <div className={styles['root']}
           onScroll={ this.handleScroll }
           ref={(scroller) => {
              this.scroller = scroller;
           }}>
          {
            (noFriend)? (
              <div className={styles['no-content-message']}>
                <FormattedMessage
                  id="friend-list-component.message"
                  defaultMessage="You have no friend yet, click below button to add"
                />
              </div>
            ):(
              <div>
              {
                isLoading? (
                  <div className={styles['loader']}>
                    <ClipLoader color={'#aaa'} size={35} loading={isLoading}/>
                  </div>
                ):(null)
              }
              {
                friendSortedList.filter((friend) => friend.FriendStatus < constants.STATUS_ARRAY.indexOf('StatusDeleted')).map((item, index) => {
                  let menuClass = (index === sliderInIndex)?'list-item-menu-slider':'list-item-menu'

                  const friendLink = (sliderInIndex === -1 && item.friendID && item.chatId) ? `/friend/${item.friendID}/chat/${item.chatId}`: '#';
                  const summaryObj = toJson(item.Summary)

                  return (
                    <div className={styles['list-item']} key={index} onClick={(e) => this.onListItemClick(e, index)}>
                      <Link to={friendLink}>
                        <div className={styles['list-item-author']}>
                          <div className={styles['list-item-author-pic']}>
                            <img src={item.Img || constants.DEFAULT_USER_IMAGE} alt={'Friend Profile'}/>
                          </div>
                          <div title={constants.STATUS_ARRAY[item.FriendStatus]} className={styles['list-item-author-status']}>
                            <div className={styles['list-item-author-status-circle-' + getStatusClass(item.FriendStatus)]}>
                            </div>
                          </div>
                        </div>
                        <div className={styles['list-item-main']}>
                          <div className={styles['list-item-header']}>
                            <div className={styles['list-item-title']}>
                              {item.Name} {constants.JOIN_STATUS_ARRAY[item.joinStatus] === 'JoinStatusAccepted'? '': '(' + constants.JOIN_STATUS_ARRAY[item.joinStatus].slice(10) + ')'}
                            </div>
                            <div className={styles['list-item-time']}>
                              {
                                item.ArticleCreateTS.T ? epoch2ReadFormat(item.ArticleCreateTS.T) : ''
                              }
                            </div>
                          </div>
                          <div className={styles['list-item-description']}>
                              { item.nameCard && item.nameCard.company ? item.nameCard.company : constants.DEFAULT_USER_COMPANY }
                          </div>
                          <div className={isUnRead(item.ArticleCreateTS.T, item.LastSeen.T) ? styles['list-item-content-unread'] : styles['list-item-content']}>
                            {
                              summaryObj.type === constants.MESSAGE_TYPE_INVITE ? (
                                <FormattedMessage
                                  id="friend-list-component.message2"
                                  defaultMessage="\u2605 {INVITING_USER_NAME} invited {INVITED_USER_NAME} to join a board"
                                  values={{ INVITING_USER_NAME: item.SummaryUserName, INVITED_USER_NAME: (item.friendID === item.SummaryUserID) ? userName : item.Name }}
                                />
                              ):(
                                <span>{summaryObj.value}</span>
                              )
                            }
                          </div>
                        </div>
                        <div className={styles['list-item-meta']}>
                          {
                            isUnRead(item.ArticleCreateTS.T, item.LastSeen.T)? (
                              <div className={styles['list-item-circle']}></div>
                            ):(
                              <div className={styles['list-item-circle-white']}></div>
                            )
                          }
                          {
                            <div className={styles['list-item-ellipsis']} onClick={(e) => this.onSliderClick(e, index)}></div>
                          }
                        </div>
                      </Link>


                      <div className={styles[menuClass]}>
                        <div className={styles['list-item-menu-item']}
                             onClick={()=> {
                              that.setState({
                                showAlert: true,
                                alertData: {
                                  message: (
                                    <FormattedMessage
                                      id="alert.message1"
                                      defaultMessage="Are you sure you want to delete?"
                                    />),
                                  onConfirm: () => {
                                    onFriendDelete(item.chatId)
                                    that.setState({showAlert: false})
                                  },
                                  onClose: () => that.setState({showAlert: false}),
                                }
                              })
                              that.setState({sliderInIndex: -1})
                            }}>
                          <div className={styles['list-item-menu-item-text']}>
                            <FormattedMessage
                              id="comment-reply-list-component.action"
                              defaultMessage="Delete"
                            />
                          </div>
                        </div>
                      </div>



                    </div>
                  )
                })
              }
              </div>
            )
          }

          <div className={styles['spinner-item']}>
            <BeatLoader color={'#aaa'} size={10} loading={false}/>
          </div>
          <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

export default FriendListComponent
