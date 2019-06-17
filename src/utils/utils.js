import React from 'react'
import uuidv4 from 'uuid/v4'
import Immutable from 'immutable'
import camelCase from 'camelcase'
import decamelize from 'decamelize'
import QueryString from 'query-string'
import sanitizeHtml from 'sanitize-html'
import { PTTAI_APP_ROOT } from '../config'
import platform from 'platform'
import { addLocaleData } from 'react-intl'

import * as constants from '../constants/Constants'

import locale_en from 'react-intl/locale-data/en'
import locale_zh from 'react-intl/locale-data/zh'
import messages_zh from '../translations/zh.json'
import messages_en from '../translations/en.json'

import attach_icon from './../images/icon_attach@2x.png'

addLocaleData([...locale_en, ...locale_zh])

// Localization
const all_messages = {
  'zh': messages_zh,
  'en': messages_en
}

// language without region code
export const language = (() => {
  let lang = navigator.language.split(/[-_]/)[0]
  return (lang in all_messages) ? lang : 'en'
})()

export const messages = all_messages[language]

const GLOBAL_IDS = new Set()

export const getFileTemplate = (file) => {
  const fileHTML = `<div class="${file.fileClass}" style="display: flex; flex-direction: row; font-family: sans-serif; width: calc(100vw - 16px); box-sizing: border-box; padding: 8px; border: solid 1px #bbbbbb; border-radius: 12px; margin: auto 0px; cursor: pointer;">
                      <div class="attachment-icon" style="background-image: url(${attach_icon}); background-repeat: no-repeat; background-size: 50px; width: 50px; min-height:50px; min-width:50px; margin-right: 10px;">
                      </div>
                      <div class="attachment-meta" style="display: flex; flex-direction: column; width: calc(100% - 50px); ">
                        <div class="attachment-title" title="${file.fileName}" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 16px; color: #484848; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                          ${file.fileName}
                        </div>
                        <div class="attachment-size" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 13px; color: #b1b1b1;">
                          ${bytesToSize(file.fileSize)}
                        </div>
                      </div>
                    </div>`
  return fileHTML.replace(/\s+/g, ' ')
}

export const getSummaryTemplate = (rowData, extraParams) => {
  let template = `<div></div>`
  let params = rowData.param

  if (rowData.type === constants.CONTENT_TYPE_FILE) {
    template = `<div style="display: flex; flex-direction: row;">
                  <div style="background-image: url(${attach_icon}); background-repeat: no-repeat; background-size: 20px; width: 20px; min-height:20px; min-width:20px; margin-left: 5px; margin-right: 10px;">
                  </div>
                <div style="line-height: 20px; border-bottom: 0px solid #000;">
                  ${extraParams.CreatorName} ${messages['summary-template.user-upload-file']}</div>
                </div>`
  } else if (rowData.type === constants.CONTENT_TYPE_IMAGE) {
    template = `<div style="display: flex; flex-direction: row;">
                  <img src="${PTTAI_APP_ROOT + '/api/img/' + extraParams.boardId + '/' + params.id}" style="height: 20px; width: 20px; margin-right: 10px; margin-left: 5px; margin-top: 0px; margin-bottom: 0px; border-radius: 3px;">
                  <div style="height: 20px; line-height: 20px; border-bottom: 0px solid #000;">
                    ${extraParams.CreatorName} ${messages['summary-template.user-upload-image']}
                  </div>
                </div>`
  } else {
    template = sanitizeDirtyHtml(rowData.content)
  }

  return template.replace(/\s+/g, ' ')
}

export const toJson = (data) => {
  let result = {}
  try {
    result = JSON.parse(data)
  } catch (e) {
    return result
  }
  return result
}

export const sanitizeDirtyHtml = (dirtyHtml) => {
  let cleanHtml = sanitizeHtml(dirtyHtml, {
    allowedTags: ['li', 'ol', 'ul', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': [ 'href', 'target' ]
    },
    allowedClasses: {
      'li': [ 'ql-indent-1', 'ql-indent-2', 'ql-indent-3']
    }
  })
  return cleanHtml
}

