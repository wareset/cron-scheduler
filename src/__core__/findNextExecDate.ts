import { ParsedDate } from './ParseDate'
import {
  ParsedCronTime,
  ParsedCronTimeFieldData,
  ParsedCronTimeFieldRules,
} from './parseCronTime.types'
import { throwError, integerMinMax } from './utils'

let iteratesCount = 0
function checkIteratesCount() {
  if (++iteratesCount > 9e3) {
    throwError(`Max iterates count: ${iteratesCount}`)
  }
}

export function findNextExecDate(
  parsedCronTime: ParsedCronTime,
  prevDate?: Date,
  timeZone?: string,
  random?: () => number
) {
  const rules: ParsedCronTimeFieldRules[] = []
  const parsedDate = new ParsedDate(prevDate, timeZone)
  parsedDate.milliseconds(1000)

  iteratesCount = 0
  getNextMonth(parsedCronTime, parsedDate, rules)

  // console.log('-------------')
  // console.log(rules)

  // console.log(parsedDate)
  // console.log(parsedDate + '')

  // prettier-ignore
  if (random && rules.some(function (v) { return v.rand })) {
    const nextParsedDate = parsedDate.clone()
    nextParsedDate.milliseconds(1000)

    // IteratesCount = 0
    getNextMonth(parsedCronTime, nextParsedDate, [])

    // console.log(nextParsedDate)
    // console.log(nextParsedDate + '')

    getRandomDate(parsedDate, nextParsedDate, rules, random)
  }

  // console.log('win', IteratesCount)
  return parsedDate._date
}

// TODO: Нужно попробовать оптимизировать этот код
function getRandomDate(
  pD: ParsedDate,
  npD: ParsedDate,
  rules: ParsedCronTimeFieldRules[],
  random: () => number
) {
  let max: number | undefined
  let isChanged: boolean
  // months
  if ((max = rules[4].rand)) {
    isChanged = false
    max = integerMinMax(random(), 0, max)
    for (; max-- > 0; ) {
      if (pD.Y === npD.Y && pD.M === npD.M) {
        if (isChanged) pD.month(pD.M - 1)
        break
      }
      isChanged = true
      pD.month(pD.M + 1)
    }
  }

  // days of week or days of month
  if (rules[5].rand || rules[3].rand) {
    isChanged = false
    max = integerMinMax(
      random(),
      0,
      Math.min(
        rules[5].rand! || rules[3].rand!,
        rules[3].rand! || rules[5].rand!
      )
    )
    for (; max-- > 0; ) {
      if (pD.Y === npD.Y && pD.M === npD.M && pD.D === npD.D) {
        if (isChanged) pD.date(pD.D - 1)
        break
      }
      isChanged = true
      pD.date(pD.D + 1)
    }
  }

  // hours
  if ((max = rules[2].rand)) {
    isChanged = false
    max = integerMinMax(random(), 0, max)
    for (; max-- > 0; ) {
      if (
        pD.Y === npD.Y &&
        pD.M === npD.M &&
        pD.D === npD.D &&
        pD.h === npD.h
      ) {
        if (isChanged) pD.hours(pD.h - 1)
        break
      }
      isChanged = true
      pD.hours(pD.h + 1)
    }
  }

  // minutes
  if ((max = rules[1].rand)) {
    isChanged = false
    max = integerMinMax(random(), 0, max)
    for (; max-- > 0; ) {
      if (
        pD.Y === npD.Y &&
        pD.M === npD.M &&
        pD.D === npD.D &&
        pD.h === npD.h &&
        pD.m === npD.m
      ) {
        if (isChanged) pD.minutes(pD.m - 1)
        break
      }
      isChanged = true
      pD.minutes(pD.m + 1)
    }
  }

  // seconds
  if ((max = rules[0].rand)) {
    isChanged = false
    max = integerMinMax(random(), 0, max)
    for (; max-- > 0; ) {
      if (
        pD.Y === npD.Y &&
        pD.M === npD.M &&
        pD.D === npD.D &&
        pD.h === npD.h &&
        pD.m === npD.m &&
        pD.s === npD.s
      ) {
        if (isChanged) pD.seconds(pD.s - 1)
        break
      }
      isChanged = true
      pD.seconds(pD.s + 1)
    }
  }

  // console.log(pD + '')
}

function getNextMonth(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[4].data

  if (!(pD.M in data)) {
    pD.seconds(0)
    pD.minutes(0)
    pD.hours(0)
    pD.date(1)
    for (; true; ) {
      checkIteratesCount()
      pD.month(pD.M + 1)
      if (pD.M in data) break
    }
  }

  rules[4] = data[pD.M][0]
  // console.log('M', pD + '')
  getNextDayOfMonth(parsedCronTime, pD, rules)
}

