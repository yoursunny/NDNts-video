import { el } from "redom";

const ROUTERS = [
  ["wss://suns.cs.ucla.edu/ws/", "USA-West WebSockets"],
  ["wss://michigan.testbed.named-data.net/ws/", "USA-East WebSockets"],
  ["wss://ndnhub.ipv6.lip6.fr/ws/", "France WebSockets"],
  ["wss://mumbai.testbed.named-data.net/ws/", "India WebSockets"],
  ["https://lil.quic.g.ndn.today:6367/ndn", "France HTTP/3"],
];

export class Pref {
  constructor() {
    <details this="el">
      <summary>Preferences</summary>
      <form this="$form" class="pure-form pure-form-stacked">
        <fieldset>
          <label>Preferred router
            <input this="$router" size="40" placeholder="wss:// or https://"/>
          </label>
          {ROUTERS.map(([uri, name]) => (
            <label class="pure-checkbox checkbox-set-router">
              <input type="checkbox" data-set-router={uri}/> {name}
            </label>
          ))}
          <button type="submit" class="pure-button">Set</button>
        </fieldset>
      </form>
    </details>;

    this.$router.addEventListener("change", () => this.clearSetRouterCheckboxes());
    for (const checkbox of this.$form.querySelectorAll(".checkbox-set-router input")) {
      checkbox.addEventListener("change", (evt) => {
        this.clearSetRouterCheckboxes(evt.target);
        if (evt.target.checked) {
          this.$router.value = evt.target.getAttribute("data-set-router");
        }
      });
    }
    this.$form.addEventListener("submit", (evt) => {
      evt.preventDefault();
      window.localStorage.setItem("router", this.$router.value);
      location.reload();
    });
  }

  clearSetRouterCheckboxes = (except) => {
    for (const checkbox of this.$form.querySelectorAll(".checkbox-set-router input")) {
      if (checkbox !== except) {
        checkbox.checked = false;
      }
    }
  };
}
