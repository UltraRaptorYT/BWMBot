import { Context } from "telegraf";
import createDebug from "debug";
import {
  getCurrentProgress,
  getStageName,
  sendMessage,
  StageType,
  addHint,
} from "../utils/utils";
import stages from "../stages.json";

const debug = createDebug("bot:skip_command");

const skip = () => async (ctx: Context) => {
  //! Logic to be implemented
  /*
  Check if hint is used []
  */
  const username = ctx.message?.from.username || "";
  debug(`Triggered "skip" command`);
  let progress = await getCurrentProgress(username);
  let stageVal = progress.stage;
  let stageName = await getStageName(stageVal);
  const stageData = stages[stageName as keyof typeof stages] as StageType;
  if (stageData["skip"]) {
    await sendMessage(ctx, stageData["skip"], { reply: true });
    await addHint(username, stageVal, "skip");
  } else {
    await sendMessage(ctx, stages["default"]["skip"], { reply: true });
  }
};

export { skip };
