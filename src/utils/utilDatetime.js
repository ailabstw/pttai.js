import moment from 'moment'

import { language } from './utils'

moment.relativeTimeRounding(Math.floor)
moment.relativeTimeThreshold('s', 60)
moment.relativeTimeThreshold('m', 60)
moment.relativeTimeThreshold('h', 24)
moment.relativeTimeThreshold('d', 31)
moment.relativeTimeThreshold('M', 12)

if (language === 'zh') {
  moment.defineLocale('zh-tw', {
    months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
    longDateFormat: {
      LT: 'Ah點mm分',
      LTS: 'Ah點m分s秒',
      L: 'YYYY-MM-DD',
      LL: 'YYYY年MMMD日',
      LLL: 'YYYY年MMMD日Ah點mm分',
      LLLL: 'YYYY年MMMD日ddddAh點mm分',
      l: 'YYYY-MM-DD',
      ll: 'YYYY年MMMD日',
      lll: 'YYYY年MMMD日Ah點mm分',
      llll: 'YYYY年MMMD日ddddAh點mm分'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (hour, meridiem) {
      if (hour === 12) {
        hour = 0
      }
      if (meridiem === '凌晨' || meridiem === '早上' ||
                    meridiem === '上午') {
        return hour
      } else if (meridiem === '下午' || meridiem === '晚上') {
        return hour + 12
      } else {
        // '中午'
        return hour >= 11 ? hour : hour + 12
      }
    },
    meridiem: function (hour, minute, isLower) {
      var hm = hour * 100 + minute
      if (hm < 600) {
        return '凌晨'
      } else if (hm < 900) {
        return '早上'
      } else if (hm < 1130) {
        return '上午'
      } else if (hm < 1230) {
        return '中午'
      } else if (hm < 1800) {
        return '下午'
      } else {
        return '晚上'
      }
    },
    calendar: {
      sameDay: function () {
        return this.minutes() === 0 ? '[今天]Ah[點整]' : '[今天]LT'
      },
      nextDay: function () {
        return this.minutes() === 0 ? '[明天]Ah[點整]' : '[明天]LT'
      },
      lastDay: function () {
        return this.minutes() === 0 ? '[昨天]Ah[點整]' : '[昨天]LT'
      },
      nextWeek: function () {
        var startOfWeek, prefix
        startOfWeek = moment().startOf('week')
        prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]'
        return this.minutes() === 0 ? prefix + 'dddAh點整' : prefix + 'dddAh點mm'
      },
      lastWeek: function () {
        var startOfWeek, prefix
        startOfWeek = moment().startOf('week')
        prefix = this.unix() < startOfWeek.unix() ? '[上]' : '[本]'
        return this.minutes() === 0 ? prefix + 'dddAh點整' : prefix + 'dddAh點mm'
      },
      sameElse: 'LL'
    },
    ordinalParse: /\d{1,2}(日|月|周)/,
    ordinal: function (number, period) {
      switch (period) {
        case 'd':
        case 'D':
        case 'DDD':
          return number + '日'
        case 'M':
          return number + '月'
        case 'w':
        case 'W':
          return number + '周'
        default:
          return number
      }
    },
    relativeTime: {
      future: '%s内',
      past: '%s前',
      s: '幾秒',
      m: '1 分鐘',
      mm: '%d 分鐘',
      h: '1 小時',
      hh: '%d 小時',
      d: '1 天',
      dd: '%d 天',
      M: '1 個月',
      MM: '%d 個月',
      y: '1 年',
      yy: '%d 年'
    },
    week: {
      // GB/T 7408-1994, equivalent to ISO 8601:1988
      dow: 1, // Monday is the first day of the week.
      doy: 4 // The week that contains Jan 4th is the first week of the year.
    }
  })
} else {
  moment.updateLocale('en', {
    ordinal: function (number, period) {
      var b = number % 10
      var output = (~~(number % 100 / 10) === 1) ? 'th'
        : (b === 1) ? 'st'
          : (b === 2) ? 'nd'
            : (b === 3) ? 'rd' : 'th'
      return number + output
    }
  })
}

export const doesCrossDay = (moment1, moment2) => {
  return moment1.format('YYYY-MM-DD') !== moment2.format('YYYY-MM-DD')
}

export const isValid = (updateAt, period) => {
  let expiredTime = updateAt.add(period, 'seconds')
  return moment().isBefore(expiredTime)
}

export const expiredMomentFormat = (updateAt, period) => {
  let isZh = language === 'zh'
  let result = ''

  if (!updateAt.isValid() || !period) {
    result = isZh ? '日期錯誤' : 'Wrong Date'
  }

  // updateAt + period - current
  let expiredTime = updateAt.clone().add(period, 'seconds')

  if (moment().isAfter(expiredTime)) {
    result = isZh ? '已過期' : 'Expired'
  } else {
    let timeleft = expiredTime.toNow(true)
    result = isZh ? `${timeleft} 後過期` : `Expired in ${timeleft}`
  }

  return result
}

export const expiredFormat = (updateTS_T, period) => {
  let isZh = language === 'zh'
  let result = ''

  if (!updateTS_T || !period) {
    result = isZh ? '日期錯誤' : 'Wrong Date'
  }

  // updateTS + period - current
  let targetTime = moment.unix(updateTS_T)
  let expiredTime = targetTime.add(period, 'seconds')

  if (moment().isAfter(expiredTime)) {
    result = isZh ? '已過期' : 'Expired'
  } else {
    let timeleft = expiredTime.toNow(true)
    result = isZh ? `${timeleft} 後過期` : `Expired in ${timeleft}`
  }

  return result
}

export const milliTimestampToDatetime = (milli_timestamp) => new Date(parseInt(milli_timestamp, 10))

export const secTimestampToDatetime = (sec_timestamp) => new Date(parseInt(sec_timestamp * 1000, 10))

export const getCurrentDatetime = (timezone = 8) => {
  // get current datetime, default to tw
  let theDatetime = new Date()
  return new Date(theDatetime.getTime() + theDatetime.getTimezoneOffset() * 60 * 1000 + timezone * 3600 * 1000)
}

export const getCurrentUTCDatetime = () => getCurrentDatetime(0)

export const getCurrentDate = (timezone = 8) => {
  // get Current date, default to tw
  let theDate = getCurrentDatetime(timezone)
  theDate.setHours(0)
  theDate.setMinutes(0)
  theDate.setSeconds(0)
  theDate.setMilliseconds(0)
  return theDate
}

export const getCurrentUTCDate = () => getCurrentDate(0)

export const getCurrentDatetimeSec = (timezone = 8) => {
  let theDate = getCurrentDatetime(timezone)
  theDate.setMilliseconds(0)
  return theDate
}

export const getCurrentUTCDatetimeSec = () => getCurrentDatetimeSec(0)

export const addDay = (theDate, days) => new Date(theDate.getTime() + days * 86400 * 1000)

export const maxDate = (a, b) => new Date(Math.max(a, b))

export const minDate = (a, b) => new Date(Math.min(a, b))

export const unixToMoment = (TS, defaultValue) => {
  if (TS && TS.T) {
    return moment.unix(TS.T)
  }

  if (moment.isMoment(defaultValue)) {
    return defaultValue
  }

  return moment(defaultValue)
}
