import React, { PureComponent }   from 'react'
import Modal                      from 'react-modal'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import { FontAwesomeIcon }        from '@fortawesome/react-fontawesome'
import { FormattedMessage }       from 'react-intl'
import QRCode                     from 'qrcode.react'
import validator                  from 'validator'

import AlertComponent         from '../components/AlertComponent'

import * as modalConstants    from '../constants/ModalConstants'
import * as constants         from '../constants/Constants'
import * as doEditNameModal   from '../reducers/EditNameModal'
import { getOrientation,
         newCanvasSize }      from '../utils/utils'

import styles from './EditNameModal.css'


function isEmpty(name) {
  return name.replace(/\s\s+/g, '') === ''
}

class EditNameModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      name:     props.modalInput.userName,
      userImg:  props.modalInput.userImg,
      company:  props.modalInput.profile.company || '',
      jobTitle: props.modalInput.profile.jobTitle || '',
      email:    props.modalInput.profile.email || '',
      phone:    props.modalInput.profile.phone || '',
      description:    props.modalInput.profile.description || '',
      friendJoinKey:  props.modalInput.friendJoinKey,
      isEdit:         false,
      showAlert:      false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onNameChange         = this.onNameChange.bind(this);
    this.onCompanyChange      = this.onCompanyChange.bind(this);
    this.onJobTitleChange     = this.onJobTitleChange.bind(this);
    this.onEmailChange        = this.onEmailChange.bind(this);
    this.onPhoneChange        = this.onPhoneChange.bind(this);
    this.onDescriptionChange  = this.onDescriptionChange.bind(this);

    this.onSubmit = this.onSubmit.bind(this);
    this.onUpload = this.onUpload.bind(this);
  }

  onNameChange(e) {
    this.setState({name:e.target.value})
  }

  onCompanyChange(e) {
    this.setState({company:e.target.value})
  }

  onJobTitleChange(e) {
    this.setState({jobTitle:e.target.value})
  }

  onEmailChange(e) {
    this.setState({email:e.target.value})
  }

  onPhoneChange(e) {
    this.setState({phone:e.target.value})
  }

  onDescriptionChange(e) {
    this.setState({description:e.target.value})
  }

  onSubmit() {
    const { onModalSubmit, onModalClose } = this.props
    const { name }          = this.state
    const { company }       = this.state
    const { jobTitle }      = this.state
    const { email }         = this.state
    const { phone }         = this.state
    const { description }   = this.state

    let that = this
    let trimmedName         = name.trim()
    let trimmedCompany      = company.trim()
    let trimmedJobTitle     = jobTitle.trim()
    let trimmedEmail        = email.trim()
    let trimmedPhone        = phone.trim()
    let trimmedDescription  = description.trim()

    if (trimmedName === constants.DEFAULT_USER_NAME) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot be ' + constants.DEFAULT_USER_NAME,
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedName).length - 2 > constants.MAX_USER_NAME_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot exceed ' + constants.MAX_USER_NAME_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (isEmpty(trimmedName)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'user name cannot be empty',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedCompany).length - 2 > constants.MAX_USER_COMPANY_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'company name cannot exceed ' + constants.MAX_USER_COMPANY_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedJobTitle).length - 2 > constants.MAX_USER_JOBTITLE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'job title cannot exceed ' + constants.MAX_USER_JOBTITLE_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedEmail).length - 2 > constants.MAX_USER_EMAIL_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'email cannot exceed ' + constants.MAX_USER_EMAIL_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedPhone).length - 2 > constants.MAX_USER_PHONE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'phone cannot exceed ' + constants.MAX_USER_PHONE_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (JSON.stringify(trimmedDescription).length - 2 > constants.MAX_USER_DESCRIPTION_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'description cannot exceed ' + constants.MAX_USER_DESCRIPTION_SIZE + ' characters',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: 'email invalid',
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      let editedProfile = {
        name:         trimmedName,
        company:      trimmedCompany,
        jobTitle:     trimmedJobTitle,
        email:        trimmedEmail,
        phone:        trimmedPhone,
        description:  trimmedDescription
      }

      onModalSubmit(trimmedName, editedProfile)
      this.setState({ isEdit: false })
      onModalClose()
    }
  }

  onUpload(e) {
    let { modalInput: { editImgSubmit } } = this.props
    let that          = this
    let file          = document.querySelector('input[type=file]').files[0];
    let resizeReader  = new FileReader();

    if (!file) {
      return
    } else if (!(file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      that.setState({
        showAlert: true,
        alertData: {
          message: (
              <FormattedMessage
                id="alert.message23"
                defaultMessage="[Error] Only allow image format: jpeg / png / gif"
              />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    } else {
      getOrientation(file, (orientation) => {
        resizeReader.readAsDataURL(file);

        resizeReader.onloadend = function () {
            let image = new Image();

            image.src = resizeReader.result;
            image.onload = function (imageEvent) {

                /* Resize */
                let canvas = document.createElement('canvas'),
                    max_size = constants.MAX_USER_IMG_WIDTH,
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width  = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);

                /* Adjust Orientation */
                let oriWidth = width
                let oriHeight = height
                let degrees = 0;
                if (orientation === 6) {
                  degrees = 90;
                } else if (orientation === 3) {
                  degrees = 180;
                } else if (orientation === 8) {
                  degrees = 270;
                }
                let newSize = newCanvasSize(oriWidth, oriHeight, degrees);
                canvas.width = newSize[0];
                canvas.height = newSize[1];
                let ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.rotate(degrees*Math.PI/180);
                ctx.drawImage(image, -oriWidth/2, -oriHeight/2, oriWidth, oriHeight);
                ctx.restore();

                /* Update img src with data url */
                let imgDataUrl = canvas.toDataURL('image/jpeg');
                that.setState({ profilePic:imgDataUrl })

                editImgSubmit(imgDataUrl)
                document.getElementById('profile-page-pic').setAttribute('src', imgDataUrl);
            }
         }
      })
    }
  }

  render() {
    const { onModalClose, modal: { currentModal } } = this.props
    const { name, userImg, company, jobTitle, email, phone, description, isEdit, showAlert, alertData, friendJoinKey } = this.state

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.editNameModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Edit Name Modal">
          <div className={styles['root']}>
          <div className={styles['info-section']}>
            <div className={styles['left-side']}>
              <div className={styles['profile-picture']}>
                {
                  isEdit? (
                    <label >
                      <img id="profile-page-pic" src={userImg} alt={'User Profile'}/>
                      <div className={styles['mask']}></div>
                      <input type="file" id="getval" onChange={this.onUpload}/>
                    </label>
                  ):(
                    <img src={userImg} alt={'User Profile'}/>
                  )
                }
              </div>
              {
                  isEdit ? (
                    <button className={styles['edit-button']} onClick={() => {
                      this.onSubmit()
                    }}>
                      <FontAwesomeIcon icon="check" size="xs"/>
                    </button>
                  ):(
                    <button className={styles['edit-button']} onClick={() => this.setState({ isEdit: true })}>
                      <FontAwesomeIcon icon="pen" size="xs"/>
                    </button>
                  )
              }
            </div>
            <div className={styles['right-side']}>
              <div className={styles['main-info']}>
                <div className={styles['profile-input']}>
                  <div className={styles['name']}>
                  {
                    isEdit ? (
                      <input
                        autoFocus
                        name='title-input'
                        value={name}
                        onChange={this.onNameChange}/>
                    ):(
                      <span>{name}</span>
                    )
                  }
                  </div>
                  <div className={styles['company']}>
                  {
                    isEdit ? (
                      <input
                        placeholder='company'
                        autoFocus
                        name='title-input'
                        value={company}
                        onChange={this.onCompanyChange}/>
                    ):(
                      <span>{company}</span>
                    )
                  }
                  </div>
                  <div className={styles['job-title']}>
                  {
                    isEdit ? (
                      <input
                        placeholder='job title'
                        autoFocus
                        name='title-input'
                        value={jobTitle }
                        onChange={this.onJobTitleChange}/>
                    ):(
                      <span>{jobTitle }</span>
                    )
                  }
                  </div>
                </div>
                <div hidden className={styles['qr-code']}>
                  <QRCode value={friendJoinKey.URL} size={80} />
                </div>
              </div>
              <div hidden={!isEdit && !email && !phone} className={styles['other-info']}>
                <div className={styles['contact-input']}>
                  <div className={styles['email']}>
                  {
                    isEdit ? (
                      <input
                        placeholder='email'
                        autoFocus
                        name='title-input'
                        value={email}
                        onChange={this.onEmailChange}/>
                    ):(
                      <span>{email}</span>
                    )
                  }
                  </div>
                  <div className={styles['phone']}>
                  {
                    isEdit ? (
                      <input
                        placeholder='phone'
                        autoFocus
                        name='title-input'
                        value={phone }
                        onChange={this.onPhoneChange}/>
                    ):(
                      <span>{phone }</span>
                    )
                  }
                  </div>
                </div>
              </div>
              <div hidden={!isEdit && !description} className={styles['other-info']}>
                <div className={styles['desc-input']}>
                  <div className={styles['description']}>
                  {
                    isEdit ? (
                      <textarea
                        placeholder='description'
                        autoFocus
                        name='title-input'
                        value={description }
                        onChange={this.onDescriptionChange}/>
                    ):(
                      <span>{description }</span>
                    )
                  }
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className={styles['qr-code-section']}>
            <div className={styles['qr-code']}>
              <QRCode value={friendJoinKey.URL} size={250} />
            </div>
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
    doEditNameModal: bindActionCreators(doEditNameModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditNameModal)
