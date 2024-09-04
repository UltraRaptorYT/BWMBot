import { Context } from "telegraf";
import createDebug from "debug";
import {
  getCurrentProgress,
  getStageName,
  sendMessage,
  StageType,
  addHint,
  checkHintUsed,
  updateCompletedTime,
  setUserStage,
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
  // Check if hint is used
  let hintUsed = await checkHintUsed(username, stageVal, progress.time_started);
  if (stageData["skip"]) {
    if (!hintUsed) {
      await sendMessage(ctx, stages["default"]["skipInvalid"], { reply: true });
    } else {
      for (let text of stages["default"]["skip"]) {
        await sendMessage(ctx, text, { delay: 100 });
      }
      await addHint(username, stageVal, "skip");
      await updateCompletedTime(progress.id, true);
      for (let text of stageData["skip"]) {
        await sendMessage(ctx, text, { delay: 100, reply: true });
      }
      if (stageData["info"]) {
        for (let info of stageData["info"]) {
          await sendMessage(ctx, info);
        }
      }
      await setUserStage(username, stageVal + 1);
      // Insert new Text
      let newStageName = await getStageName(stageVal + 1);
      if (
        !["rules"].includes(stageName) ||
        !["s1", "break", "end"].includes(newStageName)
      ) {
        await sendMessage(ctx, stages["default"]["next"]);
      }
      const newStageData = stages[
        newStageName as keyof typeof stages
      ] as StageType;
      if (newStageData["text"]) {
        for (let text of newStageData["text"]) {
          if (newStageData["extra"]) {
            await sendMessage(ctx, text, {
              extra: newStageData["extra"],
              delay: 500,
            });
          } else {
            await sendMessage(ctx, text, {
              delay: 500,
            });
          }
        }
      }
      return;
    }
  } else {
    return await sendMessage(ctx, stages["default"]["noSkip"], { reply: true });
  }
};

export { skip };
