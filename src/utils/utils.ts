import supabase from "../supabase";
import { Context, Types } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:utils");

export async function setUserLanguage(username: string, language: "EN" | "CH") {
  const { error } = await supabase
    .from("bwm_user")
    .update({ language })
    .eq("username", username);
  if (error) {
    debug("setUserLanguage - failed to run");
  }
  return;
}

export async function getUserLanguage(username: string) {
  const { data, error } = await supabase
    .from("bwm_user")
    .select()
    .eq("username", username);
  if (error) {
    debug("getUserLanguage - failed to run");
    return "EN";
  }
  if (data.length == 0) {
    debug(`getUserLanguage - user ${username} not found`);
    return "EN";
  }
  return data[0].language;
}

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

export async function addHint(username: string, stage: number, type: string) {
  const { error } = await supabase.from("bwm_hint").insert({
    username: username,
    stage: stage,
    type: type,
  });
  if (error) {
    debug("addHint - failed to run");
    console.log(error);
  }
}

export async function checkHintUsed(
  username: string,
  stage: number,
  time_started: string
) {
  const { data, error } = await supabase
    .from("bwm_hint")
    .select()
    .eq("username", username)
    .eq("stage", stage)
    .eq("type", "hint")
    .order("created_at", { ascending: false });
  if (error) {
    debug("checkHintUsed - failed to run");
    console.log(error);
    return false;
  }
  if (!data || data.length == 0) {
    return false;
  }
  if (new Date(time_started) > new Date(data[0].created_at)) {
    return false;
  }
  return true;
}

export async function logAnswer(
  username: string,
  stage: number,
  answer: string,
  isCorrect: boolean
) {
  const { error } = await supabase.from("bwm_log").insert({
    username: username,
    stage: stage,
    answer: answer,
    isCorrect: isCorrect,
  });
  if (error) {
    debug("logAnswer - failed to run");
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
    await new Promise((r) => setTimeout(r, delay));
    await ctx.replyWithHTML(message, extra);
  }
}

export type StageType = {
  intro?: string;
  begin?: string;
  error?: string;
  rules?: string[];
  key?: string[];
  "correct-en"?: string;
  "correct-ch"?: string;
  "wrong-en"?: string;
  "wrong-ch"?: string;
  "next-en"?: string;
  "next-ch"?: string;
  "text-en"?: string[];
  text?: string[];
  info?: string[];
  "hint-en"?: string;
  "hint-ch"?: string;
  hint?: string; // REMOVE
  extra?: Types.ExtraReplyMessage;
  "skip-en"?: string;
  "skip-ch"?: string;
  hintNotUsed?: string;
  hintUsed?: string;
  usernameInstructions?: string[];
};

export type ProgressType = {
  id: number;
  username: string;
  stage: number;
  time_started: string;
  time_completed?: string;
};
