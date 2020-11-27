import { el } from "redom";

import config from "../config.json";

export class Pref {
  constructor() {
    <details this="el">
      <summary>Preferences</summary>
      <form this="$form" class="pure-form pure-form-stacked">
        <fieldset>
          <label>Preferred router
            <input this="$router"/>
          </label>
          <label class="pure-checkbox">
            <input this="$quic" type="checkbox"/> use QUIC gateway
          </label>
          <button type="submit" class="pure-button">Set</button>
        </fieldset>
      </form>
    </details>;

    this.$quic.addEventListener("change", () => {
      if (this.$quic.checked) {
        this.$router.value = config.quicGateway;
      }
    });
    this.$router.addEventListener("change", () => this.$quic.checked = false);
    this.$form.addEventListener("submit", (evt) => {
      evt.preventDefault();
      window.localStorage.setItem("router", this.$router.value);
      location.reload();
    });
  }
}
