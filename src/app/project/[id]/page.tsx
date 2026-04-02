import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchProjectById } from "@/lib/data/projects";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await fetchProjectById(id);

  if (!project) notFound();

  return (
    <main className="min-h-[100svh] bg-[#8dd88a] p-4">
      <div className="mx-auto max-w-3xl rounded-xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-mono text-2xl font-bold">{project.name}</h1>
            <p className="mt-1 font-mono text-sm text-zinc-700">
              {project.x_handle ? `posted by @${project.x_handle}` : "posted by anonymous"} ·{" "}
              {new Date(project.created_at).toLocaleString()}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000]"
          >
            Back
          </Link>
        </div>

        <div className="mt-5 grid gap-4">
          <section className="rounded-md border-2 border-black bg-zinc-50 p-4">
            <h2 className="font-mono text-xs font-bold">Idea</h2>
            <p className="mt-2 whitespace-pre-wrap text-base text-zinc-900">{project.idea}</p>
          </section>

          {project.details ? (
            <section className="rounded-md border-2 border-black bg-zinc-50 p-4">
              <h2 className="font-mono text-xs font-bold">Details</h2>
              <p className="mt-2 whitespace-pre-wrap text-base text-zinc-900">{project.details}</p>
            </section>
          ) : null}

          <section className="rounded-md border-2 border-black bg-zinc-50 p-4">
            <h2 className="font-mono text-xs font-bold">Grave coordinates</h2>
            <p className="mt-2 font-mono text-sm text-zinc-800">
              ({Math.round(project.world_x)}, {Math.round(project.world_y)})
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
