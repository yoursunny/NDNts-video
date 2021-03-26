import { el } from "redom";

export class Pref {
  constructor() {
    <details this="el">
      <summary>Preferences</summary>
      <form this="$form" class="pure-form pure-form-stacked">
        <fieldset>
          <label>Preferred router
            <input this="$router" size="40" placeholder="wss://..."/>
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="wss://hobo.cs.arizona.edu/ws/"/> USA, Arizona
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="wss://michigan.testbed.named-data.net/ws/"/> USA, Michigan
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="wss://ndnhub.ipv6.lip6.fr/ws/"/> France
          </label>
          <label class="pure-checkbox checkbox-set-router">
            <input type="checkbox" data-set-router="wss://mumbai.testbed.named-data.net/ws/"/> India
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
