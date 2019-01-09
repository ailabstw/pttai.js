import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import { FormattedMessage }     from 'react-intl'

import AlertComponent           from '../components/AlertComponent'

import * as doProfilePage       from '../reducers/ProfilePage'
import * as doModalContainer    from '../reducers/ModalContainer'

import * as constants           from '../constants/Constants'
import { getOrientation,
         newCanvasSize }        from '../utils/utils'

import styles                   from './ProfilePage.css'

class ProfilePage extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      profilePic: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null,
      },
    };

    this.onUpload = this.onUpload.bind(this);
  }

  onUpload(e) {
    let { onEditImg } = this.props
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

                onEditImg(imgDataUrl)
                document.getElementById('profile-page-pic').setAttribute('src', imgDataUrl);
            }
         }
      })
    }
  }

  render() {

    const { userId,
            userName,
            userImg,
            onEditName,
            hasUnread,
            onSettingClicked,
            onLatestClicked } = this.props

    const { alertData, showAlert } = this.state

    let latestClass = hasUnread? 'profile-latest-active':'profile-latest';

    return (
      <div className={styles['root']}>
        <div className={styles['content']}>
          <div className={styles['profile-picture']}>
          {
            userImg? (
              <label >
                <img id="profile-page-pic" src={userImg} alt={'User Profile'}/>
                <div className={styles['mask']}></div>
                <input type="file" id="getval" onChange={this.onUpload}/>
              </label>
            ):null
          }
          </div>
          <div className={styles['profile-description']} onClick={onEditName}>
            <div title={userId} className={styles['name']} >{userName}</div>
          </div>
          <div className={styles[latestClass]} onClick={onLatestClicked}></div>
          <div className={styles['profile-qr-code']} onClick={onSettingClicked}></div>
        </div>
        <AlertComponent show={showAlert} alertData={alertData}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doProfilePage: bindActionCreators(doProfilePage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage)
