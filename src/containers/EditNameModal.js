import React, { PureComponent }   from 'react'
import Modal                      from 'react-modal'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
//import { FontAwesomeIcon }        from '@fortawesome/react-fontawesome'
import { FormattedMessage,
         injectIntl }             from 'react-intl'
import QRCode                     from 'qrcode.react'
import validator                  from 'validator'
import { CopyToClipboard }        from 'react-copy-to-clipboard'

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
      qrCodeCopied:   false,
    };
  }

  render() {
    const { intl, onModalClose, modal: { currentModal } } = this.props
    const { name, userImg, company, jobTitle, email, phone, description, isEdit, friendJoinKey, qrCodeCopied } = this.state

    const company_placeholder     = intl.formatMessage({id: 'edit-name-modal.company-placeholder'});
    const jobtitle_placeholder    = intl.formatMessage({id: 'edit-name-modal.jobtitle-placeholder'});
    const email_placeholder       = intl.formatMessage({id: 'edit-name-modal.email-placeholder'});
    const phone_placeholder       = intl.formatMessage({id: 'edit-name-modal.phone-placeholder'});
    const description_placeholder = intl.formatMessage({id: 'edit-name-modal.description-placeholder'});

    if (isEdit) {
      return <EditingNameCard
                {...this.props}
                {...this.state}
                finishEdit={ editedProfile => {
                  this.setState({
                    isEdit: false,
                    ...editedProfile
                  })
                }} />
    }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.editNameModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Edit Name Modal">
          <div className={styles['root']}>
            <div className={styles['wrapper']}>
              <div className={styles['info-section']}>
                <div className={styles['left-side']}>
                  <div className={styles['profile-picture']}>
                    <div>
                      <img id="profile-page-pic" src={userImg} alt={'User Profile'}/>
                      <div className={styles['mask']}></div>
                    </div>
                  </div>
                  {/*
                  <button className={styles['edit-button']} onClick={() => this.setState({ isEdit: true })}>
                    <FontAwesomeIcon icon="pen" size="xs"/>
                  </button>
                  */}
                </div>
                <div className={styles['right-side']}>
                  <div className={styles['main-info']}>
                    <div className={styles['profile-input']}>
                      <div className={styles['name']}>
                        <div>{name}</div>
                      </div>
                      <div className={styles['company']}>
                      {
                        company ? (
                          <div>{company}</div>
                        ):(
                          <div className={styles['unfilled']}>{company_placeholder}</div>
                        )
                      }
                      </div>
                      <div className={styles['job-title']}>
                      {
                        jobTitle ? (
                          <div>{jobTitle}</div>
                        ):(
                          <div className={styles['unfilled']}>{jobtitle_placeholder}</div>
                        )
                      }
                      </div>
                    </div>
                    <div hidden className={styles['qr-code']}>
                      <QRCode value={friendJoinKey.URL} size={80} />
                    </div>
                  </div>
                  <div className={styles['divider']}></div>
                  <div className={styles['other-info']}>
                    <div className={styles['contact-input']}>
                      <div className={styles['email']}>
                      {
                        email ? (
                          <div>{email}</div>
                        ):(
                          <div className={styles['unfilled']}>{email_placeholder}</div>
                        )
                      }
                      </div>
                      <div className={styles['phone']}>
                      {
                        phone ? (
                          <div>{phone}</div>
                        ):(
                          <div className={styles['unfilled']}>{phone_placeholder}</div>
                        )
                      }
                      </div>
                    </div>
                  </div>
                  <div className={styles['divider']}></div>
                  <div className={styles['other-info']}>
                    <div className={styles['desc-input']}>
                      <div className={styles['description']}>
                      {
                        description ? (
                          description.split('\n').map((line,i) => <div key={`desc-line-${i}`}>{line}</div>)
                        ):(
                          <div className={styles['unfilled']}>{description_placeholder}</div>
                        )
                      }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles['editname-modal-action-section']}>
                <button className={styles['editname-modal-cancel']} onClick={onModalClose}>
                  <div className={styles['cancel-icon']}></div>
                  <FormattedMessage
                    id="edit-name-modal.leave-button"
                    defaultMessage="Leave"
                  />
                </button>
                <button className={styles['editname-modal-submit']} onClick={() => this.setState({ isEdit: true })}>
                  <div className={styles['edit-icon']}></div>
                  <FormattedMessage
                    id="edit-name-modal.edit-button"
                    defaultMessage="Edit"
                  />
                </button>
              </div>
              <div className={styles['qr-code-section']}>
                <div className={styles['qr-code']}>
                  <QRCode value={friendJoinKey.URL} size={250} />
                </div>
                <CopyToClipboard text={friendJoinKey.URL}
                                 onCopy={() => this.setState({qrCodeCopied: true})}>
                  <button className={styles['editname-modal-copy']} onClick={null}>
                    {
                      qrCodeCopied? (
                        <FormattedMessage
                          id="add-device-modal.copy-node-id-2"
                          defaultMessage="Copied"
                        />
                      ): (
                        <FormattedMessage
                          id="add-friend-modal.copy-my-id-1"
                          defaultMessage="Copy your ID"
                        />
                      )
                    }
                  </button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

