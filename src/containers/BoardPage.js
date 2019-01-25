import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Immutable                    from 'immutable'
//import { PTTAI_URL_BASE }           from 'config'

import Empty                  from '../components/Empty'
import BoardComponent         from '../components/BoardComponent'

import { getRoot }            from '../utils/utils'
import * as doBoardPage       from '../reducers/BoardPage'
import * as doModalContainer  from '../reducers/ModalContainer'
import * as constants         from '../constants/Constants'

import styles from './BoardPage.css'

class BoardPage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval  = null
    this.getLatestArticle     = this.getLatestArticle.bind(this);
  }

  getLatestArticle() {
    const { myId, actions: {doBoardPage}, match: {params} } = this.props

    doBoardPage.getArticleList(myId, decodeURIComponent(params.boardId), false, constants.NUM_ARTICLE_PER_REQ)
  }

  componentWillMount() {
    const { actions: {doBoardPage}, match: {params}, myId} = this.props

    doBoardPage.initParams(myId, params)
    doBoardPage.getBoardInfo(myId, decodeURIComponent(params.boardId))
    doBoardPage.getArticleList(myId, decodeURIComponent(params.boardId), true, constants.NUM_ARTICLE_PER_REQ)

    this.refreshPageInterval = setInterval(this.getLatestArticle, constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    const { actions: {doBoardPage}, myId} = this.props

    doBoardPage.clearData(myId)
    clearInterval(this.refreshPageInterval)
  }

  componentDidMount() {
    const {actions: {doBoardPage}, match: {params}, myId} = this.props

    doBoardPage.markBoard(myId, decodeURIComponent(params.boardId));
  }

  render() {
    const { match, myId, boardPage, actions: {doBoardPage, doModalContainer}} = this.props

    if(!myId) return (<Empty />)

    let userId    = getRoot(this.props).getIn(['userInfo','userId'])
    let userName  = getRoot(this.props).getIn(['userInfo','userName'])
    let userImg   = getRoot(this.props).getIn(['userInfo','userImg'])

    let me = boardPage.get(myId, Immutable.Map())

    let boardId           = me.get('boardId',     '')
    let boardInfo         = me.get('boardInfo', Immutable.Map()).toJS()
    let articleList       = me.getIn(['boardArticles','articleList'], Immutable.List()).toJS()
    let articleSummaries  = me.get('articleSummaries', Immutable.Map()).toJS()
    let isLoading         = me.get('isLoading',   false)
    let noArticle         = me.get('noArticle', false)
    let allArticlesLoaded = me.get('allArticlesLoaded', false)

    let openCreateArticleSubmit = (title, reducedArticleArray, attachments) => {
      doBoardPage.createArticleWithAttachments(myId, userName, userImg, boardId, title, reducedArticleArray, attachments)
      doBoardPage.markBoard(myId, boardId);

      doModalContainer.closeModal()
    }

    let openCreateArticleModal = () => {
      doModalContainer.setInput({ boardId: boardInfo.ID })
      doModalContainer.setSubmit(openCreateArticleSubmit)
      doModalContainer.openModal(constants.CREATE_ARTICLE_MODAL)
    }

    let openManageBoardModal = (modalData) => {
      doModalContainer.setInput({
        boardId:    boardInfo.ID,
        boardName:  boardInfo.Title,
        setBoardName: (boardId, name, friendInvited) => doBoardPage.setBoardName(myId, boardId, name, friendInvited),
        deleteBoard: (boardId) => {
          doBoardPage.deleteBoard(myId, boardId)
          this.props.history.push(`/hub`)
        }
      })
      doModalContainer.openModal(constants.MANAGE_BOARD_MODAL)
    }

    let onOpenOPLogModal = () => {
      doModalContainer.setInput({
        tabs: [
          constants.SHOW_CONTENT_BOARD_TAB,
          constants.SHOW_CONTENT_MASTER_TAB,
          constants.SHOW_CONTENT_MEMBER_TAB,
          constants.SHOW_CONTENT_OPKEY_TAB,
          constants.SHOW_CONTENT_PEERS_TAB,
        ],
        params: {
          boardId: boardId,
        },
      })
      doModalContainer.openModal(constants.SHOW_OP_LOG_MODAL)
    }

    let onGetMoreArticles = (startArticleId) => {
      doBoardPage.getMoreArticles(myId, boardId, startArticleId, constants.NUM_ARTICLE_PER_REQ)
    }

    return (
      <div className={styles['root']}>
        <BoardComponent
          match={match}
          userId={userId}
          boardInfo={boardInfo}
          isLoading={isLoading}
          noArticle={noArticle}
          articleList={articleList}
          articleSummaries={articleSummaries}
          allArticlesLoaded={allArticlesLoaded}
          onGetMoreArticles={onGetMoreArticles}
          createArticleAction={openCreateArticleModal}
          manageBoardAction={openManageBoardModal}
          onOpenOPLogModal={onOpenOPLogModal}
          deleteArticleAction={(articleId) => doBoardPage.deleteArticle(myId, boardInfo.ID, articleId)} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doBoardPage: bindActionCreators(doBoardPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(BoardPage)
