import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import AlertComponent from '../components/AlertComponent'

import * as doProfilePage from '../reducers/ProfilePage'
import * as doModalContainer from '../reducers/ModalContainer'

import styles from './ProfilePage.module.scss'

class ProfilePage extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      profilePic: '',
      showAlert: false,
      alertData: {
        message: '',
        onClose: null,
        onConfirm: null
      }
    }
  }

  render () {
    const { userId,
      userName,
      userImg,
      openNameCard,
      // hasUnread,
      // onLatestClicked,
      isChatRoom,
      onSettingClicked } = this.props

    const { alertData, showAlert } = this.state

    // let latestClass = hasUnread? 'profile-latest-active':'profile-latest';

    let rootClass = styles['root']
    if (isChatRoom) { rootClass += ' ' + styles['collapsed'] }

    return (
      <div className={rootClass}>
        <div className={styles['content']}>
          <div className={styles['profile-picture']} onClick={openNameCard}>
            {
              userImg ? (
                <img src={userImg} alt={'User Profile'} />
              ) : null
            }
          </div>
          <div className={styles['profile-description']} onClick={openNameCard}>
            <div title={userId} className={styles['name']} >{userName}</div>
          </div>
          {/* <div className={styles[latestClass]} onClick={onLatestClicked}></div> */}
          <div className={styles['profile-qr-code']} onClick={onSettingClicked} />
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
    doProfilePage: bindActionCreators(doProfilePage, dispatch),
    doModalContainer: bindActionCreators(doModalContainer, dispatch)
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage)
