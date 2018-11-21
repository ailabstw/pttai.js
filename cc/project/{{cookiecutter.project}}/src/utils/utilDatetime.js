export const milliTimestampToDatetime = (milli_timestamp) => new Date(parseInt(milli_timestamp))

export const secTimestampToDatetime = (sec_timestamp) => new Date(parseInt(sec_timestamp * 1000))

export const getCurrentDatetime = (timezone=8) => {
  //get current datetime, default to tw
  let theDatetime = new Date()
  return new Date(theDatetime.getTime() + theDatetime.getTimezoneOffset() * 60 * 1000 + timezone * 3600 * 1000)
}

export const getCurrentUTCDatetime = () => getCurrentDatetime(0)

export const getCurrentDate = (timezone=8) => {
  //get Current date, default to tw
  let theDate = getCurrentDatetime(timezone)
  theDate.setHours(0)
  theDate.setMinutes(0)
  theDate.setSeconds(0)
  theDate.setMilliseconds(0)
  return theDate
}

export const getCurrentUTCDate = () => getCurrentDate(0)

export const getCurrentDatetimeSec = (timezone=8) => {
  let theDate = getCurrentDatetime(timezone)
  theDate.setMilliseconds(0)
  return theDate
}

export const getCurrentUTCDatetimeSec = () => getCurrentDatetimeSec(0)

export const addDay = (theDate, days) => new Date(theDate.getTime() + days * 86400 * 1000)

export const maxDate = (a, b) => new Date(Math.max(a, b))

export const minDate = (a, b) => new Date(Math.min(a, b))
