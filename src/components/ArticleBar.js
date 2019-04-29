import React,
       { PureComponent }    from 'react'
import { Link }             from 'react-router-dom'

import styles               from './ArticleBar.css'

class ArticleBar extends PureComponent {
  render() {
    const { boardInfo, articleInfo } = this.props

    return (
      <div className={styles['root']}>
        <div className={styles['content']}>

          <div className={styles['prev-button']}>
            <Link to={`/board/${boardInfo.ID}`}>
              <div className={styles['prev-button-icon']}></div>
            </Link>
          </div>

          <div title={articleInfo.Title} className={styles['board-name']}>
            {articleInfo.Title}
          </div>

          <div className={styles['menu-button']}>
            <div className={styles['menu-button-icon']}></div>
          </div>
        </div>
      </div>
    )
  }
}

export default ArticleBar
