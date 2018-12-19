import React, { PureComponent }     from 'react'
import { Link }                     from 'react-router-dom'
import { ClipLoader }               from 'react-spinners'
import { FormattedMessage }         from 'react-intl'
import ReactDOM                     from 'react-dom'

import { epoch2FullDate, epoch2ReadFormat } from '../utils/utilDatetime'
import { isUnRead,
         getStatusClass,
         sanitizeDirtyHtml }                from '../utils/utils'
import * as serverUtils                     from '../reducers/ServerUtils'
import * as constants                       from '../constants/Constants'

import styles from './ArticleListComponent.css'

class ArticleListComponent extends PureComponent {
  constructor(props) {
    super();
    this.topItem = null
    this.state = {
      sliderInIndex: -1,
    };
    this.onSliderClick    = this.onSliderClick.bind(this)
    this.onListItemClick  = this.onListItemClick.bind(this)
    this.scrollToBottom   = this.scrollToBottom.bind(this)
    this.needFetchMore    = this.needFetchMore.bind(this)
    this.handleScroll     = this.handleScroll.bind(this);

  }

  needFetchMore() {
    const { isLoading, allArticlesLoaded } = this.props
    const { scrollTop } = this.scroller
    return (
      this.scroller &&
      !isLoading &&
      !allArticlesLoaded &&
      scrollTop <= 0
    )
  }

  handleScroll() {
    if (this.needFetchMore()) {
      const { onGetMoreArticles, listData } = this.props

      let startArticleId = listData[0].ID

      this.topItem = this.scroller.childNodes[0].childNodes.length === 0? null : this.scroller.childNodes[0].childNodes[0];
      onGetMoreArticles(startArticleId)
    }
  }

  onSliderClick(e, index) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({sliderInIndex: index})
  }

  onListItemClick(e, index) {
    const { onListItemClick } = this.state
    if (onListItemClick !== -1) {
      this.setState({sliderInIndex: -1})
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  scrollToBottom(mode) {
    this.pageEnd.scrollIntoView({ behavior: mode });
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.listData.length === 0 && this.props.listData.length > 0) ||
        (prevProps.match.path !== this.props.match.path)) {
      /* First load */
      this.scrollToBottom("instant")
    } else if (this.topItem && prevProps.isLoading && !this.props.isLoading) {
      /* More loaded */
      ReactDOM.findDOMNode(this.topItem).scrollIntoView()
    } else if ((prevProps.listData.length > 0 && this.props.listData.length === prevProps.listData.length + 1)) {
      /* New user message */
      this.scrollToBottom("smooth")
    }
  }

  render() {
    const { boardId, listData, summaryData, isLoading, noArticle } = this.props
    const { sliderInIndex } = this.state

    return (
      <div className={styles['root']}
           onScroll={ this.handleScroll }
           ref={(scroller) => {
              this.scroller = scroller;
           }}>
        {
          (noArticle) ? (
            <div className={styles['no-content-message']}>
              <FormattedMessage
                id="article-list-component.message"
                defaultMessage="You have no articles yet, click below button to add"
              />
            </div>
          ):(
            <div>
              {
                isLoading? (
                  <div className={styles['loader']}>
                    <ClipLoader color={'#aaa'} size={35} loading={isLoading}/>
                  </div>
                ):(null)
              }
              {
                listData.filter((post) => post.Status !== constants.STATUS_ARRAY.indexOf('StatusDeleted')).map((item, index) => {
                  //let menuClass = (index === sliderInIndex)?'list-item-menu-slider':'list-item-menu'
                  let itemLink = (sliderInIndex === -1)? '/board/' + encodeURIComponent(boardId) + '/article/' + encodeURIComponent(item.ID):false
                  let summaryDataParsed = (<FormattedMessage id="article-list-component.empty" defaultMessage="(No content)"/>)
                  if (summaryData[item.ID]) {

                    let sData = JSON.parse(serverUtils.b64decode(summaryData[item.ID].B[0]))

                    if (sData.type === 'attachment') {
                      summaryDataParsed = ` <div style="display: flex; flex-direction: row;">
                                              <div style="background-image: url(/images/icon_attach@2x.png); background-repeat: no-repeat; background-size: 20px; width: 20px; min-height:20px; min-width:20px; margin-left: 5px; margin-right: 10px;">
                                              </div>
                                            <div style="line-height: 20px; border-bottom: 0px solid #000;">
                                              ${item.CreatorName} 上傳了檔案</div>
                                            </div>`
                    } else {
                      let imgEle = [/<p><img.*?><\/p>/g]
                      imgEle.forEach((each) => {
                        sData.content = sData.content.replace(each,
                          `<div style="display: flex; flex-direction: row;">
                            $&
                            <div style="height: 20px; line-height: 20px; border-bottom: 0px solid #000;">
                              ${item.CreatorName} 上傳了圖片
                            </div>
                          </div>`)
                      })
                      summaryDataParsed = sanitizeDirtyHtml(sData.content)
                    }
                  }

                  let summary = item.PreviewText || summaryDataParsed

                  return (
                    <div className={styles['list-item']} key={listData.length - index} onClick={(e) => this.onListItemClick(e, index)}>
                      <Link to={itemLink}>
                        <div hidden className={styles['list-item-blocker']}></div>
                        <div className={styles['list-item-author']}>
                          <div className={styles['list-item-author-pic']}>
                            <img src={item.CreatorImg || constants.DEFAULT_USER_IMAGE} alt={'Creator Profile'}/>
                          </div>
                          <div title={item.CreatorName} className={styles['list-item-author-name']}>
                            {item.CreatorName}
                          </div>
                        </div>
                        <div className={styles['list-item-main']}>
                          <div className={styles['list-item-header']}>
                            <div title={item.Title} className={isUnRead(item.CommentCreateTS.T, item.LastSeen.T)? styles['list-item-title-unread']:styles['list-item-title']}>
                              {item.Title}
                            </div>
                            <div title={epoch2FullDate(item.UpdateTS.T)} className={styles['list-item-time']}>
                              {epoch2ReadFormat(item.UpdateTS.T)}
                            </div>
                          </div>
                          <div className={styles['list-item-content']}>
                            <div dangerouslySetInnerHTML={{__html: summary}} />
                          </div>
                        </div>
                        <div className={styles['list-item-meta']}>
                          <span className={styles['list-item-circle']}>{item.NPush || 0}</span>
                          <div title={constants.STATUS_ARRAY[item.Status]} className={styles['list-item-status']}>
                            <div className={styles['list-item-status-' + getStatusClass(item.Status)]}></div>
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
                })
              }
            </div>
          )
        }
        <div className={styles['bottomElement']}
           ref={(el) => {
            this.pageEnd = el;
          }}>
        </div>
      </div>
    )
  }
}

export default ArticleListComponent
