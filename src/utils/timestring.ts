import { TimestampStylesString, time } from "discord.js";
export const timestring = (ms: number, style: TimestampStylesString) => {
  return time(Math.round(ms / 1000), style);
};
