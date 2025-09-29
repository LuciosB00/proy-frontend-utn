/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_BACKEND_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
