<script lang="ts">
  import { onMount } from "svelte";
  // @ts-ignore - local prebuilt module does not expose complete TS typings for this path
  import { ButtplugWasmClientConnector } from "../buttplug/wasm/buttplug-wasm.mjs";
import { ButtplugClient, ButtplugClientDevice, DeviceOutput, OutputType, InputType, DeviceOutputCommand } from "../../../satvisor/buttplug-js/js/src/index.js";
import {  ButtplugClientDeviceFeature } from "../../../satvisor/buttplug-js/js/src/client/ButtplugClientDeviceFeature.js";
import type { ButtplugMessage } from "../../../satvisor/buttplug-js/js/src/core/Messages.js";
import { BleClient } from "@capacitor-community/bluetooth-le";

  const isCapacitorNative =
    typeof window !== "undefined" &&
    typeof (window as any).Capacitor?.isNativePlatform === "function" &&
    (window as any).Capacitor.isNativePlatform();

  const hasWebBluetoothRequestDevice = () =>
    typeof navigator !== "undefined" &&
    typeof (navigator as any).bluetooth?.requestDevice === "function";

  // Capacitor Bluetooth LE wrapper classes
  const normalizeUuid = (uuid: string) => `${uuid}`.toLowerCase();

  class CapacitorBluetoothRemoteGattCharacteristic extends EventTarget {
    deviceId: string;
    service: { uuid: string };
    uuid: string;
    value: any;
    oncharacteristicvaluechanged: ((evt: MessageEvent) => void) | null;
    private _notifying: boolean;

    constructor(deviceId: string, serviceUuid: string, characteristicUuid: string) {
      super();
      this.deviceId = deviceId;
      this.service = { uuid: serviceUuid };
      this.uuid = characteristicUuid;
      this.value = null;
      this.oncharacteristicvaluechanged = null;
      this._notifying = false;
    }

    async writeValue(value: any) {
      const array = value instanceof Uint8Array ? value : new Uint8Array(value);
      const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
      await BleClient.write(this.deviceId, this.service.uuid, this.uuid, view);
    }

    async readValue() {
      const view = await BleClient.read(this.deviceId, this.service.uuid, this.uuid);
      this.value = view;
      return view;
    }

    async startNotifications() {
      if (this._notifying) {
        return this;
      }
      await BleClient.startNotifications(
        this.deviceId,
        this.service.uuid,
        this.uuid,
        (value: any) => {
          this.value = value;
          const evt = new MessageEvent("characteristicvaluechanged");
          this.dispatchEvent(evt);
          if (typeof this.oncharacteristicvaluechanged === "function") {
            this.oncharacteristicvaluechanged(evt);
          }
        },
      );
      this._notifying = true;
      return this;
    }

    async stopNotifications() {
      if (!this._notifying) {
        return this;
      }
      await BleClient.stopNotifications(this.deviceId, this.service.uuid, this.uuid);
      this._notifying = false;
      return this;
    }
  }

  class CapacitorBluetoothRemoteGattService {
    deviceId: string;
    uuid: string;
    private _characteristics: Map<string, CapacitorBluetoothRemoteGattCharacteristic>;
    private _reportedCharacteristics: Set<string>;

    constructor(deviceId: string, serviceUuid: string, characteristics: any[] = []) {
      this.deviceId = deviceId;
      this.uuid = serviceUuid;
      this._characteristics = new Map();
      this._reportedCharacteristics = new Set(
        (characteristics || []).map((c: any) => normalizeUuid(c?.uuid ?? c)),
      );
    }

    async getCharacteristic(characteristicUuid: string) {
      const key = normalizeUuid(characteristicUuid);
      if (
        this._reportedCharacteristics.size > 0 &&
        !this._reportedCharacteristics.has(key)
      ) {
        throw new Error(
          `Characteristic ${key} not reported by service ${this.uuid} on device ${this.deviceId}`,
        );
      }
      if (!this._characteristics.has(key)) {
        this._characteristics.set(
          key,
          new CapacitorBluetoothRemoteGattCharacteristic(this.deviceId, this.uuid, key),
        );
      }
      return this._characteristics.get(key)!;
    }
  }

  class CapacitorBluetoothRemoteGattServer {
    deviceId: string;
    connected: boolean;
    private _services: Map<string, CapacitorBluetoothRemoteGattService>;

    constructor(deviceId: string, services: any[] = []) {
      this.deviceId = deviceId;
      this.connected = true;
      this._services = new Map();
      for (const service of services || []) {
        const serviceUuid = normalizeUuid(service?.uuid ?? service);
        this._services.set(
          serviceUuid,
          new CapacitorBluetoothRemoteGattService(
            this.deviceId,
            serviceUuid,
            service?.characteristics || [],
          ),
        );
      }
    }

    async getPrimaryService(serviceUuid: string) {
      const key = normalizeUuid(serviceUuid);
      if (!this._services.has(key)) {
        throw new Error(`Service ${key} not reported by device ${this.deviceId}`);
      }
      return this._services.get(key)!;
    }
  }

  class CapacitorBluetoothRemoteGatt {
    private _device: any;
    connected: boolean;
    private _server: CapacitorBluetoothRemoteGattServer | null;

    constructor(device: any) {
      this._device = device;
      this.connected = false;
      this._server = null;
    }

    async connect() {
      await BleClient.connect(this._device.id, () => this._device._emitDisconnected());
      const services = await BleClient.getServices(this._device.id);
      this.connected = true;
      this._server = new CapacitorBluetoothRemoteGattServer(this._device.id, services || []);
      return this._server;
    }

    get server() {
      return this._server;
    }
  }

  class CapacitorBluetoothDevice extends EventTarget {
    id: string;
    name: string;
    gatt: CapacitorBluetoothRemoteGatt;
    ongattserverdisconnected: ((evt: Event) => void) | null;

    constructor(id: string, name?: string) {
      super();
      this.id = id;
      this.name = name || "Unknown Device";
      this.gatt = new CapacitorBluetoothRemoteGatt(this);
      this.ongattserverdisconnected = null;
    }

    _emitDisconnected() {
      const evt = new Event("gattserverdisconnected");
      this.dispatchEvent(evt);
      if (typeof this.ongattserverdisconnected === "function") {
        this.ongattserverdisconnected(evt);
      }
    }
  }

  function extractRequestDeviceFilterCriteria(options: any = {}) {
    const filters = Array.isArray(options.filters) ? options.filters : [];
    const names = new Set<string>();
    const namePrefixes = new Set<string>();
    const services = new Set<string>();
    const optionalServices = new Set<string>();

    if (typeof options.name === "string" && options.name.length > 0) {
      names.add(options.name);
    }
    if (typeof options.namePrefix === "string" && options.namePrefix.length > 0) {
      namePrefixes.add(options.namePrefix);
    }
    if (Array.isArray(options.services)) {
      for (const service of options.services) {
        services.add(normalizeUuid(service));
      }
    }
    if (Array.isArray(options.optionalServices)) {
      for (const service of options.optionalServices) {
        optionalServices.add(normalizeUuid(service));
      }
    }

    for (const filter of filters) {
      if (typeof filter?.name === "string" && filter.name.length > 0) {
        names.add(filter.name);
      }
      if (typeof filter?.namePrefix === "string" && filter.namePrefix.length > 0) {
        namePrefixes.add(filter.namePrefix);
      }
      if (Array.isArray(filter?.services)) {
        for (const service of filter.services) {
          const normalized = normalizeUuid(service);
          services.add(normalized);
          optionalServices.add(normalized);
        }
      }
    }

    return {
      names: Array.from(names),
      namePrefixes: Array.from(namePrefixes),
      services: Array.from(services),
      optionalServices: Array.from(optionalServices),
    };
  }

  function matchesPostSelectionFilters(
    deviceName: string,
    discoveredServices: string[],
    criteria: {
      names: string[];
      namePrefixes: string[];
      services: string[];
    },
  ): boolean {
    const normalizedName = (deviceName || "").toLowerCase();
    const normalizedServices = new Set((discoveredServices || []).map(normalizeUuid));

    const hasNameFilters = criteria.names.length > 0 || criteria.namePrefixes.length > 0;
    const hasServiceFilters = criteria.services.length > 0;

    const nameMatched = hasNameFilters
      ? criteria.names.some((name) => normalizedName === name.toLowerCase()) ||
        criteria.namePrefixes.some((prefix) => normalizedName.startsWith(prefix.toLowerCase()))
      : false;

    const serviceMatched = hasServiceFilters
      ? criteria.services.some((service) => normalizedServices.has(normalizeUuid(service)))
      : false;

    // Requested behavior: accept if name OR service filters match.
    if (hasNameFilters && hasServiceFilters) {
      return nameMatched || serviceMatched;
    }
    if (hasNameFilters) {
      return nameMatched;
    }
    if (hasServiceFilters) {
      return serviceMatched;
    }
    return true;
  }

  async function ensureCapacitorBluetoothBridge() {
    if (!isCapacitorNative) {
      return false;
    }

    await BleClient.initialize();

    const bridge = {
      requestDevice: async (options: any) => {
        console.log("Requesting Bluetooth device with options:", options);
        const criteria = extractRequestDeviceFilterCriteria(options);
        console.log("Extracted post-selection filter criteria:", criteria);

        const device = await BleClient.requestDevice({
          // Intentionally request ANY device and filter after selection.
          optionalServices: criteria.optionalServices,
        }).catch((err) => {
          console.error("Error during device selection:", err);
          throw err;
        }).finally(() => {
          console.log("Device selection process completed (success or failure)");
        });
        console.log("Device obtained:", device.deviceId, device.name, device.uuids);
        const deviceId = (device as any).deviceId ?? (device as any).id;
        if (!deviceId) {
          throw new Error("Capacitor requestDevice returned no device id");
        }
        const deviceName = (device as any).name ?? (device as any).localName ?? "Unknown Device";

        // Prefer advertisement UUIDs when available, otherwise temporarily
        // connect and discover services for post-selection filtering.
        let discoveredServices: string[] = Array.isArray((device as any).uuids)
          ? (device as any).uuids.map((uuid: string) => normalizeUuid(uuid))
          : [];

        if (discoveredServices.length === 0 && criteria.services.length > 0) {
          let connectedForDiscovery = false;
          try {
            await BleClient.connect(deviceId);
            connectedForDiscovery = true;
            const services = await BleClient.getServices(deviceId);
            discoveredServices = (services || []).map((service: any) => normalizeUuid(service?.uuid));
            console.log(`Discovered services for device '${deviceName}' (${deviceId}):`, discoveredServices);
          } catch (e) {
            console.warn("Service discovery failed during post-selection filtering:", e);
          } finally {
            if (connectedForDiscovery) {
              try {
                await BleClient.disconnect(deviceId);
              } catch {
                // Ignore disconnect failures in best-effort filter probing.
              }
            }
          }
        }

        const accepted = matchesPostSelectionFilters(deviceName, discoveredServices, {
          names: criteria.names,
          namePrefixes: criteria.namePrefixes,
          services: criteria.services,
        });

        if (!accepted) {
          throw new Error(
            `Selected device '${deviceName}' did not match requested name/service filters`,
          );
        }

        console.log(`Device '${deviceName}' accepted by post-selection filters, creating BluetoothDevice wrapper`);

        return new CapacitorBluetoothDevice(deviceId, deviceName);
      },
    };

    // On Capacitor native platforms, always use the plugin-backed bridge.
    Object.defineProperty(navigator, "bluetooth", {
      configurable: true,
      value: bridge,
    });

    return true;
  }

  async function initializeBluetoothTransport() {
    if (isCapacitorNative) {
      const bridged = await ensureCapacitorBluetoothBridge();
      if (bridged) {
        console.log("Capacitor BLE bridge active");
        return true;
      }
      return false;
    }

    if (hasWebBluetoothRequestDevice()) {
      console.log("Using Web Bluetooth (native browser requestDevice)");
      return true;
    }

    console.error("Bluetooth unavailable: missing Web Bluetooth requestDevice");
    return false;
  }


  // Extend the ButtplugClientDevice type with custom properties
  export interface EOMButtplugClientDeviceControl extends ButtplugClientDeviceFeature {
    type: OutputType;
    // attributes: any[];
    index: number;
    // descriptor: string;
    
    mode?: string;
    invert?: boolean;
    min?: number;
    max?: number;
    sliderElement?: HTMLInputElement;
  }

  export interface EOMButtplugClientDevice extends ButtplugClientDevice {
    controls?: EOMButtplugClientDeviceControl[];
  }

  
  interface Props {
    deviceList?: EOMButtplugClientDevice[];
  }

  let { deviceList = $bindable([]) }: Props = $props();

  let client = new ButtplugClient("EOM Client");
  let bluetoothReady = false;

  async function initialize_buttplug() {
    // Split transport strategy:
    // - Capacitor BLE bridge on native mobile
    // - Web Bluetooth on web/desktop when available
    try {
      bluetoothReady = await initializeBluetoothTransport();
    } catch (e) {
      console.error("Bluetooth transport initialization error:", e);
      bluetoothReady = false;
      return;
    }

    if (!bluetoothReady) {
      return;
    }

    client.addListener("deviceadded", async (device: ButtplugClientDevice) => {
      console.log(`Device added: ${device.name}`, device);
      let eomDevice = device as EOMButtplugClientDevice;
      eomDevice.controls = await initDeviceControls(eomDevice);
      deviceList = [...deviceList, eomDevice];
    });


    client.addListener("deviceremoved", (device: ButtplugClientDevice) => {
      console.log(`Device removed: ${device.name}`,device);
      // device.emitDisconnected(); 
      //client.disconnect();
      deviceList = deviceList.filter(d => d !== device);
    });
    // @ts-ignore
    const connector = new ButtplugWasmClientConnector();
    await client.connect(connector);
  }

  async function connect_to_device() {
    if (!bluetoothReady) {
      console.error("Bluetooth is not ready");
      return;
    }
    await client.startScanning();
  }

  onMount(() => {
    initialize_buttplug().catch(err => console.error(err));
  });

  export async function initDeviceControls(device: ButtplugClientDevice): Promise<EOMButtplugClientDeviceControl[]> {
    const controls: EOMButtplugClientDeviceControl[] = [];
    for (const [idx, feature] of device.features) {
        const control = {
          ...feature,
          index: idx,
          //descriptor: feature.FeatureDescriptor || `Vibrate ${idx + 1}`,
          mode: "manual",
          invert: false,
          min: 0,
          max: 100,
        } as EOMButtplugClientDeviceControl;

        // Vibrate = 'Vibrate',
        // Rotate = 'Rotate',
        // Oscillate = 'Oscillate',
        // Constrict = 'Constrict',
        // Inflate = 'Inflate',
        // Position = 'Position',
        // HwPositionWithDuration = 'HwPositionWithDuration',
        // Temperature = 'Temperature',
        // Spray = 'Spray',
        // Led = 'Led',

        if (feature.hasOutput(OutputType.Vibrate)) {
          control.type = OutputType.Vibrate;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Rotate)) {
          control.type = OutputType.Rotate;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Oscillate)) {
          control.type = OutputType.Oscillate;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Constrict)) {
          control.type = OutputType.Constrict;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Inflate)) {
          control.type = OutputType.Inflate;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Position)) {
          control.type = OutputType.Position;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.HwPositionWithDuration)) {
          control.type = OutputType.HwPositionWithDuration;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Temperature)) {
          control.type = OutputType.Temperature;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Spray)) {
          control.type = OutputType.Spray;
          controls.push(control);
        } else if (feature.hasOutput(OutputType.Led)) {
          control.type = OutputType.Led;
          controls.push(control);
        }

        console.log("New feature:",control)

  //|| feature.hasOutput(OutputType.Rotate) || feature.hasOutput(OutputType.Oscillate) || ) {
    }
    // for (const t of Object.values(OutputType)) {
    //   if (device.hasOutput(t)) controls.push(t as EOMButtplugClientDeviceControl);
    // }
    for (const t of Object.values(InputType)) {
      //if (device.hasInput(t)) tags.push(`<span class="device-tag input">${t}</span>`);
    }

    let batteryHtml = '';
    if (device.hasInput(InputType.Battery)) {
      try {
        const level = await device.battery();
        const pct = Math.round(level * 100);
        const cls = pct <= 15 ? 'low' : pct <= 40 ? 'mid' : '';
        batteryHtml = `<span class="device-battery ${cls}">${pct}%</span>`;
      } catch (e) {
        batteryHtml = `<span class="device-battery">?%</span>`;
      }
    }

    
    return controls;
  }

  export function handleDeviceChange(device: ButtplugClientDevice, control: EOMButtplugClientDeviceControl, value: number) {
    const min = (control.min ?? 0) / 255.0;
    const max = (control.max ?? 255) / 255.0;
    let normalizedValue = value * (max - min) + min;
    if (control.invert) {  //handles unset value as false
      normalizedValue = 1.0 - normalizedValue ;  
    }

    console.log(`Setting device ${device.name} (${control.type}) feature ${control.index} to normalizedValue ${normalizedValue} (raw value: ${value}, min: ${min}, max: ${max}, invert: ${control.invert})`);
    device
      .send({
        ScalarCmd: {
          DeviceIndex: device.index,
          Scalars: [{ 
            Index: control.index, 
            Scalar: normalizedValue,
            ActuatorType: control.type 
          }],
        },
      } as unknown as ButtplugMessage)
      .catch((err) => console.error(`Error sending command to device ${device.name}:`, err));
  }
