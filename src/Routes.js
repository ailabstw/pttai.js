import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import RootPage from './containers/RootPage'

class Routes extends Component {
  render() {
    return (
      <Router >
        <Switch>
          <Route exact path='/hub' render={(props) => <RootPage {...props} myComponent={'HubPage'} />} />
          <Route exact path='/board/:boardId' render={(props) => <RootPage {...props} myComponent={'BoardPage'} />} />
          <Route exact path='/board/:boardId/article/:articleId' render={(props) => <RootPage {...props} myComponent={'ArticlePage'} />} />
          <Route exact path='/friend' render={(props) => <RootPage {...props} myComponent={'FriendListPage'} />} />
          <Route exact path='/friend/:friendId/chat/:chatId' render={(props) => <RootPage {...props} myComponent={'FriendChatPage'} />} />
          <Redirect exact from="/" to="/friend" />
        </Switch>
      </Router>
    );
  }
}

export default Routes
