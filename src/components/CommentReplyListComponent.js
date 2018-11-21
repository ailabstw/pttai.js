import React, { PureComponent } from 'react'
import $                        from 'jquery'
import { FormattedMessage }     from 'react-intl'
import { ClipLoader }           from 'react-spinners'

import styles         from './CommentReplyListComponent.css'
import AlertComponent from '../components/AlertComponent'

import * as constants from '../constants/Constants'

function isEmpty(comment) {
  return comment.replace(/\s+/g, '') === ''
}

class CommentReplyListComponent extends PureComponent {
  constructor(props) {
    super();

    this.state = {
      comment: '',
      editComment: '',
      isEditIndex: -1,
      sliderInIndex: -1,
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onCommentSubmit      = this.onCommentSubmit.bind(this);
    this.onInputEnter         = this.onInputEnter.bind(this);
    this.handleButtonPress    = this.handleButtonPress.bind(this)
    this.handleButtonRelease  = this.handleButtonRelease.bind(this)
    this.setToEditMode        = this.setToEditMode.bind(this)
    this.onClick              = this.onClick.bind(this)
    this.onSliderClick        = this.onSliderClick.bind(this)
    this.onListItemClick      = this.onListItemClick.bind(this)
  }

  onSliderClick(e, index) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({sliderInIndex: index})
  }

  onListItemClick(e, index) {
    const { sliderInIndex } = this.state
    if (sliderInIndex !== -1) {
      this.setState({sliderInIndex: -1})
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  onInputEnter(e) {
    const { comment } = this.state

    if (e.which && e.which !== 13) return

    if (e.which === 13 && $(':focus').is('input')) {
      /* From key pressed */

      e.preventDefault()
      if (isEmpty(comment)) {
        return
      } else {
        this.onCommentSubmit(comment)
      }
      this.setState({comment:''})
    } else if (!e.which) {
      /* From button clicked */

      if (isEmpty(comment)) {
        return
      } else {
        this.onCommentSubmit(comment)
      }
      this.setState({comment:''})
      }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.onInputEnter, false);
    document.addEventListener("click",   this.onClick, false);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown", this.onInputEnter, false);
    document.removeEventListener("click",   this.onClick, false);
  }

  onClick(event) {
    if (event.target.tagName.toUpperCase() !== 'INPUT' && event.target.className.toString().indexOf('dd-list-item') === -1) {
      this.setState({isEditIndex: -1});
    }
  }

  onCommentSubmit(comment) {
    const { onCommentAdded } = this.props

    let that = this
    let trimmedComment = comment.trim()

    if (JSON.stringify(trimmedComment).length - 2 > constants.MAX_COMMENT_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'cannot comment more than ' + constants.MAX_COMMENT_SIZE + ' words',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      onCommentAdded(trimmedComment)
    }
  }

  handleButtonPress (index) {
    let that = this
    this.buttonPressTimer = setTimeout(() => that.setToEditMode(index), constants.PRESS_TO_EDIT_DELAY);
  }

  handleButtonRelease (index) {
    clearTimeout(this.buttonPressTimer);
  }

  setToEditMode (index) {
    //Disable edit comment
    return
    // const { commentContents } = this.props
    // let editComment = commentContents.toJS().filter(each => each.contentType === 1)[index].contentBlockArray[0]
    // this.setState({isEditIndex: index, editComment: editComment});
  }

  render() {
    const { commentContents, isLoading, userImg, userId, onCommentDelete } = this.props
    const { comment, isEditIndex, editComment, sliderInIndex, showAlert, alertData } = this.state
    let that = this

    return (
      <div className={styles['root']}>
        <div className={styles['scrollable']}>
          <div>
            {
              commentContents.map((item, index) => {
                let menuClass = (index === sliderInIndex)?'list-item-menu-slider':'list-item-menu'
                return (
                  <div className={styles['list-item']} key={index} onClick={(e) => this.onListItemClick(e, index)}>
                    <div className={styles['comment-prefix']}></div>
                    <div className={styles['comment-creator-profile']}>
                      <img src={item.creatorImg || constants.DEFAULT_USER_IMAGE} alt={'Commenter Profile'}/>
                    </div>
                    <div className={styles['comment-creator']}>
                      <div className={styles['comment-creator-name']}>
                        {item.creatorName}
                      </div>
                      <div className={styles['comment-creator-id-prefix']}>
                        {item.creatorId && item.creatorId.length >= 8? item.creatorId.substring(0, 8):'null'}
                      </div>
                    </div>
                    {
                      (index === isEditIndex) ? (
                        <div className={styles['comment-content-wrapper']}>
                          <div className={styles['comment-content-input']}>
                            <span>
                              <input
                                autoFocus
                                name='comment-input'
                                className={styles['comment-action-content-input']}
                                value={editComment}
                                onChange={(e) => this.setState({editComment:e.target.value})}/>
                            </span>
                          </div>
                          <div className={styles['comment-action-input-enter']}></div>
                        </div>
                      ):(
                        <div className={styles['comment-content']}
                             onMouseDown={() => this.handleButtonPress(index)}
                             onMouseUp={() => this.handleButtonRelease(index)} >
                          {item.contentBlockArray[0]}
                        </div>
                      )
                    }
                    <div className={styles['comment-manage']}>
                    {
                      (item.contentBlockArray[0] === "(本文已被刪除)" || item.creatorId !== userId) ? (
                        null
                      ):(
                        <div className={styles['list-item-ellipsis']} onClick={(e) => this.onSliderClick(e, index)}></div>
                      )
                    }
                    </div>
                    <div className={styles[menuClass]}>
                      <div className={styles['list-item-menu-item']}
                           onClick={()=> {
                            that.setState({
                              showAlert: true,
                              alertData: {
                                message: (
                                  <FormattedMessage
                                    id="alert.message1"
                                    defaultMessage="Are you sure you want to delete?"
                                  />),
                                onConfirm: () => {
                                  onCommentDelete(item.subContentId)
                                  that.setState({showAlert: false})
                                },
                                onClose: () => that.setState({showAlert: false}),
                              }
                            })
                            that.setState({sliderInIndex: -1})
                          }}>
                        <div className={styles['list-item-menu-item-text']}>
                          <FormattedMessage
                            id="comment-reply-list-component.action"
                            defaultMessage="Delete"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          {
            isLoading ? (
              <div className={styles['spinner-item']}>
                <ClipLoader color={'#aaa'} size={15} loading={isLoading}/>
              </div>
            ):(null)
          }
          <div className={styles['action-section']}>
            <div className={styles['comment-prefix']}></div>
            <div className={styles['comment-creator-profile']}>
              <label >
                <img id="profile-pic" src={userImg || constants.DEFAULT_USER_IMAGE} alt={'Commenter Profile'}/>
                <div className={styles['mask']}></div>
              </label>
            </div>
            <div className={styles['comment-input']}>
              <input
                autoFocus
                value={comment}
                name='comment-input'
                onChange={(e) => this.setState({comment: e.target.value})}/>
            </div>
            <div className={styles['comment-action-icon']} onClick={this.onInputEnter}></div>
          </div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

export default CommentReplyListComponent
