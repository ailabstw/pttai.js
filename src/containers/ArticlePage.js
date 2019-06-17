import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Immutable from 'immutable'
import $ from 'jquery'
// import { PTTAI_URL_BASE }         from '../config'

import Empty from '../components/Empty'
import ArticleComponent from '../components/ArticleComponent'
import CommentReplyListComponent from '../components/CommentReplyListComponent'
import ArticleBar from '../components/ArticleBar'

import { getRoot } from '../utils/utils'
import googleAnalytics from '../utils/googleAnalytics'

import * as doArticlePage from '../reducers/ArticlePage'
import * as doModalContainer from '../reducers/ModalContainer'
import * as constants from '../constants/Constants'

import styles from './ArticlePage.module.scss'

const iframeClass = 'iframe.' + constants.IFRAME_CLASS_NAME
const attachmentClass = '.' + constants.FILE_CLASS_NAME

class ArticlePage extends PureComponent {
  constructor (props) {
    super()
    this.refreshPageInterval = null
    this.state = {
      pullTimer: null,
      attachmentTimer: null,
      count: 0
    }
    this.pullContent = this.pullContent.bind(this)
    this.attachmentLoaded = this.attachmentLoaded.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.needFetchMore = this.needFetchMore.bind(this)
    this.downloadAttachment = this.downloadAttachment.bind(this)
    this.getLatestComment = this.getLatestComment.bind(this)
  }

  componentWillMount () {
    const { actions: { doArticlePage }, match: { params }, myId } = this.props

    doArticlePage.initParams(myId, params)
    doArticlePage.getArticleInfo(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.NUM_CONTENT_PER_REQ)
    doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.EMPTY_ID, 0, constants.NUM_CONTENT_PER_REQ)