</script>

<div class="buttplug-connector">
  <div style="display: flex;justify-content: space-between; align-items: center">
    <button onclick={connect_to_device} style="max-width: 250px;">Connect to a {#if deviceList.length > 0}another{/if} toy</button>
    {#if deviceList.length === 0}
      <p style="margin-left: 10px;color: orange;">No devices connected</p>
    {/if}
    <div style="display: flex;align-items: center;">Powered by: <a href="https://buttplug.io/" target="_blank"><img src="buttplug_logo.png" alt="Buttplug Logo" style="margin-left:10px; max-height: 40px;" /></a></div>
  </div>
  {#if deviceList.length === 0}
    <p style="font-size: small;">Currently supported toys are listed <a href="https://iostindex.com/?filter0Availability=Available,DIY&filter1Connection=Bluetooth%204%20LE&filter2ButtplugSupport=4&filter3Features=OutputsVibrators" target="_blank">by IoST Index</a></p>
  {:else}
    <ul>
      {#each deviceList as device}
        <li>
          <div style="display: flex;flex-direction: row;justify-content: space-between;">
            <div>{device.name}</div>
            <button
              title="Disconnect toy"
              style="color: red; float:right; padding: 0 .25em 0 .25em; font-size: 1.25em; background: #444; cursor: pointer; line-height: .05em; display: flex; align-items: center; justify-content: center;"
              aria-label="Close settings"
              onclick={async () => {
                await device.stop();
                device.emitDisconnected();
                device.removeAllListeners();
                deviceList = deviceList.filter(d => d !== device);
                }}
            >
              &times;
            </button>

          </div>
          {#each device.controls as control}
          <div class="device-sliders">
            <div style="display: flex;flex-direction: row;justify-content: space-between;">

              <div style="font-weight: bold; margin-bottom: 5px;">
                {control.type}
              </div>

              <div>
                <select id={device.index + "-" + control.type + "-" + control.index + "-mode"} onchange={async (e) => {
                  const mode = (e.target as HTMLSelectElement).value;
                  console.log(`Setting mode for ${device.name} ${control.type} to ${mode}`);
                  control.mode = mode;
                }}>
                  <option value="manual" selected={control.mode === "manual"}>Manual control only</option>
                  <option value="pleasure" selected={control.mode === "pleasure"}>Connect to Pleasure</option>
                  <option value="arousal" selected={control.mode === "arousal"}>Connect to Arousal</option>
                  <option value="pressure" selected={control.mode === "pressure"}>Connect to Pressure</option>
                  <option value="denied" selected={control.mode === "denied"}>Connect to Denials</option>
                </select>
              </div>
              <div>
                <input type="checkbox" id={device.index + "-" + control.type + "-" + control.index + "-invert"} checked={control.invert} onchange={async (e) => {
                  control.invert = (e.target as HTMLInputElement).checked;
                }}/> Invert
              </div>
            </div>

            <!-- svelte-ignore binding_property_non_reactive -->
            <input id={`control-${device.index}-${control.type}-${control.index}-slider`} type="range" min="0" max="255" value="0" bind:this={control.sliderElement} oninput={(e) => {
              //debounce this
                handleDeviceChange(device, control, (parseInt((e.target as HTMLInputElement)?.value ?? "0") / 255.0));
              }}/>
            <div class="slider">
                <div id={`control-${device.index}-${control.type}-${control.index}-range-slider`} class="range-slider"></div>
            </div>

            <div class="range-input">
                <input id={`control-${device.index}-${control.type}-${control.index}-min`} type="range" class="min-range" min="0" max="255" value="0" step="1" oninput={(e) => {
                  control.min = parseInt((e.target as HTMLInputElement)?.value ?? "0");
                  const rangeInput = document.querySelector(`#control-${device.index}-${control.type}-${control.index}-range-slider`) as HTMLInputElement;
                  rangeInput.style.left = `${control.min / 255 * 100}%`;
                }} />
                <input id={`control-${device.index}-${control.type}-${control.index}-max`} type="range" class="max-range" min="0" max="255" value="255" step="1"  oninput={(e) => {
                  control.max = parseInt((e.target as HTMLInputElement)?.value ?? "255");
                  const rangeInput = document.querySelector(`#control-${device.index}-${control.type}-${control.index}-range-slider`) as HTMLInputElement;
                  rangeInput.style.right = `${(255 - control.max) / 255 * 100}%`;
                }} />
            </div>


          </div>
          {/each}
        </li>
      {/each}
    </ul>
  {/if}
</div>
