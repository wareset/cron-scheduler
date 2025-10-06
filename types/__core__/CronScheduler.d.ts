import { ParsedCronTime } from './parseCronTime.types';
export type CronSchedulerOptions = {
    /**
     * Cron expression.
     *
     * Example: '0 0/%5 12-16/2 * jan-dec sunL#1/2'
     */
    cronTime: string;
    /**
     * Time zone.
     *
     * Example: 'Australia/Eucla'
     */
    timeZone?: string;
    /**
     * Start cron scheduler.
     *
     * Default: true
     */
    start?: boolean;
    /**
     * Seed for random function.
     * If undefined, the "Math.random" will be used.
     */
    seedForRandom?: number;
    onTick: (this: CronScheduler) => any;
    onStart?: (this: CronScheduler) => any;
    onStop?: (this: CronScheduler) => any;
};
export declare class CronScheduler {
    readonly started: boolean;
    readonly _cronTime: string;
    readonly _timeZone: string | undefined;
    private _timeoutId;
    readonly nextDate: Date | null;
    readonly _cronTimeParsed: ParsedCronTime;
    readonly _randomFunction: () => number;
    onTick: CronSchedulerOptions['onTick'];
    onStart?: CronSchedulerOptions['onStart'];
    onStop?: CronSchedulerOptions['onStop'];
    constructor(props: CronSchedulerOptions);
    start(): void;
    stop(): void;
}
