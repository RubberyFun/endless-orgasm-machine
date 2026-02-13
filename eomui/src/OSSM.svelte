<script lang="ts">
  import { BleClient } from '@capacitor-community/bluetooth-le';
  import pkg from '../package.json';

  let isWriting = false;

  interface OSSMcontrol {
    value: number;
    default: number;
    min: number;
    max: number;
    mode: string; // "manual", "pleasure", "arousal", "pressure", "denied" corresponding to EOM states
    inverted?: boolean;  // EOM function: invert the control
    limitMin?: number;  // EOM function: limit slider control
    limitMax?: number;  // EOM function: limit slider control
    description?: string;
  }

  interface OSSMPattern {
    name: string;
    idx: number;
  }

  interface OSSMdevice {
    name: string;
    deviceId: string | null;
    service: string;
    tx: string;
    tx_knob: string;
    rx_state: string;
    rx_patterns: string;
    conn_status: string;
    unpause_speed: number;
    patterns: OSSMPattern[];
    patternDescriptions: string[][];
    strokerMode: boolean;
    controls: Record<string, OSSMcontrol>;
    isWriting: boolean;
    setControl(name: string, value: number): Promise<void>;
    resetControls(): void;
  }


  class OSSMDevice implements OSSMdevice {
    name = $state("");
    //device = $state<BluetoothDevice | null>(null);
    service = "";
    deviceId = $state<string | null>(null);
    rx_state = "";
    rx_patterns = "";
    tx = "";
    tx_knob = "";
    strokerMode = $state(false);
    conn_status = $state("Disconnected");
    patterns = $state<OSSMPattern[]>([]);
    controls = $state<Record<string, OSSMcontrol>>({});
    isWriting = $state(false);
    unpause_speed = 1;
    patternDescriptions = [
      ["Simple Stroke",     "Acceleration, coasting, & deceleration are evenly balanced"],
      ["Teasing Pounding",  "Sensation increases speed in one direction, balanced in the middle"],
      ["Robo Stroke",       "Sensation varies acceleration; from robotic to gradual"],
      ["Half'n'Half",       "Full and half depth strokes alternate; sensation affects speed"],
      ["Deeper",            "Stroke depth increases per cycle; sensation sets count"],
      ["Stop'n'Go",         "Pauses between strokes; sensation adjusts length"],
      ["Insist",            "Modifies length, maintains speed; sensation influences direction"],
      ["JackHammer",        "DANGEROUS WITH SPEED!  Sensation jiggles the stroke as it moves in."],
      ["StrokeNibbler",     "DANGEROUS WITH SPEED!  Sensation jiggles the stroke in both directions"],
      ["Struggle",          "(EXPERIMENTAL!) Sensation slows down the end of the stroke"],
      ["Knot",              "(EXPERIMENTAL!) Sensation pauses the end of the stroke after a slow down"],
      ["Slammin",           "(EXPERIMENTAL!) Sensation slams then pauses the end of the stroke"]
    ];

    getPatternByIdx(patterns: OSSMPattern[], idx: number): OSSMPattern | undefined {
      return patterns.find((pattern) => pattern.idx === idx);
    }

    getPatternIndexByIdx(patterns: OSSMPattern[], idx: number): number {
      return patterns.findIndex((pattern) => pattern.idx === idx);
    }


    constructor() {
      this.service = "522b443a-4f53-534d-0001-420badbabe69";
      this.tx = "522b443a-4f53-534d-1000-420badbabe69";
      this.tx_knob = "522b443a-4f53-534d-1010-420badbabe69";
      this.rx_state = "522b443a-4f53-534d-2000-420badbabe69";
      this.rx_patterns = "522b443a-4f53-534d-3000-420badbabe69";
      this.unpause_speed = 1;
      this.controls = {
        speed: { value: 0, default: 0, min: 0, max: 100, mode: "pleasure", limitMin: 0, limitMax: 100, inverted: false, description: "Adjust how fast it goes back and forth" },
        stroke: { value: 50, default: 50, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false, description: "Adjust the length of each stroke"  },
        depth: { value: 10, default: 10, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false, description: "Adjust how deep the strokes go"  },
        pattern: { value: 0, default: 0, min: 0, max: 6, mode: "manual", limitMin: 0, limitMax: 6, inverted: false, description: "Choose from preset stroke patterns"  },
        sensation: { value: 50, default: 50, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false, description: "Adjust features of the current pattern.  50 = no adjustment"  },
      };
    }

    resetControls(): void {
      this.controls["speed"].value = this.controls["speed"].default;
      this.controls["stroke"].value = this.controls["stroke"].default;
      this.controls["depth"].value = this.controls["depth"].default;
      this.controls["pattern"].value = this.controls["pattern"].default;
      this.controls["sensation"].value = this.controls["sensation"].default;
    }

    async setControl(name: string, value: number, recursiveCommand: boolean = false): Promise<void> {
      console.log(`Setting OSSM control ${name} to value ${value}`);
      if (!this.deviceId) {
        disconnectDevice(this);
        throw new Error("Not connected to Bluetooth device");
      }
      
      if (this.isWriting) {
        return;
      }
  
      try {
        const encoder = new TextEncoder();
        this.isWriting = true;
        let message = ""
        if (name !== "pattern") {
          message = "set:" + name + ":" + value;
        } else {
          //patterns are a special case where we send the idx but also update the pattern control value to the index of the pattern for better UX
          const pattern = $state.snapshot(this.patterns)[value];
          if (pattern) {
            console.log(`Setting pattern to '${pattern.name}' with idx ${pattern.idx}`);
            message = `set:${name}:${pattern.idx}`;
          } else {
            console.warn(`Pattern with idx ${value} not found, sending raw value`);
            message = `set:${name}:${value}`;
          }
        }
        const dataView = new DataView(encoder.encode(message).buffer);
        await BleClient.write(this.deviceId, this.service, this.tx, dataView);
        if (name === "speed" && value === 0) {
          console.log(`Paused device, storing unpause speed ${this.unpause_speed}`, this.controls["speed"].value);
          this.unpause_speed = this.controls["speed"].value;
        }
        this.controls[name].value = value;
        console.log(`Wrote control ${name} with value ${value}`);
      } catch (error) {
        console.error("Failed writing control value:", error);
      } finally {
        this.isWriting = false;
        if (this.strokerMode && !recursiveCommand) {
          if (name === "depth") {
            const derivedStroke = Math.round((value - 50) * 2);
            this.setControl("stroke", derivedStroke, true);
          } else if (name === "stroke") {
            const derivedDepth = Math.round((value / 2) + 50);
            this.setControl("depth", derivedDepth, true);
          }
        }
        if (name === "pattern") {
          // if (this.patterns[value] === "Teasing Pounding") {
            this.setControl("sensation", 50, true);  //lets just always reset the sensation to 50 on pattern change for safety.  
          // }
        }
      }
    }
  }

