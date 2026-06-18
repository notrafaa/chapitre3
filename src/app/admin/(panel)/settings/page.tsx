// ===========================================================================
//  /admin/settings — réglages du site.
// ===========================================================================

import { SettingsForms } from "@/components/admin/SettingsForms";
import { getSocialLinks, getSetting } from "@/lib/queries/settings";
import { SETTINGS_KEYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [social, heroSetting] = await Promise.all([
    getSocialLinks(),
    getSetting(SETTINGS_KEYS.homeHero),
  ]);

  const hero =
    heroSetting?.value && typeof heroSetting.value === "object"
      ? (heroSetting.value as { title?: string; paragraph?: string })
      : {};

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-paper">Réglages</h1>
      <p className="mb-8 text-sm text-ink-400">
        Textes principaux et liens sociaux du site.
      </p>
      <SettingsForms social={social} hero={hero} />
    </div>
  );
}
