import { Context } from "telegraf";
import createDebug from "debug";
import { sendMessage } from "../utils/utils";

const debug = createDebug("bot:test_command");

const test = () => async (ctx: Context) => {
  await sendMessage(ctx, "Testing Bot... Bot is working", {
    reply: true,
    extra: {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Test Bot",
              callback_data: "test_bot",
            },
          ],
        ],
      },
    },
  });
};

export { test };
