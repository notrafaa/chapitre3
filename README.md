# Chapitre 3

Site officiel de **Chapitre 3** — une maison créative qui imagine, construit, publie
et regroupe plusieurs projets numériques. Le site principal (`chapitre3.fr`) sert de
**portail central** vers tous les projets, notamment via des sous-domaines comme
`synk.chapitre3.fr`, `proof.chapitre3.fr` ou `replay.chapitre3.fr`.

Stack : **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS** ·
**Framer Motion** · **Supabase** (Postgres + Auth + Storage) · déploiement **Vercel**.

---

## ✨ Fonctionnalités

- **Introduction « livre qui s'ouvre »** plein écran (jouée une fois par appareil, rejouable depuis le menu).
- Direction artistique sombre, cinématographique, éditoriale (noir profond, papier, grain, chiffres géants, chrome discret).
- Pages : **Accueil** (livre de chapitres), **Projets** (sommaire filtrable), **Projet** (`/projets/[slug]`), **À propos**, **Contact**.
- **Section interactive « Écrivez la suite »** : curseur clignotant → message → formulaire complet.
- **Espace d'administration** sécurisé (`/admin`) : CRUD projets, réorganisation drag & drop, upload de médias (avec compression), gestion des idées, inscriptions et messages, réglages du site, prévisualisation avant publication.
- **Supabase** : schéma complet, types TypeScript, RLS, Storage, données de démonstration.
- SEO complet, Open Graph dynamique, sitemap, robots, pages 404/erreur personnalisées, Vercel Analytics, accessibilité, `prefers-reduced-motion`.

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# puis renseigner les variables (voir ci-dessous)

# 3. Lancer en développement
npm run dev
```

Le site est disponible sur http://localhost:3000.

> Sans Supabase configuré, le site se lance et s'affiche (avec des listes de projets
> vides). Connectez Supabase pour activer toutes les fonctionnalités dynamiques.

---

## 🔐 Variables d'environnement

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé privée service_role (⚠️ serveur uniquement, jamais exposée au client) |
| `NEXT_PUBLIC_SITE_URL` | URL canonique (`http://localhost:3000` en local, `https://chapitre3.fr` en prod) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Domaine racine pour les sous-domaines (`chapitre3.fr`) |

---

## 🗄️ Configuration de Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Récupérez `Project URL`, `anon key` et `service_role key` dans **Project Settings → API**.
3. Dans le **SQL Editor**, exécutez dans l'ordre les fichiers du dossier `supabase/` :
   1. `migrations/0001_schema.sql` — tables, types, index, contraintes, triggers, `is_admin()`
   2. `migrations/0002_rls.sql` — Row Level Security
   3. `migrations/0003_storage.sql` — bucket `media` + politiques Storage
   4. `seed.sql` *(optionnel)* — projets et réglages de démonstration

   > Avec la CLI Supabase : `supabase db push` puis `psql < supabase/seed.sql`.

### Créer un administrateur

1. **Authentication → Users → Add user** : créez un utilisateur (email + mot de passe).
2. Copiez son `id` (UUID) depuis la table `auth.users`.
3. Dans le **SQL Editor** :

   ```sql
   insert into public.admin_users (user_id, role)
   values ('COLLER-L-UUID-ICI', 'admin');
   ```

4. Connectez-vous sur `/admin/login`.

> Seuls les utilisateurs présents dans `admin_users` peuvent accéder à `/admin`.
> La protection est appliquée par le **middleware** ET revérifiée **côté serveur**
> dans chaque action sensible.

---

## 🔒 Sécurité (résumé)

- **RLS activée** sur toutes les tables. Les visiteurs ne lisent que les projets
  `public`/`teaser` ; ils peuvent créer une inscription, une idée ou un message.
- Les projets **confidentiels** (`private`) ne sont jamais exposés au navigateur :
  seule une carte générique « Projet confidentiel · Révélation prochaine » est rendue
  côté serveur (numéro uniquement).
