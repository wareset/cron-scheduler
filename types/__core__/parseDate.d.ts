export declare class ParsedDate {
    /**
     * Объект Date: new Date(+date?)
     */
    readonly _date: Date;
    /**
     * Таймзона: 'Australia/Eucla'
     */
    readonly _zone: string;
    /**
     * День недели: 0-6
     */
    readonly W: number;
    /**
     * Месяц: 1-12
     */
    readonly M: number;
    /**
     * День месяца: 1-[28,29,30,31]
     */
    readonly D: number;
    /**
     * Год: 42, 1989, 2025
     */
    readonly Y: number;
    /**
     * Эра: 'AD' | 'BC'
     */
    readonly E: 'AD' | 'BC';
    /**
     * Часы: 00-23
     */
    readonly h: number;
    /**
     * Минуты: 00-59
     */
    readonly m: number;
    /**
     * Секунды: 00-59
     */
    readonly s: number;
    /**
     * Миллисекунды: 000-999
     */
    readonly t: number;
    /**
     * GMT в мс.: 0, 18000000
     */
    readonly z: number;
    constructor(date?: Date | null, timeZone?: string);
    toString(locale?: string): string;
    clone(): ParsedDate;
    year(setMonth?: number): number;
    month(setMonth?: number): number;
    date(setDate?: number): number;
    hours(setHours?: number): number;
    minutes(setMinutes?: number): number;
    seconds(setSeconds?: number): number;
    milliseconds(setMilliseconds?: number): number;
}
export declare function parseDate(date?: Date | null, timeZone?: string): ParsedDate;
