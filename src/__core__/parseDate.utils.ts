import type { ParsedDate } from './parseDate'

import { throwError } from './utils'

const DAYS_OF_WEEK = {
  __proto__: null as never,

  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
} as const

export const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  // timeZone: 'America/Chicago', // -0500 | -0600
  // timeZone: 'Europe/Moscow', // + 0300
  // timeZone: 'Australia/Adelaide', // +0930
  // timeZone: 'Australia/Eucla', // +0845

  calendar: 'gregory',
  numberingSystem: 'latn',
  timeZone: void 0,
  hourCycle: 'h23',
  hour12: false,
  weekday: 'short',
  // для работы cron эра бессмысленна но, при её указании,
  // формат даты приобретает более здоровый вид
  era: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',

  timeZoneName: void 0,
  fractionalSecondDigits: void 0,
}

// updateParsedDate будет вызываться очень часто,
// поэтому Intl.DateTimeFormat кэшируются в DTFS
const DTFS: { [key: string]: { f: Intl.DateTimeFormat; z: string } } = {}
export function createDTF(timeZone?: string) {
  if (!DTFS[timeZone!]) {
    FORMAT_OPTIONS.timeZone = timeZone
    FORMAT_OPTIONS.timeZoneName = void 0
    FORMAT_OPTIONS.fractionalSecondDigits = void 0

    const f = new Intl.DateTimeFormat('en-US', FORMAT_OPTIONS)
    const z = f.resolvedOptions().timeZone

    DTFS[timeZone!] = DTFS[z] = { f, z }
  }
  return DTFS[timeZone!].z
}

const ERROR_TITLE = 'Incorrect ParsedDate '
function checkParsedDateValue(s: string | number, type: string) {
  const n = +s
  if (n !== (n >>> 0)) throwError(`${ERROR_TITLE}${type}: "${s}"`)
  return n
}

export function updateParsedDate(iam: ParsedDate) {
  // Примеры:
  // 'Fri, 10 03, 2025 AD, 10:01:14 GMT+09:30'
  // 'Wed, 04 06, 29720 BC, 07:27:40 GMT+09:14:20'

  const date = iam._date
  const arr = DTFS[iam._zone].f.format(date).split(/[,\s:]+/)

  // @ts-ignore
  iam.W =
    arr[0] in DAYS_OF_WEEK
      ? DAYS_OF_WEEK[arr[0] as keyof typeof DAYS_OF_WEEK]
      : throwError(`${ERROR_TITLE}W: "${arr[0]}"`)
  // @ts-ignore
  iam.M = checkParsedDateValue(arr[1], 'M')
  // @ts-ignore
  iam.D = checkParsedDateValue(arr[2], 'D')
  // @ts-ignore
  iam.Y = checkParsedDateValue(arr[3], 'Y')
  // @ts-ignore
  iam.E =
    arr[4] === 'AD' || arr[4] === 'BC'
      ? arr[4]
      : throwError(`${ERROR_TITLE}E: "${arr[4]}"`)
  // @ts-ignore
  iam.h = checkParsedDateValue(arr[5], 'h')
  // @ts-ignore
  iam.m = checkParsedDateValue(arr[6], 'm')
  // @ts-ignore
  iam.s = checkParsedDateValue(arr[7], 's')
  // @ts-ignore
  iam.t = date.getMilliseconds()
  // @ts-ignore
  iam.z =
    Date.UTC(iam.Y, iam.M - 1, iam.D, iam.h, iam.m, iam.s, iam.t) -
    date.getTime()
}

export function updateAndFixOffsetAfterChange(iam: ParsedDate) {
  const z = iam.z
  updateParsedDate(iam)
  // Коррекция смещения времени при переходе на зимнее/летнее время
  if (z !== iam.z) {
    iam._date.setMilliseconds(z - iam.z)
    updateParsedDate(iam)
  }
}
