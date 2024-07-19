import supabase from "../supabase";
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
  const { error } = await supabase.from("bwm_user").insert({
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

export async function getCurrentStage(username: string) {
  const { data, error } = await supabase
    .from("bwm_progress")
    .select()
    .eq("username", username)
    .order("time_started", { ascending: false });
  if (error) {
    debug("getCurrentStage - failed to run");
  }
  if (!data) {
    return 1;
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
