import React from 'react'
import ReactDom from 'react-dom'
import { mount, shallow } from 'enzyme'
import { IntlProvider } from 'react-intl'

import { mountWithIntl } from './testUtils'

import PttaiEditor from './PttaiEditor'

describe('PttaiEditor component', () => {
  it.skip('should pass', () => {
    const wrapper = mountWithIntl(
      <PttaiEditor
        articleTitle={''}
        initHtmlArray={[]}
        isEdit={false}
        onDeleteArticle={null}
        onSubmitArticle={() => {}}
        onCloseArticle={() => {}} />)
  })
})
