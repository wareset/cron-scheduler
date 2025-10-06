/*
Некоторые функции лежат здесь чтобы, разгрузить файл "parseCronTime.ts".
Каталог "__core__" обязателен для правильной компиляции.
*/

export const UNIT_NAMES = [
  'seconds',
  'minutes',
  'hours',
  'daysOfMonth',
  'months',
  'daysOfWeek',
  // 'years'
] as const

export function removeSpacesAndSplit(s: string | undefined) {
  return s ? s.replace(/\s+/g, '').split(',') : ['*']
}

/*@__NO_SIDE_EFFECTS__*/
function replaceAliasesFactory(ALIASES: { [key: string]: string }) {
  return function (s: string | undefined) {
    if (s) {
      s = s.replace(/@?([a-z]{1,})/gi, function (_, alias: string) {
        alias = alias.toUpperCase()
        return alias in ALIASES ? ALIASES[alias] : alias
      })
    }
    return s
  }
}

export const CRON_TIME_PRESETS = {
  __proto__: null as never,

  YEARLY: '0 0 0 1 1 *',
  MONTHLY: '0 0 0 1 * *',
  WEEKLY: '0 0 0 * * 0',
  DAILY: '0 0 0 * * *',
  HOURLY: '0 0 * * * *',
  MINUTELY: '0 * * * * *',
  SECONDLY: '* * * * * *',
  WEEKDAYS: '0 0 0 * * 1-5',
  WEEKENDS: '0 0 0 * * 0,6',
} as Readonly<{
  YEARLY: '0 0 0 1 1 *'
  MONTHLY: '0 0 0 1 * *'
  WEEKLY: '0 0 0 * * 0'
  DAILY: '0 0 0 * * *'
  HOURLY: '0 0 * * * *'
  MINUTELY: '0 * * * * *'
  SECONDLY: '* * * * * *'
  WEEKDAYS: '0 0 0 * * 1-5'
  WEEKENDS: '0 0 0 * * 0,6'
}>
// prettier-ignore
export const replacePresetsAliases =
  /*@__PURE__*/ replaceAliasesFactory(CRON_TIME_PRESETS)

const ALIASES_FOR_MONTHS = {
  __proto__: null as never,

  JAN: '1',
  FEB: '2',
  MAR: '3',
  APR: '4',
  MAY: '5',
  JUN: '6',
  JUL: '7',
  AUG: '8',
  SEP: '9',
  OCT: '10',
  NOV: '11',
  DEC: '12',
} as const
// prettier-ignore
export const replaceMonthAliases =
  /*@__PURE__*/ replaceAliasesFactory(ALIASES_FOR_MONTHS)

const ALIASES_FOR_DAYS_OF_WEEK = {
  __proto__: null as never,

  SUN: '0',
  MON: '1',
  TUE: '2',
  WED: '3',
  THU: '4',
  FRI: '5',
  SAT: '6',
} as const
// prettier-ignore
export const replaceWeekdayAliases =
  /*@__PURE__*/ replaceAliasesFactory(ALIASES_FOR_DAYS_OF_WEEK)
