/**
 * @typedef {{
 *  title: string;
 *  name: string;
 *  protocol: "ivoosh-2019";
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
    protocol: "ivoosh-2019",
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
  return (await fetch("content.json")).json();
}
