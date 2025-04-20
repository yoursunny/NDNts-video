import { el, setChildren } from "redom";

import { Pref } from "./pref.jsx";

/** Render video catalog. */
export class Catalog {
  constructor() {
    <div this="el" className="catalog">
      <h1 this="$sitename"></h1>
      <ul this="$ul"></ul>
      <Pref/>
    </div>;
  }

  /** @param {{ content: import("./content.js").Content, tag?: string}} props */
  update(props) {
    const { content: { sitename, catalog }, tag } = props;
    this.$sitename.textContent = sitename;
    let list = catalog;
    if (tag) {
      location.hash = `#tag=${encodeURI(tag)}`;
      list = catalog.filter((entry) => entry.tags?.includes(tag));
    } else {
      location.hash = "#";
    }
    setChildren(this.$ul, list.map((entry) => new Item(entry)));
  }
}

/** Render catalog line item. */
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
      {
        (entry.tags ?? []).map((tag) => (
          <a className="tag" href={`#tag=${encodeURI(tag)}`}>{tag}</a>
        ))
      }
    </li>;
  }
}
