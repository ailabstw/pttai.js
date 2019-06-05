import React, { PureComponent } from 'react'

import BoardListComponent from '../components/BoardListComponent'

import styles from './HubComponent.module.scss'

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
          createBoardAction={createBoardAction}
          manageBoard={manageBoardAction} />
      </div>
    )
  }
}

export default HubComponent
