import { revalidatePath } from "next/cache";

/**
 * On-demand ISR cache invalidation.
 *
 * Usage: GET /api/revalidate?path=/truyen/anh-mat-khong-the-che-giau
 *
 * Without this, a 404 result that Next.js cached (during the previous broken
 * build where API_BASE_URL resolved to http://localhost:5000) will keep being
 * served for 12h, even after we deploy the fix.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return Response.json(
      { error: "Missing ?path parameter, e.g. ?path=/truyen/anh-mat-khong-the-che-giau" },
      { status: 400 }
    );
  }

  // Security: only allow revalidating internal site paths.
  if (!path.startsWith("/")) {
    return Response.json({ error: "path must start with /" }, { status: 400 });
  }

  revalidatePath(path);
  return Response.json({ revalidated: true, path });
}

export async function POST(request: Request) {
  return GET(request);
}
