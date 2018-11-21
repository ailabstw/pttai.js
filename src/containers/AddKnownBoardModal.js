import React, { PureComponent }   from 'react'
import { bindActionCreators }     from 'redux'
import { connect }                from 'react-redux'
import { FormattedMessage }       from 'react-intl'
import Modal                      from 'react-modal'

import AlertComponent             from '../components/AlertComponent'
import * as modalConstants        from '../constants/ModalConstants'
import * as doAddKnownBoardModal  from '../reducers/AddKnownBoardModal'

import styles from './AddKnownBoardModal.css'

class AddKnownBoardModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      boardUrl: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
    this.onNameChange = this.onNameChange.bind(this);
  }

  onNameChange(e) {
    this.setState({boardUrl:e.target.value})
  }

  render() {
    const { modalInput: {modalJoinBoardSubmit},  onModalClose, modal: { currentModal }} = this.props
    const { boardUrl, alertData, showAlert } = this.state

    let that = this

    let sumbitCallBack = function(response) {
      if (response.error) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message7"
                defaultMessage="[Error] {data}:{boardUrl}"
                values={{ data: response.data, boardUrl: response.boardUrl}}
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        onModalClose()
      }
    }

    let onSubmitAndClose = function() {
      if (!boardUrl || !boardUrl.startsWith('pnode://')) {
        that.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message8"
                defaultMessage="Board name empty or invalid"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        modalJoinBoardSubmit(boardUrl, sumbitCallBack)
      }
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.joinBoardModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Add Known Board Modal">
          <div className={styles['root']}>
            <div className={styles['profile-title']}>
              <FormattedMessage
                id="add-known-board-modal.title"
                defaultMessage="Enter board ID to join"
              />
            </div>
            <div className={styles['profile-input']}>
              <textarea
                autoFocus
                name='title-input'
                value={boardUrl}
                onChange={this.onNameChange}/>
            </div>
            <div className={styles['action-section']}>
              <button className={styles['close-button']} onClick={onModalClose}>
                <FormattedMessage
                  id="add-known-board-modal.action1"
                  defaultMessage="Cancel"
                />
              </button>
              <button className={styles['submit-button']} onClick={onSubmitAndClose}>
                <FormattedMessage
                  id="add-known-board-modal.action2"
                  defaultMessage="Confirm"
                />
              </button>
            </div>
          </div>
        </Modal>
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
    doAddKnownBoardModal: bindActionCreators(doAddKnownBoardModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(AddKnownBoardModal)
