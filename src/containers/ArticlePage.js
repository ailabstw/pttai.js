import React, { PureComponent }   from 'react'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import Immutable                  from 'immutable'
import $                          from 'jquery'

import Empty                      from '../components/Empty'
import ArticleComponent           from '../components/ArticleComponent'
import CommentReplyListComponent  from '../components/CommentReplyListComponent'
import ArticleBar                 from '../components/ArticleBar'

import { getRoot }            from '../utils/utils'
import * as doArticlePage     from '../reducers/ArticlePage'
import * as doModalContainer  from '../reducers/ModalContainer'
import * as constants         from '../constants/Constants'

import styles  from './ArticlePage.css'

const iframeClass     = 'iframe.' + constants.IFRAME_CLASS_NAME
const attachmentClass = '.' + constants.ATTACHMENT_CLASS_NAME

class ArticlePage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval = null
    this.state = {
      pullTimer: null,
      attachmentTimer:null,
      count:0,
    };
    this.pullContent        = this.pullContent.bind(this);
    this.attachmentLoaded   = this.attachmentLoaded.bind(this);
    this.handleScroll       = this.handleScroll.bind(this);
    this.needFetchMore      = this.needFetchMore.bind(this);
    this.downloadAttachment = this.downloadAttachment.bind(this);
    this.getLatestComment   = this.getLatestComment.bind(this);
  }

  componentWillMount() {
    const {actions: {doArticlePage}, match: {params}, myId} = this.props

    doArticlePage.initParams(myId, params)
    doArticlePage.getBoardInfo(myId, decodeURIComponent(params.boardId))
    doArticlePage.getArticleInfo(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId))
    doArticlePage.getArticleContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), 0, constants.NUM_CONTENT_PER_REQ)
    doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.EMPTY_ID, 0, constants.NUM_CONTENT_PER_REQ)

    this.refreshPageInterval = setInterval(this.getLatestComment, constants.REFRESH_INTERVAL);
  }

  getLatestComment() {
    const { myId, articlePage, actions: {doArticlePage}, match: {params} } = this.props

    let me = articlePage.get(myId, Immutable.Map())

    let commentContents     = me.get('commentContents', Immutable.Map()).toJS()
    let commentContentsList = commentContents.commentContentsList || []
    let latestSubContentId  = (commentContentsList.length > 0) ? commentContentsList[commentContentsList.length - 1].subContentId: constants.EMPTY_ID

    doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), latestSubContentId, 0, constants.NUM_CONTENT_PER_REQ)
  }

  downloadAttachment(e, iframeParams) {
    const { actions: {doArticlePage}, match: {params}, myId} = this.props

    function onDownload (data) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([data]));
      link.setAttribute('download', iframeParams.fileName);

      document.body.appendChild(link);
      link.click();
    }

    doArticlePage.downloadFile(myId, decodeURIComponent(params.boardId), iframeParams.fileId, onDownload)
  }

  componentDidMount() {
    const { actions: {doArticlePage}, match: {params}, myId } = this.props
    const { pullTimer, attachmentTimer} = this.state

    clearInterval(pullTimer);
    clearInterval(attachmentTimer);

    this.setState({
      pullTimer:       setInterval(this.pullContent, constants.CONTENT_REFETCH_INTERVAL),
      attachmentTimer: setInterval(this.attachmentLoaded, constants.ATTACHMENT_LOAD_INTERVAL)
    })

    doArticlePage.markArticle(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId));
  }

  componentWillUnmount() {
    const { actions: {doArticlePage}, myId} = this.props
    const { pullTimer, attachmentTimer } = this.state

    doArticlePage.clearData(myId)
    clearInterval(pullTimer)
    clearInterval(attachmentTimer)
    clearInterval(this.refreshPageInterval)
  }

  pullContent() {
    const { myId, articlePage, actions: {doArticlePage}, match: {params}} = this.props
    const { count, pullTimer } = this.state

    let me = articlePage.get(myId, Immutable.Map())
    let articleContentsList = me.get('articleContentsList', Immutable.List()).toJS()
    articleContentsList = articleContentsList.filter((each) => each.contentType === constants.CONTENT_TYPE_ARTICLE)

    doArticlePage.getArticleContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), 0, constants.NUM_CONTENT_PER_REQ)

    if (articleContentsList.length > 0 || count === constants.ARTICLE_PULL_COUNT_DOWN) {
      this.setState({ count:0 })
      clearInterval(pullTimer)
    } else {
      this.setState({ count:count + 1 })
    }
  }

  attachmentLoaded() {

    const { attachmentTimer } = this.state

    let that = this
    let allLoaded = Array.from($(iframeClass)).reduce((acc, current, idx) => {
       return acc && $($(current).contents()[0], window).find(attachmentClass).length
    }, true)

    if (allLoaded && Array.from($(iframeClass)).length) {
      Array.from($(iframeClass)).forEach((ele) => {
        let iframeParams = {
          fileId:   $(ele).attr("data-id"),
          fileName: $(ele).attr("data-name"),
          fileSize: $(ele).attr("data-size"),
          fileType: $(ele).attr("data-type")
        }
        $($(ele).contents()[0], window).find(attachmentClass).bind('click', (e) => that.downloadAttachment(e, iframeParams))
      })
      clearInterval(attachmentTimer);
    }
  }

  needFetchMore() {
    const { myId, articlePage } = this.props
    const { scrollTop, clientHeight, scrollHeight } = this.scroller

    let me = articlePage.get(myId, Immutable.Map())

    let isCommentLoading         = me.get('isCommentLoading', false)
    let allCommentsLoaded        = me.get('allCommentsLoaded', false)

    return (
      this.scroller &&
      !isCommentLoading &&
      !allCommentsLoaded &&
      scrollTop + clientHeight >= scrollHeight
    )
  }

  handleScroll() {
    if (this.needFetchMore()) {
      const { myId, articlePage, actions: {doArticlePage} } = this.props

      let me                    = articlePage.get(myId, Immutable.Map())
      let boardId               = me.get('boardId', '')
      let articleId             = me.get('articleId', '')
      let commentContents       = me.get('commentContents', Immutable.Map()).toJS()
      let commentContentsList   = commentContents.commentContentsList || []
      let startContentId        = commentContentsList.length > 0 ? commentContentsList[commentContentsList.length-1].subContentId : constants.EMPTY_ID

      doArticlePage.getMoreComments(myId, boardId, articleId, startContentId, constants.NUM_CONTENT_PER_REQ)
    }
  }

  componentDidUpdate(prevProps) {

    const { myId,
            location,
            match: {params},
            actions: {doArticlePage}}                     = this.props
    const { pullTimer, attachmentTimer }  = this.state

    if (prevProps.location.pathname !== location.pathname) {

      doArticlePage.clearData(myId)
      doArticlePage.initParams(myId, params)
      doArticlePage.getBoardInfo(myId,    decodeURIComponent(params.boardId))
      doArticlePage.getArticleInfo(myId,  decodeURIComponent(params.boardId), decodeURIComponent(params.articleId))
      doArticlePage.getArticleContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), 0, constants.NUM_CONTENT_PER_REQ)
      doArticlePage.getCommentContent(myId, decodeURIComponent(params.boardId), decodeURIComponent(params.articleId), constants.EMPTY_ID, 0, constants.NUM_CONTENT_PER_REQ)
      doArticlePage.markArticle(myId,     decodeURIComponent(params.boardId), decodeURIComponent(params.articleId));

      clearInterval(pullTimer);
      clearInterval(attachmentTimer);
      clearInterval(this.refreshPageInterval);

      this.setState({
        pullTimer:       setInterval(this.pullContent, constants.CONTENT_REFETCH_INTERVAL),
        attachmentTimer: setInterval(this.attachmentLoaded, constants.ATTACHMENT_LOAD_INTERVAL),
      })

      this.refreshPageInterval = setInterval(this.getLatestComment, constants.REFRESH_INTERVAL);
    }
  }

  render() {
    const { myId, articlePage, actions: {doArticlePage, doModalContainer}} = this.props
    const { count } = this.state

    if(!myId) return (<Empty />)

    let userId   = getRoot(this.props).getIn(['userInfo','userId'])
    let userName = getRoot(this.props).getIn(['userInfo','userName'])
    let userImg  = getRoot(this.props).getIn(['userInfo','userImg'])

    let me = articlePage.get(myId, Immutable.Map())

    let boardId           = me.get('boardId', '')
    let articleId         = me.get('articleId', '')
    let isCommentLoading  = me.get('isCommentLoading', false)

    let boardInfo           = me.get('boardInfo', Immutable.Map()).toJS()
    let articleInfo         = me.get('articleInfo', Immutable.Map()).toJS()
    let articleContentsList = me.get('articleContentsList', Immutable.List()).toJS()
    let commentContents     = me.get('commentContents', Immutable.Map()).toJS()
    let commentContentsList = commentContents.commentContentsList || []

    let deleteArticle = () => {
      doArticlePage.deleteArticle(myId, boardId, articleId)
      doModalContainer.closeModal()

      this.props.history.push('/board/' + boardId)
    }

    let openEditArticleSubmit = (reducedArticleArray, attachments) => {
      doArticlePage.createArticleWithAttachments(myId, userName, userImg, boardId, articleId, reducedArticleArray, attachments)
      doArticlePage.markArticle(myId, boardId, articleId);

      doModalContainer.closeModal()
    }

    let openEditArticleModal = () => {
      doModalContainer.setInput({
        articleTitle:         articleInfo.Title,
        articleContentsList:  articleContentsList,
        onDeleteArticle:      deleteArticle,
      })
      doModalContainer.setSubmit(openEditArticleSubmit)
      doModalContainer.openModal(constants.EDIT_ARTICLE_MODAL)
    }

    let onCommentAdded = (comment) => {
      let mediaIds = ""
      doArticlePage.addComment(myId, boardId, articleId, comment, userName, userImg, userId, mediaIds)
      doArticlePage.markArticle(myId, boardId, articleId);
    }

    let onCommentDelete = (commentId) => {
      let mediaIds = ""
      doArticlePage.deleteComment(myId, boardId, articleId, commentId, mediaIds)
    }

    return (
      <div className={styles['root']}
           onScroll={ this.handleScroll }
           ref={(scroller) => {
              this.scroller = scroller;
           }}>
        <ArticleBar
          boardInfo={boardInfo}
          articleInfo={articleInfo} />
        <ArticleComponent
          userId={userId}
          pullCount={count}
          articleInfo={articleInfo}
          articleContentsList={articleContentsList}
          editArticleAction={openEditArticleModal} />
        <CommentReplyListComponent
          isLoading={isCommentLoading}
          userId={userId}
          userImg={userImg}
          commentContents={commentContentsList}
          onCommentAdded={onCommentAdded}
          onCommentDelete={onCommentDelete} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doArticlePage: bindActionCreators(doArticlePage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ArticlePage)
