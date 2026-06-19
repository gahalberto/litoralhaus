"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { Search, X, UserCheck, Loader2 } from "lucide-react";
import { searchUsers, type UserSummary } from "@/actions/users";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", CORRETOR: "Corretor" };

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 font-inter text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30";

function Initials({ name }: { name: string }) {
  const ini = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-amber-600 font-inter text-[11px] font-bold text-white">
      {ini}
    </div>
  );
}

interface Props {
  value: UserSummary | null;
  onChange: (user: UserSummary | null) => void;
  placeholder?: string;
  label?: string;
}

export function UserSearchInput({ value, onChange, placeholder = "Buscar por nome ou e-mail…", label }: Props) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<UserSummary[]>([]);
  const [open, setOpen]         = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef            = useRef<HTMLDivElement>(null);
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback((q: string) => {
    startTransition(async () => {
      const r = await searchUsers(q);
      setResults(r);
      setOpen(true);
    });
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 300);
  }

  function handleFocus() {
    if (!value) doSearch(query);
  }

  function select(user: UserSummary) {
    onChange(user);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    onChange(null);
    setQuery("");
    setResults([]);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/5">
        <Initials name={value.name} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-inter text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <UserCheck size={13} className="text-amber-600 dark:text-amber-400" />
            {value.name}
          </p>
          <p className="font-inter text-xs text-zinc-500 dark:text-zinc-400">
            {value.email} · {ROLE_LABEL[value.role] ?? value.role}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-md p-1 text-zinc-400 hover:bg-amber-100 hover:text-zinc-600 dark:hover:bg-amber-400/10"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(inputCls, "pl-9 pr-9")}
        />
        {isPending && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onMouseDown={() => select(u)}
                className="flex w-full items-center gap-3 px-3 py-2.5 font-inter text-sm text-left hover:bg-accent transition-colors"
              >
                <Initials name={u.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email} · {ROLE_LABEL[u.role] ?? u.role}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
