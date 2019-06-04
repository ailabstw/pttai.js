import React from 'react'
import { IntlProvider } from 'react-intl'
import { MemoryRouter as Router, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history'
import { mount, unmount } from 'enzyme'

import { language, messages } from './utils/utils'
import setupStore from './containers/testUtils'

import { SwitchRoutes } from './Routes'
import RootPage from './containers/RootPage'
import HubPage from './containers/HubPage'
import FriendListPage from './containers/FriendListPage'
import BoardPage      from './containers/BoardPage'
import ArticlePage    from './containers/ArticlePage'
import FriendChatPage from './containers/FriendChatPage'

let store = null
let wrapper = null

describe('Routes', () => {
  let domTreeFunc = (path) => (
    <IntlProvider locale={language} messages={messages}>
      <Provider store={store}>
        <Router initialEntries={[path]}>
          <SwitchRoutes />
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

  it('should render HubPage if path is /hub', () => {
    wrapper = mount(domTreeFunc('/hub'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(HubPage).length).toBe(1);

    expect(wrapper.find(BoardPage).length).toBe(0);
    expect(wrapper.find(ArticlePage).length).toBe(0);
    expect(wrapper.find(FriendListPage).length).toBe(0);
    expect(wrapper.find(FriendChatPage).length).toBe(0);
  })

  it('should render BoardPage if path is /board/:boardId', () => {
    wrapper = mount(domTreeFunc('/board/:boardId'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(BoardPage).length).toBe(1);

    expect(wrapper.find(HubPage).length).toBe(0);
    expect(wrapper.find(ArticlePage).length).toBe(0);
    expect(wrapper.find(FriendListPage).length).toBe(0);
    expect(wrapper.find(FriendChatPage).length).toBe(0);
  })

  it('should render ArticlePage if path is /board/:boardId/article/:articleId', () => {
    wrapper = mount(domTreeFunc('/board/:boardId/article/:articleId'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(ArticlePage).length).toBe(1);

    expect(wrapper.find(HubPage).length).toBe(0);
    expect(wrapper.find(BoardPage).length).toBe(0);
    expect(wrapper.find(FriendListPage).length).toBe(0);
    expect(wrapper.find(FriendChatPage).length).toBe(0);
  })

  it('should render FriendListPage if path is /friend', () => {
    wrapper = mount(domTreeFunc('/friend'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(FriendListPage).length).toBe(1);

    expect(wrapper.find(HubPage).length).toBe(0);
    expect(wrapper.find(BoardPage).length).toBe(0);
    expect(wrapper.find(ArticlePage).length).toBe(0);
    expect(wrapper.find(FriendChatPage).length).toBe(0);
  })

  it('should render FriendChatPage if path is /friend/:friendId/chat/:chatId', () => {
    wrapper = mount(domTreeFunc('/friend/:friendId/chat/:chatId'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(FriendChatPage).length).toBe(1);

    expect(wrapper.find(HubPage).length).toBe(0);
    expect(wrapper.find(BoardPage).length).toBe(0);
    expect(wrapper.find(ArticlePage).length).toBe(0);
    expect(wrapper.find(FriendListPage).length).toBe(0);
  })

  it('should render FriendListPage if path is /', () => {
    wrapper = mount(domTreeFunc('/'));

    expect(wrapper.find(RootPage).length).toBe(1);
    expect(wrapper.find(FriendListPage).length).toBe(1);

    expect(wrapper.find(HubPage).length).toBe(0);
    expect(wrapper.find(BoardPage).length).toBe(0);
    expect(wrapper.find(ArticlePage).length).toBe(0);
    expect(wrapper.find(FriendChatPage).length).toBe(0);
  })

  // TODO:
  // it('should render FriendListPage if path is invalid', () => {
  //   wrapper = mount(domTreeFunc('/whatever_rath'));

  //   expect(wrapper.find(Redirect).prop('to')).toBe('/friend');
  // })

})

