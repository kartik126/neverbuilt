"use client";

import Image from "next/image";

import type { GraveyardProject } from "@/types/project";

type GraveProps = {
  project: GraveyardProject;
  onOpen: (project: GraveyardProject) => void;
};

export function Grave({ project, onOpen }: GraveProps) {
  const displayHandle = project.x_handle ? `@${project.x_handle}` : "anonymous";

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      onPointerDown={(e) => e.stopPropagation()}
      className="group absolute select-none text-left"
      style={{
        left: `${project.world_x}px`,
        top: `${project.world_y}px`,
      }}
      draggable={false}
    >
      <div className="relative w-[180px]">
        <div className="cursor-pointer absolute left-1/2 top-[-55px] z-10 w-[180px] -translate-x-1/2">
          <div className="rounded-md border-2 border-black bg-white px-2 py-2 shadow-[3px_3px_0_0_#000]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-md border-2 border-black bg-zinc-100">
                {project.x_avatar_url ? (
                  <Image
                    src={project.x_avatar_url}
                    alt={displayHandle}
                    width={28}
                    height={28}
                    className="h-7 w-7 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-7 w-7 place-items-center font-mono text-[10px] text-zinc-600">
                    X
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate font-mono text-[11px] font-bold text-zinc-900">
                  {project.name}
                </div>
                <div className="truncate font-mono text-[10px] text-zinc-700">{displayHandle}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-[100px] w-[100px] pixel-crisp cursor-pointer">
          <Image
            src="/grave_fixed.png"
            alt="Grave"
            fill
            sizes="100px"
            className="object-contain pixel-crisp"
            priority={false}
          />
        </div>
      </div>
    </button>
  );
}
