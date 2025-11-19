<script lang="ts">
  // Web Bluetooth API types
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
    getPrimaryService(service: number): Promise<BluetoothRemoteGATTService>;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: number): Promise<BluetoothRemoteGATTCharacteristic>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    writeValue(value: BufferSource): Promise<void>;
  }

  let BTLEDdevice: BluetoothDevice | null = $state(null);
  let BTLEDcharacteristic: BluetoothRemoteGATTCharacteristic | null = $state(null);
  
  interface Props {
    BTLEDconnected?: boolean;
  }
  
  let { BTLEDconnected = $bindable(false) }: Props = $props();
  let BTLEDstatus = $state("Disconnected");

  async function connectBluetooth() {
    try {
      BTLEDstatus = "Connecting...";
      
      // Request device with FFF0 service
      BTLEDdevice = await (navigator as any).bluetooth.requestDevice({
        optionalServices: [0xFFF0],
        filters: [{ 
          namePrefix: "ELK-",
        }]
      });

      if (!BTLEDdevice?.gatt) {
        throw new Error("GATT not available");
      }

      // Connect to GATT server
      const server = await BTLEDdevice.gatt.connect();
      BTLEDstatus = "Getting service...";

      // Get the FFF0 service
      const service = await server.getPrimaryService(0xFFF0);
      
      // Get the FFF3 characteristic
      BTLEDcharacteristic = await service.getCharacteristic(0xFFF3);
      
      BTLEDconnected = true;
      BTLEDstatus = "Connected";

      // Handle disconnect
      BTLEDdevice.addEventListener('gattserverdisconnected', () => {
        BTLEDconnected = false;
        BTLEDstatus = "Disconnected";
        BTLEDcharacteristic = null;
      });

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      BTLEDstatus = `Error: ${error instanceof Error ? error.message : String(error)}`;
      BTLEDconnected = false;
      BTLEDcharacteristic = null;
    }
  }

  async function disconnect() {
    if (BTLEDdevice?.gatt?.connected) {
      BTLEDdevice.gatt.disconnect();
    }
    BTLEDdevice = null;
    BTLEDcharacteristic = null;
    BTLEDconnected = false;
    BTLEDstatus = "Disconnected";
  }

  export async function writeRGB(r: number, g: number, b: number) {
    if (!BTLEDcharacteristic) {
      throw new Error("Not connected to Bluetooth device");
    }

    // Ensure values are in 0-255 range
    r = Math.max(0, Math.min(255, Math.floor(r)));
    g = Math.max(0, Math.min(255, Math.floor(g)));
    b = Math.max(0, Math.min(255, Math.floor(b)));

    // Build the command: 7E 07 05 03 RR GG BB 10 EF
    const data = new Uint8Array([0x7E, 0x07, 0x05, 0x03, r, g, b, 0x10, 0xEF]);
    
    try {
      await BTLEDcharacteristic.writeValue(data);
      console.log(`Wrote RGB: ${r}, ${g}, ${b}`);
    } catch (error) {
      console.error("Failed to write RGB value:", error);
      throw error;
    }
  }
</script>

<div class="bluetooth-led-control">
  <div>
    
    <button onclick={() => BTLEDconnected ? disconnect() : connectBluetooth()}>
      {BTLEDconnected ? 'Disconnect' : 'Connect to a light'}
    </button>
    <span class="bluetooth-led-status" class:BTLEDconnected>{BTLEDstatus}</span>
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