export const array2Html = (array, boardId) => {
  return array.reduce((acc, each, index) => {
    if (each.type === constants.CONTENT_TYPE_FILE) {
      const fileInfo = {
        fileId: each.param.id,
        fileClass: each.param.class,
        fileName: each.param.name,
        fileSize: each.param.size,
        fileType: each.param.type
      }

      let iframe = document.createElement('iframe')
      iframe.className = constants.IFRAME_CLASS_NAME
      iframe.srcdoc = getFileTemplate(fileInfo)
      iframe.frameborder = 0
      iframe.allowfullscreen = true
      iframe.width = '100%'
      iframe.height = '84px'
      iframe.setAttribute('style', 'border-width: 0px')
      iframe.setAttribute('data-id', fileInfo.fileId)
      iframe.setAttribute('data-class', fileInfo.fileClass)
      iframe.setAttribute('data-name', fileInfo.fileName)
      iframe.setAttribute('data-size', fileInfo.fileSize)
      iframe.setAttribute('data-type', fileInfo.fileType)

      return acc + iframe.outerHTML.replace(/\s\s+/g, ' ')
    } else if (each.type === constants.CONTENT_TYPE_IMAGE) {
      const imageInfo = {
        imageId: each.param.id,
        imageClass: each.param.class
      }

      let image = document.createElement('img')
      image.src = PTTAI_APP_ROOT + '/api/img/' + boardId + '/' + imageInfo.imageId
      image.alt = 'not working'
      image.style.width = '100%'
      image.setAttribute('data-id', imageInfo.imageId)
      image.setAttribute('data-class', imageInfo.imageClass)

      return acc + image.outerHTML.replace(/\s\s+/g, ' ')
    } else if (each.type === constants.CONTENT_TYPE_TEXT) {
      return acc + sanitizeDirtyHtml(each.content)
    } else {
      return acc
    }
  }, '')
}

export const getUUID = (isCheck = true) => {
  let theID = ''
  while (true) {
    theID = uuidv4()
    if (!isCheck) break

    if (GLOBAL_IDS.has(theID)) { continue }

    GLOBAL_IDS.add(theID)
    break
  }
  return theID
}

export const isUUID = (val) => typeof val === 'string' && val.length === 36

export const delay = (milliseconds) => new Promise(() => {
  setTimeout(() => { Promise.resolve() }, milliseconds)
})

export const delayFunc = (func, params, milliseconds = 200) => setTimeout(() => { func(...params) }, milliseconds)

export const queryToString = (query) => {
  if (!query) return ''

  return Object.keys(query).reduce((acc, cur) => {
    if (!query[cur]) return acc
    return acc += `${cur}=${query[cur]}&`
  }, '')
}

export const parseQueryString = (str) => QueryString.parse(str)

export const getRoot = (state) => {
  const { app } = state

  let rootId = app.get('rootId', '')
  let rootClass = app.get('rootClass', '')
  let camelCasedClass = toCamelCase(rootClass)

  if (!state[camelCasedClass]) return Immutable.Map()

  return state[camelCasedClass].get(rootId, Immutable.Map())
}

export const getStateChild = (state, child) => {
  return state[child]
}

export const getRootId = (state) => {
  const { app } = state
  if (!app) return ''
  return app.get('rootId', '')
}

export const getSingleChild = (state, childName) => {
  const child = state[childName]
  const ids = child.getIn(['ids', 0], '')
  return child.get(ids, Immutable.Map())
}

export const getChildId = (me, child) => me.getIn(['children', child, 0], '')

export const getChildIds = (me, child) => me.getIn(['children', child], Immutable.List())

export const toCamelCase = (str) => camelCase(str)

export const toUnderscore = (str) => decamelize(str)

