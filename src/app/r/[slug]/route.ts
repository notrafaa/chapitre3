import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function normalizeCountry(value: string | null): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function resolveDestination(destination: string, request: NextRequest): URL {
  if (destination.startsWith("/")) {
    return new URL(destination, request.nextUrl.origin);
  }
  return new URL(destination);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const fallback = new URL("/", getSiteUrl());

  try {
    const supabase = createAdminClient();
    const { data: link, error } = await supabase
      .from("ad_links")
      .select("id, destination_url, active")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !link || !link.active) {
      return NextResponse.redirect(fallback);
    }

    const country = normalizeCountry(
      request.headers.get("x-vercel-ip-country") ||
        request.headers.get("cf-ipcountry") ||
        request.headers.get("x-country-code"),
    );

    await supabase.from("ad_link_visits").insert({
      ad_link_id: link.id,
      country_code: country,
      referer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.redirect(resolveDestination(link.destination_url, request));
  } catch (error) {
    console.error("ad link redirect:", error);
    return NextResponse.redirect(fallback);
  }
}
