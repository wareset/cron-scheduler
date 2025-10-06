// https://elmah.io/tools/cron-parser/#0/33_*_*_*_*
// https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html
// https://help.eset.com/protect_cloud/ru-RU/cron_expression.html

import { throwError } from './utils'

import {
  ParsedCronTime,
  ParsedCronTimeField,
  ParsedCronTimeFieldData,
  ParsedCronTimeFieldOpts,
  ParsedCronTimeFieldRules,
} from './parseCronTime.types'

import {
  UNIT_NAMES,
  removeSpacesAndSplit,
  replacePresetsAliases,
  replaceMonthAliases,
  replaceWeekdayAliases,
} from './parseCronTime.utils'

function concatFields<T extends keyof typeof UNIT_NAMES>(
  opts: ParsedCronTimeFieldOpts[],
  typeNum: T
): ParsedCronTimeField<(typeof UNIT_NAMES)[T]> {
  let data!: ParsedCronTimeFieldData
  for (let i = 0; i < opts.length; i++) {
    const {
      step,
      rules,
      limit: { 0: min, 1: max },
      range: { 0: rangeMin, 1: rangeMax },
    } = opts[i]

    for (let time: number, j = rangeMin; j <= rangeMax; j += step) {
      if (
        (j <= max && ((time = j), true)) ||
        (j - max === 1 && ((time = min), true))
      ) {
        // объект будет точно не пустой, или его не будет вообще
        data || (data = Object.create(null))
        time in data ? data[time].push(rules) : (data[time] = [rules])
      }
    }
  }

  return {
    type: UNIT_NAMES[typeNum],
    data,
    opts,
  }
}

function unitToNumber(v: string, src: string, min: number, max: number) {
  let n = +v
  if (n !== n) {
    throwError(`Not a number "${v}" in "${src}"`)
  }
  if (n !== n >>> 0) {
    throwError(`Invalid number "${v}" in "${src}"`)
  }
  if (n < min || n > max) {
    throwError(
      `The number "${v}" is out of range "[${min}, ${max}]" in "${src}"`
    )
  }
  return n
}

function parseFieldBySlashAndDash(
  type: number,
  src: string,
  min: number,
  max: number,
  allowMax: number
): ParsedCronTimeFieldOpts {
  // console.log(src)
  const range_and_step = src.split('/')

  if (range_and_step.length > 2) {
    throwError(`Too many slashes in "${src}"`)
  }

  let { 0: rangeSrc, 1: stepSrc } = range_and_step

  let step: number,
    last: undefined | true,
    rand: undefined | number,
    week: undefined | number[],
    work: undefined | true,
    rangeMin: number,
    rangeMax: number

  // Nth week day of month
  if (rangeSrc.indexOf('#') > -1) {
    if (type === 5) {
      const weekDirty = rangeSrc.split('#')
      rangeSrc = weekDirty[0]
      week = []
      for (let i = weekDirty.length; i-- > 1; ) {
        week[i - 1] = unitToNumber(weekDirty[i], src, 1, 5)
      }
    } else {
      throwError(`Symbol "#" not work in "${src}"`)
    }
  }

  if (rangeSrc.indexOf('W') > -1) {
    // TODO
    // if (type === 3 && rangeSrc[rangeSrc.length - 1] === 'W') {
    if (type === 3 && rangeSrc === 'LW') {
      work = true
      rangeSrc = rangeSrc.slice(0, -1)
    } else {
      throwError(`Symbol "W" not work in "${src}"`)
    }
  }

  if (rangeSrc[rangeSrc.length - 1] === 'L') {
    if (type === 5) {
      // is last Days Of Week
      last = true
      rangeSrc = rangeSrc.replace(/L/g, '') || '0'
    } else if (type === 3 && rangeSrc === 'L') {
      // is last Day Of Month
      last = true
      rangeSrc = work ? '26-31' : '28-31'
    } else {
      throwError(`Symbol "L" not work in "${src}"`)
    }
  }

  if (rangeSrc === '*' || rangeSrc === '?') {
    rangeMin = min
    rangeMax = allowMax
  } else {
    const range = rangeSrc.split(/(?<=[*?\d])-(?=[*?\d.%-])/)

    if (range.length > 2) {
      throwError(`Too many dashes in "${src}"`)
    }

    rangeMin = unitToNumber(range[0], src, min, allowMax)
    rangeMax = range[1]
      ? unitToNumber(range[1], src, min, allowMax)
      : stepSrc
        ? max
        : rangeMin

    if (rangeMin > rangeMax) {
      throwError(`Incorrect range "[${rangeMin}, ${rangeMax}]" in "${src}"`)
    }
  }

  if (stepSrc) {
    if (last && type === 3) {
      throwError(`Options "L" and "/${stepSrc}" are incompatible in "${src}"`)
    }

    // is random
    if (stepSrc[0] === '%') {
      rand = 1
      stepSrc = stepSrc.slice(1)
    }
    /**
     * Можно использовать значение 1 в качестве минимальноо
     * чтобы при 5/1 стало 5,6,7,8...
     */
    step = unitToNumber(stepSrc, src, 1, allowMax)
    rand && (rand = step)

    if (rand && step < 2) {
      throwError(`Random "%1" won't work in "${src}". Set "%2" or more`)
    }
  } else {
    step = 1
  }

  const rules: ParsedCronTimeFieldRules = {}
  if (last) rules.last = last
  if (rand) rules.rand = rand
  if (week) rules.week = week
  if (work) rules.work = work
  const res: ParsedCronTimeFieldOpts = {
    text: src,
    step,
    rules,
    limit: [min, max],
    range: [rangeMin, rangeMax],
  }

  return res
}

