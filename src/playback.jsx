import { el, setChildren } from "redom";

import { Player } from "./player.jsx";
import { StatDisplay } from "./stat-display.jsx";

export class Playback {
  constructor() {
    <div this="el" class="pure-g">
      <div class="pure-u-1 pure-u-lg-3-4">
        <Player this="$player"/>
      </div>
      <div class="pure-u-1 pure-u-lg-1-4">
        <div class="sidebar">
          <h2 this="$title"></h2>
          <p this="$byline"></p>
          <p this="$fallbackLink" hidden></p>
          <StatDisplay this="$stat"/>
        </div>
      </div>
    </div>;
  }

  onmount() {
    this.timer = setInterval(() => {
      this.$stat.update(this.$player.getStat());
    }, 200);
  }

  onunmount() {
    clearInterval(this.timer);
  }

  update(props) {
    const { title, name, date, fallback } = props;
    if (!Player.supported) {
      location.replace(`#fallback=${name}`);
      return;
    }
    this.$title.textContent = title;
    this.$byline.textContent = `${date ? new Date(date).toDateString() : ""}`;
    this.$player.update(props);
    this.$fallbackLink.hidden = !fallback;
    setChildren(this.$fallbackLink, [
      <a href={`#fallback=${name}`}>watch on fallback site</a>,
    ]);
  }
}
