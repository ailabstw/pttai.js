import React, { PureComponent } from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FormattedMessage,
  injectIntl } from 'react-intl'
import validator from 'validator'
import Immutable from 'immutable'

import { PTTAI_URL_BASE } from 'config'

import AlertComponent from '../components/AlertComponent'

import * as modalConstants from '../constants/ModalConstants'
import * as constants from '../constants/Constants'
import * as doNameCardModal from '../reducers/NameCardModal'
import { getOrientation,
  newCanvasSize } from '../utils/utils'
import googleAnalytics from '../utils/googleAnalytics'

import styles from './NameCardModal.css'

function isEmpty (name) {
  return name.replace(/\s\s+/g, '') === ''
}

/**
 * @name NameCardModal
 * @param userId
 * @desc give userId, component would fetch all other data used by name card
 */

class NameCardModal extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      isEditing: false
    }

    this.openQRCodeModal = this.openQRCodeModal.bind(this)
  }

  componentWillMount () {
    const { myId, modalInput: { userId }, actions: { doNameCardModal } } = this.props
    doNameCardModal.getProfile(myId, userId)
  }

  openQRCodeModal () {
    this.props.onModalClose()
    document.querySelector('#friend-tab').click()
    let wait = setInterval(function () {
      let button = document.querySelector('#add-friend-button')
      if (button) {
        button.click()
        clearInterval(wait)
      }
    }, 200)
  }

  render () {
    const { myId, intl, nameCardModal, actions, onModalClose, modal: { currentModal }, modalInput: { isEditable } } = this.props
    const { isEditing } = this.state

    let me = nameCardModal.get(myId, Immutable.Map())
    let profile = me.get('profile', Immutable.Map()).toJS()

    const { name, company, jobTitle, email, phone, description, userImg } = profile

    const company_placeholder = intl.formatMessage({ id: 'edit-name-modal.company-placeholder' })
    const jobtitle_placeholder = intl.formatMessage({ id: 'edit-name-modal.jobtitle-placeholder' })
    const email_placeholder = intl.formatMessage({ id: 'edit-name-modal.email-placeholder' })
    const phone_placeholder = intl.formatMessage({ id: 'edit-name-modal.phone-placeholder' })
    const description_placeholder = intl.formatMessage({ id: 'edit-name-modal.description-placeholder' })

    if (isEditable && isEditing) {
      return (
        <div>
          <Modal
            overlayClassName={styles['overlay']}
            style={modalConstants.nameCardModalStyles}
            isOpen={currentModal !== null}
            onRequestClose={onModalClose}
            contentLabel='Edit Name Modal'>
            <EditingNameCard
              {...profile}
              {...this.state}
              myId={myId}
              intl={intl}
              actions={actions}
              finishEdit={() => this.setState({ isEditing: false })} />
          </Modal>
        </div>
      )
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.nameCardModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel='Edit Name Modal'>
          <div className={styles['root']}>

            {
              isEditable && (
                <div className={styles['modal-action-section']}>
                  <button className={styles['edit-button']} onClick={() => this.setState({ isEditing: true })}>
                    <FontAwesomeIcon icon='pen' />
                  </button>
                </div>)
            }

            <div className={styles['info-section']}>
              <div className={styles['left-side']}>
                <div className={styles['profile-picture']}>
                  <img id='profile-page-pic' src={userImg} alt={'User Profile'} />
                </div>

                {
                  isEditable && (
                    <div className={styles['qr-code']} onClick={this.openQRCodeModal}>
                      <img src={`${PTTAI_URL_BASE}/images/btn_qrcode@2x.jpg`} alt='QRCode Button' />
                    </div>)
                }

              </div>
              <div className={styles['right-side']}>
                <div className={styles['main-info']}>
                  <div className={styles['profile-input']}>
                    <div className={styles['name']}>
                      <div>{name}</div>
                    </div>
                    <div className={styles['company']}>
                      <div>{company || company_placeholder}</div>
                    </div>
                    <div className={styles['job-title']}>
                      <div>{jobTitle || jobtitle_placeholder}</div>
                    </div>
                  </div>
                </div>
                <div className={styles['contact-info']}>
                  <div className={styles['contact-input']}>
                    <div className={styles['email']}>
                      <div>{email || email_placeholder}</div>
                    </div>
                    <div className={styles['phone']}>
                      <div>{phone || phone_placeholder}</div>
                    </div>
                  </div>
                </div>
                <div className={styles['other-info']}>
                  <div className={styles['desc-input']}>
                    <div className={styles['description']}>
                      {
                        // TODO: text-overlow for the third line should be ellipsis
                        description ? description.split('\n').map((line, i) => <div key={`desc-line-${i}`}>{line}</div>) : description_placeholder
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

class EditingNameCard extends PureComponent {
  constructor (props) {
    const { name, userImg, company, jobTitle, email, phone, description } = props

    super()
    this.state = {
      name,
      userImg,
      company,
      jobTitle,
      email,
      phone,
      description,

      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }

    this.onNameChange = this.onNameChange.bind(this)
    this.onCompanyChange = this.onCompanyChange.bind(this)
    this.onJobTitleChange = this.onJobTitleChange.bind(this)
    this.onEmailChange = this.onEmailChange.bind(this)
    this.onPhoneChange = this.onPhoneChange.bind(this)
    this.onDescriptionChange = this.onDescriptionChange.bind(this)

    this.onSubmit = this.onSubmit.bind(this)
    this.onUpload = this.onUpload.bind(this)
    this.updateProfile = this.updateProfile.bind(this)
  }

  updateProfile (name, editedProfile, userImg) {
    const { myId, actions: { doNameCardModal } } = this.props

    doNameCardModal.editName(myId, name)
    doNameCardModal.editProfile(myId, editedProfile)
    doNameCardModal.editProfileImg(myId, userImg)

    googleAnalytics.fireEvent('NameCard', 'EditNameCardSuccess')
  }

  onNameChange (e) {
    this.setState({ name: e.target.value })
  }

  onCompanyChange (e) {
    this.setState({ company: e.target.value })
  }

  onJobTitleChange (e) {
    this.setState({ jobTitle: e.target.value })
  }

  onEmailChange (e) {
    this.setState({ email: e.target.value })
  }

  onPhoneChange (e) {
    this.setState({ phone: e.target.value })
  }

  onDescriptionChange (e) {
    this.setState({ description: e.target.value })
  }

  onUpload (e) {
    let that = this
    let file = document.querySelector('input[type=file]').files[0]
    let resizeReader = new FileReader()

    if (!file) {

    } else if (!(file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='alert.message23'
              defaultMessage='[Error] Only allow image format: jpeg / png / gif'
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else {
      getOrientation(file, (orientation) => {
        resizeReader.readAsDataURL(file)

        resizeReader.onloadend = function () {
          let image = new Image()

          image.src = resizeReader.result
          image.onload = function (imageEvent) {
            /* Resize */
            let canvas = document.createElement('canvas')

            let max_size = constants.MAX_USER_IMG_WIDTH

            let width = image.width

            let height = image.height
            if (width > height) {
              if (width > max_size) {
                height *= max_size / width
                width = max_size
              }
            } else {
              if (height > max_size) {
                width *= max_size / height
                height = max_size
              }
            }
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d').drawImage(image, 0, 0, width, height)

            /* Adjust Orientation */
            let oriWidth = width
            let oriHeight = height
            let degrees = 0
            if (orientation === 6) {
              degrees = 90
            } else if (orientation === 3) {
              degrees = 180
            } else if (orientation === 8) {
              degrees = 270
            }
            let newSize = newCanvasSize(oriWidth, oriHeight, degrees)
            canvas.width = newSize[0]
            canvas.height = newSize[1]
            let ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.save()
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(degrees * Math.PI / 180)
            ctx.drawImage(image, -oriWidth / 2, -oriHeight / 2, oriWidth, oriHeight)
            ctx.restore()

            /* Update img src with data url */
            let imgDataUrl = canvas.toDataURL('image/jpeg')
            that.setState({ userImg: imgDataUrl })

            // editImgSubmit(imgDataUrl)
            // document.getElementById('profile-page-pic').setAttribute('src', imgDataUrl);
          }
        }
      })
    }
  }

  onSubmit () {
    const name = this.state.name || ''
    const userImg = this.state.userImg || ''
    const company = this.state.company || ''
    const jobTitle = this.state.jobTitle || ''
    const email = this.state.email || ''
    const phone = this.state.phone || ''
    const description = this.state.description || ''

    let that = this
    let trimmedName = name.trim()
    let trimmedCompany = company.trim()
    let trimmedJobTitle = jobTitle.trim()
    let trimmedEmail = email.trim()
    let trimmedPhone = phone.trim()
    let trimmedDescription = description.trim()

    if (trimmedName === constants.DEFAULT_USER_NAME) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.default-user-name-alert'
              defaultMessage='user name cannot be {DEFAULT_USER_NAME}'
              values={{ DEFAULT_USER_NAME: constants.DEFAULT_USER_NAME }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedName).length - 2 > constants.MAX_USER_NAME_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.user-name-length-alert'
              defaultMessage='user name cannot exceed {MAX_USER_NAME_SIZE} characters'
              values={{ MAX_USER_NAME_SIZE: constants.MAX_USER_NAME_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (isEmpty(trimmedName)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.user-name-empty-alert'
              defaultMessage='user name cannot be empty'
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedCompany).length - 2 > constants.MAX_USER_COMPANY_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.company-name-length-alert'
              defaultMessage='company name cannot exceed {MAX_USER_COMPANY_SIZE} characters'
              values={{ MAX_USER_COMPANY_SIZE: constants.MAX_USER_COMPANY_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedJobTitle).length - 2 > constants.MAX_USER_JOBTITLE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.job-title-length-alert'
              defaultMessage='job title cannot exceed {MAX_USER_JOBTITLE_SIZE} characters'
              values={{ MAX_USER_JOBTITLE_SIZE: constants.MAX_USER_JOBTITLE_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedEmail).length - 2 > constants.MAX_USER_EMAIL_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.email-length-alert'
              defaultMessage='email cannot exceed {MAX_USER_EMAIL_SIZE} characters'
              values={{ MAX_USER_EMAIL_SIZE: constants.MAX_USER_EMAIL_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedPhone).length - 2 > constants.MAX_USER_PHONE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.phone-length-alert'
              defaultMessage='phone cannot exceed {MAX_USER_PHONE_SIZE} characters'
              values={{ MAX_USER_PHONE_SIZE: constants.MAX_USER_PHONE_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (JSON.stringify(trimmedDescription).length - 2 > constants.MAX_USER_DESCRIPTION_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.description-length-alert'
              defaultMessage='description cannot exceed {MAX_USER_DESCRIPTION_SIZE} characters'
              values={{ MAX_USER_DESCRIPTION_SIZE: constants.MAX_USER_DESCRIPTION_SIZE }}
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id='edit-name-modal.email-format-alert'
              defaultMessage='Email is invalid'
            />),
          onConfirm: () => that.setState({ showAlert: false })
        }
      })
    } else {
      let editedProfile = {
        name: trimmedName,
        company: trimmedCompany,
        jobTitle: trimmedJobTitle,
        email: trimmedEmail,
        phone: trimmedPhone,
        description: trimmedDescription
      }

      this.updateProfile(trimmedName, editedProfile, userImg)
      this.props.finishEdit()
    }
  }

  render () {
    const { intl } = this.props
    const { showAlert, alertData, name, userImg, company, jobTitle, email, phone, description } = this.state

    const company_placeholder = intl.formatMessage({ id: 'edit-name-modal.company-placeholder' })
    const jobtitle_placeholder = intl.formatMessage({ id: 'edit-name-modal.jobtitle-placeholder' })
    const email_placeholder = intl.formatMessage({ id: 'edit-name-modal.email-placeholder' })
    const phone_placeholder = intl.formatMessage({ id: 'edit-name-modal.phone-placeholder' })
    const description_placeholder = intl.formatMessage({ id: 'edit-name-modal.description-placeholder' })

    return (
      <div className={`${styles['root']} ${styles['editing']}`}>
        <div className={styles['modal-action-section']}>
          <button className={styles['submit-button']} onClick={() => { this.onSubmit() }}>
            <FontAwesomeIcon icon='check' size='xs' />
          </button>
        </div>

        <div className={styles['info-section']}>
          <div className={styles['left-side']}>
            <label className={styles['profile-picture']}>
              <img id='profile-page-pic' src={userImg} alt={'User Profile'} />
              <input type='file' id='getval' onChange={this.onUpload} />
            </label>
            <div className={styles['qr-code']}>
              <img src={`${PTTAI_URL_BASE}/images/btn_qrcode@2x.jpg`} alt='QRCode Button' />
            </div>
          </div>

          <div className={styles['right-side']}>
            <div className={styles['main-info']}>
              <div className={styles['profile-input']}>
                <div className={styles['name']}>
                  <input
                    name='title-input'
                    value={name}
                    onChange={this.onNameChange} />
                </div>
                <div className={styles['company']}>
                  <input
                    placeholder={company_placeholder}
                    autoFocus
                    name='title-input'
                    value={company}
                    onChange={this.onCompanyChange} />
                </div>
                <div className={styles['job-title']}>
                  <input
                    placeholder={jobtitle_placeholder}
                    name='title-input'
                    value={jobTitle}
                    onChange={this.onJobTitleChange} />
                </div>
              </div>
            </div>
            <div className={styles['contact-info']}>
              <div className={styles['contact-input']}>
                <div className={styles['email']}>
                  <input
                    placeholder={email_placeholder}
                    name='title-input'
                    value={email}
                    onChange={this.onEmailChange} />
                </div>
                <div className={styles['phone']}>
                  <input
                    placeholder={phone_placeholder}
                    name='title-input'
                    value={phone}
                    onChange={this.onPhoneChange} />
                </div>
              </div>
            </div>
            <div className={styles['other-info']}>
              <div className={styles['desc-input']}>
                <div className={styles['description']}>
                  <textarea
                    rows='3'
                    placeholder={description_placeholder}
                    name='title-input'
                    value={description}
                    onChange={this.onDescriptionChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doNameCardModal: bindActionCreators(doNameCardModal, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(NameCardModal))
