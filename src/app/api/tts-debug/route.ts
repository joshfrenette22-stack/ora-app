import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// TEMPORARY diagnostic endpoint: reports whether the ElevenLabs key is present
// and the raw status/body from a minimal synthesis attempt. Does NOT expose the
// key value. Remove once ElevenLabs synthesis is confirmed working.
export async function GET(request: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = request.nextUrl.searchParams.get("voice") || "JBFqnCBsd6RMkjVDRZzb";
  const model = process.env.ELEVENLABS_MODEL || "eleven_turbo_v2_5";

  const out: Record<string, unknown> = {
    keyPresent: Boolean(key),
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.slice(0, 3) : null,
    model,
    voiceId,
  };

  if (!key) return Response.json(out);

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({ text: "Hail Mary", model_id: model }),
      },
    );
    out.status = res.status;
    out.ok = res.ok;
    out.contentType = res.headers.get("content-type");
    if (!res.ok) {
      out.body = (await res.text().catch(() => "")).slice(0, 800);
    } else {
      out.bytes = (await res.arrayBuffer()).byteLength;
    }
  } catch (err) {
    out.threw = String(err);
  }

  return Response.json(out);
}