function isValidDayOfMonth(
  data: ParsedCronTimeFieldData,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  if (pD.D in data) {
    const dataItems = data[pD.D]

    for (let i = 0; i < dataItems.length; ++i) {
      const dataItem = dataItems[i]
      rules[3] = dataItem

      if (!dataItem.last && !dataItem.work) {
        return true
      }

      if (dataItem.last && dataItem.work) {
        if (pD.W > 0 && pD.W < 6) {
          const month = pD.M
          const pD2 = pD.clone()
          for (; true; ) {
            pD2.date(pD2.D + 1)
            if (pD2.M !== month) {
              return true
            }
            if (pD2.W > 0 && pD2.W < 6) break
          }
        }
        return false
      }

      if (dataItem.last) {
        const month = pD.M
        const pD2 = pD.clone()
        pD2.date(pD.D + 1)

        if (pD2.M !== month) {
          rules[3] = dataItem
          return true
        }
        return false
      }

      // TODO: 15W с поиском ближайших будней пока не работает
      if (dataItem.work) {
        const weekday = pD.W
        if (weekday > 0 && weekday < 6) {
          return true
        }
      }
    }
  }

  return false
}
function getNextDayOfMonth(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[3].data

  if (!isValidDayOfMonth(data, pD, rules)) {
    pD.seconds(0)
    pD.minutes(0)
    pD.hours(0)
    for (const month = pD.M; true; ) {
      checkIteratesCount()
      pD.date(pD.D + 1)
      if (pD.M !== month) return getNextMonth(parsedCronTime, pD, rules)
      if (isValidDayOfMonth(data, pD, rules)) break
    }
  }

  // console.log('D', pD + '')
  getNextDayOfWeek(parsedCronTime, pD, rules)
}

function isValidDayOfWeek(
  data: ParsedCronTimeFieldData,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  if (pD.W in data) {
    const dataItems = data[pD.W]
    for (let i = 0; i < dataItems.length; ++i) {
      const dataItem = dataItems[i]
      rules[5] = dataItem

      if (!dataItem.last && !dataItem.week) {
        return true
      }

      if (dataItem.last) {
        const month = pD.M
        const pD2 = pD.clone()
        pD2.date(pD.D + 7)

        if (pD2.M !== month) {
          return true
        }
      }

      if (dataItem.week) {
        const month = pD.M
        for (let a = dataItem.week, j = a.length; j-- > 0; ) {
          const pD2 = pD.clone()
          pD2.date(pD.D - 7 * (a[j] - 1))

          if (pD2.M === month) {
            pD2.date(pD.D - 7 * a[j])

            if (pD2.M !== month) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}
function getNextDayOfWeek(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[5].data

  if (!isValidDayOfWeek(data, pD, rules)) {
    pD.seconds(0)
    pD.minutes(0)
    pD.hours(0)

    checkIteratesCount()
    const month = pD.M
    pD.date(pD.D + 1)
    return month === pD.M
      ? getNextDayOfMonth(parsedCronTime, pD, rules)
      : getNextMonth(parsedCronTime, pD, rules)
  }

  // console.log('W', pD + '')
  getNextHours(parsedCronTime, pD, rules)
}

function getNextHours(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[2].data

  if (!(pD.h in data)) {
    pD.seconds(0)
    pD.minutes(0)
    for (const date = pD.D; true; ) {
      checkIteratesCount()
      pD.hours(pD.h + 1)
      if (pD.D !== date) return getNextDayOfMonth(parsedCronTime, pD, rules)
      if (pD.h in data) break
    }
  }

  rules[2] = data[pD.h][0]
  // console.log('h', pD + '')
  getNextMinutes(parsedCronTime, pD, rules)
}

function getNextMinutes(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[1].data

  if (!(pD.m in data)) {
    pD.seconds(0)
    for (const hours = pD.h; true; ) {
      checkIteratesCount()
      pD.minutes(pD.m + 1)
      if (pD.h !== hours) return getNextHours(parsedCronTime, pD, rules)
      if (pD.m in data) break
    }
  }

  rules[1] = data[pD.m][0]
  // console.log('m', pD + '')
  getNextSeconds(parsedCronTime, pD, rules)
}

function getNextSeconds(
  parsedCronTime: ParsedCronTime,
  pD: ParsedDate,
  rules: ParsedCronTimeFieldRules[]
) {
  const data = parsedCronTime[0].data

  if (!(pD.s in data)) {
    for (const minutes = pD.m; true; ) {
      checkIteratesCount()
      pD.seconds(pD.s + 1)
      if (pD.m !== minutes) return getNextMinutes(parsedCronTime, pD, rules)
      if (pD.s in data) break
    }
  }

  rules[0] = data[pD.s][0]
  // console.log('s', pD + '')
}
