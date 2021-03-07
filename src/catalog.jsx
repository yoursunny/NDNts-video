import { el, setChildren } from "redom";

import { Pref } from "./pref.jsx";

export class Catalog {
  constructor() {
    <div this="el" class="catalog">
      <h1 this="$sitename"></h1>
      <ul this="$ul"></ul>
      <Pref/>
    </div>;
  }

  onmount() {
    location.hash = "#";
  }

  /** @param {import("./content.js").Content} content */
  update(content) {
    const { sitename, catalog } = content;
    this.$sitename.textContent = sitename;
    setChildren(this.$ul, catalog.map((entry) => new Item(entry)));
  }
}

class Item {
  /** @param {import("./content.js").Entry} entry */
  constructor(entry) {
    <li this="el">
      <a href={`#play=${encodeURI(entry.name)}`}>{entry.title}</a>
      {
        entry.date ? (
          <time datetime={entry.date}>
            {new Date(entry.date).toDateString()}
          </time>
        ) : undefined
      }
    </li>;
  }
}
