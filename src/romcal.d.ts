// Minimal ambient types for romcal 1.x (the package ships no declarations).
// We only use `calendarFor`; its entries are narrowed locally in calendar.ts.
declare module "romcal" {
  interface CalendarForOptions {
    year?: number;
    country?: string;
    locale?: string;
    type?: string;
  }
  const Romcal: {
    calendarFor(options?: CalendarForOptions | number): Promise<unknown[]>;
    [key: string]: unknown;
  };
  export default Romcal;
}