export const encodeURIObj = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if (typeof data[eachIdx] === 'string' && !eachIdx.endsWith('ID')) {
      v = encodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const decodeURIObj = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if (typeof data[eachIdx] === 'string' && !eachIdx.endsWith('ID')) {
      v = decodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const isUnRead = (updateAt, lastSeenAt) => {
  if (updateAt.isAfter(lastSeenAt)) {
    return true
  }
  return false
}

export const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(','); let mime = arr[0].match(/:(.*?);/)[1]

  let bstr = atob(arr[1]); let n = bstr.length; let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

export const decodeBase64 = str => {
  try {
    return decodeURIComponent(atob(str).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  } catch (e) {
    return ''
  }
}

export const bytesToSize = (bytes) => {
  let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) return '0 Byte'

  let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)

  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

export const isWhitespace = (ch) => {
  let whiteSpace = false
  if ((ch === ' ') || (ch === '\t') || (ch === '\n')) {
    whiteSpace = true
  }
  return whiteSpace
}

export const getOrientation = (file, callback) => {
  let reader = new FileReader()

  reader.onload = function (e) {
    let view = new DataView(e.target.result)
    if (view.getUint16(0, false) !== 0xFFD8) return callback(-2)
    let length = view.byteLength; let offset = 2

    while (offset < length) {
      let marker = view.getUint16(offset, false)
      offset += 2
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) return callback(-1)
        let little = view.getUint16(offset += 6, false) === 0x4949
        offset += view.getUint32(offset + 4, little)
        let tags = view.getUint16(offset, little)
        offset += 2
        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) === 0x0112) { return callback(view.getUint16(offset + (i * 12) + 8, little)) }
        }
      } else if ((marker & 0xFF00) !== 0xFF00) break
      else offset += view.getUint16(offset, false)
    }
    return callback(-1)
  }

  reader.readAsArrayBuffer(file)
}

export const newCanvasSize = (w, h, rotation) => {
  /* normalize image size by rotation */
  let rads = rotation * Math.PI / 180

  let c = Math.cos(rads)
  let s = Math.sin(rads)

  if (s < 0) {
    s = -s
  }
  if (c < 0) {
    c = -c
  }

  return [h * s + w * c, h * c + w * s]
}

export const getStatusClass = (status) => {
  let statusClass = 'pre-alive'

  if (status !== 0 && !status) {
    /* null or undefined */
    return 'invalid'
  }

  if (status > 23 || status < 0 || !Number.isInteger(status)) {
    /* invalid */
    return 'invalid'
  }

  if (status >= 0 && status < 7) {
    statusClass = 'pre-alive'
  } else if (status === 7) {
    statusClass = 'alive'
  } else if (status === 8) {
    statusClass = 'failed'
  } else {
    statusClass = 'post-failed'
  }
  return statusClass
}

const isLink = str => {
  // https://stackoverflow.com/a/5717133/5032696

  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(str)
}

export const linkParser = (pure_message) => {
  if (!pure_message) return ''

  let messageArr = pure_message.split(/\s/).map((msg, i) => {
    if (isLink(msg)) {
      let link = msg

      if (!/^http(s?):\/\//.test(msg)) {
        link = '//' + msg
      }

      return <a key={i} href={link} rel='noopener noreferrer' target='_blank'>{msg}</a>
    }

    return <span key={i}>{msg}</span>
  })

  return messageArr.reduce((a, b) => a === null ? [b] : [a, ' ', b], null)
}

export const isMobile = () => {
  /* If true, autofocus will be disabled */
  /* Currently, the following should return true: */
  /* Android and iOS device */
  return platform.description.indexOf('Mobile') !== -1 || // Android and iOS chorome browser
      platform.description.indexOf('Android') !== -1 || // Android app
      platform.description.indexOf('iOS') !== -1 // iOS safari browser
}

export const isIOS = () => {
  return platform.description.indexOf('iOS') !== -1 // iOS app
}

export const isAndroid = () => {
  return platform.description.indexOf('Android') !== -1 // Android app
}
