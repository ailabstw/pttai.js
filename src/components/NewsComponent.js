import React, { PureComponent } from 'react'

import styles             from './NewsComponent.css'
import NewsBar            from '../components/NewsBar'
import NewsListComponent  from '../components/NewsListComponent'

class NewsComponent extends PureComponent {
  render() {
    const { articleList, isLoading, itemClicked, exitClicked } = this.props

    return (
      <div className={styles['root']}>
        <NewsBar
          exitClicked={exitClicked} />
        <NewsListComponent
          itemClicked={itemClicked}
          listData={articleList}
          isLoading={isLoading} />
      </div>
    )
  }
}

export default NewsComponent
