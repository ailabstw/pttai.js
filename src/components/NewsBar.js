import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'

import styles from './NewsBar.css'

class NewsBar extends PureComponent {
  render () {
    const { prevClicked } = this.props
    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['prev-button']} onClick={prevClicked}>
            <div className={styles['prev-button-icon']} />
            <div hidden className={styles['prev-button-text']}>
              <FormattedMessage
                id='newsbar.prev-button'
                defaultMessage='Boards'
              />
            </div>
          </div>
          <div className={styles['board-name']}>
            <FormattedMessage
              id='newsbar.title'
              defaultMessage='Latest posts'
            />
          </div>
          <div className={styles['search']} />
        </div>
      </div>
    )
  }
}

export default NewsBar
