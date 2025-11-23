<script lang="ts">
  import { onMount } from "svelte";
  import type { ButtplugClientDevice } from "../buttplug/client/ButtplugClientDevice.d.ts";
  import type { ButtplugWasmClientConnector } from "../buttplug/wasm/index.d.ts";
  // @ts-ignore
  import { ButtplugWasmClientConnector as IButtplugWasmClientConnector } from "../buttplug/wasm/buttplug-wasm.mjs";
  import { ButtplugClient } from "../buttplug/buttplug.mjs";


  // Extend the ButtplugClientDevice type with custom properties

  export interface EOMButtplugClientDeviceControl {
    type: "vibrate" | "oscillate" | "linear";
    attributes: any[];
    index: number;
    descriptor: string;
    
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

  async function initialize_buttplug() {
    client.addListener("deviceadded", (device: ButtplugClientDevice) => {
      console.log(`Device added: ${device.name}`, device);
      let eomDevice = device as EOMButtplugClientDevice;
      eomDevice.controls = initDeviceControls(eomDevice);
      deviceList = [...deviceList, eomDevice];
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

  export function initDeviceControls(device: ButtplugClientDevice): EOMButtplugClientDeviceControl[] {
    const controls: EOMButtplugClientDeviceControl[] = [];
    
    if (device.vibrateAttributes) {
      device.vibrateAttributes.forEach((attr, idx) => {
        controls.push({
          type: 'vibrate', 
          attributes: [], 
          index: idx, 
          descriptor: attr.FeatureDescriptor || `Vibrate ${idx + 1}`,
          mode: idx === 0 ? "pleasure" : "manual",
          invert: false,
          min: 0,
          max: 255,
          sliderElement: undefined
        });
      });
    }
    if (device.oscillateAttributes) {
      device.oscillateAttributes.forEach((attr, idx) => {
        controls.push({
          type: 'oscillate', 
          attributes: [], 
          index: idx, 
          descriptor: attr.FeatureDescriptor || `Oscillate ${idx + 1}`,
          mode: idx === 0 ? "pleasure" : "manual",
          invert: false,
          min: 0,
          max: 255,
          sliderElement: undefined
        });
      });
    }
    if (device.linearAttributes) {
      device.linearAttributes.forEach((attr, idx) => {
        controls.push({
          type: 'linear', 
          attributes: [], 
          index: idx, 
          descriptor: attr.FeatureDescriptor || `Linear ${idx + 1}`,
          mode: idx === 0 ? "pleasure" : "manual",
          invert: false,
          min: 0,
          max: 255,
          sliderElement: undefined
        });
      });
    }
    
    return controls;
  }

  export function handleDeviceChange(device: ButtplugClientDevice, control: EOMButtplugClientDeviceControl, value: number) {
    const min = (control.min ?? 0) / 255.0;
    const max = (control.max ?? 255) / 255.0;
    let normalizedValue = value * (max - min) + min;
    if (control.invert) {  //handles unset value as false
      normalizedValue = 1.0 - normalizedValue;  
    }

    console.log(`Setting device ${device.name} (${control.type}) feature ${control.index} to normalizedValue ${normalizedValue} (raw value: ${value}, min: ${min}, max: ${max}, invert: ${control.invert})`);
    if (control.type === "oscillate") {
      device.oscillate(normalizedValue, control.index);
    }
    if (control.type === "vibrate") {
      device.vibrate(normalizedValue);
    }
    if (control.type === "linear") {
      device.linear(normalizedValue);
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
          {#if 
            (device.vibrateAttributes && device.vibrateAttributes.length > 0) || 
            (device.linearAttributes && device.linearAttributes.length > 0) || 
            (device.oscillateAttributes && device.oscillateAttributes.length > 0)
          }
          {#each device.controls as control}
          <div class="device-sliders">
            <div style="display: flex;flex-direction: row;justify-content: space-between;">

              <div style="font-weight: bold; margin-bottom: 5px;">
                {control.descriptor}
              </div>

              <div>
                <select id={device.index + "-" + control.type + "-" + control.index + "-mode"} onchange={async (e) => {
                  const mode = (e.target as HTMLSelectElement).value;
                  console.log(`Setting mode for ${device.name} ${control.descriptor} to ${mode}`);
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
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
