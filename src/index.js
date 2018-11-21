import 'react-hot-loader/patch'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import { IntlProvider, addLocaleData } from 'react-intl';

import Routes from './Routes'
import createStore from './reducers'
import registerServiceWorker from './registerServiceWorker'
//import config from 'config'
//import DevTools from './DevTools'
//import ReactGA from 'react-ga'

import 'normalize.css/normalize.css'
import 'bootstrap/dist/css/bootstrap.css'
import './index.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import Empty from './components/Empty'

import locale_en from 'react-intl/locale-data/en';
import locale_zh from 'react-intl/locale-data/zh';
import messages_zh from './translations/zh.json'
import messages_en from './translations/en.json'

import { library } from '@fortawesome/fontawesome-svg-core'
import {  faMinus,
          faSearch,
          faArrowLeft,
          faArrowCircleLeft,
          faCheck,
          faCaretRight } from '@fortawesome/free-solid-svg-icons'

library.add(faMinus)
library.add(faSearch)
library.add(faArrowLeft)
library.add(faArrowCircleLeft)
library.add(faCheck)
library.add(faCaretRight)

addLocaleData([...locale_en, ...locale_zh]);

// Localization
const messages = {
    'zh': messages_zh,
    'en': messages_en
};
// language without region code
const language = navigator.language.split(/[-_]/)[0];

// ReactGA.initialize(config.googleAnalyticsId)

const store = createStore()

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <IntlProvider locale={language} messages={messages[language]}>
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
