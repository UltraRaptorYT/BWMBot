import { Context } from "telegraf";
import createDebug from "debug";
import {
  getCurrentProgress,
  getStageName,
  sendMessage,
  StageType,
} from "../utils/utils";
import stages from "../stages.json";

const debug = createDebug("bot:resend_command");

const resend = () => async (ctx: Context) => {
  const username = ctx.message?.from.username || "";
  debug(`Triggered "resend" command`);
  let progress = await getCurrentProgress(username);
  let stageVal = progress.stage;
  let stageName = await getStageName(stageVal);
  const stageData = stages[stageName as keyof typeof stages] as StageType;
  if (stageData["text"]) {
    for (let text of stageData["text"]) {
      if (stageName == "break" && stageData["extra"]) {
        await sendMessage(ctx, text, {
          extra: stageData["extra"],
        });
      } else {
        await sendMessage(ctx, text);
      }
    }
  }
};

export { resend };
