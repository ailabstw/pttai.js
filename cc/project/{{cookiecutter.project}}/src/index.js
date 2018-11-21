import 'react-hot-loader/patch'
import React from 'react'
import ReactDOM, { Component } from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import ReactGA from 'react-ga'
import Moment from 'moment'

import config from 'config'
import Routes from './Routes'
import DevTools from './DevTools'
import createStore from './reducers'
import registerServiceWorker from './registerServiceWorker'

import 'normalize.css/normalize.css'
import 'bootstrap/dist/css/bootstrap.css'

import styles from './index.css'

import App from './containers/App'
import Empty from './components/Empty'

ReactGA.initialize(config.googleAnalyticsId)

// useRouterHistory creates a composable higher-order function
const store = createStore()

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
      <div>
      <Component />
      {renderDevTools()}
      </div>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

const renderDevTools = () => {
  if(process.env.NODE_ENV === 'production') return (<Empty />)
  //return (<Empty />)
  return (
    <DevTools />
  )
}

render(Routes)
registerServiceWorker()

if (module.hot) {
  module.hot.accept('./Routes', () => {
    render(Routes)
  })
}
