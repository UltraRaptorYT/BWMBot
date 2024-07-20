import { Context, Telegraf } from "telegraf";

import { start, hint, test,skip } from "./commands";
import { stage } from "./text";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { development, production } from "./core";

import stages from "./stages.json";
import {
  setUserStage,
  sendMessage,
  getStageName,
  StageType,
} from "./utils/utils";

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const ENVIRONMENT = process.env.NODE_ENV || "";

export const bot = new Telegraf(BOT_TOKEN);

bot.command("start", start());
bot.command("hint", hint());
bot.command("skip", skip());
bot.command("test", test());
bot.on("message", stage());

bot.action("start_puzzle_hunt", async (ctx: Context) => {
  try {
    const username = ctx.from?.username || "";
    let stage = Object.keys(stages).indexOf("start");
    if (stage == -1) {
      console.log("Error");
    }
    stage += 1;
    await setUserStage(username, stage);
    let stageName = await getStageName(stage);
    const stageData = stages[stageName as keyof typeof stages] as StageType;
    if (stageData["rules"]) {
      for (let rule of stageData["rules"]) {
        await sendMessage(ctx, rule, { delay: 100 });
      }
    }
  } catch (error) {
    console.error("Error handling 'start_puzzle_hunt' action:", error);
  }
});

bot.action("test_bot", async (ctx: Context) => {
  await sendMessage(ctx, "Testing Action");
});

bot.action("end_break", async (ctx: Context) => {
  const username = ctx.from?.username || "";
  let stage = Object.keys(stages).indexOf("break");
  if (stage == -1) {
    console.log("Error");
  }
  stage += 1;
  await setUserStage(username, stage);
  let stageName = await getStageName(stage);
  const stageData = stages[stageName as keyof typeof stages] as StageType;
  if (stageData["text"]) {
    for (let text of stageData["text"]) {
      await sendMessage(ctx, text, { delay: 100 });
    }
  }
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== "production" && development(bot);
