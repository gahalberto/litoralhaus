"use client";

import { useTransition } from "react";
import { completeTask, reopenTask } from "@/actions/agenda";

export function CompleteTaskButton({ id, completed }: { id: string; completed: boolean }) {
  const [isPending, start] = useTransition();

  function handleClick() {
    start(async () => {
      if (completed) await reopenTask(id);
      else await completeTask(id);
    });
  }

  if (completed) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="font-inter text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Reabrir"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 font-inter text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        "..."
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          Concluir
        </>
      )}
    </button>
  );
}
