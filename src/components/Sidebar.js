import React, { PureComponent } from 'react'
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';

import HubPage from '../containers/HubPage'
import FriendListPage from '../containers/FriendListPage'

import styles from './Sidebar.module.scss'

class Sidebar extends PureComponent {
  render() {
    const {markHubSeen, hubPageId, markFriendRead, friendListPageId} = this.props

    return (
      <Drawer variant="permanent" open={true} classes={{ paper: styles['paper'] }}>
        <HubPage {...this.props} markSeen={markHubSeen} myId={hubPageId} />
        <Divider />
        <FriendListPage {...this.props} markSeen={markFriendRead} myId={friendListPageId} />
      </Drawer>
    )
  }
}

export default Sidebar
