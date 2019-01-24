import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Immutable                    from 'immutable'
import { FormattedMessage }         from 'react-intl'

import Empty            from '../components/Empty'
import FriendComponent  from '../components/FriendComponent'
import AlertComponent   from '../components/AlertComponent'

import * as constants         from '../constants/Constants'
import * as doFriendListPage  from '../reducers/FriendListPage'
import * as doModalContainer  from '../reducers/ModalContainer'
import { getRoot }            from '../utils/utils'

import styles           from './FriendListPage.css'

class FriendListPage extends PureComponent {
  constructor(props) {
    super();
    this.refreshPageInterval = null
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
  }

  componentWillMount() {
    const { actions: {doFriendListPage}, myId} = this.props

    doFriendListPage.getFriendList(myId, true, constants.NUM_FRIEND_PER_REQ)
    doFriendListPage.getKeyInfo(myId)

    this.refreshPageInterval = setInterval(() => doFriendListPage.getFriendList(myId, false, constants.NUM_FRIEND_PER_REQ), constants.REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    const { actions: {doFriendListPage}, myId} = this.props

    clearInterval(this.refreshPageInterval)
    doFriendListPage.clearData(myId)
  }

  render() {
    const { myId, friendListPage, actions: {doFriendListPage, doModalContainer}} = this.props
    const { showAlert, alertData } = this.state

    if(!myId) return (<Empty />)

    let userName      = getRoot(this.props).getIn(['userInfo','userName'])

    let me                = friendListPage.get(myId, Immutable.Map())
    let keyInfo           = me.get('keyInfo', Immutable.Map()).toJS()
    let friendList        = me.getIn(['myFriends','friendList'], Immutable.List()).toJS()
    let isLoading         = me.get('isLoading',   false)
    let noFriend          = me.get('noFriend', false)
    let allFriendsLoaded  = me.get('allFriendsLoaded', false)

    let refreshKeyInfo = () => {
      doFriendListPage.getKeyInfo(myId)
    }

    let addFriendCallBack = (response) => {
      if (response.error) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message20"
                defaultMessage="[Failed] {data}:{friendReqUrl}"
                values={{ data: response.data, friendReqUrl: response.friendReqUrl }}
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
                id="alert.message21"
                defaultMessage="[Success] Friend Added"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
        doModalContainer.closeModal()
      }
    }

    let onAddFriend = (name) => {
      if (!name || !name.startsWith('pnode://')) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message22"
                defaultMessage="Friend id empty or invalid"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        doFriendListPage.addFriend(myId, name, addFriendCallBack)
      }
    }

    let modalAddFriend = (name) => {
      onAddFriend(name)
    }

    let openAddFriendModal = () => {
      doModalContainer.setInput({
        friend: {
          data: keyInfo,
          addFriendAction: modalAddFriend,
          refreshKeyInfo: refreshKeyInfo,
        },
        keyInfo: {
          data: keyInfo,
          refreshKeyInfo: refreshKeyInfo,
        }
      })
      doModalContainer.openModal(constants.ADD_FRIEND_MODAL)
    }

    let onGetMoreFriends = (startFriendId) => {
      doFriendListPage.getMoreFriendlist(myId, startFriendId, constants.NUM_FRIEND_PER_REQ)
    }

    return (
      <div className={styles['root']}>
        <FriendComponent
          userName={userName}
          isLoading={isLoading}
          noFriend={noFriend}
          friendList={friendList}
          addFriendAction={openAddFriendModal}
          onGetMoreFriends={onGetMoreFriends}
          allFriendsLoaded={allFriendsLoaded} />
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
    doFriendListPage: bindActionCreators(doFriendListPage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(FriendListPage)
