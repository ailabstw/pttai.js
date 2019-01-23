import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Immutable                    from 'immutable'

import Empty            from '../components/Empty'
import HubComponent     from '../components/HubComponent'

import * as doHubPage         from '../reducers/HubPage'
import * as doModalContainer  from '../reducers/ModalContainer'

import * as constants from '../constants/Constants'

import { getRoot } from '../utils/utils'

import styles from './HubPage.css'


class HubPage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval = null
  }

  componentWillMount() {
    const { myId, actions: { doHubPage }} = this.props

    doHubPage.getBoardList(myId, constants.NUM_BOARD_PER_REQ)

    this.refreshPageInterval = setInterval(() => doHubPage.getBoardList(myId, constants.NUM_BOARD_PER_REQ), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.refreshPageInterval)
  }

  render() {
    const { myId,
            hubPage,
            actions: { doHubPage, doModalContainer }} = this.props

    if(!myId) return (<Empty />)

    let me              = hubPage.get(myId, Immutable.Map())
    let userId          = getRoot(this.props).getIn(['userInfo','userId'])
    let userName        = getRoot(this.props).getIn(['userInfo','userName'])

    let isLoading       = me.get('isLoading', false)
    let boardList       = me.get('boardList', Immutable.List()).toJS()
    // let fetchMoreBoard = () => {
    //   if (!allBoardsLoaded) {
    //     let startBoardId = boardList.toJS()[boardList.toJS().length-1].ID
    //     doHubPage.getMoreBoards(myId, startBoardId, constants.NUM_BOARD_PER_REQ)
    //   }
    // }

    let openBoardActionModule = () => {
      doModalContainer.setInput({
        modalAddBoardSubmit: (name, friendInvited) => {
          doHubPage.addBoard(myId, name, userName, friendInvited)
        },
        modalJoinBoardSubmit: (boardUrl, callBackFunc) => doHubPage.joinBoard(myId, boardUrl, callBackFunc),
      })
      doModalContainer.openModal(constants.BOARD_ACTION_MODAL)
    }

    let openManageBoardModal = (modalData) => {
      doModalContainer.setInput({
        boardId:    modalData.ID,
        boardName:  modalData.Title,
        setBoardName: (boardId, name) => doHubPage.setBoardName(myId, boardId, name),
        deleteBoard: (boardId) => doHubPage.deleteBoard(myId, boardId),
      })
      doModalContainer.openModal(constants.MANAGE_BOARD_MODAL)
    }

    return (
      <div className={styles['root']}>
        <HubComponent
          userId={userId}
          userName={userName}
          boardList={boardList}
          isLoading={isLoading}
          createBoardAction={openBoardActionModule}
          manageBoardAction={openManageBoardModal} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doHubPage: bindActionCreators(doHubPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(HubPage)
