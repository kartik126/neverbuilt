"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

const createProjectSchema = z.object({
  name: z.string().min(1).max(80),
  idea: z.string().min(1).max(280),
  details: z.string().max(4000).optional(),
  worldX: z.number().finite(),
  worldY: z.number().finite(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

function computeSpiralOffset(step: number): { dx: number; dy: number } {
  // Deterministic small spiral to avoid stacking identical coords.
  // step=0 => (0,0), step=1 => (80,0), step=2 => (80,80), step=3 => (0,80) ...
  if (step <= 0) return { dx: 0, dy: 0 };
  const ring = Math.ceil(step / 4);
  const side = (step - 1) % 4; // 0..3
  const d = ring * 80;
  if (side === 0) return { dx: d, dy: 0 };
  if (side === 1) return { dx: d, dy: d };
  if (side === 2) return { dx: 0, dy: d };
  return { dx: -d, dy: d };
}

function extractAvatarUrl(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;

  const fromMeta =
    (typeof meta?.avatar_url === "string" ? meta.avatar_url : null) ??
    (typeof meta?.picture === "string" ? meta.picture : null) ??
    (typeof meta?.profile_image_url === "string" ? meta.profile_image_url : null) ??
    (typeof meta?.profile_image_url_https === "string" ? meta.profile_image_url_https : null);

  if (fromMeta) return fromMeta;

  const identities = user.identities as
    | Array<{ identity_data?: Record<string, unknown> | null } | null>
    | undefined;
  const identityData = identities?.find(Boolean)?.identity_data ?? null;

  const fromIdentity =
    (typeof identityData?.avatar_url === "string" ? identityData.avatar_url : null) ??
    (typeof identityData?.picture === "string" ? identityData.picture : null) ??
    (typeof identityData?.profile_image_url === "string" ? identityData.profile_image_url : null) ??
    (typeof identityData?.profile_image_url_https === "string"
      ? identityData.profile_image_url_https
      : null);

  return fromIdentity ?? null;
}

export async function createProject(input: CreateProjectInput) {
  const parsed = createProjectSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to post.");
  }

  const possibleHandle =
    (user.user_metadata?.user_name as string | undefined) ??
    (user.user_metadata?.preferred_username as string | undefined) ??
    (user.user_metadata?.name as string | undefined);

  const possibleAvatarUrl = extractAvatarUrl(user);

  let worldX = parsed.worldX;
  let worldY = parsed.worldY;

  for (let i = 0; i < 12; i++) {
    const { dx, dy } = computeSpiralOffset(i);
    const candidateX = parsed.worldX + dx;
    const candidateY = parsed.worldY + dy;

    const { data: existing, error: selectError } = await supabase
      .from("projects")
      .select("id")
      .eq("world_x", candidateX)
      .eq("world_y", candidateY)
      .limit(1);

    if (selectError) {
      throw new Error(selectError.message);
    }

    if (!existing || existing.length === 0) {
      worldX = candidateX;
      worldY = candidateY;
      break;
    }
  }

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    x_handle: possibleHandle ?? null,
    x_avatar_url: possibleAvatarUrl ?? null,
    name: parsed.name,
    idea: parsed.idea,
    details: parsed.details ?? null,
    world_x: worldX,
    world_y: worldY,
  });

  if (error) {
    throw new Error(error.message);
  }
}

