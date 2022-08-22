/**
 * @typedef {{
 *  title: string;
 *  name: string;
 *  description?: string;
 *  fallback?: string;
 *  date?: string;
 *  tags?: string[];
 * }} Entry
 */

/**
 * Construct Entry from only a Name.
 * @param {string} name
 * @returns {Entry}
 */
export function makeIncompleteEntry(name) {
  return {
    title: name,
    name,
  };
}

/**
 * @typedef {{
 *  sitename: string;
 *  catalog: Entry[];
 *  testConnection?: string;
 *  fwhints?: Record<string, string>;
 * }} Content
 */

/**
 * Retrieve site content and video catalog.
 * @returns {Promise<Content>}
 */
export async function fetchContent() {
  const res = await fetch("content.json");
  if (!res.ok) {
    throw new Error(`content.json HTTP ${res.status}`);
  }
  return res.json();
}
