import type { JsonValue } from "@messanga11/core";
import { defineFeature, defineFeatureCatalog } from "@messanga11/core/features";
import { DASHBOARD_DEMO } from "./demo-data/dashboard.ts";
import { RESOURCE_DEMOS } from "./demo-data/resources.ts";
import type { ProductFeatureId } from "./feature-types";

const PUBLIC_ACCESS = { mode: "public" } as const;
const AUTHENTICATED_ACCESS = {
  mode: "authenticated",
  permissions: ["application:read"],
} as const;

function screenFeature<
  const Options extends {
    readonly access: typeof PUBLIC_ACCESS | typeof AUTHENTICATED_ACCESS;
    readonly block: string;
    readonly description: string;
    readonly id: string;
    readonly path: string;
    readonly props?: Readonly<Record<string, JsonValue>>;
    readonly title: string;
  },
>(options: Options) {
  return defineFeature({
    blocks: [options.block],
    id: options.id,
    operations: [],
    pages: [
      {
        access: options.access,
        id: "index",
        root: {
          children: [
            {
              block: options.block,
              id: "content",
              kind: "block",
              ...(options.props ? { props: options.props } : {}),
            },
          ],
          id: "page",
          kind: "layout",
          layout: "application.shell",
        },
        routes: {
          mobile: { path: options.path },
          web: {
            path: options.path,
            seo: {
              canonicalPath: options.path,
              description: options.description,
              index: false,
              title: options.title,
            },
          },
        },
      },
    ],
    schemaVersion: 1,
    version: "1.0.0",
  });
}

const FORM_SUBMISSION_SCHEMA = {
  additionalProperties: false,
  properties: {
    company: { maxLength: 120, type: "string" },
    country: { enum: ["CM", "FR", "SN"], type: "string" },
    documents: {
      items: {
        additionalProperties: false,
        properties: {
          fileId: { format: "uuid", type: "string" },
          name: { maxLength: 240, minLength: 1, type: "string" },
          size: { maximum: 5_000_000, minimum: 0, type: "number" },
          type: { maxLength: 120, type: "string" },
        },
        required: ["fileId", "name", "size", "type"],
        type: "object",
      },
      maxItems: 3,
      type: "array",
    },
    email: { format: "email", maxLength: 200, type: "string" },
    companyType: { enum: ["business", "personal"], type: "string" },
    members: {
      items: {
        additionalProperties: false,
        properties: {
          email: { format: "email", maxLength: 200, type: "string" },
          name: { maxLength: 100, minLength: 2, type: "string" },
          rowId: { maxLength: 128, minLength: 1, type: "string" },
        },
        required: ["email", "name", "rowId"],
        type: "object",
      },
      maxItems: 10,
      minItems: 1,
      type: "array",
    },
    otp: { maxLength: 6, minLength: 6, type: "string" },
    phone: {
      additionalProperties: false,
      properties: {
        code: { maxLength: 5, minLength: 2, type: "string" },
        number: { maxLength: 20, minLength: 6, type: "string" },
      },
      required: ["code", "number"],
      type: "object",
    },
    availability: {
      additionalProperties: false,
      properties: {
        end: { format: "date", type: "string" },
        start: { format: "date", type: "string" },
        timezone: { maxLength: 80, minLength: 1, type: "string" },
      },
      required: ["end", "start", "timezone"],
      type: "object",
    },
    roles: {
      items: { enum: ["admin", "editor", "viewer"], type: "string" },
      maxItems: 3,
      minItems: 1,
      type: "array",
    },
  },
  required: [
    "availability",
    "companyType",
    "country",
    "documents",
    "email",
    "members",
    "otp",
    "phone",
    "roles",
  ],
  type: "object",
} as const;

export const FORM_BUILDER_FEATURE = defineFeature({
  blocks: ["form-builder.complex"],
  id: "form-builder",
  operations: [
    {
      access: PUBLIC_ACCESS,
      audit: { event: "form-builder.submitted", required: true },
      handler: "form-builder.submit",
      id: "submit",
      idempotency: { required: true },
      input: FORM_SUBMISSION_SCHEMA,
      kind: "mutation",
      method: "POST",
      output: {
        additionalProperties: false,
        properties: {
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
        },
        required: ["createdAt", "id"],
        type: "object",
      },
      rateLimit: { cost: 1, limit: 10, windowMs: 60_000 },
      resource: "form_submissions",
    },
  ],
  pages: [
    {
      access: PUBLIC_ACCESS,
      id: "index",
      root: {
        children: [
          {
            actions: { submit: "submit" },
            block: "form-builder.complex",
            id: "form",
            kind: "block",
          },
        ],
        id: "page",
        kind: "layout",
        layout: "application.shell",
      },
      routes: {
        mobile: { path: "/formulaire" },
        web: {
          path: "/formulaire",
          seo: {
            canonicalPath: "/formulaire",
            description: "Démonstration du FormBuilder partagé Web et Native.",
            index: false,
            title: "FormBuilder complexe",
          },
        },
      },
    },
  ],
  schemaVersion: 1,
  version: "1.0.0",
});

