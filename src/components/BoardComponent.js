import React, { PureComponent } from 'react'
import styles from './BoardComponent.module.scss'

import BoardBar from '../components/BoardBar'
import ArticleListComponent from '../components/ArticleListComponent'
import * as constants from '../constants/Constants'

class BoardComponent extends PureComponent {
  render () {
    const { boardInfo, match, userId, articleList, isLoading, noArticle, allArticlesLoaded, onGetMoreArticles, createArticleAction, manageBoardAction, onOpenOPLogModal } = this.props

    return (
      <div className={styles['root']}>
        <BoardBar
          userId={userId}
          boardInfo={boardInfo}
          manageBoardAction={manageBoardAction}
          onOpenOPLogModal={onOpenOPLogModal} />
        <ArticleListComponent
          match={match}
          boardId={boardInfo.ID}
          listData={articleList}
          allArticlesLoaded={allArticlesLoaded}
          onGetMoreArticles={onGetMoreArticles}
          isLoading={isLoading}
          noArticle={noArticle} />
        {
          (boardInfo.BoardType === constants.BOARD_TYPE_PERSONAL && boardInfo.CreatorID !== userId) ? null : (
            <div className={styles['add-icon-container']}>
              <div className={styles['add-icon-subcontainer']}>
                <div className={styles['add-icon']} onClick={createArticleAction} />
              </div>
            </div>
          )
        }
      </div>
    )
  }
}

export default BoardComponent
