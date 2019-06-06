import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FormattedMessage } from 'react-intl'

import { isUnRead, getStatusClass } from '../utils/utils'
import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import * as constants from '../constants/Constants'

import styles from './BoardListComponent.module.scss'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

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
    const { userId, /* userName, */ listData, isLoading, createBoardAction, noBoard } = this.props

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

    let activeList = listData.filter((item) => item.Status < constants.STATUS_ARRAY.indexOf('StatusDeleted'))

    return (
      <div className={styles['root']} onScroll={this.handleScroll} ref={(scroller) => { this.scroller = scroller }}>
        <List>
          <ListSubheader>
            Groups <span onClick={createBoardAction}>+</span>
          </ListSubheader>
            {
              activeList.map((item, index) => {
                let isBoardUnread = isUnRead(item.ArticleCreateTS.T, item.LastSeen.T)
                let itemStatus = isBoardUnread ? styles['unread'] : styles['read']

                return (
                  <Link to={`/board/${encodeURIComponent(item.ID)}`} key={index}>
                    <ListItem button>
                      <ListItemText primary={item.Title} />
                    </ListItem>
                  </Link>
                )
              })
            }
        </List>
      </div>
    )
  }
}

export default BoardListComponent
