import React from 'react'
import { PTTAI_URL_BASE } from './config'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'

import RootPage from './containers/RootPage'

// for testing
export const SwitchRoutes = () => (
  <Switch>
    <Route exact path={`/board/:boardId`} render={(props) => <RootPage {...props} myComponent={'BoardPage'} />} />
    <Route exact path={`/board/:boardId/article/:articleId`} render={(props) => <RootPage {...props} myComponent={'ArticlePage'} />} />
    <Route exact path={`/friend/:friendId/chat/:chatId`} render={(props) => <RootPage {...props} myComponent={'FriendChatPage'} />} />
    <Route exact path={`/`} render={(props) => <RootPage {...props} />} />
  </Switch>
)

export default () => (
  <Router basename={`${PTTAI_URL_BASE}`}>
    <SwitchRoutes />
  </Router>
)
