import { Context } from "telegraf";
import createDebug from "debug";
import {
  checkUserExist,
  addUser,
  setUserStage,
  sendMessage,
} from "../utils/utils";
import stages from "../stages.json";

const debug = createDebug("bot:start_command");

const start = () => async (ctx: Context) => {
  const username = ctx.message?.from.username || "";
  const message = stages["start"]["intro"].replace("{username}", username);
  debug(`Triggered "start" command with message \n${message}`);
  if (!username) {
    debug('Error with "start" text command');
    for await (let text of stages["default"]["usernameInstructions"]) {
      await sendMessage(ctx, text, { delay: 100 });
    }
    return;
  }
  const userExist = await checkUserExist(username);
  if (!userExist) {
    await addUser(username);
  }
  setUserStage(username, 1);
  const startTime = Date.now();

  try {
    await ctx.replyWithMarkdownV2(message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "English",
              callback_data: "start_puzzle_hunt_en",
            },
            {
              text: "中文 （Chinese）",
              callback_data: "start_puzzle_hunt_ch",
            },
          ],
        ],
      },
    });
    const endTime = Date.now();
    console.log(`Message sent in ${endTime - startTime} ms`);
  } catch (error) {
    console.error("Error sending message:", error);
  }
  return;
};

export { start };
