import {
  FORMAT_OPTIONS,
  createDTF,
  updateParsedDate,
  updateAndFixOffsetAfterChange,
} from './parseDate.utils'

/*@__NO_SIDE_EFFECTS__*/
export class ParsedDate {
  /**
   * Объект Date: new Date(+date?)
   */
  readonly _date: Date
  /**
   * Таймзона: 'Australia/Eucla'
   */
  readonly _zone: string

  /**
   * День недели: 0-6
   */
  declare readonly W: number
  /**
   * Месяц: 1-12
   */
  declare readonly M: number
  /**
   * День месяца: 1-[28,29,30,31]
   */
  declare readonly D: number
  /**
   * Год: 42, 1989, 2025
   */
  declare readonly Y: number
  /**
   * Эра: 'AD' | 'BC'
   */
  declare readonly E: 'AD' | 'BC'
  /**
   * Часы: 00-23
   */
  declare readonly h: number
  /**
   * Минуты: 00-59
   */
  declare readonly m: number
  /**
   * Секунды: 00-59
   */
  declare readonly s: number
  /**
   * Миллисекунды: 000-999
   */
  declare readonly t: number
  /**
   * GMT в мс.: 0, 18000000
   */
  declare readonly z: number

  constructor(date?: Date | null, timeZone?: string) {
    this._date = date ? new Date(date.getTime()) : new Date()
    this._zone = createDTF(timeZone)
    updateParsedDate(this)
  }

  toString(locale?: string) {
    FORMAT_OPTIONS.timeZone = this._zone
    FORMAT_OPTIONS.timeZoneName = 'short'
    FORMAT_OPTIONS.fractionalSecondDigits = 3
    return this._date.toLocaleString(locale, FORMAT_OPTIONS)
  }

  // valueOf(...a) {
  //   return this._date.getTime()
  // }

  clone() {
    return new ParsedDate(this._date, this._zone)
  }

  year(setMonth?: number) {
    if (setMonth !== void 0 && setMonth !== this.Y) {
      const date = this._date
      date.setFullYear(date.getFullYear() - this.Y + setMonth)
      updateAndFixOffsetAfterChange(this)
    }
    return this.Y
  }

  month(setMonth?: number) {
    if (setMonth !== void 0 && setMonth !== this.M) {
      const date = this._date
      date.setMonth(date.getMonth() - this.M + setMonth)
      updateAndFixOffsetAfterChange(this)
    }
    return this.M
  }

  date(setDate?: number) {
    if (setDate !== void 0 && setDate !== this.D) {
      const date = this._date
      date.setDate(date.getDate() - this.D + setDate)
      updateAndFixOffsetAfterChange(this)
    }
    return this.D
  }

  hours(setHours?: number) {
    if (setHours !== void 0 && setHours !== this.h) {
      const date = this._date
      date.setHours(date.getHours() - this.h + setHours)
      updateAndFixOffsetAfterChange(this)
    }
    return this.h
  }

  minutes(setMinutes?: number) {
    if (setMinutes !== void 0 && setMinutes !== this.m) {
      const date = this._date
      date.setMinutes(date.getMinutes() - this.m + setMinutes)
      updateAndFixOffsetAfterChange(this)
    }
    return this.m
  }

  seconds(setSeconds?: number) {
    if (setSeconds !== void 0 && setSeconds !== this.s) {
      const date = this._date
      date.setSeconds(date.getSeconds() - this.s + setSeconds)
      updateAndFixOffsetAfterChange(this)
    }
    return this.s
  }

  milliseconds(setMilliseconds?: number) {
    if (setMilliseconds !== void 0 && setMilliseconds !== this.t) {
      this._date.setMilliseconds(setMilliseconds)
      updateAndFixOffsetAfterChange(this)
    }
    return this.t
  }
}

/*@__NO_SIDE_EFFECTS__*/
export function parseDate(date?: Date | null, timeZone?: string) {
  return new ParsedDate(date, timeZone)
}
