import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'
import Modal                    from 'react-modal'

import AlertComponent                 from '../components/AlertComponent'

import * as doArticleSettingMenuModal   from '../reducers/ArticleSettingMenuModal'
import * as modalConstants            from '../constants/ModalConstants'

import styles from './ArticleSettingMenuModal.css'

class ArticleSettingMenuModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };
  }

  render() {
    const { modalInput, onModalClose, modal: { currentModal }} = this.props
    const { showAlert, alertData } = this.state

    let onDeleteArticle = () => {
      let that = this
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="alert.message1"
              defaultMessage="Are you sure you want to delete?"
            />),
          onConfirm: () => {
            modalInput.onDeleteArticle()
            that.setState({showAlert: false})
          },
          onClose: () => that.setState({showAlert: false}),
        }
      })
    }

    let onEditArticle = () => {
      onModalClose()
      modalInput.onEditArticle()
      this.setState({showAlert: false})
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.articleSettingMenuModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Setting Menu Modal">
          <div className={styles['root']}>
            {
              modalInput.isCreator ? (
                <div className={styles['action-section']}>
                  <button className={styles['menu-button']} onClick={onEditArticle}>
                    <FormattedMessage
                      id="article-setting-menu-modal.menu1"
                      defaultMessage="Edit Article"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onDeleteArticle}>
                    <FormattedMessage
                      id="article-setting-menu-modal.menu2"
                      defaultMessage="Delete Group"
                    />
                  </button>
                  <button className={styles['menu-button']} onClick={onModalClose}>
                    <FormattedMessage
                      id="article-setting-menu-modal.menu3"
                      defaultMessage="Cancel"
                    />
                  </button>
                </div>
              ):(
                null
              )
            }
          </div>
          <AlertComponent show={showAlert} alertData={alertData}/>
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
    doArticleSettingMenuModal: bindActionCreators(doArticleSettingMenuModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ArticleSettingMenuModal)
