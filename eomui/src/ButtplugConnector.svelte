<script lang="ts">
  import { onMount } from "svelte";
  import * as Buttplug from "buttplug";
  type ButtplugClientDevice = any; // Type from Buttplug library

  interface Props {
    deviceList?: ButtplugClientDevice[];
  }

  let { deviceList = $bindable([]) }: Props = $props();

  let client = new Buttplug.ButtplugClient("EOM Client");

  async function initialize_buttplug() {
    client.addListener("deviceadded", (device: ButtplugClientDevice) => {
      console.log(`Device added: ${device.Name.replaceAll(" ","-")}`, device);
      console.log('Allowed messages:', device.AllowedMessages);
      device.AllowedMessages.forEach((msg: string) => {
        device.AllowedMessages.push(`_${msg}`);
      });
      deviceList = [...deviceList, device];
    });


    client.addListener("deviceremoved", (device: ButtplugClientDevice) => {
      console.log(`Device removed: ${device.Name.replaceAll(" ","-")}`,device);
      deviceList = deviceList.filter(d => d !== device);
    });
    const connector = new Buttplug.ButtplugEmbeddedClientConnector();
    await client.Connect(connector);
  }

  async function connect_to_device() {
    await client.StartScanning();
  }

  onMount(() => {
    initialize_buttplug().catch(err => console.error(err));
  });

  export function handleVibrateChange(device: ButtplugClientDevice, value: number) {
    //yes, I'm extending the buttplug.io device definition
    console.log(`Vibrate change for ${device.Name.replaceAll(" ","-")}: ${value}`);
    const min = (device.MinSpeed ?? 0) / 255.0;
    const max = (device.MaxSpeed ?? 255) / 255.0;
    let speed = value * (max - min) + min;
    if (device.invert) {  //handles unset value as false
      speed = 1.0 - speed;
    }
    device.SendVibrateCmd(speed);
  }
</script>

<div class="buttplug-connector">
  <div style="display: flex;justify-content: space-between; align-items: center">
    <button onclick={connect_to_device} style="max-width: 250px;">Connect to a {#if deviceList.length > 0}another{/if} toy</button>
    {#if deviceList.length === 0}
      <p style="margin-left: 10px;">No devices connected</p>
    {/if}
    <div style="display: flex;align-items: center;">Powered by: <a href="https://buttplug.io " target="_blank"><img src="buttplug_logo.png" alt="Buttplug Logo" style="margin-left:10px; max-height: 40px;" /></a></div>
  </div>
  {#if deviceList.length === 0}
    <p style="font-size: small;">Currently supported brands are: lovense, libo, magic-motion, mysteryvibe, picobong, vibratissimo, wevibe, youcups, cueme, kiiroo, vorze, youou, prettylove, svakom, realov, motorbunny, zalo, sayberx, muse, lelo, aneros, lovehoney, twerkingbutt</p>
    <p>This is a WIP feature. More devices will be added soon.</p>
  {:else}
    <ul>
      {#each deviceList as device}
        <li>
          <div style="display: flex;flex-direction: row;justify-content: space-between;">
            <div>{device.Name}</div>
            <div>
              <select id={device.Name.replaceAll(" ","-") + "-mode"} onchange={async (e) => {
                const mode = (e.target as HTMLSelectElement).value;
                console.log(`Setting mode for ${device.Name.replaceAll(" ","-")} to ${mode}`);
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
              <input type="checkbox" id={device.Name.replaceAll(" ","-") + "-invert"} checked={device.invert} onchange={async (e) => {
                device.invert = (e.target as HTMLInputElement).checked;
              }}/> Invert
            </div>
                <button
                  title="Disconnect toy"
                  style="color: red; float:right; padding: 0 .25em 0 .25em; font-size: 1.25em; background: #444; cursor: pointer; line-height: .05em; display: flex; align-items: center; justify-content: center;"
                  aria-label="Close settings"
                  onclick={() => {
                    device.Disconnect(); //why doesn't this work?  I'll circle back.  Using bp 0.13.2 is already a hack
                    }}
                >
                  &times;
                </button>

          </div>
          {#if device.AllowedMessages.includes("_VibrateCmd") || device.AllowedMessages.includes("VibrateCmd")}
          <div class="device-sliders">
            <input id={device.Name.replaceAll(" ","-") + "-vibrate"} type="range" min="0" max="255" value="0" oninput={(e) => {
              handleVibrateChange(device,(parseInt((e.target as HTMLInputElement)?.value ?? "0") / 255.0));
            }}/>
            <div class="slider">
                <div id={device.Name.replaceAll(" ","-") + "-range-slider"} class="range-slider"></div>
            </div>

            <div class="range-input">
                <input id={device.Name.replaceAll(" ","-") + "-min"} type="range" class="min-range" min="0" max="255" value="0" step="1" oninput={(e) => {
                  device.MinSpeed = parseInt((e.target as HTMLInputElement)?.value ?? "0");
                  const rangeInput = document.querySelector('#' + device.Name.replaceAll(" ","-") + '-range-slider') as HTMLInputElement;
                  rangeInput.style.left = `${device.MinSpeed / 255 * 100}%`;
                }} />
                <input id={device.Name.replaceAll(" ","-") + "-max"} type="range" class="max-range" min="0" max="255" value="255" step="1"  oninput={(e) => {
                  device.MaxSpeed = parseInt((e.target as HTMLInputElement)?.value ?? "255");
                  const rangeInput = document.querySelector('#' + device.Name.replaceAll(" ","-") + '-range-slider') as HTMLInputElement;
                  rangeInput.style.right = `${(255 - device.MaxSpeed) / 255 * 100}%`;
                }} />
            </div>
          </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
