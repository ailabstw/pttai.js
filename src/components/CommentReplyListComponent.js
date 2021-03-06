import React, { PureComponent } from 'react'
import $ from 'jquery'
import { FormattedMessage } from 'react-intl'
import { ClipLoader } from 'react-spinners'

import styles from './CommentReplyListComponent.module.scss'

import AlertComponent from '../components/AlertComponent'

import { getStatusClass,
  linkParser,
  isMobile } from '../utils/utils'

import * as constants from '../constants/Constants'

function isEmpty (comment) {
  return comment.replace(/\s+/g, '') === ''
}

class CommentReplyListComponent extends PureComponent {
  constructor (props) {
    super()

    this.state = {
      comment: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }

    this.commentValidate = this.commentValidate.bind(this)
    this.submitComment = this.submitComment.bind(this)
  }

  commentValidate (comment) {
    // true means valid
    let that = this

    if (isEmpty(comment)) return false

    // comment too long
    if (JSON.stringify(comment).length - 2 > constants.MAX_COMMENT_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='comment-reply-list-component.comment-length-alert'
              defaultMessage='cannot comment more than {MAX_COMMENT_SIZE} words'
              values={{ MAX_COMMENT_SIZE: constants.MAX_COMMENT_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })

      return false
    }

    return true
  }

  submitComment (e) {
    const { onCommentAdded } = this.props
    let { comment } = this.state

    comment = comment.trim()

    /* isComposing is for 注音輸入法 */
    // FIXME: safari's e.isComposing work differently from others
    if (e.isComposing || (e.key && e.key !== 'Enter') || !this.commentValidate(comment)) return

    if ($(':focus').is('input')) e.preventDefault()

    onCommentAdded(comment)
    this.setState({ comment: '' })
  }

  componentDidMount () {
    document.addEventListener('keydown', this.submitComment, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.submitComment, false)
  }

  render () {
    const { commentContents, isLoading, userImg, userId, openCommentSettingMenuModal } = this.props
    const { comment, showAlert, alertData } = this.state

    return (
      <div className={styles['root']}>
        <div className={styles['scrollable']}>
          <div>
            {
              commentContents.map((item, index) => {
                return <CommentReplyListItem
                  key={index}
                  userId={userId}
                  index={index}
                  item={item}
                  openMenu={openCommentSettingMenuModal}
                />
              })
            }
          </div>
          {
            isLoading ? (
              <div className={styles['spinner-item']}>
                <ClipLoader color={'#aaa'} size={15} loading={isLoading} />
              </div>
            ) : (null)
          }
          <div className={styles['action-section']}>
            <div className={styles['comment-creator-profile']}>
              <label >
                <img id='profile-pic' src={userImg || constants.DEFAULT_USER_IMAGE} alt={'Commenter Profile'} />
              </label>
            </div>
            <div className={styles['comment-input']}>
              <input
                autoFocus={!isMobile()}
                value={comment}
                name='comment-input'
                onChange={(e) => this.setState({ comment: e.target.value })} />
            </div>
            <div className={styles['comment-action-icon']} onClick={this.submitComment} />
          </div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData} />
      </div>
    )
  }
}

export class CommentReplyListItem extends PureComponent {
  constructor (props) {
    super()

    this.onMenuClicked = this.onMenuClicked.bind(this)
  }

  onMenuClicked (e, item, index) {
    e.preventDefault()
    e.stopPropagation()
    this.props.openMenu(item.subContentId)
  }

  render () {
    let { userId, item, index } = this.props

    const isDeleted = constants.STATUS_ARRAY[item.status] === 'StatusDeleted'

    return (
      <div className={styles['list-item']}>
        <div className={styles['comment-creator-profile']}>
          <img src={item.creatorImg || constants.DEFAULT_USER_IMAGE} alt={'Commenter Profile'} />
        </div>

        <div className={styles['comment-content-container']}>
          <div>
            <div className={styles['comment-creator']}>
              <div className={styles['comment-creator-name']}>
                {item.creatorName}
              </div>
            </div>
            <div className={styles['comment-content']}>
              {
                isDeleted ? (
                  <FormattedMessage
                    id='comment-reply-list-component.have-been-deleted'
                    defaultMessage='[Comment is deleted]'
                  />
                ):
                linkParser(item.content)
              }
            </div>
          </div>
          <div title={item.createAt.toString()} className={styles['comment-creator-id-prefix']}>
            {item.createAt.fromNow()}
          </div>
        </div>

        <div title={constants.STATUS_ARRAY[item.status]} className={styles['comment-status-wrapper']}>
          <div className={`${styles['comment-status']} ${styles[getStatusClass(item.status)]}`} />
        </div>
        <div className={styles['comment-manage']}>
          {
            (isDeleted || item.creatorId !== userId) ? (
              null
            ) : (
              <div className={styles['list-item-ellipsis']} onClick={(e) => this.onMenuClicked(e, item, index)} />
            )
          }
        </div>
      </div>
    )
  }
}

export default CommentReplyListComponent