function parseSeconds(s: string) {
  return parseFieldBySlashAndDash(0, s, 0, 59, 59)
}
function parseMinutes(s: string) {
  return parseFieldBySlashAndDash(1, s, 0, 59, 59)
}
function parseHours(s: string) {
  return parseFieldBySlashAndDash(2, s, 0, 23, 23)
}
function parseDaysOfMonth(s: string) {
  return parseFieldBySlashAndDash(3, s, 1, 31, 31)
}
function parseMonths(s: string) {
  return parseFieldBySlashAndDash(4, s, 1, 12, 12)
}
function parseWeekdays(s: string) {
  return parseFieldBySlashAndDash(5, s, 0, 6, 7)
}
// function parseYears(s: string) {
//   return parseFieldBySlashAndDash(6, s, 1969, 2050, 2050)
// }

/*@__NO_SIDE_EFFECTS__*/
export function parseCronTime(source: string): ParsedCronTime {
  const fields = replacePresetsAliases(source)!.split(
    /(?<=[*?\w])\s+(?=[*?\w.%])|(?<=[*?\w])(?=[*?])|(?<=[*?])(?=[*?\w.%])/
  )

  if (fields.length > 6) {
    throwError(`Too many fields in ["${fields.join('" "')}"]`)
  }

  if (fields.length < 6) {
    // add seconds if not exists
    fields.unshift('0')
  }

  // prettier-ignore
  return [
    // seconds
    concatFields(removeSpacesAndSplit(fields[0]).map(parseSeconds), 0),
    // minutes
    concatFields(removeSpacesAndSplit(fields[1]).map(parseMinutes), 1),
    // hours
    concatFields(removeSpacesAndSplit(fields[2]).map(parseHours), 2),
    // days of month
    concatFields(removeSpacesAndSplit(fields[3]).map(parseDaysOfMonth), 3),
    // months
    concatFields(removeSpacesAndSplit(
      replaceMonthAliases(fields[4])).map(parseMonths), 4),
    // days of week
    concatFields(removeSpacesAndSplit(
      replaceWeekdayAliases(fields[5])).map(parseWeekdays), 5),
    // years
    // concatFields(removeSpacesAndSplit(fields[6]).map(parseYears), 6),
  ] as const
}
