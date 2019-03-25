import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'
import Modal                    from 'react-modal'
import platform                 from 'platform'

import * as doSettingMenuModal  from '../reducers/SettingMenuModal'
import * as modalConstants      from '../constants/ModalConstants'
import * as constants           from '../constants/Constants'

import styles from './SettingMenuModal.css'

class SettingMenuModal extends PureComponent {

  render() {
    const { modalInput, onModalClose, onModalSwitch, modal: { currentModal }} = this.props

    let onSwitchAndClose = function(modal) {
      onModalSwitch(modal, modalInput)
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.boardSettingMenuModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Setting Menu Modal">
          <div className={styles['root']}>
            <div className={styles['action-section']}>
              <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.SHOW_DEVICE_INFO)}>
                <FormattedMessage
                  id="setting-menu-modal.menu1"
                  defaultMessage="Devices setting"
                />
              </button>
              <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.SHOW_OP_LOG_MODAL)}>
                <FormattedMessage
                  id="setting-menu-modal.menu2"
                  defaultMessage="Op Log"
                />
              </button>
              <button className={styles['menu-button']} onClick={() => onSwitchAndClose(constants.PRIVACY_SETTING_MODAL)}>
                <FormattedMessage
                  id="setting-menu-modal.menu4"
                  defaultMessage="Privacy"
                />
              </button>
              <button className={styles['menu-button']} onClick={onModalClose}>
                <FormattedMessage
                  id="setting-menu-modal.menu3"
                  defaultMessage="Cancel"
                />
              </button>
              <div className={styles['platform-info']}>{platform.description}</div>
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
    doSettingMenuModal: bindActionCreators(doSettingMenuModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SettingMenuModal)
