// ===========================================================================
//  Layout du site public : Header + introduction + transitions + Footer.
// ===========================================================================

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookIntro } from "@/components/BookIntro";
import { BookPageTransition } from "@/components/BookPageTransition";
import { getSocialLinks } from "@/lib/queries/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const social = await getSocialLinks();

  return (
    <>
      <BookIntro />
      <Header />
      <main id="contenu" className="relative min-h-screen overflow-x-clip">
        <BookPageTransition>{children}</BookPageTransition>
      </main>
      <Footer social={social} />
    </>
  );
}
