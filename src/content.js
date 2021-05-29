/**
 * @typedef {{
 *  title: string;
 *  name: string;
 *  fallback?: string;
 *  date?: string;
 *  tags?: string[];
 * }} Entry
 */

/** @returns {Entry} */
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
 * }} Content
 */

/** @returns {Promise<Content>} */
export async function fetchContent() {
  const res = await fetch("content.json");
  if (!res.ok) {
    throw new Error(`content.json HTTP ${res.status}`);
  }
  return res.json();
}
