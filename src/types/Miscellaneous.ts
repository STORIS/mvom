export type MvDataType = string | null | undefined;

export type MvAttribute = MvDataType | (MvDataType | MvDataType[])[];

export type MvRecord = MvAttribute[];

/** Format of ISOCalendarDate output */
export type ISOCalendarDate = `${number}-${number}-${number}`;
/** Format of ISOTime output */
export type ISOTime = `${number}:${number}:${number}.${number}`;
/** Format of ISOCalendarDateTime output */
export type ISOCalendarDateTime = `${ISOCalendarDate}T${ISOTime}`;
