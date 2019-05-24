import React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { mount, unmount } from 'enzyme'

import HubPage from './HubPage'
import Empty from '../components/Empty'
import HubComponent from '../components/HubComponent'
import AlertComponent from '../components/AlertComponent'

import { language, messages, getUUID } from '../utils/utils'
import setupStore from './testUtils'

let store = null

describe('HubPage container', () => {
  let wrapper = null
  let domTreeFunc = (id, props) => (
    <IntlProvider locale={language} messages={messages}>
      <Provider store={store}>
        <HubPage {...props} markSeen={()=>{}} myId={id} />
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

  it('should render nothing if no hubpage id', () => {
    wrapper = mount(domTreeFunc(null));

    expect(wrapper.find(Empty).length).toBe(1);
    expect(wrapper.find(HubComponent).length).toBe(0);
  })

  it('should render the hubpage container and its components', () => {
    wrapper = mount(domTreeFunc(getUUID()));

    expect(wrapper.find(HubComponent).length).toBe(1);
    expect(wrapper.find(AlertComponent).length).toBe(1);
  })


})
