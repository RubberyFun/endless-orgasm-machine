<script lang="ts">
  import { BleClient } from '@capacitor-community/bluetooth-le';

  let BTLEDdeviceId: string | null = $state(null);
  let deviceConfig: LEDdevice | undefined = $state(undefined);
  let isWriting = false;

  interface Props {
    BTLEDconnected?: boolean;
  }

  interface LEDdevice {
    name: string;
    prefix: string;
    service: string;
    tx: string;
    keepalive?: string;
    startup?: string;
  }

  let lastRBGValues: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 };

  const devices: LEDdevice[] = [
    { name: "LotusLampX", prefix: "ELK-", service: "0000fff0-0000-1000-8000-00805f9b34fb", tx: "0000fff3-0000-1000-8000-00805f9b34fb" },
    { name: "Govee", prefix: "Govee_H", service: "00010203-0405-0607-0809-0a0b0c0d1910", tx: "00010203-0405-0607-0809-0a0b0c0d2b11", keepalive: "aa010000000000000000000000000000000000ab", startup: "3301010000000000000000000000000000000033" }
  ];
  
  let { BTLEDconnected = $bindable(false) }: Props = $props();
  let BTLEDstatus = $state("No lights connected");
  let keepAliveInterval: NodeJS.Timeout | null = null;

  async function connectBluetooth() {
    try {
      BTLEDstatus = "Connecting...";
      
      // Initialize BLE client
      await BleClient.initialize();
      
      // Request device with multiple name prefixes
      const device = await BleClient.requestDevice({
        namePrefix: devices[0].prefix, // Start with first prefix
        optionalServices: devices.map(d => d.service),
      });

      BTLEDdeviceId = device.deviceId;
      const deviceName = device.name || "";
      console.log("Connected to device:", deviceName);
      
      // Determine brand from device name
      deviceConfig = devices.find(d => deviceName?.startsWith(d.prefix));
      if (!deviceConfig) {
        throw new Error("Unknown device type");
      }

      console.log("Detected brand:", deviceConfig.name);

      // Connect to device with disconnect callback and timeout
      await BleClient.connect(
        device.deviceId, 
        (deviceId) => {
          console.log(`Device ${deviceId} disconnected`);
          BTLEDconnected = false;
          BTLEDstatus = "No lights connected";
          BTLEDdeviceId = null;
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
          }
        },
        { timeout: 15000 } // 15 second timeout
      );
      
      console.log("Connected successfully");
      BTLEDconnected = true;
      BTLEDstatus = "Connected";

      console.log(deviceConfig.keepalive);
      if (deviceConfig.keepalive) {
        console.log("Starting keepalive interval");
        keepAliveInterval = setInterval(async () => {
          if (BTLEDconnected && BTLEDdeviceId) {
            const keepaliveData = new Uint8Array(deviceConfig!.keepalive!.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            try {
              const dataView = new DataView(keepaliveData.buffer);
              await BleClient.writeWithoutResponse(BTLEDdeviceId, deviceConfig!.service, deviceConfig!.tx, dataView);
              console.log("Sent keepalive");
            } catch (error) {
              console.error("Failed to send keepalive:", error);
            }
          } else {
            console.log("Not connected, skipping keepalive");
            clearInterval(keepAliveInterval!);
            keepAliveInterval = null;
          }
        }, 2000);  // Send keepalive every 2 seconds
      }

      if (deviceConfig.startup) {
        console.log("Sending startup sequence");
        const startupData = new Uint8Array(deviceConfig!.startup!.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        try {
          const dataView = new DataView(startupData.buffer);
          await BleClient.writeWithoutResponse(device.deviceId, deviceConfig.service, deviceConfig.tx, dataView);
          console.log("Sent startup sequence");
        } catch (error) {
          console.error("Failed to send startup sequence:", error);
        }
      }

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      BTLEDstatus = `Error: ${error instanceof Error ? error.message : String(error)}`;
      BTLEDconnected = false;
      BTLEDdeviceId = null;
    }
  }

  async function disconnect() {
    if (BTLEDdeviceId) {
      try {
        await BleClient.disconnect(BTLEDdeviceId);
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    BTLEDdeviceId = null;
    BTLEDconnected = false;
    if (keepAliveInterval) {
      console.log("Clearing keepalive interval");
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    BTLEDstatus = "No lights connected";
  }

  function RGBdata(brand: string | null, r: number, g: number, b: number): Uint8Array<ArrayBuffer> {
    if (brand === "LotusLampX") {
      return new Uint8Array([0x7E, 0x07, 0x05, 0x03, r, g, b, 0x10, 0xEF]);
    } else if (brand === "Govee") {
      const XOR = (0x33 ^ 0x05 ^ 0x02 ^ r ^ g ^ b) && 0xFF // ^ 0xFF ^ 0xAE ^ 0x54);
      const data = new Uint8Array([0x33, 0x05, 0x02, r, g, b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, XOR]);
      return data;
    } else {
      throw new Error(`Unsupported brand: ${brand}`);
    }
  }

  export async function writeRGB(r: number, g: number, b: number) {
    if (!BTLEDdeviceId || !deviceConfig) {
      throw new Error("Not connected to Bluetooth device");
    }
    
    if (isWriting) {
      //console.log("GATT write already in progress, skipping");
      return;
    }

    if (lastRBGValues.r === r && lastRBGValues.g === g && lastRBGValues.b === b) {
      //console.log("RGB values unchanged, skipping write",r,g,b,lastRBGValues);
      return;
    }
    lastRBGValues = { r, g, b };
    
    console.log(`Preparing to write RGB: ${r}, ${g}, ${b}`);


    // Ensure values are in 0-255 range
    r = Math.max(0, Math.min(255, Math.floor(r)));
    g = Math.max(0, Math.min(255, Math.floor(g)));
    b = Math.max(0, Math.min(255, Math.floor(b)));

    let data: Uint8Array<ArrayBuffer> = RGBdata(deviceConfig?.name || null, r, g, b);
      
    isWriting = true;
    console.log(`Writing RGB to ${deviceConfig?.name || "unknown device"}: ${r}, ${g}, ${b}: `, data);
    try {
      const dataView = new DataView(data.buffer);
      await BleClient.writeWithoutResponse(BTLEDdeviceId, deviceConfig.service, deviceConfig.tx, dataView);
    } catch (error) {
      console.error("Failed writing RGB value:", error);
      throw error;
    } finally {
      isWriting = false;
    }
  }
</script>

<div class="bluetooth-led-control">
  <div>
    <button onclick={() => BTLEDconnected ? disconnect() : connectBluetooth()}>
      {BTLEDconnected ? 'Disconnect' : 'Connect to a light'}
    </button>
    <span class={"bluetooth-led-status" + (BTLEDconnected ? ' connected' : '')}>{BTLEDstatus}</span>
  </div>
  {#if !BTLEDconnected}
    <p style="font-size: small;">Currently this only supports off-brand lights using the LotusLampX app <a target="_blank" href="https://www.amazon.com/dp/B0CCBH8R6K">like this strip.</a></p>
  {/if}
</div>

<style>
  .bluetooth-led-control {
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid #ccc;

    .bluetooth-led-status {
      color: #666;
    }

    .bluetooth-led-status.connected {
      color: #22c55e;
      font-weight: 600;
    }
  }

</style>
