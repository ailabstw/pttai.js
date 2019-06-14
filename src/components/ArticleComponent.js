import React, { PureComponent } from 'react'
import { FormattedMessage } from 'react-intl'
import { PulseLoader } from 'react-spinners'
// import $                          from 'jquery'

import styles from './ArticleComponent.module.scss'
import * as constants from '../constants/Constants'

import '../../node_modules/quill/dist/quill.bubble.css'

class ArticleComponent extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      noResult: false
    }
  }

  componentWillReceiveProps (nextProp) {
    const { pullCount } = this.props

    if (pullCount === constants.ARTICLE_PULL_COUNT_DOWN && nextProp.pullCount === 0) {
      this.setState({ noResult: true })
    }
  }

  render () {
    const { contentHTML, pullCount, creator, openNameCard } = this.props
    const { noResult } = this.state

    const loading = (contentHTML === '') && !noResult
    const cntDown = constants.ARTICLE_PULL_COUNT_DOWN - pullCount

    if (!creator || loading) {
      return (
        <div id='article-main-content' className={styles['root']}>
          <div className={styles['loading']}>
            <FormattedMessage
              id='article-component.message1'
              defaultMessage='Allow me to fetch the content ... ({cntDown})'
              values={{ cntDown: cntDown }}
            />
            <PulseLoader color={'#aaa'} size={6} />
          </div>
        </div>
      )
    }

    return (
      <div id='article-main-content' className={styles['root']}>
        <div className={styles['main-content']}>
          <div className={styles['author']}>
            <img src={creator.img} alt={'Author Profile'} onClick={openNameCard} />
            <div title={creator.name} onClick={openNameCard}>
              {creator.name}
            </div>
          </div>
          <div id='quill-id' className={styles['content']}>
            {
              (noResult) ? (
                <FormattedMessage
                  id='article-component.message2'
                  defaultMessage='(No content)'
                />
              ) : (
                <div className={constants.PTT_EDITOR_CLASS_NAME} dangerouslySetInnerHTML={{ __html: contentHTML }} />
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ArticleComponent
