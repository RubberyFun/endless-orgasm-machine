<script lang="ts">
  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    };
  }

  interface RequestDeviceOptions {
    filters: Array<{ services: number[] }>;
  }

  interface BluetoothDevice {
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(event: string, handler: () => void): void;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: number | string): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
  }

  interface BluetoothRemoteGATTService {
    uuid: string;
    getCharacteristic(characteristic: number | string): Promise<BluetoothRemoteGATTCharacteristic>;
    getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    uuid: string;
    writeValue(value: BufferSource): Promise<void>;
  }

  let isWriting = false;

  interface OSSMcontrol {
    value: number;
    min: number;
    max: number;
    mode: string; // "manual", "pleasure", "arousal", "pressure", "denied" corresponding to EOM states
    inverted?: boolean;  // EOM function: invert the control
    sliderElement?: HTMLInputElement;
    limitMin?: number;  // EOM function: limit slider control
    limitMax?: number;  // EOM function: limit slider control
  }

  interface OSSMdevice {
    name: string;
    device: BluetoothDevice | null;
    service: string;
    tx: string;
    tx_char: BluetoothRemoteGATTCharacteristic | null;
    tx_knob: string;
    tx_knob_char: BluetoothRemoteGATTCharacteristic | null;
    rx_state: string;
    rx_patterns: string;
    conn_status: string;
    unpause_speed: number;
    patterns: string[];
    controls: Record<string, OSSMcontrol>;
    isWriting: boolean;
    setControl(name: string, value: number): Promise<void>;
  }

  class OSSMDevice implements OSSMdevice {
    name = $state("");
    device = $state<BluetoothDevice | null>(null);
    service = "";
    tx = "";
    tx_char = $state<BluetoothRemoteGATTCharacteristic | null>(null);
    tx_knob = "";
    tx_knob_char = $state<BluetoothRemoteGATTCharacteristic | null>(null);
    rx_state = "";
    rx_patterns = "";
    conn_status = $state("Disconnected");
    patterns = $state<string[]>([]);
    controls = $state<Record<string, OSSMcontrol>>({});
    isWriting = $state(false);
    unpause_speed = 1;

    constructor() {
      this.service = "522b443a-4f53-534d-0001-420badbabe69";
      this.tx = "522b443a-4f53-534d-1000-420badbabe69";
      this.tx_knob = "522b443a-4f53-534d-1010-420badbabe69";
      this.rx_state = "522b443a-4f53-534d-2000-420badbabe69";
      this.rx_patterns = "522b443a-4f53-534d-3000-420badbabe69";
      this.unpause_speed = 1;
      this.controls = {
        speed: { value: 0, min: 0, max: 100, mode: "pleasure", limitMin: 0, limitMax: 100, inverted: false },
        stroke: { value: 50, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false  },
        depth: { value: 10, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false  },
        sensation: { value: 0, min: 0, max: 100, mode: "manual", limitMin: 0, limitMax: 100, inverted: false  },
        pattern: { value: 0, min: 0, max: 6, mode: "manual", limitMin: 0, limitMax: 6, inverted: false  },
      };
    }

    async setControl(name: string, value: number) {
      console.log(`Setting OSSM control ${name} to value ${value}`);
      if (!this.tx_char) {
        throw new Error("Not connected to Bluetooth device");
      }
      
      if (this.isWriting) {
        return;
      }
  
      try {
        const encoder = new TextEncoder();
        this.isWriting = true;
        await this.tx_char.writeValue(encoder.encode("set:" + name + ":" + value));
        if (name === "speed" && value == 0) {
          this.unpause_speed = this.controls["speed"].value;
          console.log(`Paused device, storing unpause speed ${this.unpause_speed}`, this.controls["speed"].value);
        }
        this.controls[name].value = value;
        console.log(`Wrote control ${name} with value ${value}`);
      } catch (error) {
        console.error("Failed writing control value:", error);
      } finally {
        this.isWriting = false;
      }
    }
  }

//   let devices: OSSMdevice[] = $state([
//   ]);
  
  interface Props {
    devices: OSSMdevice[];
  }
  
  let { devices = $bindable([]) }: Props = $props();

  async function connectBluetooth() {
    let newOSSM = new OSSMDevice();
    
    try {
      newOSSM.conn_status = "Connecting...";
            
      newOSSM.device = await (navigator as any).bluetooth.requestDevice({
        filters: [
            { namePrefix: "OSSM" }

        ],
        optionalServices: [newOSSM.service],
      });

      if (!newOSSM.device?.gatt) {
        throw new Error("GATT not available");
      }

      newOSSM.name = (newOSSM.device as any).name as string;
      console.log("Connected to device:", newOSSM.name);
      

      // Connect to GATT server
      const server = await newOSSM.device.gatt.connect();
      newOSSM.conn_status = "Getting service...";

      // Get the specific service for this device
      const service = await server.getPrimaryService(newOSSM.service);
      console.log("Got service:", service.uuid);
      
      // Get the TX characteristic
      newOSSM.tx_char = await service.getCharacteristic(newOSSM.tx);
      newOSSM.tx_knob_char = await service.getCharacteristic(newOSSM.tx_knob);
      console.log("Got characteristic:", newOSSM.tx_char.uuid);
      
      newOSSM.conn_status = "Connected";


        try {
          const encoder = new TextEncoder();
          await newOSSM.tx_char.writeValue(encoder.encode("go:strokeEngine"));
          await newOSSM.tx_knob_char.writeValue(encoder.encode("false"));
          console.log("Sent startup sequence");
        } catch (error) {
          console.error("Failed to send startup sequence:", error);
        }

      // Handle disconnect
      const disconnectHandler = () => {
        devices = devices.filter(d => d.device !== newOSSM.device);
        newOSSM.tx_char = null;
        newOSSM.tx_knob_char = null;
        newOSSM.device = null;
      };
      newOSSM.device.addEventListener('gattserverdisconnected', disconnectHandler);
      devices.push(newOSSM);

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
    }
  }


