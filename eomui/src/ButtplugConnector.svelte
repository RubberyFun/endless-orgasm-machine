<script lang="ts">
  import { onMount } from "svelte";
  import type { ButtplugClientDevice } from "../buttplug/client/ButtplugClientDevice.d.ts";
  import type { ButtplugWasmClientConnector } from "../buttplug/wasm/index.d.ts";
  // @ts-ignore
  import { ButtplugWasmClientConnector as IButtplugWasmClientConnector } from "../buttplug/wasm/buttplug-wasm.mjs";
  import { ButtplugClient } from "../buttplug/buttplug.mjs";

  // Extend the ButtplugClientDevice type with custom properties
  interface EOMButtplugClientDevice extends ButtplugClientDevice {
    mode?: string;
    invert?: boolean;
    min?: number;
    max?: number;
    sliderElement?: HTMLInputElement;
  }

  interface Props {
    deviceList?: EOMButtplugClientDevice[];
  }

  let { deviceList = $bindable([]) }: Props = $props();

  let client = new ButtplugClient("EOM Client");

  async function initialize_buttplug() {
    client.addListener("deviceadded", (device: ButtplugClientDevice) => {
      console.log(`Device added: ${device.name}`, device);
      const eomClientDevice = device as EOMButtplugClientDevice;
      eomClientDevice.mode = "pleasure";
      eomClientDevice.invert = false;
      eomClientDevice.min = 0;
      eomClientDevice.max = 255;
      eomClientDevice.sliderElement = undefined;
      deviceList = [...deviceList, eomClientDevice];
    });


    client.addListener("deviceremoved", (device: ButtplugClientDevice) => {
      console.log(`Device removed: ${device.name}`,device);
      deviceList = deviceList.filter(d => d !== device);
    });
    // @ts-ignore
    const connector = new IButtplugWasmClientConnector() as ButtplugWasmClientConnector;
    await client.connect(connector);
  }

  async function connect_to_device() {
    await client.startScanning();
  }

  onMount(() => {
    initialize_buttplug().catch(err => console.error(err));
  });

  export function handleDeviceChange(device: EOMButtplugClientDevice, value: number, type: string | undefined = undefined) {
    const min = (device.min ?? 0) / 255.0;
    const max = (device.max ?? 255) / 255.0;
    let speed = value * (max - min) + min;
    if (device.invert) {  //handles unset value as false
      speed = 1.0 - speed;
    }

    
    //console.log(`Setting device ${device.name} (${type ?? "all"}) to speed ${speed} (raw value: ${value}, min: ${min}, max: ${max}, invert: ${device.invert})`);
    if (type === "oscillate" || (!type && (device.oscillateAttributes && device.oscillateAttributes.length > 0))) {
      device.oscillate(speed);
    }
    if (type === "vibrate" || (!type && (device.vibrateAttributes && device.vibrateAttributes.length > 0))) {
      device.vibrate(speed);
    }
  }
</script>

<div class="buttplug-connector">
  <div style="display: flex;justify-content: space-between; align-items: center">
    <button onclick={connect_to_device} style="max-width: 250px;">Connect to a {#if deviceList.length > 0}another{/if} toy</button>
    {#if deviceList.length === 0}
      <p style="margin-left: 10px;color: orange;">No devices connected</p>
    {/if}
    <div style="display: flex;align-items: center;">Powered by: <a href="https://buttplug.io " target="_blank"><img src="buttplug_logo.png" alt="Buttplug Logo" style="margin-left:10px; max-height: 40px;" /></a></div>
  </div>
  {#if deviceList.length === 0}
    <p style="font-size: small;">Currently supported toys are listed <a href="https://iostindex.com/?filter0Availability=Available,DIY&filter1Connection=Bluetooth%204%20LE&filter2ButtplugSupport=4&filter3Features=OutputsVibrators" target="_blank">by this website</a></p>
  {:else}
    <ul>
      {#each deviceList as device}
        <li>
          <div style="display: flex;flex-direction: row;justify-content: space-between;">
            <div>{device.name}</div>
            <div>
              <select id={device.name.replaceAll(" ","-") + "-mode"} onchange={async (e) => {
                const mode = (e.target as HTMLSelectElement).value;
                console.log(`Setting mode for ${device.name.replaceAll(" ","-")} to ${mode}`);
                device.mode = mode;
              }}>
                <option value="pleasure">Connect to Pleasure</option>
                <option value="arousal">Connect to Arousal</option>
                <option value="pressure">Connect to Pressure</option>
                <option value="denials">Connect to Denials</option>
                <option value="manual">Manual control only</option>
              </select>
            </div>
            <div>
              <input type="checkbox" id={device.name.replaceAll(" ","-") + "-invert"} checked={device.invert} onchange={async (e) => {
                device.invert = (e.target as HTMLInputElement).checked;
              }}/> Invert
            </div>
                <button
                  title="Disconnect toy"
                  style="color: red; float:right; padding: 0 .25em 0 .25em; font-size: 1.25em; background: #444; cursor: pointer; line-height: .05em; display: flex; align-items: center; justify-content: center;"
                  aria-label="Close settings"
                  onclick={async () => {
                    await device.stop();
                    deviceList = deviceList.filter(d => d !== device);
                    }}
                >
                  &times;
                </button>

          </div>
          {#if (device.vibrateAttributes && device.vibrateAttributes.length > 0) || (device.oscillateAttributes && device.oscillateAttributes.length > 0)}
          <div class="device-sliders">
            <!-- svelte-ignore binding_property_non_reactive -->
            <input id={`device-${device.index}-slider`} type="range" min="0" max="255" value="0" bind:this={device.sliderElement} oninput={(e) => {
              //debounce this
                handleDeviceChange(device,(parseInt((e.target as HTMLInputElement)?.value ?? "0") / 255.0));
              }}/>
            <div class="slider">
                <div id={`device-${device.index}-range-slider`} class="range-slider"></div>
            </div>

            <div class="range-input">
                <input id={`device-${device.index}-min`} type="range" class="min-range" min="0" max="255" value="0" step="1" oninput={(e) => {
                  device.min = parseInt((e.target as HTMLInputElement)?.value ?? "0");
                  const rangeInput = document.querySelector(`#device-${device.index}-range-slider`) as HTMLInputElement;
                  rangeInput.style.left = `${device.min / 255 * 100}%`;
                }} />
                <input id={`device-${device.index}-max`} type="range" class="max-range" min="0" max="255" value="255" step="1"  oninput={(e) => {
                  device.max = parseInt((e.target as HTMLInputElement)?.value ?? "255");
                  const rangeInput = document.querySelector(`#device-${device.index}-range-slider`) as HTMLInputElement;
                  rangeInput.style.right = `${(255 - device.max) / 255 * 100}%`;
                }} />
            </div>
          </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
