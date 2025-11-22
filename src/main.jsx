import { el, mount, router } from "redom";

import { Catalog } from "./catalog.jsx";
import { connect } from "./connect.js";
import { fetchContent, makeIncompleteEntry } from "./content.js";
import { Fallback } from "./fallback.jsx";
import { Playback } from "./playback.jsx";
import { updateFwHints } from "./shaka-ndn-plugin.js";

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
  }
}

function gotoPage() {
  const { sitename, catalog } = content;
  document.title = sitename;
  let [action, param] = globalThis.location.hash.split("=", 2);
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
    case "tag": {
      app.update("catalog", { content, tag: param });
      break;
    }
    default: {
      app.update("catalog", { content, tag: undefined });
      break;
    }
  }
}

/** @type {import("./content.js").Content} */
const content = await fetchContent();
updateFwHints(content.fwhints);
connect(content.testConnection);
mount(document.body, new Main());

globalThis.addEventListener("hashchange", gotoPage);
gotoPage();
