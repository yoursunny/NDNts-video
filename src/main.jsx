import { el, mount, router } from "redom";

import { Catalog } from "./catalog.jsx";
import { connect } from "./connect.js";
import { fetchContent, makeIncompleteEntry } from "./content.js";
import { Fallback } from "./fallback.jsx";
import { Playback } from "./playback.jsx";

/** @type {import("./content.js").Content} */
let content;

const app = router(".app", {
  catalog: Catalog,
  play: Playback,
  fallback: Fallback,
});

class Main {
  constructor() {
    <div this="el">
      {app}
      <footer>
        <a href="#">{content.sitename}</a>, powered by <a href="https://github.com/yoursunny/NDNts-video" target="_blank" rel="noopener">NDNts adaptive video</a>
      </footer>
    </div>;

    connect();
  }
}

function gotoPage() {
  const { sitename, catalog } = content;
  document.title = sitename;
  let [action, param] = location.hash.split("=", 2);
  action = action.slice(1);
  switch (action) {
    case "play":
    case "fallback": {
      const entry = catalog.find((entry) => entry.name === param) ?? makeIncompleteEntry(param);
      if (entry.title) {
        document.title = `${entry.title} - ${sitename}`;
      }
      app.update(action, entry);
      break;
    }
    default:
      app.update("catalog", content);
      break;
  }
}

(async () => {
content = await fetchContent();
mount(document.body, new Main());

window.addEventListener("hashchange", gotoPage);
gotoPage();
})();
