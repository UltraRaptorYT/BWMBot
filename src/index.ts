import { Context, Telegraf } from "telegraf";

import { start } from "./commands";
import { stage } from "./text";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { development, production } from "./core";

import stages from "./stages.json";
import { setUserStage, sendMessage } from "./utils/utils";

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const ENVIRONMENT = process.env.NODE_ENV || "";

export const bot = new Telegraf(BOT_TOKEN);

bot.command("start", start());
bot.on("message", stage());

bot.action("start_puzzle_hunt", async (ctx: Context) => {
  await ctx.answerCbQuery(); // Acknowledge the button click
  const username = ctx.message?.from.username || "";
  await setUserStage(username, 2);
  await sendMessage(ctx, stages["start"]["begin"]);
  for (let rule of stages["rules"]["rules"]) {
    await sendMessage(ctx, rule);
  }
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== "production" && development(bot);