//   let devices: OSSMdevice[] = $state([
//   ]);
  
  interface Props {
    devices: OSSMdevice[];
    EOMembedded?: boolean;
  }
  
  let { devices = $bindable([]), EOMembedded = false  }: Props = $props();
  
  let connectionError = $state<string | null>(null);

  function disconnectDevice(device: OSSMdevice) {
    devices = devices.filter(d => d.deviceId !== device.deviceId);
    device.deviceId = null;
    device.conn_status = "Disconnected";
    device.resetControls();
  }

  async function connectBluetooth() {
    let newOSSM = new OSSMDevice();
    connectionError = null;
    
    try {
      // Initialize BLE client
      await BleClient.initialize();
      
      newOSSM.conn_status = "Connecting...";
            
      const device = await BleClient.requestDevice({
        namePrefix: "OSSM",
        optionalServices: [newOSSM.service],
      });

      newOSSM.deviceId = device.deviceId;
      newOSSM.name = device.name || "OSSM";
      console.log("Connected to device:", newOSSM.name);
      
      // Connect to device with disconnect callback
      await BleClient.connect(device.deviceId, (deviceId) => {
        console.log(`Device ${deviceId} disconnected`);
        disconnectDevice(newOSSM);
      });

      
      
      newOSSM.conn_status = "Connected";



      // Send startup sequence
      try {
        const encoder = new TextEncoder();
        const goMessage = encoder.encode("go:strokeEngine");
        const goDataView = new DataView(goMessage.buffer);
        await BleClient.write(device.deviceId, newOSSM.service, newOSSM.tx, goDataView);
        
        const falseMessage = encoder.encode("false");
        const falseDataView = new DataView(falseMessage.buffer);
        await BleClient.write(device.deviceId, newOSSM.service, newOSSM.tx_knob, falseDataView);


        console.log("Sent startup sequence");
      } catch (error) {
        console.error("Failed to send startup sequence:", error);
      }

      // Read patterns from rx_patterns characteristic
      try {
        const patternsData = await BleClient.read(device.deviceId, newOSSM.service, newOSSM.rx_patterns);
        const decoder = new TextDecoder();
        const patternsString = decoder.decode(patternsData);
        const patternsObject = JSON.parse(patternsString);
        let indexFallback = 0;
        patternsObject.forEach((pattern: any) => {
          console.log("Pattern:", pattern);
          newOSSM.patterns.push({ name: pattern.name, idx: pattern.idx ?? indexFallback++ });
        });
        newOSSM.controls["pattern"].max = newOSSM.patterns.length - 1;
        newOSSM.controls["pattern"].limitMax = newOSSM.patterns.length - 1;
      } catch (error) {
        console.error("Failed to read patterns:", error);
      }

      // Read initial state from rx_state characteristic
      try {
        const stateData = await BleClient.read(device.deviceId, newOSSM.service, newOSSM.rx_state);
        const decoder = new TextDecoder();
        const stateString = decoder.decode(stateData);
        const stateObject = JSON.parse(stateString);
        console.log("Initial state:", stateObject);
        
        // Update control values from device state
        if (stateObject.speed !== undefined) {
          newOSSM.controls.speed.value = stateObject.speed;
        }
        if (stateObject.stroke !== undefined) {
          newOSSM.controls.stroke.value = stateObject.stroke;
        }
        if (stateObject.depth !== undefined) {
          newOSSM.controls.depth.value = stateObject.depth;
        }
        if (stateObject.pattern !== undefined) {
          newOSSM.controls.pattern.value = stateObject.pattern;
        }
        if (stateObject.sensation !== undefined) {
          newOSSM.controls.sensation.value = stateObject.sensation;
        }
      } catch (error) {
        console.error("Failed to read state:", error);
      }

      devices.push(newOSSM);

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      newOSSM.conn_status = "Connection failed";
      connectionError = error instanceof Error ? error.message : String(error);
    }
  }


