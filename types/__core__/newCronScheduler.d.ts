import { ParsedCronTime } from './parseCronTime.types';
export type CronSchedulerProps = {
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
    onTick: (this: CronScheduler) => any;
    onStart?: (this: CronScheduler) => any;
    onStop?: (this: CronScheduler) => any;
    /**
     * Seed for random function.
     * If undefined or 0, the "Math.random" will be used.
     */
    seedForRandom?: number;
};
export declare class CronScheduler {
    readonly started: boolean;
    readonly _cronTime: string;
    readonly _timeZone: string | undefined;
    private _timeoutId;
    readonly nextDate: Date | null;
    readonly _cronTimeParsed: ParsedCronTime;
    readonly _randomFunction: () => number;
    onTick: CronSchedulerProps['onTick'];
    onStart?: CronSchedulerProps['onStart'];
    onStop?: CronSchedulerProps['onStop'];
    constructor(props: CronSchedulerProps);
    start(): void;
    stop(): void;
}
export declare function newCronScheduler(params: CronSchedulerProps): CronScheduler;
