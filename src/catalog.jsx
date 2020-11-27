import { el, setChildren } from "redom";

import config from "../config.json";
import { Pref } from "./pref.jsx";

export class Catalog {
  constructor() {
    <div this="el" class="catalog">
      <h1>{config.sitename}</h1>
      <ul this="$ul"></ul>
      <Pref/>
    </div>;
  }

  onmount() {
    location.hash = "#";
  }

  update({ catalog }) {
    setChildren(this.$ul, catalog.map((entry) => new Item(entry)));
  }
}

class Item {
  /** @param {typeof import("../catalog.json")[0]} entry */
  constructor(entry) {
    <li this="el">
      <a href={`#play=${encodeURI(entry.name)}`}>{entry.title}</a>
    </li>;
  }
}
