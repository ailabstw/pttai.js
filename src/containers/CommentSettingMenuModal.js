import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import Modal from 'react-modal'

import AlertComponent from '../components/AlertComponent'

import * as doCommentSettingMenuModal from '../reducers/CommentSettingMenuModal'
import * as modalConstants from '../constants/ModalConstants'

import styles from './SettingMenuModal.module.scss'

class CommentSettingMenuModal extends PureComponent {
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
  }

  render () {
    const { modalInput, onModalClose, modal: { currentModal } } = this.props
    const { showAlert, alertData } = this.state

    let onDeleteComment = () => {
      let that = this
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='alert.message1'
              defaultMessage='Are you sure you want to delete?'
            />),
          onConfirm: () => {
            modalInput.onDeleteComment()
            onModalClose()
            that.setState({ showAlert: false })
          },
          onClose: () => that.setState({ showAlert: false })
        }
      })
    }

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
              <button className={styles['menu-button']} onClick={onDeleteComment}>
                <FormattedMessage
                  id='comment-setting-menu-modal.menu2'
                  defaultMessage='Delete Comment'
                />
              </button>
              <button className={styles['menu-button']} onClick={onModalClose}>
                <FormattedMessage
                  id='comment-setting-menu-modal.menu3'
                  defaultMessage='Cancel'
                />
              </button>
            </div>
          </div>
          <AlertComponent show={showAlert} alertData={alertData} />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doCommentSettingMenuModal: bindActionCreators(doCommentSettingMenuModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CommentSettingMenuModal)
