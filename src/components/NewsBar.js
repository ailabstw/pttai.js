import React, { PureComponent } from 'react'
import { FormattedMessage }     from 'react-intl';

import styles from './NewsBar.css'

class NewsBar extends PureComponent {
  render() {
    const { exitClicked } = this.props
    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
            <div className={styles['left-button']}>
            </div>
            <div className={styles['board-name']}>
              <FormattedMessage
                id="newsbar.title"
                defaultMessage="Latest posts"
              />
            </div>
            <div className={styles['right-button']} onClick={exitClicked}>
              <div className={styles['exit-button-icon']}></div>
              <div hidden className={styles['exit-button-text']}>
                <FormattedMessage
                  id="newsbar.exit-button"
                  defaultMessage="Boards"
                />
              </div>
            </div>
        </div>
      </div>
    )
  }
}

export default NewsBar
