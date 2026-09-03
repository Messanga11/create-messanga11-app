import { toPublicOidcError } from "@messanga11/auth-oidc";
import {
  beginOidcLogin,
  completeOidcLogin,
  createFetchOidcTokenTransport,
  createJoseOidcIdTokenVerifier,
  createJoseOidcTokenVerifier,
} from "@messanga11/auth-oidc/server";
import { compileFeatureCatalog } from "@messanga11/core/features";
import { APP_FEATURE_CATALOG } from "@starter/features/catalog";
import { getProductionRuntime } from "./production-runtime";

const CATALOG = compileFeatureCatalog(APP_FEATURE_CATALOG);

export async function startLogin(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "production") {
    return Response.redirect(new URL("/", request.url));
  }
  try {
    const runtime = await getProductionRuntime(CATALOG);
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenant") ?? "";
    const returnTo = url.searchParams.get("returnTo") ?? "/";
    const login = await beginOidcLogin({
      config: runtime.oidc.config,
      returnTo,
      tenantId,
      transactions: runtime.oidc.transactions,
    });
    return Response.redirect(login.url, 302);
  } catch (error) {
    return authError(error);
  }
}

export async function finishLogin(request: Request): Promise<Response> {
  try {
    const runtime = await getProductionRuntime(CATALOG);
    const url = new URL(request.url);
    const code = url.searchParams.get("code") ?? "";
    const state = url.searchParams.get("state") ?? "";
    const verifierConfig = {
      algorithms: runtime.oidc.config.algorithms,
      audience: runtime.oidc.config.clientId,
      issuer: runtime.oidc.config.issuer,
      jwksUri: runtime.oidc.config.jwksUri,
    };
    const result = await completeOidcLogin({
      code,
      config: runtime.oidc.config,
      identityVerifier: createJoseOidcTokenVerifier(verifierConfig),
      sessionStore: runtime.oidc.sessions,
      state,
      tenantAccess: runtime.oidc.tenantAccess,
      tokenVault: runtime.oidc.tokenVault,
      transactions: runtime.oidc.transactions,
      transport: createFetchOidcTokenTransport(),
      verifier: createJoseOidcIdTokenVerifier(verifierConfig),
    });
    const response = Response.redirect(new URL(result.returnTo, request.url), 302);
    response.headers.append(
      "set-cookie",
      cookie("m11_session", result.sessionToken, 1_800),
    );
    response.headers.append(
      "set-cookie",
      cookie("m11_tenant", result.tenantId, 28_800),
    );
    return response;
  } catch (error) {
    return authError(error);
  }
}

export async function endSession(request: Request): Promise<Response> {
  if (!isSameOrigin(request))
    return Response.json({ code: "FORBIDDEN" }, { status: 403 });
  try {
    if (process.env.NODE_ENV === "production") {
      const runtime = await getProductionRuntime(CATALOG);
      await runtime.oidc.logout(request);
    }
    const response = Response.json({ status: "signed-out" });
    response.headers.append("set-cookie", cookie("m11_session", "", 0));
    response.headers.append("set-cookie", cookie("m11_tenant", "", 0));
    return response;
  } catch (error) {
    return authError(error);
  }
}

function cookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function authError(error: unknown): Response {
  const publicError = toPublicOidcError(error);
  return Response.json(publicError, {
    headers: { "cache-control": "no-store" },
    status: publicError.code === "SERVICE_UNAVAILABLE" ? 503 : 401,
  });
}
