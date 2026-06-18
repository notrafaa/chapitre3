/** @type {import('next').NextConfig} */

// Le hostname Supabase est dérivé de l'URL publique afin d'autoriser
// next/image à optimiser les médias stockés dans Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname;
try {
  if (supabaseUrl) supabaseHostname = new URL(supabaseUrl).hostname;
} catch {
  supabaseHostname = undefined;
}

const remotePatterns = [
  { protocol: "https", hostname: "**.supabase.co" },
  { protocol: "https", hostname: "**.supabase.in" },
];

if (supabaseHostname) {
  remotePatterns.push({ protocol: "https", hostname: supabaseHostname });
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Limite la taille du body pour les Server Actions (uploads via Storage côté client).
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
