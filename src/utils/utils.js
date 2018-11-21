import uuid from 'node-uuid'
import Immutable from 'immutable'
import camelCase from 'camelcase'
import decamelize from 'decamelize'
import QueryString from 'query-string'
import moment from 'moment'

const GLOBAL_IDS = new Set()

export const getUUID = (isCheck=true) => {
  let theID = ''
  while(true) {
    theID = uuid.v4()
    if(!isCheck) break

    if(GLOBAL_IDS.has(theID))
      continue

    GLOBAL_IDS.add(theID)
    break

  }
  return theID
}

export const isUUID = (val) => typeof val === 'string' && val.length === 36

export const delay = (milliseconds) => new Promise(() => {
  setTimeout(() => {Promise.resolve()}, milliseconds)
})

export const delayFunc = (func, params, milliseconds=200) => setTimeout(() => {func(...params)}, milliseconds)

export const queryToString = (query) => {
  if(!query) return ''

  return Object.keys(query).reduce((acc, cur) => {
    if (!query[cur]) return acc
    return acc += `${cur}=${query[cur]}&`
  }, '')
}

export const parseQueryString = (str) => QueryString.parse(str)

export const getRoot = (state) => {
  const {app} = state

  let rootId = app.get('rootId', '')
  let rootClass = app.get('rootClass', '')
  let camelCasedClass = toCamelCase(rootClass)

  if(!state[camelCasedClass]) return Immutable.Map()

  return state[camelCasedClass].get(rootId, Immutable.Map())
}

export const getStateChild = (state, child) => {
  return state[child]
}

export const getRootId = (state) => {
  const {app} = state
  if(!app) return ''
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
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = encodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const decodeURIObj = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = decodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const isUnRead = (updateTS, lastSeen) => {
  if (moment.unix(updateTS).isAfter(moment.unix(lastSeen))) {
    return true
  }
  return false
}

export const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

export const bytesToSize = (bytes) => {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes === 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export const isWhitespace = (ch) => {
  var whiteSpace = false
  if ((ch === ' ') || (ch === '\t') || (ch === '\n')) {
    whiteSpace = true;
  }
  return whiteSpace;
}

export const getOrientation = (file, callback) => {
  let reader = new FileReader();

  reader.onload = function(e) {

    let view = new DataView(e.target.result);
    if (view.getUint16(0, false) !== 0xFFD8) return callback(-2);
    let length = view.byteLength, offset = 2;

    while (offset < length) {
      let marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) return callback(-1);
        let little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        let tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) === 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) !== 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file);
}

export const newCanvasSize = (w, h, rotation) => {
    let rads = rotation * Math.PI / 180;
    let c = Math.cos(rads);
    let s = Math.sin(rads);
    if (s < 0) {
        s = -s;
    }
    if (c < 0) {
        c = -c;
    }
    return [h * s + w * c,h * c + w * s];
}
