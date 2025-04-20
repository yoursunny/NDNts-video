import { el } from "redom";

const ROUTERS = [
  ["wss://hobo.cs.arizona.edu/ws/", "USA-West WebSockets"],
  ["wss://wundngw.arl.wustl.edu/ws/", "USA-Central WebSockets"],
  ["wss://ndn-testbed.ewi.tudelft.nl/ws/", "Netherlands WebSockets"],
  ["wss://testbed-ndn-rg.stei.itb.ac.id/ws/", "Indonesia WebSockets"],
  ["https://mdw.quic.ndn.net.eu.org:6367/ndn", "USA-Central HTTP/3"],
  ["https://lil.quic.ndn.net.eu.org:6367/ndn", "France HTTP/3"],
  ["https://bom.quic.ndn.net.eu.org:6367/ndn", "India HTTP/3"],
];

export class Pref {
  constructor() {
    <details this="el">
      <summary>Preferences</summary>
      <form this="$form" className="pure-form pure-form-stacked">
        <fieldset>
          <label>Preferred router
            <input this="$router" size="40" placeholder="wss:// or https://"/>
          </label>
          {ROUTERS.map(([uri, name]) => (
            <label className="pure-checkbox checkbox-set-router">
              <input type="checkbox" data-router={uri}/> {name}
            </label>
          ))}
          <button type="submit" className="pure-button">Set</button>
        </fieldset>
      </form>
    </details>;

    this.$router.addEventListener("change", () => this.clearSetRouterCheckboxes());
    for (const checkbox of this.$form.querySelectorAll(".checkbox-set-router input")) {
      checkbox.addEventListener("change", (evt) => {
        this.clearSetRouterCheckboxes(evt.target);
        if (evt.target.checked) {
          this.$router.value = evt.target.dataset.router;
        }
      });
    }
    this.$form.addEventListener("submit", (evt) => {
      evt.preventDefault();
      globalThis.localStorage.setItem("router", this.$router.value);
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
