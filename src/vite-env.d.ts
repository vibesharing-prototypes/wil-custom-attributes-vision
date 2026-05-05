/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional one-line note shown on side sheet deployment footers (e.g. demo branch). */
  readonly VITE_DEPLOYMENT_NOTE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
