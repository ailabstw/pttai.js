jest.mock('react-qr-reader');
jest.mock('../utils/utils', () => ({
  isAndroid: jest.fn(),
  isIOS: jest.fn(),
  language: 'en',
  messages: {}
}) )

import React from 'react'
import { IntlProvider } from 'react-intl'
import { mount } from 'enzyme'
import QRScannerSubmodal, { WebScanner, AndroidScanner, IosScanner } from './QRScannerSubmodal'

import { language, messages, isIOS, isAndroid } from '../utils/utils'

describe('<QRScannerSubmodal />', () => {
  let wrapper = null
  let mountComponent = onScanned => {
    wrapper = mount(
      <IntlProvider locale={language} messages={messages}>
        <QRScannerSubmodal onScanned={onScanned} />
      </IntlProvider>
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders <WebScanner /> if not android or ios', () => {
    isAndroid.mockReturnValue(false)
    isIOS.mockReturnValue(false)

    mountComponent(jest.fn())

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(WebScanner)).toHaveLength(1)
    expect(wrapper.find(AndroidScanner)).toHaveLength(0)
    expect(wrapper.find(IosScanner)).toHaveLength(0)
  })


  it('renders <AndroidScanner /> if is android', () => {
    isAndroid.mockReturnValue(true)
    isIOS.mockReturnValue(false)

    mountComponent(jest.fn())

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(WebScanner)).toHaveLength(0)
    expect(wrapper.find(AndroidScanner)).toHaveLength(1)
    expect(wrapper.find(IosScanner)).toHaveLength(0)
  })

  it('renders <IosScanner /> if is iOS', () => {
    isAndroid.mockReturnValue(false)
    isIOS.mockReturnValue(true)

    mountComponent(jest.fn())

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find(WebScanner)).toHaveLength(0)
    expect(wrapper.find(AndroidScanner)).toHaveLength(0)
    expect(wrapper.find(IosScanner)).toHaveLength(1)
  })
})

