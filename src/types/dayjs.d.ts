// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace dayjs {
  function dayjs(date?: ConfigType): Dayjs;

  function dayjs(date?: ConfigType, format?: OptionType, strict?: boolean): Dayjs;

  function dayjs(date?: ConfigType, format?: OptionType, locale?: string, strict?: boolean): Dayjs;

  export type ConfigType = string | number | Date | Dayjs | GoogleAppsScript.Base.Date;

  export type OptionType = { locale?: string; format?: string; utc?: boolean } | string | string[];

  type UnitTypeShort = 'd' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms';
  export type UnitType =
    | 'millisecond'
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'month'
    | 'year'
    | 'date'
    | UnitTypeShort;

  export type OpUnitType = UnitType | 'week' | 'w';
  export type QUnitType = UnitType | 'quarter' | 'Q';

  class Dayjs {
    constructor(config?: ConfigType);

    clone(): Dayjs;

    isValid(): boolean;

    year(): number;

    year(value: number): Dayjs;

    month(): number;

    month(value: number): Dayjs;

    date(): number;

    date(value: number): Dayjs;

    day(): number;

    day(value: number): Dayjs;

    hour(): number;

    hour(value: number): Dayjs;

    minute(): number;

    minute(value: number): Dayjs;

    second(): number;

    second(value: number): Dayjs;

    millisecond(): number;

    millisecond(value: number): Dayjs;

    set(unit: UnitType, value: number): Dayjs;

    get(unit: UnitType): number;

    add(value: number, unit: OpUnitType): Dayjs;

    subtract(value: number, unit: OpUnitType): Dayjs;

    startOf(unit: OpUnitType): Dayjs;

    endOf(unit: OpUnitType): Dayjs;

    format(template?: string): string;

    diff(date: ConfigType, unit?: QUnitType | OpUnitType, float?: boolean): number;

    valueOf(): number;

    unix(): number;

    daysInMonth(): number;

    toDate(): Date;

    toJSON(): string;

    toISOString(): string;

    toString(): string;

    utcOffset(): number;

    isBefore(date: ConfigType, unit?: OpUnitType): boolean;

    isSame(date: ConfigType, unit?: OpUnitType): boolean;

    isAfter(date: ConfigType, unit?: OpUnitType): boolean;

    locale(): string;

    locale(preset: string | ILocale, object?: Partial<ILocale>): Dayjs;
  }

  export type PluginFunc<T = unknown> = (option: T, c: typeof Dayjs, d: typeof dayjs) => void;

  namespace dayjs {
    export function extend<T = unknown>(plugin: PluginFunc<T>, option?: T): Dayjs;

    export function locale(
      preset?: string | ILocale,
      object?: Partial<ILocale>,
      isLocal?: boolean
    ): string;

    export function isDayjs(d: unknown): d is Dayjs;

    export function unix(t: number): Dayjs;

    const Ls: { [key: string]: ILocale };
  }
}

declare module 'dayjs/locale/*' {
  namespace locale {
    type Locale = ILocale;
  }

  const locale: locale.Locale;

  export = locale;
}

declare interface ILocale {
  name: string;
  weekdays?: string[];
  months?: string[];
  weekStart?: number;
  weekdaysShort?: string[];
  monthsShort?: string[];
  weekdaysMin?: string[];
  ordinal?: (n: number) => number | string;
  formats: Partial<{
    LT: string;
    LTS: string;
    L: string;
    LL: string;
    LLL: string;
    LLLL: string;
  }>;
  relativeTime: Partial<{
    future: string;
    past: string;
    s: string;
    m: string;
    mm: string;
    h: string;
    hh: string;
    d: string;
    dd: string;
    M: string;
    MM: string;
    y: string;
    yy: string;
  }>;
}
