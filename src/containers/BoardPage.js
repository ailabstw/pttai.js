import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Immutable                    from 'immutable'
import { FormattedMessage }         from 'react-intl'
//import { PTTAI_URL_BASE }           from 'config'

import Empty                  from '../components/Empty'
import BoardComponent         from '../components/BoardComponent'
import AlertComponent         from '../components/AlertComponent'

import { getRoot }            from '../utils/utils'
import googleAnalytics        from '../utils/googleAnalytics'
import * as doBoardPage       from '../reducers/BoardPage'
import * as doModalContainer  from '../reducers/ModalContainer'
import * as constants         from '../constants/Constants'

import styles from './BoardPage.css'

class BoardPage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval  = null
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.getLatestArticle     = this.getLatestArticle.bind(this);
  }

  getLatestArticle() {
    const { myId, markSeen, actions: {doBoardPage}, match: {params} } = this.props

    doBoardPage.getArticleList(myId, decodeURIComponent(params.boardId), false, constants.NUM_ARTICLE_PER_REQ)
    doBoardPage.markBoard(myId, decodeURIComponent(params.boardId));

    markSeen()
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
    const {markSeen, actions: {doBoardPage}, match: {params}, myId} = this.props

    doBoardPage.markBoard(myId, decodeURIComponent(params.boardId));
    markSeen()
    googleAnalytics.firePageView()
  }

  render() {
    const { match, myId, boardPage, markSeen, actions: {doBoardPage, doModalContainer}} = this.props
    const { showAlert, alertData } = this.state

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
      googleAnalytics.fireEvent('Article','CreateArticleSuccess')
      markSeen()

      doModalContainer.closeModal()
    }

    let openCreateArticleModal = () => {
      doModalContainer.setInput({ boardId: boardInfo.ID })
      doModalContainer.setSubmit(openCreateArticleSubmit)
      doModalContainer.openModal(constants.CREATE_ARTICLE_MODAL)
    }

    let leaveBoardCallBack = (response) => {
      if (response.error) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message32"
                defaultMessage="[Failed] {data}"
                values={{ data: response.data }}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message33"
                defaultMessage="[Success] Left Group"
              />),
            onConfirm: () => {
              that.setState({showAlert: false})
              that.props.history.push(`/hub`)
            }
          }
        })
        doModalContainer.closeModal()
      }
    }

    let deleteBoardCallBack = (response) => {
      if (response.error) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message32"
                defaultMessage="[Failed] {data}"
                values={{ data: response.data }}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message34"
                defaultMessage="[Success] Group Deleted"
              />),
            onConfirm: () => {
              that.setState({showAlert: false})
              that.props.history.push(`/hub`)
            }
          }
        })
        doModalContainer.closeModal()
      }
    }

    let openManageBoardModal = (modalData) => {
      doModalContainer.setInput({
        isCreator:  boardInfo.CreatorID === userId,
        boardId:    boardInfo.ID,
        boardName:  boardInfo.Title,
        onEditBoardName: (boardId, name) => {
          doBoardPage.setBoardName(myId, boardId, name)
        },
        onInviteFriend: (boardId, boardName, friendInvited) => {
          doBoardPage.inviteFriend(myId, boardId, boardName, friendInvited)
        },
        onRemoveMember: (boardId, memberToRemove) => {
          doBoardPage.removeMember(myId, boardId, memberToRemove)
        },
        onDeleteBoard: () => {
          doBoardPage.deleteBoard(myId, boardInfo.ID, deleteBoardCallBack)
        },
        onLeaveBoard: () => {
          doBoardPage.leaveBoard(myId, boardInfo.ID, leaveBoardCallBack)
        },
      })
      doModalContainer.openModal(constants.BOARD_SETTING_MENU_MODAL)
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
        <AlertComponent show={showAlert} alertData={alertData}/>
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
