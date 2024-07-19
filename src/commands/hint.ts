import { Context } from "telegraf";
import createDebug from "debug";
import {
  getCurrentProgress,
  getStageName,
  sendMessage,
  StageType,
} from "../utils/utils";
import stages from "../stages.json";

const debug = createDebug("bot:hint_command");

const hint = () => async (ctx: Context) => {
  const username = ctx.message?.from.username || "";
  debug(`Triggered "hint" command`);
  let progress = await getCurrentProgress(username);
  let stageVal = progress.stage;
  let stageName = await getStageName(stageVal);
  const stageData = stages[stageName as keyof typeof stages] as StageType;
  if (stageData["hint"]) {
    await sendMessage(ctx, stageData["hint"], { reply: true });
  } else {
    await sendMessage(ctx, stages["default"]["hint"], { reply: true });
  }
};

export { hint };
