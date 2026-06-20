"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Trash2, Phone, ChevronDown, ChevronUp } from "lucide-react";

type Contact = {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function ContactCard({
  contact,
  markRead,
  remove,
}: {
  contact: Contact;
  markRead: (id: string, read: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded]   = useState(!contact.read);
  const [pending, startTransition] = useTransition();

  function toggleRead() {
    startTransition(async () => {
      await markRead(contact.id, !contact.read);
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta mensagem?")) return;
    startTransition(async () => {
      await remove(contact.id);
    });
  }

  return (
    <div className={`rounded-xl border transition-colors ${
      contact.read
        ? "border-border bg-card"
        : "border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-400/5"
    }`}>
      {/* Header do card */}
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
          if (!contact.read) {
            startTransition(async () => { await markRead(contact.id, true); });
          }
        }}
        className="flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        {/* Ícone lido/não lido */}
        <div className={`mt-0.5 shrink-0 ${contact.read ? "text-muted-foreground/40" : "text-amber-500"}`}>
          {contact.read ? <MailOpen size={16} /> : <Mail size={16} />}
        </div>

        {/* Conteúdo */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className={`font-inter text-sm font-medium ${contact.read ? "text-foreground" : "text-foreground"}`}>
              {contact.name}
            </span>
            {!contact.read && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 font-inter text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                Nova
              </span>
            )}
            <span className="font-inter text-xs text-muted-foreground">{contact.email}</span>
          </div>
          <p className={`mt-0.5 font-inter text-sm ${contact.read ? "text-muted-foreground" : "font-medium text-foreground"}`}>
            {contact.subject}
          </p>
        </div>

        {/* Data + chevron */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-inter text-xs text-muted-foreground/60 sm:block">
            {fmt(contact.createdAt)}
          </span>
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-border px-5 py-4">
          {contact.phone && (
            <div className="mb-3 flex items-center gap-2 font-inter text-xs text-muted-foreground">
              <Phone size={12} />
              <a href={`tel:${contact.phone}`} className="hover:text-foreground transition-colors">
                {contact.phone}
              </a>
            </div>
          )}
          <p className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-foreground">
            {contact.message}
          </p>

          {/* Ações */}
          <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
            <span className="font-inter text-[10px] text-muted-foreground/60 sm:hidden">
              {fmt(contact.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={toggleRead}
                disabled={pending}
                className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {contact.read ? <Mail size={13} /> : <MailOpen size={13} />}
                {contact.read ? "Marcar como não lida" : "Marcar como lida"}
              </button>
              <a
                href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 font-inter text-xs font-medium text-background transition-opacity hover:opacity-80"
              >
                Responder
              </a>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="flex items-center gap-1 font-inter text-xs text-destructive/70 transition-colors hover:text-destructive disabled:opacity-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContactsClient({
  contacts,
  markRead,
  remove,
}: {
  contacts: Contact[];
  markRead: (id: string, read: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const shown = filter === "unread" ? contacts.filter((c) => !c.read) : contacts;

  return (
    <div>
      {/* Filtro rápido */}
      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 font-inter text-xs transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "all" ? "Todas" : "Não lidas"}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <p className="font-cormorant text-2xl font-light text-muted-foreground">
            {filter === "unread" ? "Nenhuma mensagem não lida" : "Nenhuma mensagem recebida"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              markRead={markRead}
              remove={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
