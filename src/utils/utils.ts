import supabase from "../supabase";
import { Context, Types } from "telegraf";
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
    console.log(error);
  }
}

export async function getCurrentProgress(
  username: string
): Promise<ProgressType> {
  const { data, error } = await supabase
    .from("bwm_progress")
    .select()
    .eq("username", username)
    .order("time_started", { ascending: false });
  if (error) {
    debug("getCurrentProgress - failed to run");
  }
  if (!data || data.length == 0) {
    await setUserStage(username, 1);
    return await getCurrentProgress(username);
  }
  return data[0];
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

export async function updateCompletedTime(progress_id: number) {
  const { error } = await supabase
    .from("bwm_progress")
    .update({
      time_completed: new Date(),
    })
    .eq("id", progress_id);
  if (error) {
    debug("updateCompletedTime - failed to run");
    console.log(error);
  }
}

interface SendMessageOptions {
  delay?: number;
  reply?: boolean;
  extra?: Types.ExtraReplyMessage;
}

export async function sendMessage(
  ctx: Context,
  message: string,
  { delay = 0, reply = false, extra = {} }: SendMessageOptions = {}
) {
  const messageId = ctx.message?.message_id;
  if (message.startsWith("image:")) {
    await ctx.sendPhoto(message.replace("image:", ""));
  } else {
    if (message.includes("{username}")) {
      const username = ctx.message?.from.username || "";
      message = message.replaceAll("{username}", username);
    }
    if (reply && messageId) {
      extra["reply_parameters"] = { message_id: messageId };
    }
    setTimeout(() => {}, delay);
    await ctx.reply(message, extra);
  }
}

export type StageType = {
  intro?: string;
  begin?: string;
  error?: string;
  rules?: string[];
  key?: string;
  correct?: string;
  wrong?: string;
  next?: string;
  text?: string[];
  info?: string[];
  hint?: string;
  extra?: Types.ExtraReplyMessage;
};

export type ProgressType = {
  id: number;
  username: string;
  stage: number;
  time_started: string;
  time_completed?: string;
};