class EditingNameCard extends PureComponent {
  constructor(props) {
    super();
    this.state = {

      nameOriginal:         props.name,
      userImgOriginal:      props.userImg,
      companyOriginal:      props.company,
      jobTitleOriginal:     props.jobTitle,
      emailOriginal:        props.email,
      phoneOriginal:        props.phone,
      descriptionOriginal:  props.descriptiom,

      name:           props.name,
      userImg:        props.userImg,
      company:        props.company,
      jobTitle:       props.jobTitle,
      email:          props.email,
      phone:          props.phone,
      description:    props.description,

      friendJoinKey:  props.friendJoinKey,
      isEdit:         false,
      qrCodeCopied:   false,
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

  onUpload(e) {
    //let { modalInput: { editImgSubmit } } = this.props
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
            }
            else {
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
            }
            else if (orientation === 3) {
              degrees = 180;
            }
            else if (orientation === 8) {
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
            that.setState({ userImg: imgDataUrl })

            // editImgSubmit(imgDataUrl)
            // document.getElementById('profile-page-pic').setAttribute('src', imgDataUrl);
          }
        }
      })
    }
  }

  onSubmit() {
    const { onModalSubmit/*, onModalClose*/, modalInput: { editImgSubmit } } = this.props

    const { name }          = this.state
    const { userImg }       = this.state
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
          message: (
            <FormattedMessage
              id="edit-name-modal.default-user-name-alert"
              defaultMessage="user name cannot be {DEFAULT_USER_NAME}"
              values={{ DEFAULT_USER_NAME: constants.DEFAULT_USER_NAME }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedName).length - 2 > constants.MAX_USER_NAME_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.user-name-length-alert"
              defaultMessage="user name cannot exceed {MAX_USER_NAME_SIZE} characters"
              values={{ MAX_USER_NAME_SIZE: constants.MAX_USER_NAME_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (isEmpty(trimmedName)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.user-name-empty-alert"
              defaultMessage="user name cannot be empty"
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedCompany).length - 2 > constants.MAX_USER_COMPANY_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.company-name-length-alert"
              defaultMessage="company name cannot exceed {MAX_USER_COMPANY_SIZE} characters"
              values={{ MAX_USER_COMPANY_SIZE: constants.MAX_USER_COMPANY_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedJobTitle).length - 2 > constants.MAX_USER_JOBTITLE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.job-title-length-alert"
              defaultMessage="job title cannot exceed {MAX_USER_JOBTITLE_SIZE} characters"
              values={{ MAX_USER_JOBTITLE_SIZE: constants.MAX_USER_JOBTITLE_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedEmail).length - 2 > constants.MAX_USER_EMAIL_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.email-length-alert"
              defaultMessage="email cannot exceed {MAX_USER_EMAIL_SIZE} characters"
              values={{ MAX_USER_EMAIL_SIZE: constants.MAX_USER_EMAIL_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedPhone).length - 2 > constants.MAX_USER_PHONE_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.phone-length-alert"
              defaultMessage="phone cannot exceed {MAX_USER_PHONE_SIZE} characters"
              values={{ MAX_USER_PHONE_SIZE: constants.MAX_USER_PHONE_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (JSON.stringify(trimmedDescription).length - 2 > constants.MAX_USER_DESCRIPTION_SIZE) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.description-length-alert"
              defaultMessage="description cannot exceed {MAX_USER_DESCRIPTION_SIZE} characters"
              values={{ MAX_USER_DESCRIPTION_SIZE: constants.MAX_USER_DESCRIPTION_SIZE }}
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      this.setState({
        showAlert: true,
        alertData: {
          message: (
            <FormattedMessage
              id="edit-name-modal.email-format-alert"
              defaultMessage="Email is invalid"
            />),
          onConfirm: () => that.setState({showAlert: false})
        }
      })
    }
    else {
      let editedProfile = {
        name:         trimmedName,
        company:      trimmedCompany,
        jobTitle:     trimmedJobTitle,
        email:        trimmedEmail,
        phone:        trimmedPhone,
        description:  trimmedDescription
      }

      editImgSubmit(userImg)
      onModalSubmit(trimmedName, editedProfile)
      this.props.finishEdit(editedProfile)
      //onModalClose()
    }
  }

  render(){
    const { intl, onModalClose, modal: { currentModal } } = this.props
    const { showAlert, alertData, name, userImg, company, jobTitle, email, phone, description, isEdit, friendJoinKey, qrCodeCopied } = this.state

    const company_placeholder     = intl.formatMessage({id: 'edit-name-modal.company-placeholder'});
    const jobtitle_placeholder    = intl.formatMessage({id: 'edit-name-modal.jobtitle-placeholder'});
    const email_placeholder       = intl.formatMessage({id: 'edit-name-modal.email-placeholder'});
    const phone_placeholder       = intl.formatMessage({id: 'edit-name-modal.phone-placeholder'});
    const description_placeholder = intl.formatMessage({id: 'edit-name-modal.description-placeholder'});

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.editNameModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Edit Name Modal">
          <div className={styles['root']}>
            <div className={styles['wrapper']}>
              <div className={styles['info-section']}>
                <div className={styles['left-side']}>
                  <div className={styles['profile-picture']}>
                    <label>
                      <img id="profile-page-pic" src={userImg} alt={'User Profile'}/>
                      <div className={styles['mask']}></div>
                      <input type="file" id="getval" onChange={this.onUpload}/>
                      <div className={styles['profile-picture-edit-icon']}></div>
                    </label>
                  </div>
                  {/*
                      <button className={styles['edit-button']} onClick={() => {
                        this.onSubmit()
                      }}>
                        <FontAwesomeIcon icon="check" size="xs"/>
                      </button>
                  */}
                </div>
                <div className={styles['right-side']}>
                  <div className={styles['main-info']}>
                    <div className={styles['profile-input']}>
                      <div className={styles['name']}>
                        <input
                          name='title-input'
                          value={name}
                          onChange={this.onNameChange}/>
                      </div>
                      <div className={styles['company']}>
                        <input
                          placeholder={company_placeholder}
                          autoFocus
                          name='title-input'
                          value={company}
                          onChange={this.onCompanyChange}/>
                      </div>
                      <div className={styles['job-title']}>
                        <input
                          placeholder={jobtitle_placeholder}
                          name='title-input'
                          value={jobTitle}
                          onChange={this.onJobTitleChange}/>
                      </div>
                    </div>
                    <div hidden className={styles['qr-code']}>
                      <QRCode value={friendJoinKey.URL} size={80} />
                    </div>
                  </div>
                  <div className={styles['divider']}></div>
                  <div className={styles['other-info']}>
                    <div className={styles['contact-input']}>
                      <div className={styles['email']}>
                        <input
                          placeholder={email_placeholder}
                          name='title-input'
                          value={email}
                          onChange={this.onEmailChange}/>
                      </div>
                      <div className={styles['phone']}>
                        <input
                          placeholder={phone_placeholder}
                          name='title-input'
                          value={phone}
                          onChange={this.onPhoneChange}/>
                      </div>
                    </div>
                  </div>
                  <div className={styles['divider']}></div>
                  <div className={styles['other-info']}>
                    <div className={styles['desc-input']}>
                      <div className={styles['description']}>
                        <textarea
                          placeholder={description_placeholder}
                          name='title-input'
                          value={description}
                          onChange={this.onDescriptionChange}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles['editname-modal-action-section']}>
                <button className={styles['editname-modal-cancel']} onClick={() => {

                  const { nameOriginal,
                          userImgOriginal,
                          companyOriginal,
                          jobTitleOriginal,
                          emailOriginal,
                          phoneOriginal,
                          descriptionOriginal } = this.state

                  this.props.finishEdit({
                    isEdit:       false,
                    name:         nameOriginal,
                    userImg:      userImgOriginal,
                    company:      companyOriginal,
                    jobTitle:     jobTitleOriginal,
                    email:        emailOriginal,
                    phone:        phoneOriginal,
                    description:  descriptionOriginal
                  })
                }}>
                  <div className={styles['cancel-icon']}></div>
                  <FormattedMessage
                    id="first-popup-modal.action1"
                    defaultMessage="Cancel"
                  />
                </button>
                <button className={styles['editname-modal-submit']} onClick={() => { this.onSubmit() }}>
                  <div className={styles['confirm-icon']}></div>
                  <FormattedMessage
                    id="first-popup-modal.action2"
                    defaultMessage="Confirm"
                  />
                </button>
              </div>
              <div className={styles['qr-code-section']}>
                <div className={styles['qr-code']}>
                  <QRCode value={friendJoinKey.URL} size={250} />
                </div>
                <CopyToClipboard text={friendJoinKey.URL}
                                 onCopy={() => this.setState({qrCodeCopied: true})}>
                  <button className={styles['editname-modal-copy']} onClick={null}>
                    {
                      qrCodeCopied? (
                        <FormattedMessage
                          id="add-device-modal.copy-node-id-2"
                          defaultMessage="Copied"
                        />
                      ): (
                        <FormattedMessage
                          id="add-friend-modal.copy-my-id-1"
                          defaultMessage="Copy your ID"
                        />
                      )
                    }
                  </button>
                </CopyToClipboard>
              </div>
              <AlertComponent show={showAlert} alertData={alertData}/>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EditNameModal))
