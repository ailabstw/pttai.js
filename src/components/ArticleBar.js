import React,
{ PureComponent } from 'react'
import { Link } from 'react-router-dom'

import styles from './ArticleBar.module.scss'

class ArticleBar extends PureComponent {
  render () {
    const { boardID, title, isCreator, openManageArticleModal } = this.props

    return (
      <div className={styles['root']}>
        <div className={styles['content']}>

          <div className={styles['prev-button']}>
            <Link to={`/board/${boardID}`}>
              <div className={styles['prev-button-icon']} />
            </Link>
          </div>

          <div title={title} className={styles['board-name']}>
            {title}
          </div>

          <div className={styles['menu-button']}>
            {
              isCreator ? (
                <div className={styles['menu-button-icon']} onClick={openManageArticleModal} />
              ) : null
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ArticleBar
