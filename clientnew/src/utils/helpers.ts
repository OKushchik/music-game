import {YearValue} from "@/src/models/models";

export function toMs(date: YearValue): number {
  const ms = Date.parse(date);
  return Number.isNaN(ms) ? 0 : ms;
}
