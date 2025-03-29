/*
 * @Description: https://docs.astro.build/en/guides/content-collections/
 * @Author: MADAO
 * @Date: 2025-01-21 15:39:05
 * @LastEditors: MADAO
 * @LastEditTime: 2025-03-29 11:14:36
 */
import type { CollectionConfig } from 'astro:content';

import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

import { NOTES_TYPE } from './utils/constant';

const getNotesCollectionPath = (type?: typeof NOTES_TYPE[number]) => {
  return type ? `./src/data/notes/${type}` : './src/data/notes'
}

const createNoteCollection = (type?: typeof NOTES_TYPE[number]) => defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: getNotesCollectionPath(type) }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    type: z.string(),
    cover: z.object({
      image: image(),
      source: z.string(),
      sourceUrl: z.string(),
    }),
  }),
});


const notes: Partial<Record<typeof NOTES_TYPE[number] | 'all', CollectionConfig<unknown>>> = {
  all: createNoteCollection()
};

for (const type of NOTES_TYPE) {
  notes[type] = createNoteCollection(type);
};

export const collections = {
  ...notes
};