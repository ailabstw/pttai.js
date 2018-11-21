import React, { PureComponent } from 'react'
import classnames from 'classnames/bind'
import styles from './Empty.css'

const cx = classnames.bind(styles)

class Empty extends PureComponent {
  render() {
    return <div className={cx('hide')}></div>
  }
}

export default Empty
