import type { GraveyardProject } from "@/types/project";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchProjects(): Promise<GraveyardProject[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id,created_at,user_id,x_handle,x_avatar_url,name,idea,details,world_x,world_y")
    .order("created_at", { ascending: false })
    .returns<GraveyardProject[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchProjectById(id: string): Promise<GraveyardProject | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id,created_at,user_id,x_handle,x_avatar_url,name,idea,details,world_x,world_y")
    .eq("id", id)
    .maybeSingle<GraveyardProject>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

