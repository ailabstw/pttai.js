import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'
import Modal                    from 'react-modal'

import { epoch2FullDate } from '../utils/utilDatetime'

import * as doMultiDeviceModal  from '../reducers/MultiDeviceModal'
import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'

import styles from './MultiDeviceModal.css'

class MultiDeviceModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      name: '',
      menuIsOpen: false,
    };
    this.onNameChange = this.onNameChange.bind(this);
    this.onAddButtonClicked = this.onAddButtonClicked.bind(this)
    this.onMenuClose = this.onMenuClose.bind(this)
  }

  onNameChange(e) {
    this.setState({name:e.target.value})
  }

  onAddButtonClicked(e) {
    this.setState({menuIsOpen: true})
  }

  onMenuClose(e) {
    this.setState({menuIsOpen: false})
  }

  render() {
    const { modalInput:{ device, keyInfo }, onModalClose, onModalSwitch, modal: { currentModal }} = this.props
    const { menuIsOpen } = this.state

    let openAddDevice = function() {
      onModalSwitch(constants.ADD_DEVICE_MODAL, {device:device, keyInfo: keyInfo})
    }

    let openAddDeviceScanner = function() {
      onModalSwitch(constants.ADD_DEVICE_SCANNER_MODAL, {device:device, keyInfo: keyInfo })
    }

    return (
      <div>
        <Modal
          overlayClassName="MultiDeviceModal__Overlay"
          style={modalConstants.MultiDeviceModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Multi Device Modal">
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']}>
                <div className={styles['prev-button-icon']} onClick={onModalClose}></div>
              </div>
              <div className={styles['title']}>
                <FormattedMessage
                  id="multi-device-modal.title"
                  defaultMessage="Devices Setting"
                />
              </div>
              <div className={styles['null-space']}>
              </div>
            </div>
            <div className={styles['device-list']}>
            {
              device.data.map((item, index) => {
                return (
                  <div className={styles['device-item']} key={index}>
                    <div className={styles['device-item-name']}>
                      ID ( {item.NodeID.substring(0,8)} )
                    </div>
                    <div title={epoch2FullDate(item.CreateTime.T)} className={styles['device-item-start-date']}>
                      <FormattedMessage
                        id="multi-device-modal.device-content1"
                        defaultMessage="Start Date"
                      />
                      {' '+ epoch2FullDate(item.CreateTime.T)}
                    </div>
                  </div>
                )
              })
            }
            </div>
            <div className={styles['add-icon-container']}>
              <div className={styles['add-icon-subcontainer']}>
              <div className={styles['add-icon']} onClick={this.onAddButtonClicked}></div>
              </div>
            </div>
            <Modal
              overlayClassName="MultiDeviceMenuModal__Overlay"
              style={modalConstants.boardActionModalStyels}
              isOpen={menuIsOpen}
              onRequestClose={this.onMenuClose}
              contentLabel="Multi Device Menu Modal">
                <div className={styles['submodal-action-section']}>
                  <button className={styles['submodal-join-board-button']} onClick={openAddDevice}>
                    <FormattedMessage
                      id="multi-device-modal.add-menu1"
                      defaultMessage="Add Device"
                    />
                  </button>
                  <button className={styles['submodal-create-board-button']} onClick={openAddDeviceScanner}>
                    <FormattedMessage
                      id="multi-device-modal.add-menu2"
                      defaultMessage="Sync Device"
                    />
                  </button>
                  <button className={styles['submodal-close-button']} onClick={this.onMenuClose}>
                    <FormattedMessage
                      id="multi-device-modal.add-menu3"
                      defaultMessage="Cancel"
                    />
                  </button>
                </div>
            </Modal>
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
    doMultiDeviceModal: bindActionCreators(doMultiDeviceModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(MultiDeviceModal)
