import React, { PureComponent } from 'react'

import BoardListComponent from '../components/BoardListComponent'

import styles from './HubComponent.css'


class HubComponent extends PureComponent {
  render() {
    const { userId, userName, boardList, isLoading, createBoardAction, manageBoardAction } = this.props

    return (
      <div className={styles['root']}>
        <BoardListComponent
          userId={userId}
          userName={userName}
          listData={boardList}
          isLoading={isLoading}
          createBoard={createBoardAction}
          manageBoard={manageBoardAction} />
      </div>
    )
  }
}

export default HubComponent