- La clé `service_role` n'est utilisée que côté serveur (`src/lib/supabase/admin.ts`,
  marqué `server-only`).
- Validation **zod** sur tous les formulaires (client + serveur), **honeypot** et
  **limitation de débit** anti-spam.

---

## 🧱 Architecture

```
src/
├── app/
│   ├── (site)/            # site public (header, footer, intro, transitions)
│   │   ├── page.tsx       # accueil
│   │   ├── projets/       # liste + [slug]
│   │   ├── a-propos/
│   │   └── contact/
│   ├── admin/
│   │   ├── login/         # connexion (hors layout protégé)
│   │   ├── (panel)/       # routes protégées + sidebar
│   │   └── preview/[slug] # prévisualisation avant publication
│   ├── layout.tsx         # root (fonts, analytics, toasts)
│   ├── not-found.tsx · error.tsx · sitemap.ts · robots.ts
├── actions/               # Server Actions (public + admin)
├── components/            # composants UI + admin + animations
├── lib/
│   ├── supabase/          # client · server · admin · anon · middleware
│   ├── queries/           # lectures (projets, réglages)
│   ├── validations.ts     # schémas zod
│   ├── utils.ts · constants.ts · auth.ts · rate-limit.ts · upload.ts
├── types/                 # database.ts + types de domaine
└── middleware.ts          # garde des routes /admin
```

Composants principaux : `BookIntro`, `Header`, `MobileMenu`, `HeroSection`,
`ChapterSection`, `ProjectCard`, `ProjectStatusBadge`, `ProjectFilters`,
`ProjectTimeline`, `ProjectMediaGallery`, `IdeaSubmissionForm`,
`LaunchNotificationForm`, `ContactForm`, `BookPageTransition`, `Footer`,
`AdminSidebar`, `ProjectEditor`, `MediaUploader`, `DeleteConfirmationDialog`.

---

## ☁️ Déploiement sur Vercel

1. Poussez le dossier `site/` sur un dépôt Git, puis **Import Project** sur Vercel
   (Framework détecté : Next.js).
2. Renseignez les **5 variables d'environnement** ci-dessus dans
   *Project Settings → Environment Variables* (pour Production **et** Preview).
   - En production, `NEXT_PUBLIC_SITE_URL = https://chapitre3.fr`.
3. Déployez.

### Domaine `chapitre3.fr` et sous-domaines

1. **Project Settings → Domains** : ajoutez `chapitre3.fr` et `www.chapitre3.fr`.
2. Chez votre registrar, pointez le DNS vers Vercel :
   - `A` `@` → `76.76.21.21` (ou suivez les instructions de Vercel)
   - `CNAME` `www` → `cname.vercel-dns.com`
3. **Sous-domaines des projets** (`synk.chapitre3.fr`, …) : chaque projet a sa propre
   application/déploiement. Pour rattacher un sous-domaine :
   - ajoutez un enregistrement `CNAME` `synk` → `cname.vercel-dns.com` ;
   - ajoutez le domaine `synk.chapitre3.fr` au projet Vercel correspondant ;
   - dans l'admin Chapitre 3, renseignez l'**URL externe** du projet (ex.
     `https://synk.chapitre3.fr`). Si elle est vide, le bouton « Accéder au projet »
     pointe automatiquement vers `https://[slug].chapitre3.fr`
     (voir `getProjectExternalUrl` dans `src/lib/utils.ts`).

> Le site principal **ne sert pas** les applications des projets : il redirige vers
> leurs URLs respectives. Un wildcard `*.chapitre3.fr` peut être ajouté si vous
> souhaitez router tous les sous-domaines.

---

## 🛠️ Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Développement (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |

---

## 📚 Modèle de données

`projects`, `project_media`, `launch_subscribers`, `project_submissions`,
`contact_messages`, `admin_users`, `site_settings`.

Statuts : `idea · building · published · paused · archived`.
Visibilités : `public · teaser · private`.
Étapes : `concept · identity · construction · test · publication`.

© 2026 Chapitre 3 — La suite est en cours d'écriture.
