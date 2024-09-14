import { Context } from "telegraf";
import createDebug from "debug";
import {
  checkUserExist,
  addUser,
  setUserStage,
  sendMessage,
  uploadFile,
  getUserProfilePhotos,
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
  const photos = await ctx.telegram.getUserProfilePhotos(
    ctx.message?.from.id ?? 0
  );
  let uploadSuccess = false;
  if (photos.total_count > 0) {
    const file_id = photos.photos[0][photos.photos[0].length - 1].file_id;
    uploadSuccess = await uploadFile(
      ctx,
      username,
      file_id,
      "image/jpeg",
      false
    );
  }
  if (!userExist) {
    let file_path =
      "https://img.freepik.com/free-icon/user_318-563642.jpg?w=360";
    if (uploadSuccess) {
      file_path = await getUserProfilePhotos(username);
    }
    await addUser(username, file_path);
  }
  setUserStage(username, 1);
  const startTime = Date.now();

  try {
    await sendMessage(ctx, message, {
      extra: {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Begin 开始",
                callback_data: "start_puzzle_hunt",
              },
            ],
          ],
        },
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
