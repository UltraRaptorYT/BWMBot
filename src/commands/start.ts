import { Context } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:start_command");

const start = () => async (ctx: Context) => {
  const message = `Welcome to BW Monastery. This is \n---\n欢迎来到吉祥宝聚寺`;
  debug(`Triggered "start" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { start };
