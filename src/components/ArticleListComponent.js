import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { FormattedMessage } from 'react-intl'
import ReactDOM from 'react-dom'

import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import { isUnRead,
  getStatusClass,
  toJson,
  getSummaryTemplate } from '../utils/utils'
import * as serverUtils from '../reducers/ServerUtils'
import * as constants from '../constants/Constants'

import styles from './ArticleListComponent.css'

class ArticleListComponent extends PureComponent {
  constructor (props) {
    super()
    this.topItem = null
    this.state = {
      sliderInIndex: -1
    }
    this.onListItemClick = this.onListItemClick.bind(this)
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

  onListItemClick (e) {
    const { onListItemClick } = this.state
    if (onListItemClick !== -1) {
      this.setState({ sliderInIndex: -1 })
    } else {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  scrollToBottom (mode) {
    this.pageEnd.scrollIntoView({ behavior: mode })
  }

  componentDidUpdate (prevProps) {
    if ((prevProps.listData.length === 0 && this.props.listData.length > 0) ||
        (prevProps.match.path !== this.props.match.path)) {
      /* First load */
      this.scrollToBottom('instant')
    } else if (this.topItem && prevProps.isLoading && !this.props.isLoading) {
      /* More loaded */
      ReactDOM.findDOMNode(this.topItem).scrollIntoView()
    } else if ((prevProps.listData.length > 0 && this.props.listData.length === prevProps.listData.length + 1)) {
      /* New user message */
      this.scrollToBottom('smooth')
    }
  }

  render () {
    const { boardId, listData, summaryData, isLoading, noArticle } = this.props
    const { sliderInIndex } = this.state

    let aliveArticles = listData.filter((post) => post.Status !== constants.STATUS_ARRAY.indexOf('StatusDeleted'))

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
              <ArticleComponent data={item} summaryData={summaryData} key={item.ID}
                onClick={this.onListItemClick} sliderInIndex={sliderInIndex} boardId={boardId} />
            ))
          }
        </div>
        <div className={styles['bottomElement']} ref={(el) => { this.pageEnd = el }} />
      </div>
    )
  }
}

class ArticleComponent extends PureComponent {
  render () {
    let { data, onClick, sliderInIndex, boardId, summaryData } = this.props
    let isUnreadArticle = isUnRead(data.CommentCreateTS.T, data.LastSeen.T)
    let listItemClass = styles['list-item'] + ' ' + (isUnreadArticle ? styles['unread'] : styles['read'])
    let itemLink = (sliderInIndex === -1) ? `/board/${encodeURIComponent(boardId)}/article/${encodeURIComponent(data.ID)}` : false
    // let menuClass = (index === sliderInIndex)?'list-item-menu-slider':'list-item-menu'

    let summary = ''
    if (data.PreviewText) {
      summary = data.PreviewText
    } else if (summaryData[data.ID] && summaryData[data.ID].B) {
      let sData = toJson(serverUtils.b64decode(summaryData[data.ID].B[0]))
      summary = getSummaryTemplate(sData, { CreatorName: data.CreatorName, boardId: boardId })
    }

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
              <div title={epoch2FullDate(data.UpdateTS.T)} className={styles['list-item-time']}>
                {epoch2ReadFormat(data.UpdateTS.T)}
              </div>
            </div>
            <div className={styles['list-item-content']}>
              {
                summary ? (
                  <div dangerouslySetInnerHTML={{ __html: summary }} />
                ) : (
                  <FormattedMessage id='article-list-component.empty' defaultMessage='(No content)' />
                )
              }
            </div>
          </div>
          <div className={styles['list-item-meta']}>
            <div className={styles['list-item-circle']}>{data.NPush || 0}</div>
            <div title={constants.STATUS_ARRAY[data.Status]} className={styles['list-item-status']}>
              <div className={styles['list-item-status-' + getStatusClass(data.Status)]} />
            </div>
          </div>
        </Link>
        {/*
        <div className={styles[menuClass]}>
          <div className={styles['list-item-menu-item']}
               onClick={()=> {
                deleteArticle(item.ID)
                that.setState({sliderInIndex: -1})
              }}>
            <FormattedMessage
              id="article-list-component.action"
              defaultMessage="Delete"
            />
          </div>
        </div>
        */}
      </div>
    )
  }
}

export default ArticleListComponent
