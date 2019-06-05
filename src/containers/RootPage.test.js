import React from 'react'
import { MemoryRouter as Router } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { mount, unmount } from 'enzyme'

import RootPage from './RootPage'
import ProfilePage from '../containers/ProfilePage'
import Navigator from '../components/Navigator'
import ModalContainer from '../containers/ModalContainer'
import HubPage from '../containers/HubPage'
import BoardPage from '../containers/BoardPage'
import ArticlePage from '../containers/ArticlePage'
import FriendListPage from '../containers/FriendListPage'
import FriendChatPage from '../containers/FriendChatPage'

import { language, messages, getUUID } from '../utils/utils'
import setupStore from './testUtils'

let store = null

describe('RootPage', () => {
  let wrapper = null
  let domTreeFunc = (componentName) => (
    <IntlProvider locale={language} messages={messages}>
      <Provider store={store}>
        <Router>
          <RootPage myComponent={componentName} />
        </Router>
      </Provider>
    </IntlProvider>
  )

  beforeAll(() => {
    store = setupStore()
  })

  afterAll(() => {
    store = null
  })

  afterEach(() => {
    wrapper.unmount()
  })


  it('should render nothing if invalid component name', () => {
    wrapper = mount(domTreeFunc(''))

    expect(wrapper.find(ProfilePage).length).toBe(1)
    expect(wrapper.find(Navigator).length).toBe(1)
    expect(wrapper.find(ModalContainer).length).toBe(1)
    expect(wrapper.find(ToastContainer).length).toBe(1)
  })

  it('should render HubPage', () => {
    wrapper = mount(domTreeFunc('HubPage'))
    expect(wrapper.find(HubPage).length).toBe(1)
    expect(wrapper.find(BoardPage).length).toBe(0)
    expect(wrapper.find(ArticlePage).length).toBe(0)
    expect(wrapper.find(FriendListPage).length).toBe(0)
    expect(wrapper.find(FriendChatPage).length).toBe(0)
  })

  it('should render BoardPage', () => {
    wrapper = mount(domTreeFunc('BoardPage'))
    expect(wrapper.find(BoardPage).length).toBe(1)
    expect(wrapper.find(HubPage).length).toBe(0)
    expect(wrapper.find(ArticlePage).length).toBe(0)
    expect(wrapper.find(FriendListPage).length).toBe(0)
    expect(wrapper.find(FriendChatPage).length).toBe(0)
  })

  it('should render ArticlePage', () => {
    wrapper = mount(domTreeFunc('ArticlePage'))
    expect(wrapper.find(ArticlePage).length).toBe(1)
    expect(wrapper.find(HubPage).length).toBe(0)
    expect(wrapper.find(BoardPage).length).toBe(0)
    expect(wrapper.find(FriendListPage).length).toBe(0)
    expect(wrapper.find(FriendChatPage).length).toBe(0)
  })

  it('should render FriendListPage', () => {
    wrapper = mount(domTreeFunc('FriendListPage'))
    expect(wrapper.find(FriendListPage).length).toBe(1)
    expect(wrapper.find(HubPage).length).toBe(0)
    expect(wrapper.find(BoardPage).length).toBe(0)
    expect(wrapper.find(ArticlePage).length).toBe(0)
    expect(wrapper.find(FriendChatPage).length).toBe(0)
  })

  it('should render FriendChatPage', () => {
    wrapper = mount(domTreeFunc('FriendChatPage'))
    expect(wrapper.find(FriendChatPage).length).toBe(1)
    expect(wrapper.find(HubPage).length).toBe(0)
    expect(wrapper.find(BoardPage).length).toBe(0)
    expect(wrapper.find(ArticlePage).length).toBe(0)
    expect(wrapper.find(FriendListPage).length).toBe(0)
  })
})
