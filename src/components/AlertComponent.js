import React, { PureComponent }   from 'react'
import { FormattedMessage }       from 'react-intl'
import Modal                      from 'react-modal'

import styles               from './AlertComponent.css'
import * as modalConstants  from '../constants/ModalConstants'

class AlertComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.handleDismiss = this.handleDismiss.bind(this);
    this.handleShow = this.handleShow.bind(this);

    this.state = {
      show: props.show
    };
  }


  handleDismiss() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  render() {
    const { show, alertData: { message, onClose, onConfirm } } = this.props

    return (
        <div className={styles['root']}>
        {
            (show)? (
                <Modal
                    overlayClassName={styles['overlay']}
                    style={modalConstants.alertStyles}
                    isOpen={show}
                    onRequestClose={null}
                    contentLabel="Alert Modal">
                    <div className={styles['root']}>
                        {
                            (message)? (
                                <div className={styles['message']}> {message} </div>
                            ):null
                        }
                        <div className={styles['action-section']}>
                            {
                                (onClose)? (
                                    <div className={styles['close']} onClick={onClose}>
                                        <FormattedMessage
                                          id="alert-component.action1"
                                          defaultMessage="Cancel"
                                        />
                                    </div>
                                ):null
                            }
                            {
                                (onConfirm)? (
                                    <div className={styles['confirm']} onClick={onConfirm}>
                                        <FormattedMessage
                                          id="alert-component.action2"
                                          defaultMessage="Confirm"
                                        />
                                    </div>
                                ):null
                            }
                        </div>
                    </div>
                </Modal>
            ):null
        }
        </div>
    )
  }
}

export default AlertComponent
