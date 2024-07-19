import { Context } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:begin_command");

const begin = () => async (ctx: Context) => {
  const message = `First things first.\n\nWhat is your name?\n\n欢迎来到吉祥宝聚寺`;
  debug(`Triggered "begin" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { begin };
