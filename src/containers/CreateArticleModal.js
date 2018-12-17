import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'

import * as modalConstants          from '../constants/ModalConstants'
import * as doCreateArticleModal    from '../reducers/CreateArticleModal'
import PttaiEditor                  from '../components/PttaiEditor'
import styles                       from './CreateArticleModal.css'

class CreateArticleModal extends PureComponent {

  render() {
    const { onModalSubmit, modal: { currentModal }, onModalClose } = this.props

    return (
      <Modal
        overlayClassName={styles['overlay']}
        style={modalConstants.createArticleModalStyles}
        isOpen={currentModal !== null}
        onRequestClose={null}
        shouldCloseOnEsc={false}
        contentLabel="Create Article Modal">
        <PttaiEditor articleTitle={''}
                     initHtmlArray={[]}
                     isEdit={false}
                     onDeleteArticle={null}
                     onSubmitArticle={onModalSubmit}
                     onCloseArticle={onModalClose}/>
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doCreateArticleModal: bindActionCreators(doCreateArticleModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateArticleModal)
