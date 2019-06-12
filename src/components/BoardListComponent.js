import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FormattedMessage } from 'react-intl'

import { getStatusClass } from '../utils/utils'
import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import * as constants from '../constants/Constants'

import styles from './BoardListComponent.module.scss'

class BoardListComponent extends PureComponent {
  constructor (props) {
    super()

    // this.needFetchMore    = this.needFetchMore.bind(this)
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

  render () {
    const { userId, listData, isLoading, noBoard, intl } = this.props

    if (noBoard) {
      return (
        <div className={styles['root']} ref={(scroller) => { this.scroller = scroller }}>
          <div className={styles['no-content-message']}>
            <FormattedMessage
              id='board-list-component.message'
              defaultMessage='You have no group yet, click below button to add'
            />
          </div>
        </div>
      )
    }

    let boardType = (board) => {
      if (board.BoardType === constants.BOARD_TYPE_PERSONAL) {
        return board.CreatorID === userId ? '-green' : '-yellow'
      }
      return ''
    }

    let activeList = listData.filter((item) => item.Status < constants.STATUS_ARRAY.indexOf('StatusDeleted')).sort((a,b) => b.updateAt.T - a.updateAt.T)

    return (
      <div className={styles['root']} ref={(scroller) => { this.scroller = scroller }}>
        {
          <div className={styles['list']}>
            {
              isLoading ? (
                <div className={styles['loader']}>
                  <ClipLoader color={'#aaa'} size={35} loading={isLoading} />
                </div>
              ) : (null)
            }
            {
              activeList.map((item, index) => (
                <div className={`${styles['list-item']} ${item.isUnread ? styles['unread'] : styles['read']}`} key={index}>
                  <div className={styles['list-item-label' + boardType(item)]} />
                  <Link to={`/board/${encodeURIComponent(item.ID)}`}>
                    <div title={constants.STATUS_ARRAY[item.Status]} className={styles['list-item-board-status']}>
                      <div className={styles['list-item-board-status-' + getStatusClass(item.Status)]} />
                    </div>
                    <div className={styles['list-item-title-wrapper']}>
                      <div className={styles['list-item-title']}>
                        {item.Title}
                        {constants.JOIN_STATUS_ARRAY[item.joinStatus] === 'JoinStatusAccepted' ? '' : `(${intl.formatMessage({ id: 'board-list-component.syncing' })})`}
                      </div>
                    </div>
                    <div className={styles['list-item-author']}>
                      {
                        (item.BoardType === constants.BOARD_TYPE_PERSONAL) ? (
                          <FormattedMessage
                            id='board-list-component.board-type'
                            defaultMessage='[Personal] {name}'
                            values={{ name: item.creatorName }}
                          />
                        ) : (
                          item.creatorName
                        )
                      }
                    </div>
                    <div className={styles['list-item-meta']}>
                      <div title={epoch2FullDate(item.updateAt.T)} className={styles['list-item-time']}>
                        {epoch2ReadFormat(item.updateAt.T)}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            }
          </div>
        }
      </div>
    )
  }
}

export default BoardListComponent
