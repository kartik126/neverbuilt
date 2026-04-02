import { fetchProjects } from "@/lib/data/projects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GraveyardWorld } from "@/components/graveyard/GraveyardWorld";

export default function Home() {
  return <HomeInner />;
}

async function HomeInner() {
  const [projects, supabase] = await Promise.all([fetchProjects(), createSupabaseServerClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 min-h-[100svh]">
      <GraveyardWorld projects={projects} user={user} />
    </main>
  );
}
