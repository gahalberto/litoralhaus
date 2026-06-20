import type { Metadata } from "next";
import { getContacts, markContactRead, deleteContact } from "@/actions/contacts";
import { ContactsClient } from "@/components/admin/ContactsClient";

export const metadata: Metadata = { title: "Mensagens de Contato" };
export const revalidate = 0;

export default async function ContactsPage() {
  const contacts = await getContacts();
  const unread   = contacts.filter((c) => !c.read).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-2xl font-light text-foreground">
            Mensagens
          </h1>
          <p className="mt-0.5 font-inter text-xs text-muted-foreground">
            {contacts.length} {contacts.length === 1 ? "mensagem" : "mensagens"}
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-400">
                {unread} não {unread === 1 ? "lida" : "lidas"}
              </span>
            )}
          </p>
        </div>
      </div>

      <ContactsClient
        contacts={contacts}
        markRead={markContactRead}
        remove={deleteContact}
      />
    </div>
  );
}
