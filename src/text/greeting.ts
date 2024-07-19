import { Context } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:greeting_text");

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  const userName = ctx.message?.from.username;

  if (messageId) {
    await replyToMessage(ctx, messageId, `Test Greetings, ${userName}!`);
  }
};

export { greeting };
