import { Context } from "telegraf";
import createDebug from "debug";
import stages from "../stages.json";
import {
  checkUserExist,
  addUser,
  getCurrentProgress,
  getStageName,
  StageType,
  sendMessage,
  setUserStage,
  updateCompletedTime,
  logAnswer,
  uploadFile,
} from "../utils/utils";

const debug = createDebug("bot:stage_text");

const stage = () => {
  return async (ctx: Context) => {
    debug('Triggered "stage" text command');
    const username = ctx.message?.from.username || "";
    if (!username) {
      debug('Error with "stage" text command');
      return;
    }
    const userExist = await checkUserExist(username);
    if (!userExist) {
      await addUser(username);
    }
    let progress = await getCurrentProgress(username);
    let stageVal = progress.stage;
    let stageName = await getStageName(stageVal);
    const stageData = stages[stageName as keyof typeof stages] as StageType;
    if (stageName == "start") {
      return await sendMessage(ctx, stages["start"]["error"]);
    }
    console.log(ctx);

    if (ctx.message) {
      let uploadSuccess = false;
      if ("photo" in ctx.message) {
        let file_id = ctx.message.photo.pop()?.file_id || "";
        uploadSuccess = await uploadFile(ctx, username, file_id, "image/jpeg");
      } else if ("document" in ctx.message) {
        let file_id = ctx.message.document.file_id;
        uploadSuccess = await uploadFile(
          ctx,
          username,
          file_id,
          ctx.message.document.mime_type || "image/jpeg"
        );
      } else if ("video" in ctx.message) {
        let file_id = ctx.message.video.file_id;
        uploadSuccess = await uploadFile(
          ctx,
          username,
          file_id,
          ctx.message.video.mime_type || "video/mp4"
        );
      }
      if (uploadSuccess) {
        return await sendMessage(ctx, stages["default"]["imageUpload"]);
      }
    }

    let answer = ctx.text || "";
    let isCorrect =
      stageData["key"]?.includes(answer.toLowerCase().trim() || "") || false;
    await logAnswer(username, stageVal, answer, isCorrect);
    if (isCorrect) {
      // Update Time
      await updateCompletedTime(progress.id);
      let wellDone = stageData["correct"] || stages["default"]["correct"];
      await sendMessage(ctx, wellDone);
      // Insert Info
      if (stageData["info"]) {
        for (let info of stageData["info"]) {
          await sendMessage(ctx, info);
        }
      }
      await setUserStage(username, stageVal + 1);
      // Insert Text
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
    if (stageVal > 1) {
      let wrong = stageData["wrong"] || stages["default"]["wrong"];
      return await sendMessage(ctx, wrong);
    }
    return await sendMessage(ctx, stages["start"]["error"]);
  };
};

export { stage };
