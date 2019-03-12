import React, { PureComponent }   from 'react'
import { Link }                   from "react-router-dom"
import { ClipLoader } from 'react-spinners'
import { FormattedMessage }       from 'react-intl'

import { isUnRead, getStatusClass }         from '../utils/utils'
import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import * as constants                       from '../constants/Constants'

import styles from './BoardListComponent.css'

class BoardListComponent extends PureComponent {
  constructor(props) {
    super();

    this.onEditBoard   = this.onEditBoard.bind(this);
    // this.needFetchMore    = this.needFetchMore.bind(this)
    this.handleScroll     = this.handleScroll.bind(this)
  }

  onEditBoard(e, item) {
    const { manageBoard } = this.props

    e.preventDefault();
    e.stopPropagation();

    manageBoard(item)
  }

  // needFetchMore() {
  //   const { isLoading, allBoardsLoaded } = this.props
  //   const { scrollTop } = this.scroller
  //   return (
  //     this.scroller &&
  //     !isLoading &&
  //     !allBoardsLoaded &&
  //     scrollTop <= 0
  //   )
  // }

  handleScroll() {
    // TODO
    return

    // if (this.needFetchMore()) {
    //   const { onGetMoreBoards, friendList } = this.props

    //   let startFriendId = friendList[0].friendID

    //   this.topItem = this.scroller.childNodes[0].childNodes.length === 0? null : this.scroller.childNodes[0].childNodes[0];
    //   onGetMoreBoards(startFriendId)
    // }
  }

  render() {
    const { userId, /*userName,*/ listData, isLoading, /*createBoard,*/ noBoard } = this.props

    let boardType  = (board) => {
      if (board.BoardType === constants.BOARD_TYPE_PERSONAL) {
        if (board.CreatorID === userId) {
          return '-green'
        } else {
          return '-yellow'
        }
      }
      return ''
    }

    let activeList = listData

    return (
      <div className={styles['root']}
           onScroll={ this.handleScroll }
           ref={(scroller) => {
              this.scroller = scroller;
           }}>
        {/*
        <div className={styles['list-item']} onClick={createBoard}>
          <div className={styles['plus-button']} ></div>
        </div>
        */}
        {
          (noBoard)? (
            <div className={styles['no-content-message']}>
              <FormattedMessage
                id="board-list-component.message"
                defaultMessage="You have no group yet, click below button to add"
              />
            </div>
          ):(
            <div className={styles['list']}>
            {
              isLoading? (
                <div className={styles['loader']}>
                  <ClipLoader color={'#aaa'} size={35} loading={isLoading}/>
                </div>
              ):(null)
            }
            {
              activeList.filter((item) => item.Status < constants.STATUS_ARRAY.indexOf('StatusDeleted')).map((item, index) => (
                <div className={styles['list-item']} key={index}>
                  <div className={styles['list-item-label' + boardType(item)]}></div>
                  <Link to={`/board/${encodeURIComponent(item.ID)}`}>
                    <div className={styles['list-item-title-wrapper']}>
                      <div title={constants.STATUS_ARRAY[item.Status]} className={styles['list-item-board-status']}>
                        <div className={styles['list-item-board-status-' + getStatusClass(item.Status)]}></div>
                      </div>
                      <div className={isUnRead(item.ArticleCreateTS.T, item.LastSeen.T)? styles['list-item-title-unread']: styles['list-item-title'] }>
                        {item.Title} {constants.JOIN_STATUS_ARRAY[item.joinStatus] === 'JoinStatusAccepted'? '': '(' + constants.JOIN_STATUS_ARRAY[item.joinStatus].slice(10) + ')'}
                      </div>
                    </div>
                    <div className={styles['list-item-author']}>
                      {
                        (item.BoardType === constants.BOARD_TYPE_PERSONAL)?(
                          <FormattedMessage
                            id="board-list-component.board-type"
                          defaultMessage="[Personal] {name}"
                            values={{name: item.creatorName}}
                          />
                        ):(
                          item.creatorName
                        )
                      }
                    </div>
                    <div className={styles['list-item-meta']}>
                      <div className={styles['list-item-space']}>
                      </div>
                      <div title={epoch2FullDate(item.UpdateTS.T)} className={styles['list-item-time']}>
                        {epoch2ReadFormat(item.UpdateTS.T)}
                      </div>
                      <div className={styles['list-item-edit-button']}>
                      {
                        true || item.CreatorID !== userId? (null):(
                          <div className={styles['list-item-ellipsis']} onClick={(e) => this.onEditBoard(e, item)}></div>
                        )
                      }
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            }
            </div>
          )
        }
      </div>
    )
  }
}

export default BoardListComponent