</script>

<div class="bluetooth-ossm-control" style="--version: '{pkg.version}';">
  {#if devices.length}
    {#each devices as ossm, deviceIndex}
      <div style="display: flex;flex-direction: row;justify-content: space-between;margin-bottom: 10px; ">

        <div>
          {#if ($state.snapshot(ossm.controls)["speed"].value > 0)} 
            <button class="device-pause" title="Pause" onclick={() => {
                  ossm.setControl("speed", 0);
            }}>
              <div style="line-height: 1.25;">❚❚</div>
            <div style="font-size: xx-small;">Pause</div>
            </button>
          {:else}
            <button class="device-resume" title="Pause" onclick={() => {
                  ossm.setControl("speed", $state.snapshot(ossm.unpause_speed));
            }}>
            ▶
            <div style="font-size: xx-small;">Resume</div>
            </button>
          {/if}
        </div>

        <div>
          <button class="device-disconnect" title="Disconnect" onclick={async () => {
              if (ossm.deviceId) {
                await BleClient.disconnect(ossm.deviceId);
              }
          }}>
            ✕
          <div style="font-size: xx-small; font-weight: normal;">Disconnect</div>
          </button>
        </div>
      </div>

      {#each Object.entries($state.snapshot(ossm.controls)) as control, controlIndex}
        {#if (!(control[0] === "depth" && ossm.strokerMode) && 
              !(control[0] === "sensation" && ossm.patterns[ossm.controls["pattern"].value].name === "Simple Stroke"))}

                <div class="slider-label">
                  {#if (control[0] === "pattern")}
                    Pattern: <span style="font-weight: normal;">{$state.snapshot(ossm.patterns)[control[1].value].name ?? control[1].value}</span>
                    <div class="minMaxText"  style="font-weight: normal;">{ossm.patternDescriptions[control[1].value]?.[1] ?? "(EXPERIMENTAL!) A custom pattern"}</div>
                  {:else}
                    {control[0].charAt(0).toUpperCase() + control[0].slice(1)}: {control[1].value} 
                    <span class="minMaxText">(Min: {control[1].limitMin}, Max: {control[1].limitMax})</span>
                  {/if}
                </div>

                {#if (EOMembedded)}
                <div>
                  <select id={deviceIndex + "-" + control[0] + "-mode"} onchange={async (e) => {
                      const mode = (e.target as HTMLSelectElement).value;
                      console.log(`Setting mode for ${ossm.name} ${control[0]} to ${mode}`);
                      control[1].mode = mode;
                  }}>
                      <option value="manual" selected={control[1].mode === "manual"}>Manual control only</option>
                      <option value="pleasure" selected={control[1].mode === "pleasure"}>Connect to Pleasure</option>
                      <option value="arousal" selected={control[1].mode === "arousal"}>Connect to Arousal</option>
                      <option value="pressure" selected={control[1].mode === "pressure"}>Connect to Pressure</option>
                      <option value="denied" selected={control[1].mode === "denied"}>Connect to Denials</option>
                  </select>
                  </div>
                  <div class="invertedText">
                    Invert:
                      <input type="checkbox" id={deviceIndex + "-" + control[0] + "-invert"} checked={control[1].inverted} onchange={async (e) => {
                          control[1].inverted = (e.target as HTMLInputElement).checked;
                      }}/>
                  </div>
                {/if}
                          <div class="device-sliders" title={control[1].description ?? ""}>

            <div style="display: flex;flex-direction: row;justify-content: space-between" >

            </div>

            <!-- svelte-ignore binding_property_non_reactive -->
            <input 
                id={`control-${deviceIndex}-${control[0]}-slider`} 
                class="main-slider"
                type="range" 
                min={control[1].limitMin ?? control[1].min}
                max={control[1].limitMax ?? control[1].max} 
                value={control[1].value}
                style="background: hsl({controlIndex * (360 / Object.keys(ossm.controls).length)}, 30%, 50%);"
                onpointerdown={(e) => {
                  const input = e.target as HTMLInputElement;
                  const rect = input.getBoundingClientRect();
                  const pointerX = e.clientX - rect.left;
                  const percentage = pointerX / rect.width;
                  const min = parseFloat(input.min);
                  const max = parseFloat(input.max);
                  const pointerValue = percentage * (max - min) + min;
                  // Use the stored control value, not the input value which might already be changed
                  const currentValue = control[1].value;
                  
                  // Prevent jump if pointer is far from current thumb position
                  const threshold = (max - min) * 0.1;
                  if (control[0] !== "pattern" && Math.abs(pointerValue - currentValue) > threshold) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                onpointerup={(e) => {
                  const input = e.target as HTMLInputElement;
                  delete input.dataset.dragging;
                }}
                ontouchend={(e) => {
                  const input = e.target as HTMLInputElement;
                  delete input.dataset.dragging;
                }}
                oninput={(e) => {
                  const input = e.target as HTMLInputElement;
                  const newValue = parseInt(input.value);
                  
                  // For touchscreens: prevent jump if not actively dragging and jump is too large
                  if (control[0] !== "pattern" && !input.dataset.dragging && 
                      Math.abs(newValue - control[1].value) > (control[1].limitMax! - control[1].limitMin!) * 0.1) {
                    input.value = control[1].value.toString();
                    return;
                  }
                  
                  // Mark that we're now dragging after first valid input
                  input.dataset.dragging = "true";
                  
                  ossm.setControl(control[0], newValue);
                }}/>
            {#if control[0] === "pattern"}
              <div class="pattern-numbers">
                {#each Array.from({ length: control[1].max - control[1].min + 1 }, (_, i) => i + control[1].min) as num}
                  <span class="pattern-number" style="left: {(num - control[1].min) / (control[1].max - control[1].min) * 100}%;">{num + 1}</span>
                {/each}
              </div>
            {:else}
              <div class="slider">
                  <div id={`control-${deviceIndex}-${control[0]}-range-slider`} class="range-slider"></div>
              </div>
              <div class="range-input">
                  <input id={`control-${deviceIndex}-${control[0]}-min`} type="range" class="min-range"  step="1" 
                    min={control[1].min} 
                    max={control[1].max} 
                    value={control[1].limitMin}
                    oninput={(e) => {
                      const originalValue = control[1].limitMin ?? control[1].min;
                      control[1].limitMin = parseInt((e.target as HTMLInputElement)?.value ?? "0");
                      const rangeInput = document.querySelector(`#control-${deviceIndex}-${control[0]}-range-slider`) as HTMLInputElement;
                      rangeInput.style.left = `${control[1].limitMin / (control[1].max) * 100}%`;
                      const newValue = ((control[1].value - originalValue) / ((control[1].limitMax ?? control[1].max ) - originalValue)) *
                        ((control[1].limitMax ?? control[1].max) - (control[1].limitMin ?? control[1].min)) + (control[1].limitMin ?? control[1].min);
                      ossm.setControl(control[0], Math.round(newValue));
                    }} 
                  />
                  <input id={`control-${deviceIndex}-${control[0]}-max`} type="range" class="max-range"  step="1" 
                  min={control[1].min} 
                  max={control[1].max} 
                  value={control[1].limitMax} 
                  oninput={(e) => {
                      const originalValue = control[1].limitMax ?? control[1].max;
                      control[1].limitMax = parseInt((e.target as HTMLInputElement)?.value ?? "255");
                      const rangeInput = document.querySelector(`#control-${deviceIndex}-${control[0]}-range-slider`) as HTMLInputElement;
                      if (rangeInput) {
                        rangeInput.style.right = `${(control[1].max - (control[1].limitMax ?? control[1].max)) / control[1].max * 100}%`;
                      }
                      const newValue = ((control[1].value - (control[1].limitMin ?? control[1].min)) / (originalValue - (control[1].limitMin ?? control[1].min))) *
                        ((control[1].limitMax ?? control[1].max) - (control[1].limitMin ?? control[1].min)) + (control[1].limitMin ?? control[1].min);
                      ossm.setControl(control[0], Math.round(newValue));
                    }} 
                  />
              </div>
            {/if}
          </div>
        {/if}
      {/each}

      <div style="display: flex;flex-direction: row; justify-content: center; margin-bottom: 0px; ">


        <div style="font-size: small; margin-top: 5px;color: #666;">
          <input type="checkbox" id="stroker mode" checked={ossm.strokerMode} onchange={async (e) => {
              const strokerMode = (e.target as HTMLInputElement).checked;
              console.log(`Setting OSSM stroker mode to ${strokerMode}`);
              ossm.strokerMode = strokerMode;
              if (strokerMode) {
                //adjust stroke to match depth
                const derivedDepth = Math.round((ossm.controls["stroke"].value / 2) + 50);
                ossm.setControl("depth", derivedDepth);
              } else {
                ossm.setControl("depth", 10); //back to default for safety
              }
          }}/> Stroker Mode (keeps limits centered for a piston)
        </div>

      </div>

    {/each}
    {:else}
    <div  style="font-size: small;">
      <p>This supports <a target="_blank" href="https://www.researchanddesire.com/pages/ossm">OSSM devices</a> with a stock firmware from 2026 or newer.</p>
      <p>If your OSSM firmware is older or custom you can easily upgrade it using <a href="https://dashboard.researchanddesire.com/app/tools/web-flasher">their web flashing tool</a>.</p>
      {#if (!EOMembedded)}
        <p>Coded with love and hedonism by <a href="http://rubberyfun.com/">Claus Macher</a>.  Main repo <a href="https://github.com/rubberyfun/OSSM-Possum">is posted here</a>.  Have fun!</p>
      {/if}
      <p></p>
    </div>
 {/if}
 {#if (EOMembedded || devices.length == 0)}
   <div>
    <button onclick={() => connectBluetooth()}>
      Connect to an{#if devices.length}other{:else}{/if} OSSM device
    </button>
    
  </div>
  {/if}
  
  {#if connectionError}
    <div style="color: #c00; font-weight: bold; margin-top: 10px; padding: 10px; background-color: #fee; border: 1px solid #faa; border-radius: 4px;">
      ⚠ Connection error: {connectionError}
      <button style="margin-left: 10px; font-size: small;" onclick={() => {
        connectionError = null;
      }}>Dismiss</button>
    </div>
  {/if}

</div>

<style>
  .bluetooth-ossm-control {
    margin: auto;
    width: 90%;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
    margin-top:37px;
    margin-bottom: 5%;
        position: relative;

      &::before {
      content: var(--version);
      color: #666;
      position: absolute;
      top: -46px;
      left: 40%;
      transform: translateX(-50%);
      width: 30%;
      height: 50px;
      background-image: url('/possum_head.svg');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      text-indent: 150px;
    }

      &::after {
      content: '';
      position: absolute;
      bottom: -39px;
      left: 65%;
      transform: translateX(-50%);
      width: 40%;
      height: 60px;
      background-image: url('/possum_tail.svg');
      background-size: 100% 60px;
      background-repeat: no-repeat;
      background-position: center;
    }

        /* larger screens */

    .slider-label {
      font-weight: bold;
      margin-bottom: 1px;
      white-space: nowrap;
    }
    .minMaxText {
      font-size: large;
      color: #ccc;
    }
    .invertedText {
      white-space: nowrap;
      font-size: small;
    }

    .device-disconnect {  
      color: #a99;
      background-color: transparent;
      font-weight: bold;
      float: right; 
      width: 4.8rem;
      text-align: center;
    }

    .device-pause {
      color: rgb(153, 0, 0);
      background-color: rgb(248, 188, 188);
      width: 4rem;
    }

    .device-resume {
      color: rgb(7, 186, 72);
      background-color: rgb(228, 248, 188);
      width: 4rem;
    }


    .device-sliders {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
        gap: 0.5rem;
        margin-top: -.5rem;

        /* Remove Arrows/Spinners */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Main slider track styling */
        input[type="range"].main-slider {
            -webkit-appearance: none;
            appearance: none;
            background: #3a6dc1;
            cursor: pointer;
            height: 40px;
            border-radius: 20px;
            outline: none;
        }

        input[type="range"].main-slider::-webkit-slider-track {
            background: #3a6dc1;
            height: 40px;
            border-radius: 20px;
            border: none;
        }

        input[type="range"].main-slider::-moz-range-track {
            background: #3a6dc1;
            height: 40px;
            border-radius: 20px;
        }

        input[type="range"].main-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 40px;
            width: 40px;
            border-radius: 20px;
            background: #aaccff;
            cursor: pointer;
            margin-top: 0;
        }

        input[type="range"].main-slider::-moz-range-thumb {
            height: 40px;
            width: 40px;
            border-radius: 20px;
            background: #aaccff;
            cursor: pointer;
            border: none;
        }

        .slider {
        width: 100%;
        height: 6px;
        position: relative;
        background: #333;
        border-radius: 5px;
        }
        .slider .range-slider {
            height: 100%;
            left: 0%;
            right: 0%;
            position: absolute;
            border-radius: 20px;
            background: #666;
        }    
        .range-input {
        position: relative;
        }

        .range-input input {
            position: absolute;
            width: 100%;
            height: 5px;
            background: none;
            top: -15px;
            pointer-events: none;
            cursor: pointer;
            -webkit-appearance: none;
        }


        /* Styles for the range thumb in WebKit browsers */
        input[type="range"]::-webkit-slider-thumb {
            height: 40px;
            width: 40px;
            border-radius: 20px;
            background: #333;
            pointer-events: auto;
            -webkit-appearance: none;
            position: relative;
        }

        /* Firefox thumb */
        input[type="range"]::-moz-range-thumb {
            height: 40px;
            width: 40px;
            border-radius: 20px;
            background: #333;
            pointer-events: auto;
            border: none;
        }

        /* Min range thumb - shows "min" text */
        input[type="range"].min-range::-webkit-slider-thumb {
            height: 18px;
            background: #444 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="lightgray" text-anchor="middle">min</text></svg>') center/contain no-repeat;
        }

        input[type="range"].min-range::-moz-range-thumb {
            height: 18px;
            background: #444 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="lightgray" text-anchor="middle">min</text></svg>') center/contain no-repeat;
        }

        /* Max range thumb - shows "max" text */
        input[type="range"].max-range::-webkit-slider-thumb {
            height: 18px;
            background: #444 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="lightgray" text-anchor="middle">max</text></svg>') center/contain no-repeat;
        }

        input[type="range"].max-range::-moz-range-thumb {
            height: 18px;
            background: #444 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="lightgray" text-anchor="middle">max</text></svg>') center/contain no-repeat;
        }

        /* Pattern numbers overlay */
        .pattern-numbers {
            position: relative;
            width: calc(100% - 40px);
            height: 20px;
            margin-left: 20px;
            margin-top: -38px;
            margin-bottom: 30px;
            z-index: 10;
            pointer-events: none;
        }

        .pattern-number {
            position: absolute;
            transform: translateX(-50%);
            font-size: 11px;
            color: #aaa;
            font-weight: bold;
            pointer-events: none;
            user-select: none;
        }
    }

    @media screen and (max-width: 800px) {
      &::after {
              bottom: -36px;
      }
      .minMaxText {
        font-size: small;
      }
      .slider-label {
        font-weight: bold;
        font-size: small;
        margin-bottom: 0px;
      }

    }

    /* specific styles for mobile and smaller screens */
    @media screen and (max-width: 500px) {
      &::after {
              bottom: -34px;
      }

      .slider-label {
        font-size: x-small;
        margin-bottom: 0px;
      }

      .minMaxText {
        font-size: xx-small;
      }
      .invertedText {
        white-space: nowrap;
        font-size: xx-small;
      }

        .device-sliders {
          margin-bottom: 0px;
          gap: 0.5rem;
        }
    }

}
</style>
