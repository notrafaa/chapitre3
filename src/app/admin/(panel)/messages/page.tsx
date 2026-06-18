// ===========================================================================
//  /admin/messages — messages de contact.
// ===========================================================================

import { MessageList } from "@/components/admin/MessageList";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-paper">Messages</h1>
      <p className="mb-8 text-sm text-ink-400">Reçus via la page contact.</p>
      <MessageList initial={data ?? []} />
    </div>
  );
}
