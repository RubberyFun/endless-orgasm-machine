<script lang="ts">
  import { onMount } from "svelte";
  // @ts-ignore - local prebuilt module does not expose complete TS typings for this path
  import { ButtplugWasmClientConnector } from "../buttplug/wasm/buttplug-wasm.mjs";
import { ButtplugClient, ButtplugClientDevice, DeviceOutput, OutputType, InputType, DeviceOutputCommand } from "../../../satvisor/buttplug-js/js/src/index.js";
import {  ButtplugClientDeviceFeature } from "../../../satvisor/buttplug-js/js/src/client/ButtplugClientDeviceFeature.js";
import type { ButtplugMessage } from "../../../satvisor/buttplug-js/js/src/core/Messages.js";
import { BleClient } from "@capacitor-community/bluetooth-le";


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

  async function initialize_buttplug() {
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
