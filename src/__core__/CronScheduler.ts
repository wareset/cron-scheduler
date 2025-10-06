import { createSeededRandom } from './utils'
import { parseCronTime } from './parseCronTime'
import { ParsedCronTime } from './parseCronTime.types'
import { findNextExecDate } from './findNextExecDate'

function loop(iam: CronScheduler, date: Date) {
  const ms = date.getTime() - Date.now()
  // @ts-ignore
  iam._timeoutId =
    ms > 214e7
      ? setTimeout(function () {
          loop(iam, date)
        }, 21e8)
      : setTimeout(
          function () {
            startCronScheduler(iam)
            iam.onTick.call(iam)
          },
          ms >= 1 ? ms : 1
        )
}

function startCronScheduler(iam: CronScheduler) {
  loop(
    iam,
    // @ts-ignore
    (iam.nextDate = findNextExecDate(
      iam._cronTimeParsed,
      void 0,
      iam._timeZone,
      iam._randomFunction
    ))
  )
}

export type CronSchedulerOptions = {
  /**
   * Cron expression.
   *
   * Example: '0 0/%5 12-16/2 * jan-dec sunL#1/2'
   */
  cronTime: string
  /**
   * Time zone.
   *
   * Example: 'Australia/Eucla'
   */
  timeZone?: string
  /**
   * Start cron scheduler.
   *
   * Default: true
   */
  start?: boolean

  /**
   * Seed for random function.
   * If undefined, the "Math.random" will be used.
   */
  seedForRandom?: number

  onTick: (this: CronScheduler) => any
  onStart?: (this: CronScheduler) => any
  onStop?: (this: CronScheduler) => any
}

export class CronScheduler {
  readonly started: boolean

  readonly _cronTime: string
  readonly _timeZone: string | undefined

  private _timeoutId: null | number | NodeJS.Timeout

  readonly nextDate: Date | null

  readonly _cronTimeParsed: ParsedCronTime
  readonly _randomFunction: () => number

  onTick: CronSchedulerOptions['onTick']
  onStart?: CronSchedulerOptions['onStart']
  onStop?: CronSchedulerOptions['onStop']

  constructor(props: CronSchedulerOptions) {
    this._timeZone = props.timeZone
    this._cronTimeParsed = parseCronTime((this._cronTime = props.cronTime))
    this.nextDate = this._timeoutId = null
    this.started = false

    const seedForRandom = props.seedForRandom
    this._randomFunction =
      seedForRandom === void 0 ? Math.random : createSeededRandom(seedForRandom)

    this.onTick = props.onTick
    this.onStart = props.onStart
    this.onStop = props.onStop

    if (props.start || props.start === void 0) {
      this.start()
    }
  }

  start() {
    if (!this.started) {
      // @ts-ignore
      this.started = true

      startCronScheduler(this)

      if (this.onStart) {
        this.onStart.call(this)
      }
    }
  }

  stop() {
    if (this.started) {
      // @ts-ignore
      this.started = false
      // @ts-ignore
      this.nextDate = null

      if (this._timeoutId != null) {
        clearTimeout(this._timeoutId)
        this._timeoutId = null
      }

      if (this.onStop) {
        this.onStop.call(this)
      }
    }
  }
}
