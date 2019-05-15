import moment from 'moment'
import { doesCrossDay,
  expiredFormat } from './utilDatetime'

test('test doesCrossDay()', () => {
  let Dec5th = moment('12/5/2018 0:00', 'M/D/YYYY H:mm').valueOf()
  let OneSecBeforeDec5th = moment('12/5/2018 0:00', 'M/D/YYYY H:mm').valueOf() - 1
  let OneSecAfterDec5th = moment('12/5/2018 0:00', 'M/D/YYYY H:mm').valueOf() + 1

  expect(doesCrossDay(Dec5th, OneSecBeforeDec5th)).toBe(true)
  expect(doesCrossDay(OneSecBeforeDec5th, Dec5th)).toBe(true)
  expect(doesCrossDay(Dec5th, OneSecAfterDec5th)).toBe(false)
})

test.skip('test expiredFormat()', () => {
  let current = moment().unix()
  let OneDayPeriod = 24 * 60 * 60
  let FiveMinPeriod = 5 * 60

  expect(expiredFormat(current, FiveMinPeriod)).toContain('4')
  expect(expiredFormat(current - OneDayPeriod, FiveMinPeriod)).toEqual('Expired')
  expect(expiredFormat(current - FiveMinPeriod, OneDayPeriod)).toContain('23')
  expect(expiredFormat(null, OneDayPeriod)).toContain('Wrong')
  expect(expiredFormat(current, null)).toContain('Wrong')
})
