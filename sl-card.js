class SL_Card extends HTMLElement {
    set hass(hass) {
        if (!this.content) {
            this.innerHTML = `
          <ha-card >
            <div class="card-content">Loading SL</div>
          </ha-card>
        `;
            this.content = this.querySelector("div");
        }
        
        const entityId = this.config.entity;
        const state = hass.states[entityId];
        const stateStr = state ? state.state : "unavailable";

        var that = this;

        
        function get_dep_str(sec_to_dep) {
            let ss0 = sec_to_dep % 60;
            let mm0 = (sec_to_dep - ss0) / 60;
            ss0 = ss0 + "";
            mm0 = mm0 + "";
            ss0 = ss0.padStart(2, "0");
            mm0 = mm0.padStart(2, "0");
            return mm0 + ":" + ss0;
        }

        function drawDepartureSign() {


            let idx = 0;
            let ms_to_dep0 = 0;
            //Do not show the departure if it happened in the past, this happens between API calls
            for (let i = 0; i < state.attributes.departures.length - 1; i++) {
                idx = i;
                ms_to_dep0 =
                    new Date(state.attributes.departures[idx].departure_time) -
                    new Date();
                if (ms_to_dep0 > 0) {
                    break;
                }
            }
            //Get the depature time in MM:SS string based on the time to depareture
            let dep_str0 = get_dep_str(parseInt(ms_to_dep0 / 1000));
            let ms_to_dep1 =
                new Date(state.attributes.departures[idx + 1].departure_time) -
                new Date();

            let dep_str1 = get_dep_str(parseInt(ms_to_dep1 / 1000));

            const destination0 = state.attributes.departures[0].destination;
            const destination1 = state.attributes.departures[1].destination;
            //Update the html of the frontend
            that.content.innerHTML = `
<style>
.sl-time {
  font-family: 'Courier New', monospace;
  color: #ffaa00;
  padding-left:12px;
}
.sl-sign{
  background: black;
  padding: 3px;
  border: 5px solid #111;
  border-radius: 15px;
}
</style>
<div class="sl-sign">
    <h1 class="sl-time"> ${destination0} ${dep_str0} </h1>
    <h2 class="sl-time"> ${destination1} ${dep_str1} </h2>
</div>
      `;
        }


        // Start the periodic 1 second update, but only do so the first time the card is loaded
        if (!this.loaded_before) {
            this.content.innerHTML = `loading...
              `;
            this.loaded_before = true;
            drawDepartureSign();
            setInterval(drawDepartureSign, 1000);
        } else {
            console.log("reload");
        }
    }
    // The user supplied configuration. Throw an exception and Lovelace will
    // render an error card.
    setConfig(config) {
        if (!config.entity) {
            throw new Error("You need to define an entity");
        }
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return 3;
    }
}

customElements.define("sl-card", SL_Card);