"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import type { User } from "@supabase/supabase-js";

import { createProject } from "@/app/actions/createProject";

type NewProjectPanelProps = {
  user: User | null;
  suggestedWorldX: number;
  suggestedWorldY: number;
};

export function NewProjectPanel({ user, suggestedWorldX, suggestedWorldY }: NewProjectPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      name: "",
      idea: "",
      details: "",
    }),
    [],
  );

  const [name, setName] = useState(defaultValues.name);
  const [idea, setIdea] = useState(defaultValues.idea);
  const [details, setDetails] = useState(defaultValues.details);

  const open = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submit = useCallback(() => {
    setError(null);

    startTransition(async () => {
      try {
        await createProject({
          name,
          idea,
          details: details.trim().length ? details : undefined,
          worldX: suggestedWorldX,
          worldY: suggestedWorldY,
        });
        window.location.href = "/";
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }, [details, idea, name, suggestedWorldX, suggestedWorldY]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-md border-2 border-black bg-[#a7f3d0] px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000]"
      >
        Dump a dead project
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={close}
        >
          <div
            className="w-full max-w-xl rounded-xl border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-mono text-lg font-bold">Bury a project</h2>
                <p className="mt-1 text-sm text-zinc-700">
                  It drops a grave at your current camera center.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-md border-2 border-black bg-white px-2 py-1 font-mono text-sm shadow-[3px_3px_0_0_#000]"
              >
                ESC
              </button>
            </div>

            {!user ? (
              <div className="mt-4 rounded-md border-2 border-black bg-zinc-50 p-3 font-mono text-sm">
                Sign in with X first.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="font-mono text-xs font-bold">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                    placeholder="e.g. Pocket Cemetery"
                    maxLength={80}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="font-mono text-xs font-bold">Idea</span>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="min-h-[84px] rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                    placeholder="One-liner + what it would do."
                    maxLength={280}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="font-mono text-xs font-bold">Details (optional)</span>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="min-h-[120px] rounded-md border-2 border-black px-3 py-2 font-mono text-sm"
                    placeholder="Features, target users, why you killed it, links…"
                    maxLength={4000}
                  />
                </label>

                {error ? (
                  <div className="rounded-md border-2 border-black bg-red-50 p-3 font-mono text-sm text-red-900">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={submit}
                    className="rounded-md border-2 border-black bg-[#fde68a] px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] disabled:opacity-60"
                  >
                    {isPending ? "Burying..." : "Bury it"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
