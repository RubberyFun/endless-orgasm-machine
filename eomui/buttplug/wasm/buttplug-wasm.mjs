import { EventEmitter as a } from "eventemitter3";
let e;
let __tla = (async () => {
  var _a;
  e = (_a = class extends a {
    constructor() {
      super(), this._connected = false, this.initialize = async () => {
      }, this.connect = async () => {
        await e.maybeLoadWasm(), await e.activateLogging("debug"), this.client = e.wasmInstance.buttplug_create_embedded_wasm_server((s) => {
          this.emitMessage(s);
        }, this.serverPtr), this._connected = true;
      }, this.disconnect = async () => {
      }, this.send = (s) => {
        e.wasmInstance.buttplug_client_send_json_message(this.client, new TextEncoder().encode("[" + JSON.stringify(s) + "]"), (t) => {
          this.emitMessage(t);
        });
      }, this.emitMessage = (s) => {
        const t = new TextDecoder().decode(s), i = JSON.parse(t);
        this.emit("message", i);
      };
    }
    get Connected() {
      return this._connected;
    }
  }, _a._loggingActivated = false, _a.maybeLoadWasm = async () => {
    e.wasmInstance == null && (e.wasmInstance = await import("./buttplug_wasm-7s8FaBJM.js").then(async (m) => {
      await m.__tla;
      return m;
    }));
  }, _a.activateLogging = async (s = "debug") => {
    if (await e.maybeLoadWasm(), _a._loggingActivated) {
      console.log("Logging already activated, ignoring.");
      return;
    }
    console.log("Turning on logging."), e.wasmInstance.buttplug_activate_env_logger(s), _a._loggingActivated = true;
  }, _a);
})();
export {
  e as ButtplugWasmClientConnector,
  __tla
};
