import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import styles from './BoardBar.module.css'

class BoardBar extends PureComponent {
  render () {
    const { boardInfo, manageBoardAction, onOpenOPLogModal } = this.props
    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']}>
            <Link to={`/hub`}>
              <div className={styles['prev-button-icon']} />
              <div className={styles['prev-button-text']}>
                <FormattedMessage
                  id='boardbar.prev-button'
                  defaultMessage='Boards'
                />
              </div>
            </Link>
          </div>
          <div title={boardInfo.Title} className={styles['board-name']} onClick={onOpenOPLogModal}>
            {boardInfo.Title}
          </div>
          <div className={styles['search']}>
            <div className={styles['list-item-ellipsis']} onClick={() => manageBoardAction(boardInfo.ID)} />
          </div>
        </div>
      </div>
    )
  }
}

export default BoardBar
