import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Immutable from 'immutable'
import { FormattedMessage } from 'react-intl'

import Empty from '../components/Empty'
import HubComponent from '../components/HubComponent'
import AlertComponent from '../components/AlertComponent'

import * as doHubPage from '../reducers/HubPage'
import * as doModalContainer from '../reducers/ModalContainer'

import * as constants from '../constants/Constants'

import { getRoot } from '../utils/utils'
import googleAnalytics from '../utils/googleAnalytics'

import styles from './HubPage.module.css'

class HubPage extends PureComponent {
  constructor (props) {
    super()
    this.refreshPageInterval = null
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
  }

  componentDidMount () {
    this.props.markSeen()
    googleAnalytics.firePageView()
  }

  componentWillMount () {
    const { myId, actions: { doHubPage } } = this.props

    doHubPage.getBoardList(myId, true, constants.NUM_BOARD_PER_REQ)

    this.refreshPageInterval = setInterval(() => doHubPage.getBoardList(myId, false, constants.NUM_BOARD_PER_REQ), constants.REFRESH_INTERVAL)
  }

  componentWillUnmount () {
    const { myId, actions: { doHubPage } } = this.props

    clearInterval(this.refreshPageInterval)
    doHubPage.clearData(myId)
  }

  render () {
    const { myId,
      hubPage,
      actions: { doHubPage, doModalContainer } } = this.props
    const { showAlert, alertData } = this.state

    if (!myId) return (<Empty />)

    let me = hubPage.get(myId, Immutable.Map())
    let userId = getRoot(this.props).getIn(['userInfo', 'userId'])
    let userName = getRoot(this.props).getIn(['userInfo', 'userName'])

    let isLoading = me.get('isLoading', false)
    let noBoard = me.get('noBoard', false)
    let boardList = me.get('boardList', Immutable.List()).toJS()
    // let fetchMoreBoard = () => {
    //   if (!allBoardsLoaded) {
    //     let startBoardId = boardList.toJS()[boardList.toJS().length-1].ID
    //     doHubPage.getMoreBoards(myId, startBoardId, constants.NUM_BOARD_PER_REQ)
    //   }
    // }

    let joinBoardCallBack = (response) => {
      let that = this
      if (response.error) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message7'
                defaultMessage='[Error] {data}:{boardUrl}'
                values={{ data: response.data, boardUrl: response.boardUrl }}
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })

        googleAnalytics.fireEvent('Group', 'JoinGroupFailed')
      } else {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message29'
                defaultMessage='[Success] Board Joined'
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
        doModalContainer.closeModal()

        googleAnalytics.fireEvent('Group', 'JoinGroupSuccess')
      }
    }

    let onJoinBoard = (boardUrl) => {
      let that = this
      if (!boardUrl || !boardUrl.startsWith('pnode://')) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id='alert.message8'
                defaultMessage='Board name empty or invalid'
              />),
            onConfirm: () => that.setState({ showAlert: false })
          }
        })
      } else {
        doHubPage.joinBoard(myId, boardUrl, joinBoardCallBack)
      }
    }

    let openBoardActionModule = () => {
      doModalContainer.setInput({
        modalAddBoardSubmit: (name, friendInvited) => {
          doHubPage.addBoard(myId, name, userName, friendInvited)
          googleAnalytics.fireEvent('Group', 'CreateGroupSuccess')
        },
        modalJoinBoardSubmit: (boardUrl) => onJoinBoard(boardUrl)
      })
      doModalContainer.openModal(constants.BOARD_ACTION_MODAL)
    }

    let openManageBoardModal = (modalData) => {
      doModalContainer.setInput({
        boardId: modalData.ID,
        boardName: modalData.Title,
        setBoardName: (boardId, name, friendInvited) => doHubPage.setBoardName(myId, boardId, name, friendInvited),
        deleteBoard: (boardId) => doHubPage.deleteBoard(myId, boardId)
      })
      doModalContainer.openModal(constants.MANAGE_BOARD_MODAL)
    }

    return (
      <div className={styles['root']}>
        <HubComponent
          userId={userId}
          userName={userName}
          noBoard={noBoard}
          boardList={boardList}
          isLoading={isLoading}
          createBoardAction={openBoardActionModule}
          manageBoardAction={openManageBoardModal} />
        <AlertComponent show={showAlert} alertData={alertData} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doHubPage: bindActionCreators(doHubPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HubPage)
