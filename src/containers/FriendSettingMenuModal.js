import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import Modal from 'react-modal'

import AlertComponent from '../components/AlertComponent'

import * as doFriendSettingMenuModal from '../reducers/FriendSettingMenuModal'
import * as modalConstants from '../constants/ModalConstants'

import styles from './SettingMenuModal.module.css'

class FriendSettingMenuModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }

    this.onDeleteClicked = this.onDeleteClicked.bind(this)
  }

  onDeleteClicked () {
    const { onDeleteFriend } = this.props.modalInput

    this.setState({
      showAlert: true,
      alertData: {
        message: (
          <FormattedMessage
            id='alert.message1'
            defaultMessage='Are you sure you want to delete?' />
        ),
        onConfirm: () => {
          onDeleteFriend()
          this.setState({ showAlert: false })
        },
        onClose: () => this.setState({ showAlert: false })
      }
    })
  }

  render () {
    const { onModalClose, modal: { currentModal } } = this.props
    const { showAlert, alertData } = this.state

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.settingMenuModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel='Setting Menu Modal'>
          <div className={styles['root']}>
            <div className={styles['action-section']}>
              <button className={styles['menu-button']} onClick={this.onDeleteClicked}>
                <FormattedMessage
                  id='friend-setting-menu-modal.menu0'
                  defaultMessage='Delete Friend'
                />
              </button>
              <button className={styles['menu-button']} onClick={onModalClose}>
                <FormattedMessage
                  id='friend-setting-menu-modal.menu1'
                  defaultMessage='Cancel'
                />
              </button>
            </div>
          </div>
        </Modal>
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
    doFriendSettingMenuModal: bindActionCreators(doFriendSettingMenuModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(FriendSettingMenuModal)
