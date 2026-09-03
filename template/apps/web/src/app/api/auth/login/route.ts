import { startLogin } from "../../../../server/oidc";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return startLogin(request);
}
