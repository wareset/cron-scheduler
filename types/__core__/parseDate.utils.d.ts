import type { ParsedDate } from './parseDate';
export declare const FORMAT_OPTIONS: Intl.DateTimeFormatOptions;
export declare function createDTF(timeZone?: string): string;
export declare function updateParsedDate(iam: ParsedDate): void;
export declare function updateAndFixOffsetAfterChange(iam: ParsedDate): void;
