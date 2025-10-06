export declare const UNIT_NAMES: readonly ["seconds", "minutes", "hours", "daysOfMonth", "months", "daysOfWeek"];
export declare function removeSpacesAndSplit(s: string | undefined): string[];
export declare const CRON_TIME_PRESETS: Readonly<{
    YEARLY: "0 0 0 1 1 *";
    MONTHLY: "0 0 0 1 * *";
    WEEKLY: "0 0 0 * * 0";
    DAILY: "0 0 0 * * *";
    HOURLY: "0 0 * * * *";
    MINUTELY: "0 * * * * *";
    SECONDLY: "* * * * * *";
    WEEKDAYS: "0 0 0 * * 1-5";
    WEEKENDS: "0 0 0 * * 0,6";
}>;
export declare const replacePresetsAliases: (s: string | undefined) => string;
export declare const replaceMonthAliases: (s: string | undefined) => string;
export declare const replaceWeekdayAliases: (s: string | undefined) => string;
