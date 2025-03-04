// @ts-check
import { defineConfig } from "astro/config";
import tailwind from '@astrojs/tailwind';

import expressiveCode from "astro-expressive-code";
import { remarkModifiedTime } from './plugins/remark-modified-time.mjs';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    expressiveCode({
      themes: ['dracula'],
    })
  ],

  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },

  adapter: node({
    mode: 'standalone',
  }),
});