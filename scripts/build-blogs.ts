/**
 * Build script: scans public/blogs/, generates public/blogs-manifest.json.
 *
 * Usage: tsx scripts/build-blogs.ts
 *
 * Also imported by build-docs.ts, which appends `/blogs` + `/blogs/:slug`
 * routes to routes.txt from the manifest this writes — one .md file per
 * post, no subdirectories (unlike public/docs/).
 *
 * Frontmatter is validated against KNOWN_BLOG_FRONTMATTER_KEYS: title,
 * description, publishedOn, order, author, readTime, coverImage. An
 * unrecognized key throws and fails the build, same convention as
 * build-docs.ts's KNOWN_FRONTMATTER_KEYS.
 *
 * `order` sorts the index listing newest-first (higher number = more
 * recent); posts without an `order` sort last.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';

const BLOGS_ROOT = path.resolve(process.cwd(), 'public/blogs');
const MANIFEST_OUT = path.resolve(process.cwd(), 'public/blogs-manifest.json');

export interface BlogAuthor {
  name: string;
  xHandle?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  publishedOn: string;
  order?: number;
  author: BlogAuthor;
  readTime?: number;
  coverImage?: string;
}

const KNOWN_BLOG_FRONTMATTER_KEYS = new Set([
  'title',
  'description',
  'publishedOn',
  'order',
  'author',
  'readTime',
  'coverImage',
]);

function validateFrontmatterKeys(filePath: string, fm: Record<string, unknown>): void {
  const unknown = Object.keys(fm).filter((key) => !KNOWN_BLOG_FRONTMATTER_KEYS.has(key));
  if (unknown.length === 0) return;
  const rel = path.relative(process.cwd(), filePath);
  throw new Error(
    `Invalid frontmatter in ${rel}: unknown key(s) ${unknown.map((k) => `"${k}"`).join(', ')}.\n` +
      `Known keys: ${[...KNOWN_BLOG_FRONTMATTER_KEYS].sort().join(', ')}.`,
  );
}

function requireString(fm: Record<string, unknown>, key: string, filePath: string): string {
  const value = fm[key];
  if (typeof value !== 'string' || value.length === 0) {
    const rel = path.relative(process.cwd(), filePath);
    throw new Error(`Missing required "${key}" frontmatter in ${rel}`);
  }
  return value;
}

function readPost(fileName: string): BlogPost {
  const filePath = path.join(BLOGS_ROOT, fileName);
  const { data: fm } = matter(fs.readFileSync(filePath, 'utf-8'));
  validateFrontmatterKeys(filePath, fm);

  const title = requireString(fm, 'title', filePath);
  const publishedOn = requireString(fm, 'publishedOn', filePath);

  const author = fm['author'] as Partial<BlogAuthor> | undefined;
  if (!author || typeof author.name !== 'string' || author.name.length === 0) {
    throw new Error(
      `Missing required "author.name" frontmatter in ${path.relative(process.cwd(), filePath)}`,
    );
  }

  return {
    slug: fileName.replace(/\.md$/, ''),
    title,
    description: typeof fm['description'] === 'string' ? fm['description'] : undefined,
    publishedOn,
    order: typeof fm['order'] === 'number' ? fm['order'] : undefined,
    author: {
      name: author.name,
      xHandle: typeof author.xHandle === 'string' ? author.xHandle : undefined,
      avatar: typeof author.avatar === 'string' ? author.avatar : undefined,
    },
    readTime: typeof fm['readTime'] === 'number' ? fm['readTime'] : undefined,
    coverImage: typeof fm['coverImage'] === 'string' ? fm['coverImage'] : undefined,
  };
}

/** Scans public/blogs/*.md and returns the post list, newest (`order`) first. */
export function buildBlogsManifest(): BlogPost[] {
  if (!fs.existsSync(BLOGS_ROOT)) return [];

  const posts = fs
    .readdirSync(BLOGS_ROOT)
    .filter((name) => name.endsWith('.md'))
    .map(readPost);

  posts.sort((a, b) => (b.order ?? -Infinity) - (a.order ?? -Infinity));

  return posts;
}

/** Builds and writes public/blogs-manifest.json; returns the posts written. */
export function writeBlogsManifest(): BlogPost[] {
  const posts = buildBlogsManifest();
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(posts, null, 2) + '\n', 'utf-8');
  console.log(`✓ Written ${MANIFEST_OUT} (${posts.length} posts)`);
  return posts;
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isDirectRun) {
  writeBlogsManifest();
}
