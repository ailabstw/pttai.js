import React, { PureComponent } from 'react'

import styles from './NewsComponent.css'
import NewsBar from '../components/NewsBar'
import NewsListComponent from '../components/NewsListComponent'

class NewsComponent extends PureComponent {
  render () {
    const { articleList, isLoading, itemClicked, prevClicked } = this.props

    return (
      <div className={styles['root']}>
        <NewsBar
          prevClicked={prevClicked} />
        <NewsListComponent
          itemClicked={itemClicked}
          listData={articleList}
          isLoading={isLoading} />
      </div>
    )
  }
}

export default NewsComponent
