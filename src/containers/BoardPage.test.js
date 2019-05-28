import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { mount, unmount } from 'enzyme'

import BoardPage from './BoardPage'
import Empty from '../components/Empty'

import BoardComponent from '../components/BoardComponent'
import AlertComponent from '../components/AlertComponent'

import { language, messages, getUUID } from '../utils/utils'
import setupStore from './testUtils'

let store = null

describe('HubPage container', () => {
  let wrapper = null
  let common_props = {
    match: { params: '' }
  };
  let domTreeFunc = (id, props) => (
    <IntlProvider locale={language} messages={messages}>
      <Provider store={store}>
        <Router>
          <BoardPage {...props} myId={id} markSeen={() => {}} />
        </Router>
      </Provider>
    </IntlProvider>
  )

  beforeAll(() => {
    store = setupStore();
  })

  afterAll(() => {
    store = null
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('should render nothing if no boardpage id', () => {
    wrapper = mount(domTreeFunc(null, common_props));

    expect(wrapper.find(Empty).length).toBe(1);
    expect(wrapper.find(BoardComponent).length).toBe(0);
  })

  it('should render the hubpage container and its components', () => {
    wrapper = mount(domTreeFunc(getUUID(), common_props));

    expect(wrapper.find(BoardComponent).length).toBe(1);
    expect(wrapper.find(AlertComponent).length).toBe(1);
  })
})
