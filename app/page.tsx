import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import Datatable from "@/components/datatable";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <span>DIMOVTAX Interview</span>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
              <div className="h-10 rounded-md bg-muted/50 animate-pulse" />
            </div>
          }
        >
          <AuthGate />
        </Suspense>
      </div>
    </main>
  );
}

async function AuthGate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
      <Datatable />
    </div>
  );
}
