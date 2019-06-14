import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'

import * as modalConstants from '../constants/ModalConstants'
import * as doEditArticleModal from '../reducers/EditArticleModal'
import PttaiEditor from '../components/PttaiEditor'
import styles from './EditArticleModal.module.scss'


class EditArticleModal extends PureComponent {
  render () {
    const { modalInput: {
      onDeleteArticle,
      articleTitle,
      contentHTML
    },
    modal: {
      currentModal
    },
    onModalSubmit,
    onModalClose } = this.props

    return (
      <Modal
        overlayClassName={styles['overlay']}
        style={modalConstants.editArticleModalStyles}
        isOpen={currentModal !== null}
        onRequestClose={null}
        shouldCloseOnEsc={false}
        contentLabel='Edit Article Modal'>
        <PttaiEditor
          articleTitle={articleTitle}
          initHtml={contentHTML}
          isEdit
          onDeleteArticle={onDeleteArticle}
          onSubmitArticle={onModalSubmit}
          onCloseArticle={onModalClose} />
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doEditArticleModal: bindActionCreators(doEditArticleModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditArticleModal)
