import "purecss";
import "purecss/build/grids-responsive.css";
import "./style.css";

import { el, mount, router } from "redom";

import catalog from "../catalog.json";
import config from "../config.json";
import { Catalog } from "./catalog.jsx";
import { connect } from "./connect.js";
import { Fallback } from "./fallback.jsx";
import { Playback } from "./playback.jsx";

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
        <a href="#">{config.sitename}</a>, powered by <a href="https://github.com/yoursunny/NDNts-ivoosh" target="_blank" rel="noopener">NDNts adaptive video</a>
      </footer>
    </div>;

    connect();
  }
}

mount(document.body, new Main());

function gotoPage() {
  document.title = config.sitename;
  let [action, param] = location.hash.split("=", 2);
  action = action.slice(1);
  switch (action) {
    case "play":
    case "fallback": {
      const entry = catalog.find((entry) => entry.name === param) ?? { name: param };
      if (entry.title) {
        document.title = `${entry.title} - ${config.sitename}`;
      }
      app.update(action, entry);
      break;
    }
    default:
      app.update("catalog", { catalog });
      break;
  }
}

window.addEventListener("hashchange", gotoPage);
gotoPage();
