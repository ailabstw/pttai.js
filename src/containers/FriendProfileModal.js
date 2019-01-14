import React, { PureComponent }   from 'react'
import Modal                      from 'react-modal'
import { connect }                from 'react-redux'
import { bindActionCreators }     from 'redux'
import Immutable                  from 'immutable'

import * as constants               from '../constants/Constants'
import * as modalConstants          from '../constants/ModalConstants'
import * as doFriendProfileModal    from '../reducers/FriendProfileModal'

import styles from './FriendProfileModal.css'

class FriendProfileModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      friendId:     props.modalInput.FriendID,
      name:         props.modalInput.Name,
      userImg:      props.modalInput.Img,
    };
  }

  componentWillMount() {
    const { myId, actions:{ doFriendProfileModal } } = this.props
    const { friendId } = this.state

    doFriendProfileModal.getFriendProfile(myId, friendId)
  }

  render() {
    const { myId, friendProfileModal, onModalClose, modal: { currentModal } } = this.props
    const { name, userImg } = this.state

    let me = friendProfileModal.get(myId, Immutable.Map())
    let profile = me.get('profile', Immutable.Map()).toJS()

    profile = {
      name:         name || profile.name,
      company:      profile.company,
      jobTitle:     profile.jobTitle,
      email:        profile.email,
      phone:        profile.phone,
      description:  profile.description
    }

    // profile = {
    //   name: 'sammui',
    //   company: 'Taiwan AI Labs',
    //   jobTitle: '軟體工程師',
    //   email: 'sammui@ailabs.tw',
    //   phone: '0912345678',
    //   description: '歡迎聯絡我'
    // }

    return (
      <div>
        <Modal
          overlayClassName={styles['overlay']}
          style={modalConstants.friendProfileModalStyles}
          isOpen={currentModal !== null}
          onRequestClose={onModalClose}
          contentLabel="Edit Name Modal">
          <div className={styles['root']}>
            <div className={styles['left-side']}>
              <div className={styles['profile-picture']}>
                <img src={ userImg || constants.DEFAULT_USER_IMAGE } alt={'User Profile'}/>
              </div>
            </div>
            <div className={styles['right-side']}>
              <div className={styles['main-info']}>
                <div className={styles['profile-input']}>
                  <div className={styles['name']}>
                    <span>{ name || constants.DEFAULT_USER_NAME }</span>
                  </div>
                  <div className={styles['company']}>
                    <span>{ profile.company }</span>
                  </div>
                  <div className={styles['job-title']}>
                    <span>{ profile.jobTitle }</span>
                  </div>
                </div>
              </div>
              <div hidden={!profile.email && !profile.phone} className={styles['other-info']}>
                <div className={styles['contact-input']}>
                  <div className={styles['email']}>
                    <span>{profile.email}</span>
                  </div>
                  <div className={styles['phone']}>
                      <span>{profile.phone }</span>
                  </div>
                </div>
              </div>
              <div hidden={!profile.description} className={styles['other-info']}>
                <div className={styles['desc-input']}>
                  <div className={styles['description']}>
                    <span>{profile.description }</span>
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

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doFriendProfileModal: bindActionCreators(doFriendProfileModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(FriendProfileModal)
