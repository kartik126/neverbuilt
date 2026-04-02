"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import type { User } from "@supabase/supabase-js";

import type { GraveyardProject } from "@/types/project";

import { AuthButton } from "@/components/auth/AuthButton";
import { NewProjectPanel } from "@/components/graveyard/NewProjectPanel";
import { Grave } from "@/components/graveyard/Grave";
import { deleteProject } from "@/app/actions/deleteProject";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type GraveyardWorldProps = {
  projects: GraveyardProject[];
  user: User | null;
};

export function GraveyardWorld({ projects, user }: GraveyardWorldProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<Size>({ width: 800, height: 600 });
  const [openProject, setOpenProject] = useState<GraveyardProject | null>(null);

  const dragStateRef = useRef<
    | {
        pointerId: number;
        startPan: Point;
        startClient: Point;
      }
    | null
  >(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

    dragStateRef.current = {
      pointerId: e.pointerId,
      startPan: pan,
      startClient: { x: e.clientX, y: e.clientY },
    };
  }, [pan]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startClient.x;
    const dy = e.clientY - drag.startClient.y;
    setPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dragStateRef.current = null;
        setOpenProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const update = () => {
      const rect = viewport.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(viewport);

    return () => ro.disconnect();
  }, []);

  const cameraCenterWorld = useMemo(() => {
    return { x: -pan.x + viewportSize.width / 2, y: -pan.y + viewportSize.height / 2 };
  }, [pan.x, pan.y, viewportSize.height, viewportSize.width]);

  const centerOnProject = useCallback(
    (p: GraveyardProject) => {
      setPan({ x: viewportSize.width / 2 - p.world_x, y: viewportSize.height / 2 - p.world_y });
    },
    [viewportSize.height, viewportSize.width],
  );

  const newestProject = projects[0] ?? null;
  const closeModal = useCallback(() => setOpenProject(null), []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 p-4">
          <div className="pointer-events-auto rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000]">
            <div className="font-bold">NeverBuilt</div>
            <div className="text-xs text-zinc-700">
              Drag to explore. Click a grave to read it. ({projects.length} buried)
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2 justify-end">
            {newestProject ? (
              <button
                type="button"
                onClick={() => centerOnProject(newestProject)}
                className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000]"
              >
                Center newest
              </button>
            ) : null}
            <NewProjectPanel
              user={user}
              suggestedWorldX={Math.round(cameraCenterWorld.x)}
              suggestedWorldY={Math.round(cameraCenterWorld.y)}
            />
            <AuthButton initialUser={user} />
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative flex flex-1 overflow-hidden bg-sky-200"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="absolute inset-0 graveyard-ground"
          style={{
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {projects.map((p) => (
            <Grave key={String(p.id)} project={p} onOpen={setOpenProject} />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border-2 border-black bg-white/90 px-3 py-2 font-mono text-xs shadow-[3px_3px_0_0_#000]">
          <div>
            camera: ({Math.round(cameraCenterWorld.x)}, {Math.round(cameraCenterWorld.y)})
          </div>
          <div className="text-zinc-700">tip: place a grave by posting while centered</div>
        </div>

        {openProject ? (
          <ProjectModal project={openProject} onClose={closeModal} viewerUserId={user?.id ?? null} />
        ) : null}
      </div>
    </div>
  );
}

type ProjectModalProps = {
  project: GraveyardProject;
  onClose: () => void;
  viewerUserId: string | null;
};

function ProjectModal({ project, onClose, viewerUserId }: ProjectModalProps) {
  const displayHandle = project.x_handle ? `@${project.x_handle}` : "anonymous";
  const canDelete = viewerUserId != null && viewerUserId === project.user_id;
  const [isDeleting, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      onPointerDown={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-xl font-bold">{project.name}</h2>
            <p className="mt-1 font-mono text-xs text-zinc-700">
              {displayHandle} · {new Date(project.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canDelete ? (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteError(null);
                  startTransition(async () => {
                    try {
                      const ok = confirm("Delete this project permanently?");
                      if (!ok) return;
                      await deleteProject({ id: project.id });
                      window.location.href = "/";
                    } catch (e) {
                      setDeleteError(e instanceof Error ? e.message : "Delete failed.");
                    }
                  });
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-md border-2 border-black bg-red-100 px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {deleteError ? (
            <div className="rounded-md border-2 border-black bg-red-50 p-3 font-mono text-sm text-red-900">
              {deleteError}
            </div>
          ) : null}
          <section className="rounded-md border-2 border-black bg-zinc-50 p-4">
            <h3 className="font-mono text-xs font-bold">Idea</h3>
            <p className="mt-2 whitespace-pre-wrap text-base text-zinc-900">{project.idea}</p>
          </section>

          {project.details ? (
            <section className="rounded-md border-2 border-black bg-zinc-50 p-4">
              <h3 className="font-mono text-xs font-bold">Details</h3>
              <p className="mt-2 whitespace-pre-wrap text-base text-zinc-900">{project.details}</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
