/// <reference types="@cloudflare/workers-types" />
declare module 'virtual:astro-cms/config' {
  import type { CMSConfig } from '@geniusofdigital/astro-cms/config'
  const config: CMSConfig
  export default config
}