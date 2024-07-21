import { Context } from "telegraf";
import createDebug from "debug";
import {
  getCurrentProgress,
  getStageName,
  sendMessage,
  StageType,
  addHint,
  checkHintUsed,
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
  let hintUsed = await checkHintUsed(username, stageVal, progress.time_started);
  if (stageData["hint"]) {
    if (!hintUsed) {
      await addHint(username, stageVal, "hint");
      await sendMessage(ctx, stages["default"]["hintNotUsed"], { reply: true });
    } else {
      await sendMessage(ctx, stages["default"]["hintUsed"], { reply: true });
    }
    await sendMessage(ctx, stageData["hint"]);
  } else {
    await sendMessage(ctx, stages["default"]["hint"], { reply: true });
  }
};

export { hint };
