import React, { PureComponent }   from 'react'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import Modal                      from 'react-modal'

import CreateBoardModal       from './CreateBoardModal';
import ManageBoardModal       from './ManageBoardModal';
import ManageBoardMemberModal from './ManageBoardMemberModal';
import InviteToBoardModal     from './InviteToBoardModal';
import CreateArticleModal     from './CreateArticleModal';
import EditArticleModal       from './EditArticleModal';
import AddKnownBoardModal     from './AddKnownBoardModal';
import NameCardModal          from './NameCardModal';
import FriendProfileModal     from './FriendProfileModal';
import FirstPopupModal        from './FirstPopupModal';
import MultiDeviceModal       from './MultiDeviceModal'
import AddFriendModal         from './AddFriendModal';
import AddDeviceModal         from './AddDeviceModal';
import AddDeviceScannerModal  from './AddDeviceScannerModal';
import BoardActionModal       from './BoardActionModal';
import SettingMenuModal       from './SettingMenuModal';
import BoardSettingMenuModal  from './BoardSettingMenuModal';
import LatestPageModal        from './LatestPageModal';
import ShowOpLogModal         from './ShowOpLogModal';

import Empty                  from '../components/Empty'

import * as doModalContainer  from '../reducers/ModalContainer'
import * as constants         from '../constants/Constants'

class ModalContainer extends PureComponent {

  componentWillMount() {
    Modal.setAppElement('body');
  }

  render() {
    const { idMap,
            modal:    { currentModal, modalSubmit, modalInput },
            actions:  { myId, doModalContainer }} = this.props

    let modalSwitch = (modal, data) => {
      doModalContainer.setInput(data)
      doModalContainer.openModal(modal)
    }

    switch (currentModal) {
      case constants.CREATE_BOARD_MODAL:
        return (<CreateBoardModal myId={idMap['CREATE_BOARD_MODAL']}
                                  modalInput={modalInput}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.MANAGE_BOARD_MODAL:
        return (<ManageBoardModal myId={idMap['MANAGE_BOARD_MODAL']}
                                  onModalSwitch={modalSwitch}
                                  modalInput={modalInput}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.MANAGE_BOARD_MEMBER_MODAL:
        return (<ManageBoardMemberModal myId={idMap['MANAGE_BOARD_MEMBER_MODAL']}
                                        onModalSwitch={modalSwitch}
                                        modalInput={modalInput}
                                        onModalClose={doModalContainer.closeModal}
                                        onModalSubmit={modalSubmit} />)

      case constants.INVITE_TO_BOARD_MODAL:
        return (<InviteToBoardModal myId={idMap['INVITE_TO_BOARD_MODAL']}
                                    onModalSwitch={modalSwitch}
                                    modalInput={modalInput}
                                    onModalClose={doModalContainer.closeModal}
                                    onModalSubmit={modalSubmit} />)

      case constants.CREATE_ARTICLE_MODAL:
        return (<CreateArticleModal modalInput={modalInput}
                                    onModalClose={doModalContainer.closeModal}
                                    onModalSubmit={modalSubmit} />)

      case constants.EDIT_ARTICLE_MODAL:
        return (<EditArticleModal modalInput={modalInput}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.NAME_CARD_MODAL:
        return (<NameCardModal userId={myId}
                               modalInput={modalInput}
                               onModalClose={doModalContainer.closeModal}
                               onModalSubmit={modalSubmit} />)

      case constants.FRIEND_PROFILE_MODAL:
        return (<FriendProfileModal userId={myId}
                               modalInput={modalInput}
                               onModalClose={doModalContainer.closeModal}
                               onModalSubmit={modalSubmit} />)

      case constants.FIRST_POPUP_MODAL:
        return (<FirstPopupModal userId={myId}
                                 modalInput={modalInput}
                                 onModalClose={doModalContainer.closeModal}
                                 onModalSubmit={modalSubmit} />)

      case constants.ADD_KNOWN_BOARD_MODAL:
        return (<AddKnownBoardModal userId={myId}
                                    modalInput={modalInput}
                                    onModalClose={doModalContainer.closeModal}
                                    onModalSubmit={modalSubmit} />)

      case constants.SHOW_DEVICE_INFO:
        return (<MultiDeviceModal modalInput={modalInput}
                                  onModalSwitch={modalSwitch}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.ADD_FRIEND_MODAL:
        return (<AddFriendModal modalInput={modalInput}
                                onModalSwitch={modalSwitch}
                                onModalClose={doModalContainer.closeModal}
                                onModalSubmit={modalSubmit} />)

      case constants.ADD_DEVICE_MODAL:
        return (<AddDeviceModal modalInput={modalInput}
                                onModalSwitch={modalSwitch}
                                onModalClose={doModalContainer.closeModal}
                                onModalSubmit={modalSubmit} />)

      case constants.ADD_DEVICE_SCANNER_MODAL:
        return (<AddDeviceScannerModal modalInput={modalInput}
                                       onModalSwitch={modalSwitch}
                                       onModalClose={doModalContainer.closeModal}
                                       onModalSubmit={modalSubmit} />)

      case constants.BOARD_ACTION_MODAL:
        return (<BoardActionModal modalInput={modalInput}
                                  onModalSwitch={modalSwitch}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.SETTING_MENU_MODAL:
        return (<SettingMenuModal modalInput={modalInput}
                                  onModalSwitch={modalSwitch}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      case constants.BOARD_SETTING_MENU_MODAL:
        return (<BoardSettingMenuModal  modalInput={modalInput}
                                        onModalSwitch={modalSwitch}
                                        onModalClose={doModalContainer.closeModal}
                                        onModalSubmit={modalSubmit} />)

      case constants.LATEST_PAGE_MODAL:
        return (<LatestPageModal modalInput={modalInput}
                                 onModalClose={doModalContainer.closeModal} />)

      case constants.SHOW_OP_LOG_MODAL:
        return (<ShowOpLogModal   myId={idMap['SHOW_OP_LOG_MODAL']}
                                  modalInput={modalInput}
                                  onModalClose={doModalContainer.closeModal}
                                  onModalSubmit={modalSubmit} />)

      default:
        return (<Empty/>)
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doModalContainer: bindActionCreators(doModalContainer,  dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer)
