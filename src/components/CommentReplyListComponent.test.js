import React from 'react'
import { ClipLoader } from 'react-spinners'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import CommentReplyListComponent, {CommentReplyListItem} from './CommentReplyListComponent'

import { language, messages } from '../utils/utils'
import setupStore from '../containers/testUtils'
import AlertComponent from '../components/AlertComponent'

let store = null

describe('<CommentReplyListComponent />', () => {

  const mountDom = (mockData) => (
    mount(
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
          <CommentReplyListComponent {...mockData} />
        </Provider>
      </IntlProvider>
    )
  )

  beforeAll(() => {
    store = setupStore()
  })

  afterAll(() => {
    store = null
  })

  it('should render nothing but format message if no Board', () => {
    let wrapper = mountDom({
      commentContents: [],
      isLoading: true,
      userId: '',
      userImg: null,
      openCommentSettingMenuModal: jest.fn(),
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).exists()).toBe(true)
    expect(wrapper.find(AlertComponent).length).toBe(1)
  })

  it('should render nothing but format message if no Board', () => {
    let wrapper = mountDom({
      commentContents: [{
        creatorId: 'ANOTHER_ID',
        creatorImg: '',
        creatorName: '',
        contentBlockArray: ['文章內容'],
        createAt: { fromNow: jest.fn() },
        updateAt: { fromNow: jest.fn() },
        status: 7
      }],
      isLoading: false,
      userId: 'TESTER_ID',
      userImg: 'https://exmaple.com/icon.png',
      openCommentSettingMenuModal: jest.fn()
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).exists()).toBe(false)
    expect(wrapper.find(AlertComponent).length).toBe(1)
    expect(wrapper.find(CommentReplyListItem).length).toBe(1)
  })

})
describe('<CommentReplyListItem />', () => {

  const mountDom = (mockData) => (
    mount(
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
          <CommentReplyListItem {...mockData} />
        </Provider>
      </IntlProvider>
    )
  )

  beforeAll(() => {
    store = setupStore()
  })

  afterAll(() => {
    store = null
  })

  it('should render nothing but format message if no Board', () => {
    let wrapper = mountDom({
      userId: 'TESTER_ID',
      index: 1,
      item: {
        creatorId: 'ANOTHER_ID',
        creatorImg: '',
        creatorName: '',
        contentBlockArray: ['文章內容'],
        createAt: { fromNow: jest.fn() },
        updateAt: { fromNow: jest.fn() },
        status: 7
      },
      openMenu: jest.fn()
    })

    expect(wrapper.exists()).toBe(true)
  })
})
