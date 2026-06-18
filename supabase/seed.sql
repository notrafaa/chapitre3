-- ===========================================================================
--  Chapitre 3 — Données de démonstration
--  À exécuter APRÈS les migrations 0001 → 0003.
--
--  Pour rattacher un administrateur :
--    1. Créez un utilisateur dans Supabase Auth (email + mot de passe).
--    2. Récupérez son `id` dans la table auth.users.
--    3. insert into public.admin_users (user_id) values ('<uuid>');
-- ===========================================================================

-- --------------------------------------------------------------------------
--  Projets de démonstration
-- --------------------------------------------------------------------------
insert into public.projects
  (name, slug, project_number, short_description, long_description, story,
   objectives, features, category, status, visibility, current_stage,
   external_url, launch_date, featured, display_order)
values
  (
    'Synk',
    'synk',
    1,
    'La synchronisation pensée comme une évidence.',
    'Synk relie vos espaces de travail, vos appareils et vos idées dans un flux unique. Une couche de synchronisation discrète, rapide et fiable, conçue pour disparaître derrière l''usage.',
    'Synk est né d''une frustration simple : nos outils ne se parlaient pas. Le premier chapitre fut l''idée d''un fil conducteur entre les applications. Le deuxième, la construction d''un moteur de synchronisation temps réel. Le troisième, le moment où Synk est devenu réel.',
    array['Rendre la synchronisation invisible', 'Zéro perte de données', 'Une latence imperceptible'],
    array['Synchronisation temps réel', 'Chiffrement de bout en bout', 'Mode hors-ligne', 'Historique des versions'],
    'Productivité',
    'published',
    'public',
    'publication',
    'https://synk.chapitre3.fr',
    '2026-02-14',
    true,
    1
  ),
  (
    'Replay',
    'replay',
    2,
    'Revivez ce qui compte, autrement.',
    'Replay transforme vos archives en récits. Une manière nouvelle de revisiter vos moments, vos projets et vos données, comme on tourne les pages d''un livre.',
    'L''idée de Replay est venue en regardant en arrière. Nous sommes au cœur du deuxième chapitre : la construction. Les fondations sont posées, l''interface prend forme.',
    array['Donner du sens aux archives', 'Une narration fluide', 'Respect total de la vie privée'],
    array['Timeline interactive', 'Montage automatique', 'Export haute qualité'],
    'Média',
    'building',
    'public',
    'construction',
    null,
    null,
    true,
    2
  ),
  (
    'Proof',
    'proof',
    3,
    'La preuve, sans le doute.',
    'Proof explore une nouvelle façon de certifier l''authenticité du numérique. Encore au stade de l''idée, son chapitre commence tout juste à s''écrire.',
    'Proof est une intuition : et si chaque création portait sa propre preuve ? Le premier chapitre s''ouvre.',
    array['Certifier sans friction', 'Vérifiable par tous'],
    array[]::text[],
    'Confiance numérique',
    'idea',
    'teaser',
    'concept',
    null,
    null,
    false,
    3
  ),
  (
    'Projet confidentiel',
    'projet-confidentiel',
    4,
    'Quelque chose se prépare en silence.',
    null,
    null,
    array[]::text[],
    array[]::text[],
    null,
    'idea',
    'private',
    'concept',
    null,
    null,
    false,
    4
  )
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
--  Réglages du site (textes principaux + liens sociaux)
-- --------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  (
    'social_links',
    jsonb_build_object(
      'tiktok', 'https://tiktok.com/@chapitre3',
      'instagram', 'https://instagram.com/chapitre3',
      'discord', 'https://discord.gg/chapitre3',
      'x', 'https://x.com/chapitre3',
      'youtube', 'https://youtube.com/@chapitre3',
      'email', 'contact@chapitre3.fr'
    )
  ),
  (
    'home_hero',
    jsonb_build_object(
      'title', 'NOUS CRÉONS CE QUI MÉRITE D''EXISTER.',
      'paragraph', 'Chapitre 3 est un studio indépendant qui imagine, construit et lance des projets numériques, des expériences et des univers.'
    )
  ),
  (
    'contact_email',
    to_jsonb('contact@chapitre3.fr'::text)
  )
on conflict (key) do nothing;
