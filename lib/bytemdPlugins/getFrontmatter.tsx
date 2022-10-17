import type { BytemdPlugin } from 'bytemd';

export default function getFrontmatter(callback: <T extends Record<string, string>>(_frontmatter: T) => void): BytemdPlugin {
  return {
    viewerEffect({ file }) {
      if (typeof file.frontmatter === 'object') {
        callback(file.frontmatter);
      }
    },
  };
}
