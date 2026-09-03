import { readiness } from "../../../../server/readiness";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return readiness();
}
