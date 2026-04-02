"use client";

import Image from "next/image";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthButtonProps = {
  initialUser: User | null;
};

export function AuthButton({ initialUser }: AuthButtonProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, [supabase]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={signIn}
        className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000]"
      >
        Sign in with X
      </button>
    );
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const identities = user.identities as
    | Array<{ identity_data?: Record<string, unknown> | null } | null>
    | undefined;
  const identityData = identities?.find(Boolean)?.identity_data ?? null;

  const label =
    (meta?.user_name as string | undefined) ??
    (meta?.preferred_username as string | undefined) ??
    user.email ??
    "Signed in";

  const avatarUrl =
    (typeof meta?.avatar_url === "string" ? meta.avatar_url : null) ??
    (typeof meta?.picture === "string" ? meta.picture : null) ??
    (typeof meta?.profile_image_url === "string" ? meta.profile_image_url : null) ??
    (typeof meta?.profile_image_url_https === "string" ? meta.profile_image_url_https : null) ??
    (typeof identityData?.avatar_url === "string" ? identityData.avatar_url : null) ??
    (typeof identityData?.picture === "string" ? identityData.picture : null) ??
    (typeof identityData?.profile_image_url === "string" ? identityData.profile_image_url : null) ??
    (typeof identityData?.profile_image_url_https === "string"
      ? identityData.profile_image_url_https
      : null);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block h-8 w-8 overflow-hidden rounded-md border-2 border-black bg-white shadow-[3px_3px_0_0_#000]">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`@${String(label)}`}
            width={32}
            height={32}
            className="h-8 w-8 object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center font-mono text-[10px] text-zinc-700">
            X
          </div>
        )}
      </div>
      {/* <span className="hidden sm:inline font-bold text-sm text-white">
        @{String(label).slice(0, 24)}
      </span> */}
      <button
        type="button"
        onClick={signOut}
        className="rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#000]"
      >
        Sign out
      </button>
    </div>
  );
}
