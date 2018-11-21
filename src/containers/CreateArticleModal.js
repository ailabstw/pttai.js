import React, { PureComponent }     from 'react'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import Modal                        from 'react-modal'
import $                            from 'jquery'
import { FontAwesomeIcon }          from '@fortawesome/react-fontawesome'
import { injectIntl,
         FormattedMessage }         from 'react-intl'

import PttaiEditor                  from './PttaiEditor'
import styles                       from './CreateArticleModal.css'

import AlertComponent               from '../components/AlertComponent'
import * as constants               from '../constants/Constants'
import * as modalConstants          from '../constants/ModalConstants'
import * as doCreateArticleModal    from '../reducers/CreateArticleModal'

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

class CreateArticleModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      title:      '',
      htmlArray:  [],
      attachments:[],

      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onContentClick     = this.onContentClick.bind(this);
    this.onContentChange    = this.onContentChange.bind(this);
    this.onTitleChange      = this.onTitleChange.bind(this);
    this.onInputEnter       = this.onInputEnter.bind(this);
    this.onInsertAttachment = this.onInsertAttachment.bind(this);
    this.onPrevPageClick    = this.onPrevPageClick.bind(this);
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
    if (e.target.id !== 'create-article-modal-main-section') {
      return
    } else if (isEmpty(htmlArray)){
      e.target.children[0].children[0].children[0].focus()
    }
  }

  onContentChange(htmlArray) {
    this.setState({ htmlArray: htmlArray })
  }

  onInsertAttachment(attachments) {
    this.setState({ attachments:attachments })
  }

  onTitleChange(e) {
    this.setState({ title:e.target.value })
  }

  onPrevPageClick() {
    const { onModalClose } = this.props
    const { title, htmlArray } = this.state

    if (!isEmpty(htmlArray) || title || title.replace(/\s+/g, '') !== '') {
      let that = this
      this.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message9"
                defaultMessage="You have unfinished article, are you sure you want to leave?"
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
    const { intl, onModalSubmit, modal: { currentModal }}   = this.props
    const { title, htmlArray, attachments, showAlert, alertData} = this.state

    const placeholder = intl.formatMessage({id: 'create-article-modal.placeholder'});

    let onSubmitAndClose = () => {

      if (isEmpty(htmlArray) || !title || title.replace(/\s+/g, '') === '') {
        let that = this
        this.setState({
          showAlert: true,
          alertData: {
            message: (
              <FormattedMessage
                id="alert.message10"
                defaultMessage="Title or content cannot be empty"
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
                id="alert.message11"
                defaultMessage="Max content is {MAX_ARTICLE_SIZE} characters"
                values={{ MAX_ARTICLE_SIZE: constants.MAX_ARTICLE_SIZE }}
              />),
              onConfirm: () => that.setState({showAlert: false})
            }
          })
        } else {
          onModalSubmit(title, reducedHtmlArray, attachments)
        }
      }
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.createArticleModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={this.onPrevPageClick}
          shouldCloseOnEsc={false}
          contentLabel="Create Article Modal">
          <div className={styles['root']}>
            <div className={styles['title-section']}>
              <div className={styles['prev-arrow']}>
                <FontAwesomeIcon icon="arrow-left" onClick={this.onPrevPageClick} />
              </div>
              <div className={styles['title-text']}>
                <input
                  placeholder={placeholder}
                  autoFocus
                  name='title-input'
                  value={title}
                  onChange={this.onTitleChange}/>
              </div>
            </div>
            <div id='create-article-modal-main-section'
                 className={styles['main-section']}
                 onClick={this.onContentClick}>
              <PttaiEditor onChange={this.onContentChange}
                           onInsertAttachment={this.onInsertAttachment}/>
            </div>
            <div className={styles['action-section']}>
              <div className={styles['submit-button']} onClick={onSubmitAndClose}></div>
            </div>
            <AlertComponent show={showAlert} alertData={alertData}/>
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
    doCreateArticleModal: bindActionCreators(doCreateArticleModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(CreateArticleModal))
