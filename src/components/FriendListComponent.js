import React, { PureComponent }   from 'react'
import { BeatLoader }             from 'react-spinners'
import { Link }                   from 'react-router-dom'
import { FormattedMessage }       from 'react-intl'

import AlertComponent             from '../components/AlertComponent'
import { isUnRead,
         getStatusClass }         from '../utils/utils'
import { epoch2ReadFormat }       from '../utils/utilDatetime'

import * as constants             from '../constants/Constants'

import styles                     from './FriendListComponent.css'

class FriendListComponent extends PureComponent {

  constructor(props) {
    super();

    this.state = {
      sliderInIndex: -1,
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onFriendDelete   = this.onFriendDelete.bind(this);
    this.onSliderClick    = this.onSliderClick.bind(this)
    this.onListItemClick  = this.onListItemClick.bind(this)
  }

  onFriendDelete() {

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
    const { friendList, userName } = this.props
    const { sliderInIndex, showAlert, alertData } = this.state

    let that = this
    let friendSortedList = friendList.sort((a,b) => {
      return b.SummaryUpdateTS.T - a.SummaryUpdateTS.T
    })

    return (
      <div className={styles['root']}>
          {
            (friendSortedList.length === 0)? (
              <div className={styles['no-content-message']}>
                <FormattedMessage
                  id="friend-list-component.message"
                  defaultMessage="You have no friend yet, click below button to add"
                />
              </div>
            ):null
          }
          {
            friendSortedList.map((item, index) => {
              const friendLink = (sliderInIndex === -1 && item.friendID && item.chatId) ? `/friend/${item.friendID}/chat/${item.chatId}`: false
              const summaryObj = JSON.parse(item.Summary)

              let menuClass = (index === sliderInIndex)?'list-item-menu-slider':'list-item-menu'

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
                          {item.Name}
                        </div>
                        <div className={styles['list-item-time']}>
                          {
                            item.ArticleCreateTS.T ? epoch2ReadFormat(item.ArticleCreateTS.T) : ''
                          }
                        </div>
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
                        <div hidden className={styles['list-item-ellipsis']} onClick={(e) => this.onSliderClick(e, index)}></div>
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
                                this.onFriendDelete(item.friendID)
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
          <div className={styles['spinner-item']}>
            <BeatLoader color={'#aaa'} size={10} loading={false}/>
          </div>
          <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

export default FriendListComponent
