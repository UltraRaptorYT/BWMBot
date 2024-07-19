import supabase from "../supabase";
import { Context } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:utils");

export async function checkUserExist(username: string) {
  const { data, error } = await supabase
    .from("bwm_user")
    .select()
    .eq("username", username);
  if (error) {
    debug("checkUserExist - failed to run");
    return false;
  }
  if (data.length == 0) {
    debug(`checkUserExist - user ${username} not found`);
    return false;
  }
  return true;
}

export async function addUser(username: string) {
  const { error } = await supabase.from("bwm_user").upsert({
    username: username,
  });
  if (error) {
    debug("addUser - failed to run");
  }
  await setUserStage(username, 1);
}

export async function setUserStage(username: string, stage: number) {
  const { error } = await supabase.from("bwm_progress").insert({
    username: username,
    stage: stage,
  });
  if (error) {
    debug("setUserStage - failed to run");
  }
}

export async function getCurrentStage(username: string): Promise<number> {
  const { data, error } = await supabase
    .from("bwm_progress")
    .select()
    .eq("username", username)
    .order("time_started", { ascending: false });
  if (error) {
    debug("getCurrentStage - failed to run");
  }
  if (!data || data.length == 0) {
    await setUserStage(username, 1);
    return await getCurrentStage(username);
  }
  return data[0].stage;
}

export async function getStageName(stage: number): Promise<string> {
  const { data, error } = await supabase
    .from("bwm_stage")
    .select()
    .eq("id", stage);
  if (error) {
    debug("getStageName - failed to run");
  }
  if (!data) {
    return "start";
  }
  return data[0].stage;
}

export async function sendMessage(
  ctx: Context,
  message: string,
  reply: boolean = false
) {
  let extra: { [key: string]: any } = {};
  if (message.startsWith("image:")) {
    await ctx.sendPhoto(message.replace("image:", ""));
  } else {
    if (message.includes("{username}")) {
      const username = ctx.message?.from.username || "";
      message = message.replaceAll("{username}", username);
    }
    if (reply) {
      const messageId = ctx.message?.message_id;
      extra["reply_parameters"] = { message_id: messageId };
    }
    await ctx.reply(message, extra);
  }
}
