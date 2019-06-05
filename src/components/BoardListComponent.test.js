import React from 'react'
import { MemoryRouter as Router, Link } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import BoardListComponent from './BoardListComponent'

import { language, messages } from '../utils/utils'
import setupStore from '../containers/testUtils'

let store = null

describe('<BoardListComponent />', () => {

  const mountDom = (mockData) => (
    mount(
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
          <Router>
            <BoardListComponent {...mockData} />
          </Router>
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
      noBoard: true
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(FormattedMessage).length).toBe(1)
    expect(wrapper.find(ClipLoader).exists()).toBe(false)
    expect(wrapper.find(Link).exists()).toBe(false)
  })

  it('should render one ArticleComponent in list if listData exist', () => {
    let wrapper = mountDom({
      userId: 'TESTER_ID',
      listData: [{
        Status: 7, // StatusAlive
        ID: 1,
        Title: 'whatever',
        ArticleCreateTS: {},
        LastSeen: {},
        joinStatus: 3,
        BoardType: 1, // BOARD_TYPE_PERSONAL
        CreatorID: 'TESTER_ID',
        creatorName: 'TESTER',
        UpdateTS: {},
        CommentCreateTS: {}
      }],

      noArticle: false,
      isLoading: true
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).exists()).toBe(true)
    expect(wrapper.find(FormattedMessage).length).toBe(1)
  })

  it('should render one ArticleComponent in list if listData exist', () => {
    let wrapper = mountDom({
      userId: 'TESTER_ID',
      listData: [{
        Status: 7, // StatusAlive
        ID: 1,
        Title: 'whatever',
        ArticleCreateTS: {},
        LastSeen: {},
        joinStatus: 3,
        BoardType: 2, // BOARD_TYPE_PRIVATE
        CreatorID: 'TESTER_ID',
        creatorName: 'TESTER',
        UpdateTS: {},
        CommentCreateTS: {}
      }],

      noArticle: false,
      isLoading: false
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).exists()).toBe(false)
    expect(wrapper.find(FormattedMessage).exists()).toBe(false)
  })
})

