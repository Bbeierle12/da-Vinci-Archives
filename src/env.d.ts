/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly DATABASE_URL_UNPOOLED: string;
  readonly STUDIO_PASSWORD_HASH: string;
  readonly BLOB_READ_WRITE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
