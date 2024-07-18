import { Context } from "telegraf";
import createDebug from "debug";

import { author, name, version } from "../../package.json";

const debug = createDebug("bot:start_command");

const start = () => async (ctx: Context) => {
  const message = `Welcome To Jurassic Park!`;
  debug(`Triggered "start" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { start };
