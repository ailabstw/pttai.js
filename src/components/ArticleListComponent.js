import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FormattedMessage } from 'react-intl'
import ReactDOM from 'react-dom'

import { getStatusClass } from '../utils/utils'
import * as constants from '../constants/Constants'

import styles from './ArticleListComponent.module.scss'

class ArticleListComponent extends PureComponent {
  constructor (props) {
    super()
    this.topItem = null
    this.scrollToBottom = this.scrollToBottom.bind(this)
    this.needFetchMore = this.needFetchMore.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  needFetchMore () {
    const { isLoading, allArticlesLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allArticlesLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll () {
    if (this.needFetchMore()) {
      const { onGetMoreArticles, listData } = this.props

      let startArticleId = listData[0].ID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0 ? null : this.scroller.childNodes[0].childNodes[0]
      onGetMoreArticles(startArticleId)
    }
  }

  scrollToBottom (mode) {
    this.pageEnd.scrollIntoView({ behavior: mode })
  }

  componentDidUpdate (prevProps) {
    const isFirstLoaded = (prevProps.listData.length === 0 && this.props.listData.length > 0) ||
      (prevProps.match.path !== this.props.match.path)

    if (isFirstLoaded) {
      return this.scrollToBottom('instant')
    }

    const isLoadingMore = this.topItem && prevProps.isLoading && !this.props.isLoading
    if (isLoadingMore) {
      return ReactDOM.findDOMNode(this.topItem).scrollIntoView()
    }

    const isGettingNewMessage = prevProps.listData.length > 0 &&
      this.props.listData.length === prevProps.listData.length + 1
    if (isGettingNewMessage) {
      this.scrollToBottom('smooth')
    }
  }

  render () {
    const { boardId, listData, isLoading, noArticle } = this.props

    let aliveArticles = listData.filter((post) => post.Status !== constants.STATUS_ARRAY.indexOf('StatusDeleted')).sort((a,b) => {
      return a.updateAt - b.updateAt;
    })

    if (noArticle) {
      return (
        <div className={styles['root']}
          onScroll={this.handleScroll}
          ref={scroller => { this.scroller = scroller }}>
          <div className={styles['no-content-message']}>
            <FormattedMessage
              id='article-list-component.message'
              defaultMessage='You have no articles yet, click below button to add'
            />
          </div>
        </div>
      )
    }

    return (
      <div className={styles['root']} onScroll={this.handleScroll} ref={scroller => { this.scroller = scroller }}>
        <div className={styles['list']}>
          {
            isLoading ? (
              <div className={styles['loader']}>
                <ClipLoader color={'#aaa'} size={35} loading={isLoading} />
              </div>
            ) : (null)
          }
          {
            aliveArticles.map(item => (
              <ArticleItemComponent data={item} key={item.ID} boardId={boardId} />
            ))
          }
        </div>
        <div className={styles['bottomElement']} ref={(el) => { this.pageEnd = el }} />
      </div>
    )
  }
}

export class ArticleItemComponent extends PureComponent {
  render () {
    let { data, onClick, boardId } = this.props

    let listItemClass = styles['list-item'] + ' ' + (data.isUnread ? styles['unread'] : styles['read'])
    let itemLink = `/board/${encodeURIComponent(boardId)}/article/${encodeURIComponent(data.ID)}`

    return (
      <div className={listItemClass} onClick={onClick}>
        <Link to={itemLink}>
          <div hidden className={styles['list-item-blocker']} />
          <div className={styles['list-item-author']}>
            <div className={styles['list-item-author-pic']}>
              <img src={data.CreatorImg || constants.DEFAULT_USER_IMAGE} alt={'Creator Profile'} />
            </div>
            <div title={data.CreatorName} className={styles['list-item-author-name']}>{data.CreatorName}</div>
          </div>
          <div className={styles['list-item-main']}>
            <div className={styles['list-item-header']}>
              <div title={data.Title} className={styles['list-item-title']}>{data.Title}</div>
              <div title={data.updateAt.toString()} className={styles['list-item-time']}>
                {data.updateAt.fromNow()}
              </div>
            </div>
            <div className={styles['list-item-content']}>
              {
                data.summary ? (
                  <div dangerouslySetInnerHTML={{ __html: data.summary }} />
                ) : (
                  <FormattedMessage id='article-list-component.empty' defaultMessage='(No content)' />
                )
              }
            </div>
          </div>
          <div className={styles['list-item-meta']}>
            <div className={styles['list-item-circle']}>{data.responseNumber}</div>
            <div title={constants.STATUS_ARRAY[data.Status]} className={styles['list-item-status']}>
              <div className={styles['list-item-status-' + getStatusClass(data.Status)]} />
            </div>
          </div>
        </Link>
      </div>
    )
  }
}

export default ArticleListComponent