</script>

<div class="bluetooth-ossm-control">
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
                <button class="device-disconnect" title="Disconnect" onclick={() => {
                    ossm.device?.gatt?.disconnect();
                }}>
                  ✕
                <div style="font-size: xx-small; font-weight: normal;">Disconnect</div>
                </button>
              </div>
            </div>

        {#each Object.entries(ossm.controls) as control, controlIndex}
        <div class="device-sliders">
          <div style="display: flex;flex-direction: row;justify-content: space-between;">

              <div style="font-weight: bold; margin-bottom: 1px; white-space: nowrap;">
                {control[0].charAt(0).toUpperCase() + control[0].slice(1)}: {control[1].value} 
                <span class="minMaxText">(Min: {control[1].limitMin}, Max: {control[1].limitMax})</span>
              </div>

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
              bind:this={control[1].sliderElement} oninput={(e) => {
                //debounce this
                const newValue = parseInt((e.target as HTMLInputElement)?.value ?? "0");
                ossm.setControl(
                  control[0], 
                  parseInt((e.target as HTMLInputElement)?.value ?? "0")
                  //Math.round((newValue - control[1].min) / (control[1].max - control[1].min) * ((control[1].limitMax ?? control[1].max) - (control[1].limitMin ?? control[1].min)) + (control[1].limitMin ?? control[1].min))
                );
              }}/>
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
                  const newSpeed = ((control[1].value - originalValue) / ((control[1].limitMax ?? control[1].max ) - originalValue)) *
                    ((control[1].limitMax ?? control[1].max) - (control[1].limitMin ?? control[1].min)) + (control[1].limitMin ?? control[1].min);
                  ossm.setControl(control[0], Math.round(newSpeed));
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
                  const newSpeed = ((control[1].value - (control[1].limitMin ?? control[1].min)) / ((control[1].limitMax ?? control[1].max ) - originalValue)) *
                    ((control[1].limitMax ?? control[1].max) - (control[1].limitMin ?? control[1].min)) + (control[1].limitMin ?? control[1].min);
                  ossm.setControl(control[0], Math.round(newSpeed));
                }} 
              />
          </div>


        </div>
        {/each}
    {/each}
    {:else}
    <div  style="font-size: small;">
      <p>This supports <a target="_blank" href="https://www.researchanddesire.com/pages/ossm">OSSM devices</a> with a stock firmware from 2026 or newer.</p><p>If your OSSM firmware is older you can easily upgrade it using <a href="https://dashboard.researchanddesire.com/app/tools/web-flasher">their web flashing tool</a>.</p>
    </div>
 {/if}
   <div>
    <button onclick={() => connectBluetooth()}>
      Connect to an{#if devices.length}other{:else}{/if} OSSM device
    </button>
  </div>

</div>

<style>
  .bluetooth-ossm-control {
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid #ccc;

    /* specific styles for mobile and smaller screens */
    @media screen and (max-width: 600px) {
      .minMaxText {
        display: none;
      }
      .invertedText {
        white-space: nowrap;
        font-size: xx-small;
      }
    }

    /* larger screens */
    .minMaxText {
      font-size: small;
      color: #ccc;
    }
    .invertedText {
      white-space: nowrap;
      font-size: small;
    }

    /* end larger screens */
    .device-disconnect {  
      color: #900;
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

    .ossm-status.connected {
      color: #22c55e;
      font-weight: 600;
    }

    .device-sliders {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
        gap: 0.5rem;

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
        background: #444;
        border-radius: 5px;
        }
        .slider .range-slider {
            height: 100%;
            left: 0%;
            right: 0%;
            position: absolute;
            border-radius: 20px;
            background: #99c8ff;
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
            background: #555;
            pointer-events: auto;
            -webkit-appearance: none;
            position: relative;
        }

        /* Firefox thumb */
        input[type="range"]::-moz-range-thumb {
            height: 40px;
            width: 40px;
            border-radius: 20px;
            background: #555;
            pointer-events: auto;
            border: none;
        }

        /* Min range thumb - shows "min" text */
        input[type="range"].min-range::-webkit-slider-thumb {
            height: 18px;
            background: #555 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="white" text-anchor="middle">min</text></svg>') center/contain no-repeat;
        }

        input[type="range"].min-range::-moz-range-thumb {
            height: 18px;
            background: #555 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="white" text-anchor="middle">min</text></svg>') center/contain no-repeat;
        }

        /* Max range thumb - shows "max" text */
        input[type="range"].max-range::-webkit-slider-thumb {
            height: 18px;
            background: #555 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="white" text-anchor="middle">max</text></svg>') center/contain no-repeat;
        }

        input[type="range"].max-range::-moz-range-thumb {
            height: 18px;
            background: #555 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="18"><text x="50%" y="13" font-family="Arial" font-size="10" fill="white" text-anchor="middle">max</text></svg>') center/contain no-repeat;
        }
    }
}
</style>
