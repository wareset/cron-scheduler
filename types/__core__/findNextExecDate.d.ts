import { ParsedCronTime } from './parseCronTime.types';
export declare function findNextExecDate(parsedCronTime: ParsedCronTime, prevDate?: Date, timeZone?: string, random?: () => number): Date;
