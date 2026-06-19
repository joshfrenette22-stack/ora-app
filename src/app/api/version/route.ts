export const dynamic = "force-dynamic";

// Returns this deployment's build id. The value is inlined at build time, so the
// latest deployment always reports the latest id — a client running an older
// cached build sees a mismatch and refreshes itself.
export async function GET() {
  return new Response(JSON.stringify({ id: process.env.NEXT_PUBLIC_BUILD_ID ?? "" }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
