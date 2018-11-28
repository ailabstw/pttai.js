import React, { PureComponent }   from 'react'
import { Link }                   from "react-router-dom";
import { BeatLoader }             from 'react-spinners';
import { FormattedMessage }       from 'react-intl';

import { isUnRead, getStatusClass }         from '../utils/utils'
import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import * as constants                       from '../constants/Constants'

import styles from './BoardListComponent.css'

class BoardListComponent extends PureComponent {
  constructor(props) {
    super();

    this.onEditBoard   = this.onEditBoard.bind(this);
  }

  onEditBoard(e, item) {
    const { manageBoard } = this.props

    e.preventDefault();
    e.stopPropagation();

    manageBoard(item)
  }

  render() {
    const { userId, userName, listData, isLoading, createBoard } = this.props

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

    return (
      <div className={styles['root']}>
        <div className={styles['list-item']} onClick={createBoard}>
          <div className={styles['plus-button']} ></div>
        </div>
        {
          listData.toJS().map((item, index) => (
          <div className={styles['list-item']} key={index}>
            <div className={styles['list-item-label' + boardType(item)]}></div>
            <Link to={`/board/${encodeURIComponent(item.ID)}`}>
              <div className={styles['list-item-title-wrapper']}>
                <div title={constants.STATUS_ARRAY[item.Status]} className={styles['list-item-board-status']}>
                  <div className={styles['list-item-board-status-' + getStatusClass(item.Status)]}></div>
                </div>
                <div className={isUnRead(item.ArticleCreateTS.T, item.LastSeen.T)? styles['list-item-title-unread']: styles['list-item-title'] }>
                  {item.Title}
                </div>
              </div>
              <div className={styles['list-item-author']}>
                {
                  (item.BoardType === constants.BOARD_TYPE_PERSONAL)?(
                    <FormattedMessage
                      id="board-list-component.board-type"
                    defaultMessage="[Personal] {name}"
                      values={{name: userName}}
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
                {
                  item.CreatorID !== userId? (null):(
                  <div className={styles['list-item-edit-button']}>
                    <div className={styles['list-item-ellipsis']} onClick={(e) => this.onEditBoard(e, item)}></div>
                  </div>
                  )
                }
              </div>
            </Link>
          </div>))
        }
        <div className={styles['spinner-item']}>
          <BeatLoader color={'#aaa'} size={8} loading={isLoading}/>
        </div>
      </div>
    )
  }
}

export default BoardListComponent
