"use server";

import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function marcarTutorialVistoAction() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ tutorial_visto: true }).eq("id", profile.id);
  if (error) throw error;
}
