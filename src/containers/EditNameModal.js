import React, { PureComponent }   from 'react'
import Modal                      from 'react-modal'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import { FontAwesomeIcon }        from '@fortawesome/react-fontawesome'

import * as modalConstants    from '../constants/ModalConstants'
import * as constants         from '../constants/Constants'
import * as doEditNameModal   from '../reducers/EditNameModal'

import styles from './EditNameModal.css'


function isEmpty(name) {
  return name.replace(/\s\s+/g, '') === ''
}

class EditNameModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      name: props.modalInput.userName,
    };
    this.onNameChange = this.onNameChange.bind(this);
    this.onSubmitName = this.onSubmitName.bind(this);
  }

  onNameChange(e) {
    this.setState({name:e.target.value})
  }

  onSubmitName() {
    const { onModalSubmit } = this.props
    const { name } = this.state

    let that = this
    let trimmedName = name.trim()

    if (trimmedName === constants.DEFAULT_USER_NAME) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot be ' + constants.DEFAULT_USER_NAME,
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedName).length - 2 > constants.MAX_USER_NAME_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot exceed ' + constants.MAX_USER_NAME_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (isEmpty(trimmedName)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot be empty',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      onModalSubmit(trimmedName)
    }
  }

  render() {
    const { onModalClose, modalInput:{ userImg }, modal: { currentModal }} = this.props
    const { name } = this.state

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.editNameModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Edit Name Modal">
          <div className={styles['root']}>
            <div className={styles['content']}>
              <div className={styles['profile-picture']}>
                <img src={userImg} alt={'User Profile'}/>
              </div>
              <div className={styles['profile-description']}>
                <div className={styles['profile-input']}>
                  <input
                    autoFocus
                    name='title-input'
                    value={name}
                    onChange={this.onNameChange}/>
                  <div className={styles['profile-submit']} onClick={this.onSubmitName}>
                    <FontAwesomeIcon icon="check" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doEditNameModal: bindActionCreators(doEditNameModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditNameModal)
