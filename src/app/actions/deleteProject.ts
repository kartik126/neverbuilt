"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const deleteProjectSchema = z.object({
  id: z.union([z.string().uuid(), z.coerce.number().int().positive()]),
});

export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

export async function deleteProject(input: DeleteProjectInput) {
  const parsed = deleteProjectSchema.parse(input);
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

