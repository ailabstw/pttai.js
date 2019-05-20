import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'

import NewsComponent from '../components/NewsComponent'
import * as modalConstants from '../constants/ModalConstants'
import * as doLatestPageModal from '../reducers/LatestPageModal'

import styles from './LatestPageModal.module.css'

class LatestPageModal extends PureComponent {
  render () {
    const { modalInput: { articleList, isLoading, itemClicked, prevClicked },
      onModalClose,
      modal: { currentModal } } = this.props

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.latestPageModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel='Latest Page Modal'>
          <div className={styles['root']}>
            <NewsComponent
              articleList={articleList}
              isLoading={isLoading}
              itemClicked={itemClicked}
              prevClicked={prevClicked} />
          </div>
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
    doLatestPageModal: bindActionCreators(doLatestPageModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(LatestPageModal)
