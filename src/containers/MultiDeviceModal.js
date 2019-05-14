import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'
import Modal                    from 'react-modal'
import platform                 from 'platform'

import { epoch2FullTimeFormat } from '../utils/utilDatetime'

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
      openCurrent: false,
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
    const { menuIsOpen, openCurrent } = this.state

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
          style={modalConstants.multiDeviceModalStyels}
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
              <div className={styles['null-space']} onClick={() => this.setState({ openCurrent: !openCurrent })}>
              </div>
            </div>
            <div className={styles['device-list']}>
              <div hidden={!openCurrent} className={styles['device-item']} key={-1}>
                <div className={styles['item-index']}>
                  <div className={styles['op-value-index']}>[Debug] Platform</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>Name</div>
                  <div className={styles['op-value']}>{platform.name}</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>Version</div>
                  <div className={styles['op-value']}>{platform.version}</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>Manufacturer</div>
                  <div className={styles['op-value']}>{platform.manufacturer}</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>Layout</div>
                  <div className={styles['op-value']}>{platform.layout}</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>OS</div>
                  <div title={platform.os} className={styles['op-value']}>{platform.os.toString()}</div>
                </div>
                <div className={styles['item']}>
                  <div className={styles['op-title']}>Description</div>
                  <div className={styles['op-value']}>{platform.description}</div>
                </div>
              </div>

            {
              device.data.map((item, index) => {
                return (
                  <div className={styles['device-item']} key={index}>
                    <div className={styles['item-index']}>
                      <div className={styles['op-value-index']}>{(index + 1) + '. ' + item.NodeName}</div>
                    </div>
                    <div className={styles['item']}>
                      <div className={styles['op-title']}>Node ID</div>
                      <div className={styles['op-value']}>{item.NodeID}</div>
                    </div>
                    <div className={styles['item']}>
                      <div className={styles['op-title']}>Node Type</div>
                      <div className={styles['op-value']}>{constants.NODE_TYPE_ARRAY[item.NodeType]}</div>
                    </div>
                    <div className={styles['item']}>
                      <div className={styles['op-title']}>Status</div>
                      <div className={styles['op-value']}>{constants.STATUS_ARRAY[item.Status]}</div>
                    </div>
                    <div className={styles['item']}>
                      <div className={styles['op-title']}>User ID</div>
                      <div className={styles['op-value']}>{item.userID}</div>
                    </div>
                    <div className={styles['item']}>
                      <div className={styles['op-title']}>
                        <FormattedMessage
                          id="multi-device-modal.device-content1"
                          defaultMessage="Start Date"
                        />
                      </div>
                      <div title={epoch2FullTimeFormat(item.CreateTime.T)} className={styles['op-value']}>{epoch2FullTimeFormat(item.CreateTime.T)}</div>
                    </div>
                  </div>
                )
              })
            }
            </div>
            <div hidden={true} className={styles['add-icon-container']}>
              <div className={styles['add-icon-subcontainer']}>
              <div className={styles['add-icon']} onClick={openAddDevice/*this.onAddButtonClicked*/}></div>
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
