import 'react-hot-loader/patch'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import { IntlProvider } from 'react-intl';

import Routes from './Routes'
import createStore from './reducers'
import registerServiceWorker from './registerServiceWorker'
import { language, messages } from './utils/utils'
//import config from 'config'
//import DevTools from './DevTools'
//import ReactGA from 'react-ga'

import 'normalize.css/normalize.css'
import 'bootstrap/dist/css/bootstrap.css'
import './index.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import Empty from './components/Empty'

import { library } from '@fortawesome/fontawesome-svg-core'
import {  faMinus,
          faSearch,
          faArrowLeft,
          faArrowCircleLeft,
          faCheck,
          faCaretRight,
          faPen } from '@fortawesome/free-solid-svg-icons'

library.add(faMinus)
library.add(faSearch)
library.add(faArrowLeft)
library.add(faArrowCircleLeft)
library.add(faCheck)
library.add(faCaretRight)
library.add(faPen)

// ReactGA.initialize(config.googleAnalyticsId)

const store = createStore()

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
        <div>
        <Component />
        {renderDevTools()}
        </div>
        </Provider>
      </IntlProvider>
    </AppContainer>,
    document.getElementById('root')
  )
}

const renderDevTools = () => {
  if(process.env.NODE_ENV === 'production') return (<Empty />)
  return (<Empty />)
  /*return (
    <DevTools />
  )*/
}

render(Routes)
registerServiceWorker()

if (module.hot) {
  module.hot.accept('./Routes', () => {
    render(Routes)
  })
}
