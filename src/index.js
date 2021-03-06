import 'react-hot-loader/patch'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import { IntlProvider } from 'react-intl'

import Routes from './Routes'
import createStore from './reducers'
import registerServiceWorker from './registerServiceWorker'
import { setup as setupNotification } from './utils/notification'
import { language, messages } from './utils/utils'
import DevTools from './DevTools'
// import ReactGA from 'react-ga'

import './overwrite_console.js'

import 'normalize.css/normalize.css'
import 'bootstrap/dist/css/bootstrap.css'
import './index.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

import Empty from './components/Empty'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faMinus,
  faSearch,
  faArrowLeft,
  faArrowCircleLeft,
  faCheck,
  faCaretRight,
  faEllipsisH,
  faPen } from '@fortawesome/free-solid-svg-icons'

library.add(faMinus)
library.add(faSearch)
library.add(faArrowLeft)
library.add(faArrowCircleLeft)
library.add(faCheck)
library.add(faCaretRight)
library.add(faEllipsisH)
library.add(faPen)

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

const renderDevTools = () => <Empty /> || process.env.NODE_ENV === 'production' ? (<Empty />) : (<DevTools />)

render(Routes)
registerServiceWorker()
setupNotification()

if (module.hot) {
  module.hot.accept('./Routes', () => {
    render(Routes)
  })
}
