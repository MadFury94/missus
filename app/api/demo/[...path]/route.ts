import { IS_DEMO_STORE } from "@/lib/store-config";
import { handleDemoApi } from "@/lib/demo-api";

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
    if (!IS_DEMO_STORE) return Response.json({ error: "Not found" }, { status: 404 });
    return handleDemoApi(request, (await context.params).path.join("/"));
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
