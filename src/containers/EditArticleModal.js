import React, { PureComponent }   from 'react'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import Modal                      from 'react-modal'
import $                          from 'jquery'
import { FontAwesomeIcon }        from '@fortawesome/react-fontawesome'
import { FormattedMessage }       from 'react-intl'

import * as constants             from '../constants/Constants'
import * as modalConstants        from '../constants/ModalConstants'
import * as doEditArticleModal    from '../reducers/EditArticleModal'
import AlertComponent             from '../components/AlertComponent'

import PttaiEditor                from './PttaiEditor'
import styles                     from './EditArticleModal.css'

function isEmpty(htmlArray) {

  if (!htmlArray || htmlArray.length === 0) {
    return true
  }

  let html = htmlArray.reduce((acc, each) => {
    let cleanEach = each.replace(/<p>/g,'')
    cleanEach = cleanEach.replace(/<\/p>/g,'')
    cleanEach = cleanEach.replace(/<br>/g,'')
    cleanEach = cleanEach.trim().replace(/\s\s+/g, ' ');
    return acc + cleanEach
  }, '')

  html = html.replace(/\s\s+/g, ' ')

  return html === ''
}

class EditArticleModal extends PureComponent {
  constructor(props) {
    const { articleTitle, articleContentsList } = props.modalInput

    super();
    this.state = {
      title:          articleTitle,
      htmlArray:      articleContentsList.reduce((resultArray, block) => { return resultArray.concat(block.contentBlockArray) }, []),
      attachments:    [],
      titleChanged:   false,
      contentChanged: false,

      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onContentClick       = this.onContentClick.bind(this);
    this.onContentChange      = this.onContentChange.bind(this);
    //this.onTitleChange        = this.onTitleChange.bind(this);
    this.onInputEnter         = this.onInputEnter.bind(this);
    this.onInsertAttachment   = this.onInsertAttachment.bind(this);
    this.onPrevPageClick      = this.onPrevPageClick.bind(this);
  }

  onInputEnter(e) {
    /* focus editor when press enter or tab */
    if ((e.which === 13 || e.which === 9) && $(':focus').is('input')) {
        $('.' + constants.PTT_EDITOR_CLASS_NAME).focus();
        e.preventDefault()
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.onInputEnter, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.onInputEnter, false);
  }

  onContentClick(e) {
    const { htmlArray } = this.state

    /* focus editor when modal is clicked */
    if (e.target.id !== 'edit-article-modal-main-section') {
      return
    } else if (isEmpty(htmlArray)){
      e.target.children[0].children[0].children[0].focus()
    }
  }

  onContentChange(htmlArray) {
    this.setState({ htmlArray: htmlArray, contentChanged: true })
  }

  onInsertAttachment(attachments) {
    this.setState({ attachments: attachments, contentChanged: true })
  }

  // onTitleChange(e) {
  //   this.setState({ title:e.target.value, titleChanged: true })
  // }

  onPrevPageClick() {
    const { onModalClose } = this.props
    const { contentChanged } = this.state

    if (contentChanged) {
      let that = this
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message14"
                defaultMessage="You have edited the article, are you sure you want to leave?"
              />),
          onConfirm: () => {
            that.setState({showAlert: false})
            onModalClose()
          },
          onClose: () => that.setState({showAlert: false})
        }
      })
    } else {
      onModalClose()
    }
  }

  render() {
    const { modalInput: { onDeleteArticle }, onModalSubmit, modal: { currentModal }} = this.props
    const { title, htmlArray, attachments, showAlert, alertData } = this.state

    let onSubmitAndClose = function() {

      if (isEmpty(htmlArray)) {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message15"
                defaultMessage="Content cannot be empty"
              />),
            onConfirm: () => that.setState({showAlert: false})
          }
        })
      } else {
        /*                                              */
        /* Start submitting article:                    */
        /*                                              */
        /* Replace data-url with attachement ID an      */
        /*  data-url will be replaced back after upload */
        /*                                              */

        let reducedHtmlArray = htmlArray.map((each) => {
          let replaced = each
          attachments.forEach((attachment) => { replaced = replaced.replace(attachment.data, attachment.id) })
          return replaced
        })

        if ((JSON.stringify(reducedHtmlArray).length - 2)*3.032 > constants.MAX_ARTICLE_SIZE) {
          let that = this
          this.setState({
            showAlert: true,
            alertData: {
              message: (
              <FormattedMessage
                id="alert.message16"
                defaultMessage="Max content is {MAX_ARTICLE_SIZE} characters"
                values={{ MAX_ARTICLE_SIZE: constants.MAX_ARTICLE_SIZE }}
              />),
              onConfirm: () => that.setState({showAlert: false})
            }
          })
        } else {
          onModalSubmit(reducedHtmlArray, attachments)
        }
      }
    }

    let onDelete = () => {
      let that = this
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message1"
                defaultMessage="Are you sure you want to delete?"
              />),
          onConfirm: () => {
            that.setState({showAlert: false})
            onDeleteArticle()
          },
          onClose: () => that.setState({showAlert: false})
        }
      })
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.editArticleModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={this.onPrevPageClick}
          shouldCloseOnEsc={false}
          contentLabel="Edit Article Modal">
          <div className={styles['root']}>
            <div className={styles['title-section']}>
              <div className={styles['prev-arrow']}>
                <FontAwesomeIcon icon="arrow-left" onClick={this.onPrevPageClick} />
              </div>
              <div title={title} className={styles['title-text']}>
                <div className={styles['title-input']}>{title}</div>
              </div>
              <div className={styles['prev-arrow']}>
              </div>
            </div>
            <div id='edit-article-modal-main-section'
                 className={styles['main-section']}
                 onClick={this.onContentClick}>
              <PttaiEditor onChange={this.onContentChange}
                           onInsertAttachment={this.onInsertAttachment}
                           initHtmlArray={htmlArray}/>
            </div>
            <div className={styles['action-section']}>
              <div className={styles['delete-button']} onClick={onDelete}></div>
              <div className={styles['submit-button']} onClick={onSubmitAndClose}></div>
            </div>
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
    doEditArticleModal: bindActionCreators(doEditArticleModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditArticleModal)
