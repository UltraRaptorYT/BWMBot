import { Context } from "telegraf";
import createDebug from "debug";
import { checkUserExist, addUser, setUserStage } from "../utils/utils";
import stages from "../stages.json";

const debug = createDebug("bot:start_command");

const start = () => async (ctx: Context) => {
  const username = ctx.message?.from.username || "";
  const message = stages["start"]["intro"].replace("{username}", username);
  debug(`Triggered "start" command with message \n${message}`);
  if (!username) {
    debug('Error with "start" text command');
    return;
  }
  const userExist = await checkUserExist(username);
  if (!userExist) {
    await addUser(username);
  }
  setUserStage(username, 1);
  await ctx.replyWithMarkdownV2(message, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Begin 开始", callback_data: "start_puzzle_hunt" }],
      ],
    },
  });
};

export { start };
