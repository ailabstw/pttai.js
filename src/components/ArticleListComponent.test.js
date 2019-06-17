import React from 'react'
import { ClipLoader } from 'react-spinners'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter as Router } from 'react-router-dom'
import { mount } from 'enzyme'
import ArticleListComponent, {ArticleItemComponent} from './ArticleListComponent'

import { language, messages } from '../utils/utils'
import setupStore from '../containers/testUtils'

let store = null

describe('<ArticleListComponent />', () => {

  const mountDom = (mockData) => (
    mount(
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
          <Router>
            <ArticleListComponent {...mockData} />
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

  it('render no-content-message if listData is empty', () => {
    let wrapper = mountDom({
      listData: [],
      noArticle: true
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ArticleItemComponent).length).toBe(0)
  })

  it('should render ClipLoader if is loading', () => {
    let wrapper = mountDom({
      listData: [],
      summaryData: [],
      noArticle: false,
      isLoading: true
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).length).toBe(1)
  })

  it('should render ClipLoader if loaded', () => {
    let wrapper = mountDom({
      listData: [],
      summaryData: [],
      noArticle: false,
      isLoading: false
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ClipLoader).length).toBe(0)
    expect(wrapper.find(ArticleItemComponent).length).toBe(0)
  })


  it('should render one ArticleItemComponent in list if listData exist', () => {
    let wrapper = mountDom({
      listData: [{
        ID: 1,
        content: 'whatever',
        updateAt: {
          toString: jest.fn(),
          fromNow: jest.fn()
        },
        CommentCreateTS: {},
        LastSeen: {}
      }],
      summaryData: [{
        B: ''
      }],
      noArticle: false,
      isLoading: true
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(ArticleItemComponent).length).toBe(1)
  })
})

describe('<ArticleListComponent />', () => {
  const mountDom = (mockData) => (
    mount(
      <IntlProvider locale={language} messages={messages}>
        <Provider store={store}>
          <Router>
            <ArticleItemComponent {...mockData} />
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

  it('render without summary', () => {
    let wrapper = mountDom({
      data: {
        ID: 1,
        content: 'whatever',
        updateAt: {
          toString: jest.fn(),
          fromNow: jest.fn()
        },
        CommentCreateTS: {},
        LastSeen: {}
      },
      summaryData: [{
        B: ''
      }],
      boardId: 'the_id'
    })

    expect(wrapper.exists()).toBe(true)
  })

  // TODO: should check functions in componentDidUpdate

})

