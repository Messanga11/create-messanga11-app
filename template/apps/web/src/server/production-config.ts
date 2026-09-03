import { z } from "zod";

const HttpsUrl = z.url().refine((value) => new URL(value).protocol === "https:");
const ProductionConfigSchema = z
  .object({
    DATABASE_URL: z.string().refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === "postgres:" || protocol === "postgresql:";
    }),
    OIDC_ALGORITHMS: z.string().default("RS256"),
    OIDC_AUTHORIZATION_ENDPOINT: HttpsUrl,
    OIDC_CLIENT_ID: z.string().min(1).max(256),
    OIDC_ISSUER: HttpsUrl,
    OIDC_JWKS_URI: HttpsUrl,
    OIDC_REDIRECT_URI: HttpsUrl,
    OIDC_TOKEN_ENDPOINT: HttpsUrl,
    OIDC_TOKEN_ENCRYPTION_KEY: z.string().min(44).max(44),
    REDIS_URL: z.string().refine((value) => new URL(value).protocol === "rediss:"),
  })
  .strict();

export interface ProductionConfig {
  readonly databaseUrl: string;
  readonly oidc: {
    readonly algorithms: readonly string[];
    readonly authorizationEndpoint: string;
    readonly clientId: string;
    readonly issuer: string;
    readonly jwksUri: string;
    readonly redirectUri: string;
    readonly scopes: readonly string[];
    readonly tokenEndpoint: string;
  };
  readonly oidcTokenEncryptionKey: string;
  readonly redisUrl: string;
}

export function readProductionConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionConfig {
  const result = ProductionConfigSchema.safeParse({
    DATABASE_URL: environment.DATABASE_URL,
    OIDC_ALGORITHMS: environment.OIDC_ALGORITHMS,
    OIDC_AUTHORIZATION_ENDPOINT: environment.OIDC_AUTHORIZATION_ENDPOINT,
    OIDC_CLIENT_ID: environment.OIDC_CLIENT_ID,
    OIDC_ISSUER: environment.OIDC_ISSUER,
    OIDC_JWKS_URI: environment.OIDC_JWKS_URI,
    OIDC_REDIRECT_URI: environment.OIDC_REDIRECT_URI,
    OIDC_TOKEN_ENDPOINT: environment.OIDC_TOKEN_ENDPOINT,
    OIDC_TOKEN_ENCRYPTION_KEY: environment.OIDC_TOKEN_ENCRYPTION_KEY,
    REDIS_URL: environment.REDIS_URL,
  });
  if (!result.success) {
    throw new Error("Production configuration is incomplete or unsafe.");
  }
  return Object.freeze({
    databaseUrl: result.data.DATABASE_URL,
    oidc: Object.freeze({
      algorithms: Object.freeze(
        result.data.OIDC_ALGORITHMS.split(",").map((value) => value.trim()),
      ),
      authorizationEndpoint: result.data.OIDC_AUTHORIZATION_ENDPOINT,
      clientId: result.data.OIDC_CLIENT_ID,
      issuer: result.data.OIDC_ISSUER,
      jwksUri: result.data.OIDC_JWKS_URI,
      redirectUri: result.data.OIDC_REDIRECT_URI,
      scopes: Object.freeze(["openid", "profile", "email"]),
      tokenEndpoint: result.data.OIDC_TOKEN_ENDPOINT,
    }),
    oidcTokenEncryptionKey: result.data.OIDC_TOKEN_ENCRYPTION_KEY,
    redisUrl: result.data.REDIS_URL,
  });
}