export const INVOICE_FEATURE = defineFeature({
  blocks: ["invoice.builder"],
  id: "invoice",
  operations: [
    {
      access: PUBLIC_ACCESS,
      audit: { event: "invoice.created", required: true },
      handler: "invoice.create",
      id: "create",
      idempotency: { required: true },
      input: {
        additionalProperties: false,
        properties: {
          clientName: { maxLength: 120, minLength: 2, type: "string" },
          currency: { enum: ["XAF"], type: "string" },
          description: { maxLength: 240, minLength: 1, type: "string" },
          quantity: { maximum: 10_000, minimum: 0.01, type: "number" },
          taxRate: { maximum: 100, minimum: 0, type: "number" },
          unitPrice: { maximum: 1_000_000_000, minimum: 0, type: "number" },
        },
        required: [
          "clientName",
          "currency",
          "description",
          "quantity",
          "taxRate",
          "unitPrice",
        ],
        type: "object",
      },
      kind: "mutation",
      method: "POST",
      output: {
        additionalProperties: false,
        properties: {
          createdAt: { format: "date-time", type: "string" },
          id: { format: "uuid", type: "string" },
          invoiceNumber: { maxLength: 40, minLength: 1, type: "string" },
          total: { maximum: 20_000_000_000_000, minimum: 0, type: "number" },
        },
        required: ["createdAt", "id", "invoiceNumber", "total"],
        type: "object",
      },
      rateLimit: { cost: 1, limit: 20, windowMs: 60_000 },
      resource: "invoices",
    },
  ],
  pages: [
    {
      access: PUBLIC_ACCESS,
      id: "index",
      root: {
        children: [
          {
            actions: { save: "create" },
            block: "invoice.builder",
            id: "builder",
            kind: "block",
          },
        ],
        id: "page",
        kind: "layout",
        layout: "application.shell",
      },
      routes: {
        mobile: { path: "/factures" },
        web: {
          path: "/factures",
          seo: {
            canonicalPath: "/factures",
            description: "Créez et enregistrez une facture de démonstration.",
            index: false,
            title: "Mini générateur de facture",
          },
        },
      },
    },
  ],
  schemaVersion: 1,
  version: "1.0.0",
});

export const APP_FEATURE_CATALOG = defineFeatureCatalog({
  application: {
    defaultLocale: "fr",
    description: "Démonstration des fonctionnalités partagées Messanga11.",
    name: "__PROJECT_NAME__",
    shortName: "__PROJECT_NAME__",
  },
  features: [
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "dashboard.screen",
      description: "Tableau de bord de démonstration Messanga11.",
      id: "dashboard",
      path: "/",
      props: DASHBOARD_DEMO,
      title: "Tableau de bord",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Liste et suivi des commandes.",
      id: "orders",
      path: "/orders",
      props: RESOURCE_DEMOS.orders,
      title: "Orders",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Répertoire des clients.",
      id: "customers",
      path: "/customers",
      props: RESOURCE_DEMOS.customers,
      title: "Customers",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Catalogue des produits.",
      id: "products",
      path: "/products",
      props: RESOURCE_DEMOS.products,
      title: "Products",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Organisation des catégories produits.",
      id: "categories",
      path: "/categories",
      props: RESOURCE_DEMOS.categories,
      title: "Categories",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Réseau des points de vente.",
      id: "stores",
      path: "/stores",
      props: RESOURCE_DEMOS.stores,
      title: "Stores",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "resource.list",
      description: "Disponibilité et activité des coursiers.",
      id: "couriers",
      path: "/couriers",
      props: RESOURCE_DEMOS.couriers,
      title: "Couriers",
    }),
    FORM_BUILDER_FEATURE,
    INVOICE_FEATURE,
    screenFeature({
      access: PUBLIC_ACCESS,
      block: "authentication.screen",
      description: "Connexion sécurisée à la démonstration Messanga11.",
      id: "authentication",
      path: "/authentification",
      title: "Authentification",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "profile.screen",
      description: "Consultation et modification du profil utilisateur.",
      id: "profile",
      path: "/profil",
      title: "Profil",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "notifications.screen",
      description: "Centre de notifications et préférences de communication.",
      id: "notifications",
      path: "/notifications",
      title: "Notifications",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "team.screen",
      description: "Gestion des membres, rôles et invitations de l'équipe.",
      id: "team",
      path: "/equipe",
      title: "Équipe",
    }),
    screenFeature({
      access: AUTHENTICATED_ACCESS,
      block: "settings.screen",
      description: "Paramètres du compte et préférences de l'application.",
      id: "settings",
      path: "/parametres",
      title: "Paramètres",
    }),
  ],
  schemaVersion: 1,
});

export type AppFeatureId = ProductFeatureId;
