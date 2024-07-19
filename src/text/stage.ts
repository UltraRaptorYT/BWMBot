import { Context } from "telegraf";
import createDebug from "debug";
import stages from "../stages.json";
import {
  checkUserExist,
  addUser,
  getCurrentStage,
  getStageName,
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
    let stageVal = await getCurrentStage(username);
    let stageName = await getStageName(stageVal);
    const stageData = stages[stageName as keyof typeof stages];
    console.log(stageData);
    if (stageName == "start") {
      await ctx.sendMessage(`Test Greetings, ${username}!`);
    } else if (stageName == "setup") {
      await ctx.sendMessage(`enter name Greetings, ${username}!`);
    }
  };
};

export { stage };
