import { el } from "redom";

export class Pref {
  constructor() {
    <details this="el">
      <summary>Preferences</summary>
      <form this="$form" class="pure-form pure-form-stacked">
        <fieldset>
          <label>Preferred router
            <input this="$router" size="40" placeholder="wss://... or quic-gateway://..."/>
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="quic-transport://quic-gateway-lax.ndn.today:6367/ndn"/> use QUIC gateway (LAX)
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="quic-transport://quic-gateway-yul.ndn.today:15937/ndn"/> use QUIC gateway (YUL)
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="quic-transport://quic-gateway-ams.ndn.today:6367/ndn"/> use QUIC gateway (AMS)
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="quic-transport://quic-gateway-nrt.ndn.today:6367/ndn"/> use QUIC gateway (NRT)
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="autoconfig:"/> disallow QUIC gateway
          </label>
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