    this.refreshPageInterval = setInterval(this.getLatestComment, constants.REFRESH_INTERVAL)
  }

  getLatestComment () {
    const { myId, /* articlePage, */ actions: { doArticlePage }, match: { params } } = this.props

    // let me = articlePage.get(myId, Immutable.Map())

    // let commentContents     = me.get('commentContents', Immutable.Map()).toJS()
    // let commentContentsList = commentContents.commentContentsList || []
    // let latestSubContentId  = (commentContentsList.length > 0) ? commentContentsList[commentContentsList.length - 1].subContentId: constants.EMPTY_ID

    doArticlePage.getArticleInfo(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.NUM_CONTENT_PER_REQ)
    doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.EMPTY_ID, 0, constants.NUM_CONTENT_PER_REQ)
  }

  downloadAttachment (e, iframeParams) {
    const { actions: { doArticlePage }, match: { params }, myId } = this.props

    function onDownload (data) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data]))
      link.setAttribute('download', iframeParams.fileName)

      document.body.appendChild(link)
      link.click()
    }

    doArticlePage.downloadFile(myId, decodeURIComponent(params.boardId), iframeParams.fileId, onDownload)
  }

  componentDidMount () {
    const { actions: { doArticlePage }, match: { params }, myId } = this.props
    const { pullTimer, attachmentTimer } = this.state

    clearInterval(pullTimer)
    clearInterval(attachmentTimer)

    this.setState({
      pullTimer: setInterval(this.pullContent, constants.CONTENT_REFETCH_INTERVAL),
      attachmentTimer: setInterval(this.attachmentLoaded, constants.ATTACHMENT_LOAD_INTERVAL)
    })

    doArticlePage.markArticle(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId))
    googleAnalytics.firePageView()
  }

  componentWillUnmount () {
    const { actions: { doArticlePage }, myId } = this.props
    const { pullTimer, attachmentTimer } = this.state

    doArticlePage.clearData(myId)
    clearInterval(pullTimer)
    clearInterval(attachmentTimer)
    clearInterval(this.refreshPageInterval)
  }

  pullContent () {
    const { myId, articlePage, actions: { doArticlePage }, match: { params } } = this.props
    const { count, pullTimer } = this.state

    let me = articlePage.get(myId, Immutable.Map())
    let contentHTML = me.getIn(['articleInfo', 'contentHTML'], '')

    doArticlePage.getArticleInfo(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.NUM_CONTENT_PER_REQ)

    if (contentHTML.length > 0 || count === constants.ARTICLE_PULL_COUNT_DOWN) {
      this.setState({ count: 0 })
      clearInterval(pullTimer)
    } else {
      this.setState({ count: count + 1 })
    }
  }

  attachmentLoaded () {
    const { attachmentTimer } = this.state

    let that = this
    let iframeArray = Array.from($(iframeClass))
    let allLoaded = iframeArray.reduce((acc, current) => {
      return acc && $($(current).contents()[0], window).find(attachmentClass).length
    }, true)

    if (allLoaded && iframeArray.length) {
      iframeArray.forEach((ele) => {
        let elem = $(ele)
        let iframeParams = {
          fileId: elem.attr('data-id'),
          fileName: elem.attr('data-name'),
          fileSize: elem.attr('data-size'),
          fileType: elem.attr('data-type')
        }
        $(elem.contents()[0], window).find(attachmentClass).bind('click', (e) => that.downloadAttachment(e, iframeParams))
      })
      clearInterval(attachmentTimer)
    }
  }

  needFetchMore () {
    const { myId, articlePage } = this.props
    const { scrollTop, clientHeight, scrollHeight } = this.scroller

    let me = articlePage.get(myId, Immutable.Map())

    let isCommentLoading = me.get('isCommentLoading', false)
    let allCommentsLoaded = me.get('allCommentsLoaded', false)

    return (
      this.scroller &&
      !isCommentLoading &&
      !allCommentsLoaded &&
      scrollTop + clientHeight >= scrollHeight
    )
  }

  handleScroll () {
    if (this.needFetchMore()) {
      const { myId, articlePage, actions: { doArticlePage } } = this.props

      let me = articlePage.get(myId, Immutable.Map())
      let boardId = me.get('boardId', '')
      let articleId = me.get('articleId', '')
      let commentContents = me.get('commentContents', Immutable.Map()).toJS()
      let commentContentsList = commentContents.commentContentsList || []
      let startContentId = commentContentsList.length > 0 ? commentContentsList[commentContentsList.length - 1].subContentId : constants.EMPTY_ID

      doArticlePage.getMoreComments(myId, boardId, articleId, startContentId, constants.NUM_CONTENT_PER_REQ)
    }
  }

  componentDidUpdate (prevProps) {
    const { myId,
      location,
      match: { params },
      actions: { doArticlePage } } = this.props
    const { pullTimer, attachmentTimer } = this.state

    if (prevProps.location.pathname !== location.pathname) {
      doArticlePage.clearData(myId)
      doArticlePage.initParams(myId, params)
      doArticlePage.getArticleInfo(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.NUM_CONTENT_PER_REQ)
      doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.EMPTY_ID, 0, constants.NUM_CONTENT_PER_REQ)
      doArticlePage.markArticle(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId))

      clearInterval(pullTimer)
      clearInterval(attachmentTimer)
      clearInterval(this.refreshPageInterval)

      this.setState({
        pullTimer: setInterval(this.pullContent, constants.CONTENT_REFETCH_INTERVAL),
        attachmentTimer: setInterval(this.attachmentLoaded, constants.ATTACHMENT_LOAD_INTERVAL)
      })

      this.refreshPageInterval = setInterval(this.getLatestComment, constants.REFRESH_INTERVAL)
    }
  }

  render () {
    const { myId, articlePage, actions: { doArticlePage, doModalContainer } } = this.props
    const { count } = this.state

    if (!myId) return (<Empty />)

    let userId = getRoot(this.props).getIn(['userInfo', 'userId'])
    let userName = getRoot(this.props).getIn(['userInfo', 'userName'])
    let userImg = getRoot(this.props).getIn(['userInfo', 'userImg'])

    let me = articlePage.get(myId, Immutable.Map())

    let boardId = me.get('boardId', '')
    let articleId = me.get('articleId', '')
    let isCommentLoading = me.get('isCommentLoading', false)

    let articleInfo = me.get('articleInfo', Immutable.Map()).toJS()
    let commentContents = me.get('commentContents', Immutable.Map()).toJS()
    let commentContentsList = commentContents.commentContentsList || []

    let deleteArticle = () => {
      doArticlePage.deleteArticle(myId, boardId, articleId)
      doModalContainer.closeModal()

      this.props.history.push(`/board/${boardId}`)
    }

    let openManageArticleModal = (modalData) => {
      doModalContainer.setInput({
        isCreator: articleInfo.creator.id === userId,
        articleId: articleInfo.ID,
        onEditArticle: openEditArticleModal,
        onDeleteArticle: deleteArticle
      })

      doModalContainer.openModal(constants.ARTICLE_SETTING_MENU_MODAL)
    }

    let openEditArticleSubmit = (title, reducedArticleArray, attachments) => {
      doArticlePage.clearData(myId)
      doArticlePage.createArticleWithAttachments(myId, userName, userImg, boardId, articleId, reducedArticleArray, attachments)
      doArticlePage.markArticle(myId, boardId, articleId)

      this.setState({
        pullTimer: setInterval(this.pullContent, constants.CONTENT_REFETCH_INTERVAL),
        attachmentTimer: setInterval(this.attachmentLoaded, constants.ATTACHMENT_LOAD_INTERVAL)
      })

      doModalContainer.closeModal()
    }

    const openEditArticleModal = () => {
      doModalContainer.setInput({
        boardId: boardId,
        articleTitle: articleInfo.Title,
        contentHTML:         articleInfo.contentHTML,
        onDeleteArticle: deleteArticle
      })
      doModalContainer.setSubmit(openEditArticleSubmit)
      doModalContainer.openModal(constants.EDIT_ARTICLE_MODAL)
    }

    let openNameCard = () => {
      doModalContainer.setInput({
        userId: articleInfo.creator.id,
        isEditable: false
      })
      doModalContainer.openModal(constants.NAME_CARD_MODAL)
    }

    let onCommentAdded = (comment) => {
      let mediaIds = ''
      doArticlePage.addComment(myId, boardId, articleId, comment, userName, userImg, userId, mediaIds)
      doArticlePage.markArticle(myId, boardId, articleId)

      googleAnalytics.fireEventOnProb('Comment', 'CreateCommentSuccess', 0.1)
    }

    const onDeleteComment = (commentId) => {
      let mediaIds = ''
      doArticlePage.deleteComment(myId, boardId, articleId, commentId, mediaIds)
    }

    const openCommentSettingMenuModal = (commentId) => {
      doModalContainer.setInput({
        onDeleteComment: () => onDeleteComment(commentId)
      })
      doModalContainer.openModal(constants.COMMENT_SETTING_MENU_MODAL)
    }

    return (
      <div className={styles['root']} onScroll={this.handleScroll} ref={(scroller) => { this.scroller = scroller }}>
        <ArticleBar
          boardID={boardId}
          title={articleInfo.Title}
          isCreator={userId === (articleInfo.creator && articleInfo.creator.id)}
          openManageArticleModal={openManageArticleModal} />
        {
          $.isEmptyObject(articleInfo) ? (
            <div className={styles['time']} />
          ) : (
            <div title={articleInfo.createAt.toString()} className={styles['time']}>
              {articleInfo.createAt.fromNow()}
            </div>
          )
        }
        <ArticleComponent
          userId={userId}
          pullCount={count}
          creator={articleInfo.creator}
          contentHTML={articleInfo.contentHTML || ''}
          openNameCard={openNameCard} />
        <CommentReplyListComponent
          isLoading={isCommentLoading}
          userId={userId}
          userImg={userImg}
          commentContents={commentContentsList}
          onCommentAdded={onCommentAdded}
          openCommentSettingMenuModal={openCommentSettingMenuModal} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doArticlePage: bindActionCreators(doArticlePage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ArticlePage)
