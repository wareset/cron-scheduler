import { UNIT_NAMES } from './parseCronTime.utils';
export type ParsedCronTime = Readonly<[
    ParsedCronTimeField<(typeof UNIT_NAMES)[0]>,
    ParsedCronTimeField<(typeof UNIT_NAMES)[1]>,
    ParsedCronTimeField<(typeof UNIT_NAMES)[2]>,
    ParsedCronTimeField<(typeof UNIT_NAMES)[3]>,
    ParsedCronTimeField<(typeof UNIT_NAMES)[4]>,
    ParsedCronTimeField<(typeof UNIT_NAMES)[5]>
]>;
export type ParsedCronTimeField<T extends (typeof UNIT_NAMES)[keyof typeof UNIT_NAMES]> = {
    type: T;
    data: ParsedCronTimeFieldData;
    opts: ParsedCronTimeFieldOpts[];
};
export type ParsedCronTimeFieldData = {
    [key: number]: ParsedCronTimeFieldRules[];
};
export type ParsedCronTimeFieldOpts = {
    text: string;
    step: number;
    limit: [number, number];
    range: [number, number];
    rules: ParsedCronTimeFieldRules;
};
export type ParsedCronTimeFieldRules = {
    last?: undefined | true;
    rand?: undefined | number;
    week?: undefined | number[];
    work?: undefined | true;
};
