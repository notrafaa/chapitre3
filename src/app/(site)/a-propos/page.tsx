// ===========================================================================
//  /a-propos — page retirée : tout le contenu vit désormais sur l'accueil.
//  On redirige vers la page d'accueil pour ne casser aucun lien existant.
// ===========================================================================

import { redirect } from "next/navigation";

export default function AProposPage() {
  redirect("/");
}
