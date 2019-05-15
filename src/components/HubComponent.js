import React, { PureComponent } from 'react'

import BoardListComponent from '../components/BoardListComponent'

import styles from './HubComponent.css'

class HubComponent extends PureComponent {
  render () {
    const { userId, userName, boardList, isLoading, noBoard, createBoardAction, manageBoardAction } = this.props

    return (
      <div className={styles['root']}>
        <BoardListComponent
          userId={userId}
          userName={userName}
          noBoard={noBoard}
          listData={boardList}
          isLoading={isLoading}
          // createBoard={createBoardAction}
          manageBoard={manageBoardAction} />
        <div className={styles['add-icon-container']}>
          <div className={styles['add-icon-subcontainer']}>
            <div className={styles['add-icon-container']}>
              <div className={styles['add-icon-subcontainer']}>
                <div className={styles['add-icon']} onClick={createBoardAction} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default HubComponent
