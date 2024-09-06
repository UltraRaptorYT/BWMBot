import supabase from "../supabase";
import { Context, Types } from "telegraf";
import createDebug from "debug";
import axios from "axios";

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

export async function getUserProfilePhotos(username: string) {
  const { data, error } = await supabase
    .from("bwm_user")
    .select()
    .eq("username", username);
  if (error) {
    debug("getUserProfilePhotos - failed to run");
    return "https://img.freepik.com/free-icon/user_318-563642.jpg?w=360";
  }
  if (data.length == 0) {
    debug(`getUserProfilePhotos - user ${username} not found`);
    return "https://img.freepik.com/free-icon/user_318-563642.jpg?w=360";
  }
  return data[0].profile_pic;
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

export async function addUser(username: string, profile_pic?: string) {
  const { error } = await supabase.from("bwm_user").upsert({
    username: username,
    profile_pic: profile_pic,
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

export async function updateCompletedTime(
  progress_id: number,
  skip: boolean = false
) {
  const { error } = await supabase
    .from("bwm_progress")
    .update({
      time_completed: new Date(),
      skip: skip,
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

export async function uploadFile(
  ctx: Context,
  username: string,
  file_id: string,
  type: string
): Promise<boolean> {
  try {
    const fileLink = await ctx.telegram.getFileLink(file_id);
    console.log(fileLink);
    const response = await axios.get(fileLink.href, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data, "binary");
    let file_extension = fileLink.href.split(".").slice(-1);
    const fileName = `${username}-${String(new Date().getTime())}.${file_extension}`;
    let storageVal = await supabase.storage
      .from("bwm_puzzle")
      .upload(fileName, buffer, {
        contentType: type,
      });
    if (storageVal.error) {
      console.log(storageVal.error);
      return false;
    }
    let { error } = await supabase
      .from("bwm_image")
      .insert({ username: username, image: storageVal.data.fullPath });
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
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
  key?: string[];
  correct?: string[];
  wrong?: string;
  next?: string;
  text?: string[];
  info?: string[];
  hint?: string;
  extra?: Types.ExtraReplyMessage;
  skip?: string[];
  hintNotUsed?: string;
  hintUsed?: string;
  usernameInstructions?: string[];
  imageUpload?: string;
  skipInvalid?: string;
  noSkip?: string;
};

export type ProgressType = {
  id: number;
  username: string;
  stage: number;
  time_started: string;
  time_completed?: string;
};
