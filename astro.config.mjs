import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// @see https://github.com/withastro/astro/issues/4229
// import relativeLinks from "astro-relative-links";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
