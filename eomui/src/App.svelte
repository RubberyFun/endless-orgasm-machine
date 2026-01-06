<script lang="ts">
  import { onMount } from "svelte";
  import type { Action } from "svelte/action";
    import { run } from "svelte/legacy";
  import BTLED from "./BTLED.svelte";
  import DeviceList from "./ButtplugConnector.svelte";

  let btledComponent: any;
  let BTLEDconnected = $state(false);
  let deviceComponent: any;
  let deviceList = $state([]); // List of Buttplug devices

  let isSSL = window.location.protocol === "https:";
  let wssUrl = $state(
    window.location
      .toString()
      .replace("/ui","/")
      .replace(/http(s?):\/\//, isSSL ? "wss://" : "ws://")
      .replace(/^(wss?:\/\/)[^\/:]+(:\d+)?(\/.*)?$/, (match, protocol, port, path) => {
        const host = match.replace(protocol, '').replace(port || '', '').replace(path || '', '');
        const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(host);
        return protocol + (isIP ? host : "192.168.4.1");  //replace with your local ip for dev convenience
      }), 
      //If not in AP mode update to match your EOM's IP address...useful for local testing
  ) as string;
  if ((window.location.toString().match(/\.\d+\/?$/) ?? []).length > 0) {
    window.location.replace(window.location.toString() + "ws");
  }

  type eomReading = {
    arousal: number;
    cooldown?: number; //s left of denial period
    color?: string;
    denied?: number;
    localTime?: number;
    millis: number;
    motor: number; //calling this "pleasure" now since it can change more than motors but leaving it backwards compatible
    pavg?: number; //should just send this as pressure even when its the average
    pleasure?: number;
    permit?: number;
    pressure: number;
    runMode: string;
    pleasureMode?: number;
    sensitivity?: number; //this is more of a setting than a realtime requirement
    threshold: number;
  };

    let readings = $state([
    {
      pressure: 4000,
      arousal: 4000,
      motor: 255,
      threshold: 3950,
      denied: 19,
      runMode: "ENDLESS",
      localTime: Date.now(),
    } as eomReading,  
    {
      pressure: 0,
      arousal: 0,
      motor: 0,
      threshold: 0,
      denied: 0,
      runMode: "ENDLESS",
      localTime: 0,
    } as eomReading,
  ]) as eomReading[]; //initial dummy data



  type settingType = {
    value: number;
    min: number;
    max: number;
    label: string;
    type?: string;
    description?: string;
  };

  type eomSettings = {
    sensitivity_threshold: settingType;
    mid_threshold: settingType;
    vibration_mode: settingType;
    max_pleasure: settingType;
    motor_ramp_time_s: settingType;
    initial_pleasure: settingType;
    edge_delay: settingType;
    max_additional_delay: settingType;
    minimum_on_time: settingType;
    pressure_smoothing: settingType;
    update_frequency_hz: settingType;
    sensor_sensitivity: settingType;
    clench_pressure_sensitivity: settingType;
    clench_time_to_orgasm_ms: settingType;
    clench_time_threshold_ms: settingType;
    clench_detector_in_edging: settingType;
    max_clench_duration_ms: settingType;
    auto_edging_duration_minutes: settingType;
    post_orgasm_duration_seconds: settingType;
    use_average_values: settingType;
    use_post_orgasm: settingType;
    chart_window_s: settingType;
    max_denied: settingType;
  };

  let vibration_modes: Record<number, string> = {
    //0: "GlobalSync",
    1: "RampStop",
    2: "Depletion",
    3: "Enhancement",
    //4: "Pattern",
  };

  let runModes: string[] = ["MANUAL", "ENDLESS","ORGASM"];

  function getNumericValue(r: eomReading, lineType: string): number {
    if (lineType === "pleasure" || lineType === "motor") {
      let yScaledMotor = typeof r.motor === "number"
      ? Math.round(r.motor / settings.max_pleasure.value * maxY)
      : 0;
      //console.log(yScaledMotor,r.motor,settings.max_pleasure.value,maxY);
      return yScaledMotor;
    }
    
    if (lineType === "runMode") return runModes.indexOf(r.runMode);
    if (lineType === "denials") { //using "denials" for the scaled value
      return typeof r.denied === "number" ? Math.round(r.denied / maxDenied * maxY) : 0;
    }
    const val = (r as any)[lineType];
    return typeof val === "number" ? val : 0;
  }

  function lastNumericValue(lineType: string): number {
    let r = $state.snapshot(readings);
    if (r.length === 0) return 0;
    const lastReading = r[r.length - 1];
    //const val = (lastReading as any)[lineType];
    return getNumericValue(lastReading, lineType);
  }

  let settings = $state({
    sensitivity_threshold: {
      value: 1024,
      min: 0,
      max: 4096,
      label: "Arousal Edge Threshold",
      type: "%",
      description: "The arousal threshold for orgasm detection. Lower values stop sooner. Everyone will have their own ideal setting here.",
    },
    mid_threshold: {
      value: 0,
      min: 0,
      max: lastNumericValue("threshold"),
      label: "Arousal Mid Threshold",
      type: "%",
      description: "The start of the warning zone for approaching arousal.  Changes lights to yellow.",
    },
    vibration_mode: { 
      value: 2, 
      min: 1, 
      max: 4, 
      label: 
      "Mode",
      type: "mode",
      description: "The algorithm used during endless or orgasm mode.",
    },
    max_pleasure: {
      value: 255,
      min: 0,
      max: 255,
      label: "Maximum Pleasure Intensity",
      type: "%",
      description: "Maximum intensity of pleasure during stimulation.",
    },
    max_denied: {
      value: 20,
      min: 0,
      max: 100,
      label: "Maximum Denials",
      type: "denied orgasms",
      description: "Maximum number of denials before forcing an orgasm (in orgasm mode). 0 or 100 disables this limit. Also changes the scale of the chart line in other modes.",
    },
    motor_ramp_time_s: {
      value: 30,
      min: 1,
      max: 120,
      label: "Pleasure Ramp Time",
      type: "seconds",
      description: "Time (s) taken to ramp the pleasure from the starting amount to the maximum.",
    },
    initial_pleasure: {
      value: 10,
      min: 0,
      max: 255,
      label: "Starting Pleasure Intensity",
      type: "%",
      description: "Initial intensity of pleasure when stimulation starts.",
    },
    edge_delay: {
      value: 5,
      min: 0,
      max: 60,
      label: "Edge Delay",
      type: "seconds",
      description: "Minimum time to wait after an edge detection before resuming pleasure.",
    },
    max_additional_delay: {
      value: 5,
      min: 0,
      max: 60,
      label: "Max Additional Delay",
      type: "seconds",
      description: "A random amount of extra seconds to add to the wait time before resuming after an edge detection.",
    },
    chart_window_s: {
      value: 1,  //todo: redner chart offscreen to better support older phones/slow processors
      min: 1,
      max: 120,  //todo: implement logging for longer windows
      label: "Chart Window",
      type: "seconds",
      description: "The number of seconds to display in the chart history.  Higher numbers can cause sluggish behavior on slower devices.",
    },
    minimum_on_time: {
      value: 5,
      min: 0,
      max: 60,
      label: "Minimum On Time",
      type: "seconds",
      description: "Time after stimulation restarts before edge detection is resumed.",
    },
    pressure_smoothing: {
      value: 10,
      min: 0,
      max: 100,
      label: "Pressure Smoothing",
      type: "samples",
      description: "Number of samples to take an average of. Higher numbers can reduce false positives but may result in lag and lower resolution!",
    },
    update_frequency_hz: {
      value: 50,
      min: 1,
      max: 100,
      label: "Update Frequency (Hz)",
      type: "Hz",
      description: "Update frequency for pressure readings and arousal steps.",
    },
    sensor_sensitivity: {
      value: 50,
      min: 0,
      max: 100,
      label: "Sensor Sensitivity",
      type: "%",
      description: "Analog pressure sensor prescaling. Higher values are more sensitive.",
    },
    clench_pressure_sensitivity: {
      value: 3000,
      min: 0,
      max: 4096,
      label: "Clench Pressure Sensitivity",
      type: "%",
      description: "Minimum additional Arousal level to detect clench",
    },
    clench_time_to_orgasm_ms: {
      value: 5000,
      min: 0,
      max: 60000,
      label: "Clench Time to Orgasm (ms)",
      type: "ms",
      description: "Threshold variable that is milliseconds count of clench to detect orgasm.",
    },
    clench_time_threshold_ms: {
      value: 2000,
      min: 0,
      max: 60000,
      label: "Clench Time Threshold (ms)",
      type: "ms",
      description: "Threshold variable that is milliseconds counts to detect the start of clench.",
    },
    max_clench_duration_ms: {
      value: 20000,
      min: 0,
      max: 60000,
      label: "Max Clench Duration (ms)",
      type: "ms",
      description: "Duration the clench detector can raise arousal if clench detector turned on in edging session.",
    },
    auto_edging_duration_minutes: {
      value: 15,
      min: 1,
      max: 120,
      label: "Auto-Edging Duration",
      type: "minutes",
      description: "How long to edge before permiting an orgasm.",
    },
    post_orgasm_duration_seconds: {
      value: 60,
      min: 0,
      max: 180,
      label: "Post Orgasm Duration",
      type: "seconds",
      description: "How long to stimulate after orgasm detected.",
    },
    clench_detector_in_edging: {
      value: 1,
      min: 0,
      max: 1,
      label: "Clench Detector in Edging",
      type: "yes/no",
      description: "Enable clench detection while in edging mode.",
    },
    use_post_orgasm: { 
      value: 1, 
      min: 0, 
      max: 1, 
      label: "Use Post Orgasm",
      type: "yes/no",
      description: "Use post-orgasm torture mode and functionality.",
    },
    use_average_values: {
      value: 1,
      min: 0,
      max: 1,
      label: "Use Average Values",
      type: "yes/no",
      description: "Use average values when calculating arousal. This smooths noisy data.",
    },
    // wifi_on: {
    //   value: 1,
    //   min: 0,
    //   max: 1,
    //   label: "Use WiFi",
    //   type: "yes/no",
    //   description: "Enable WiFi connectivity for remote control and monitoring.",
    // },
  } as eomSettings);

  let mainSettings: string[] = [
    "sensitivity_threshold",
    "sensor_sensitivity",
    "motor_ramp_time_s",
    "edge_delay",
    "chart_window_s",
  ];
  
  let modalSettings: string[] = [
    //"wifi_on",
    "max_denied",
    "max_additional_delay",
    "max_pleasure",
    "mid_threshold",
    "initial_pleasure",
    "minimum_on_time",
    "pressure_smoothing",
    "update_frequency_hz",
    "clench_pressure_sensitivity",
    "clench_time_to_orgasm_ms",
    "clench_time_threshold_ms",
    "clench_detector_in_edging",
    "max_clench_duration_ms",
    "post_orgasm_duration_seconds",
    "use_post_orgasm",
    "use_average_values",
  ];

  let lines: Record<string, [string, number]> = {
    pleasure: ["orange", 3],
    arousal: ["red", 3],
    threshold: ["red", 2],
    denials: ["#FF7FFF", 2],
    pressure: ["green", 1],
  };

  let bgt: number = $state(0) as number;
  let chartCanvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let frameFlashDelay: number = 5; //frames between background color toggles when aroused/on cooldown
  // function getXTicks(): number[] {
  //   return Array.from({ length: chartTime + 1 }, (_, i) => chartTime - i);
  // }
  const padding = { top: 10, right: 0, bottom: 5, left: 5 };
  let maxY = 4096;  //everything is 12 bit
  let fudge: number = 2;
  let arousalThicknessMultiplier: number = 4;
  let currentPleasure = $state(0) as number;
  let maxDenied = $state(20) as number;
  let thresholdStep = 100;
  let isWsConnected = $state(false) as boolean;
  let isBtConnected = $state(false) as boolean;
  let lastConnection = $state("bt") as string;

  let mainSend: any = null;
  let btDevice: any = null;
  let socket = $state() as WebSocket;

  let showSettings = $state(false);
  let showToys = $state(false);
  let settingsDialog = $state() as HTMLDialogElement;
  let toysDialog = $state() as HTMLDialogElement;
  let displayMode = $state(0) as number;

  function chartReady() {
    console.log("Chart ready");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    const dataLines = Object.entries(lines);
    const keySpacing = Math.round(
      (chartCanvas.width -
        (chartCanvas.width * (padding.left + padding.right)) / 100) /
        (dataLines.length + 1),
    );
    let keyHeight = Math.round((ctx.canvas.height * padding.top) / 100); //use 3/4 of top padding area
    let keyWidth = keySpacing / 4;
    let keyPadding = keyWidth / 4;

    ctx.font = "bold 1.5em sans-serif";
    //ctx.textBaseline = "middle";
    ctx.fontStretch = "condensed";
    ctx.textRendering = "optimizeLegibility";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
    ctx.textAlign = "left";
    //y axis labels
    for (let y = 0; y <= maxY; y += maxY / 4) {
      const yPos =
        ctx.canvas.height -
        (y / maxY) *
          (ctx.canvas.height -
            (ctx.canvas.height * (padding.top + padding.bottom)) / 100) -
        (ctx.canvas.height * padding.bottom) / 100;
      ctx.fillStyle = "white";
      ctx.fillText(
        Math.round((y / maxY) * 100).toString() + "%",
        5,
        yPos,
        Math.round((chartCanvas.width * padding.left) / 100 / 1.5),
      );
    }

    //data keys
    let i: number = keySpacing;
    for (const [lineType, [color, width]] of dataLines) {
      ctx.fillStyle = color;
      ctx.fillRect(
        i,
        Math.round(((ctx.canvas.height * padding.top) / 100) * 1.25) -
          keyHeight,
        keyWidth,
        Math.round(keyHeight / 2),
      );
      ctx.fillText(
        lineType,
        i + keyWidth + keyPadding,
        keyHeight / 1.666,
        keySpacing - keyWidth - keyPadding,
      );
      i += keySpacing;
    }
    ctx.fillStyle = "black";
    updateChart();
  }

  function scaleLinear(domain: number[], range: number[]) {
    if (domain[1] === domain[0]) return (value: number) => 0;
    const m = (range[1] - range[0]) / (domain[1] - domain[0]);
    const minRange = Math.min(range[0], range[1]);
    const maxRange = Math.max(range[0], range[1]);
    return (value: number) =>
      Math.max(
        minRange,
        Math.min(maxRange, range[0] + m * (value - domain[0])),
      );
  }

  function isAroused(_reading: eomReading): boolean {
    return _reading.arousal >= _reading.threshold;
  }

  function isOnCooldown(_reading: eomReading): boolean {
    return (_reading.cooldown ?? 0) > 0 && _reading.motor == 0;
  }

  function updateChart() {
    if (!ctx || !chartCanvas || displayMode != 1) return;
    const _readings = $state.snapshot(readings);
    if (_readings.length === 0) return;
    const xScale = scaleLinear(
      [0, _readings.length - 1],
      [
        (chartCanvas.width * padding.left) / 100,
        chartCanvas.width - (chartCanvas.width * padding.right) / 100,
      ],
    );
    const yScale = scaleLinear(
      [0, maxY],
      [
        chartCanvas.height - (chartCanvas.height * padding.bottom) / 100,
        (chartCanvas.height * padding.top) / 100 + fudge,
      ],
    );

    let lastReading = _readings[_readings.length - 1];

    //background
    if (
      isAroused(lastReading) ||
      isOnCooldown(lastReading)
    ) {
      if (bgt >= frameFlashDelay) {  
        ctx.fillStyle = ctx.fillStyle == "#111111" ? "#330000" : "#111111";
        bgt = 0;
      } else {
        bgt += 1;
      }
    } else {
      ctx.fillStyle = "#111111";
    }
    ctx.fillRect(
      (chartCanvas.width * padding.left) / 100 - fudge,
      (chartCanvas.height * padding.top) / 100 - fudge,
      chartCanvas.width - (chartCanvas.width * padding.right) / 100,
      chartCanvas.height - (chartCanvas.height * padding.bottom) / 100,
    );

    //y axis guides
    for (let y = 0; y <= maxY; y += maxY / 4) {
      const yPos =
        ctx.canvas.height -
        (y / maxY) *
          (ctx.canvas.height -
            (ctx.canvas.height * (padding.top + padding.bottom)) / 100) -
        (ctx.canvas.height * padding.bottom) / 100;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "white";
      ctx.moveTo((chartCanvas.width * padding.left) / 100, yPos);
      ctx.lineTo(
        chartCanvas.width - (chartCanvas.width * padding.right) / 100,
        yPos,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    //countdown
    let statusText: string = edgeStatusText();
    if (statusText.length > 0) {
      // ctx.fillStyle = "grey";
        ctx.font = chartCanvas.width > 600 ? (
            chartCanvas.width > 900 ? "bold 3em sans-serif" : "2em sans-serif"
          ) : "1em sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText(statusText, chartCanvas.width/2, chartCanvas.height/2);
    }




    //data lines
    for (const [lineType, [color, width]] of Object.entries(lines)) {
      ctx.strokeStyle = color;
      ctx.setLineDash(lineType === "threshold" ? [10, 10] : []); // Dashed line for threshold
      ctx.beginPath();
      ctx.moveTo(
        (chartCanvas.width * padding.left) / 100 + fudge,
        yScale(getNumericValue(_readings[0], lineType)),
      );
      _readings.forEach((r, i) => {
        if (isAroused(r) && lineType === "arousal") {
          ctx.lineWidth = width * arousalThicknessMultiplier; //thicker line when aroused
        } else {
          ctx.lineWidth = width;
        }
        ctx.lineTo(xScale(i), yScale(getNumericValue(r, lineType)));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xScale(i), yScale(getNumericValue(r, lineType)));

        //todo: a vertical line to indicate when an edge event occurred
      });
    }
  }

  function edgeStatusText(): string {
    let lastReading = $state.snapshot(readings)[$state.snapshot(readings).length - 1];
    let statusText: string = "";
    if (isOnCooldown(lastReading)) {
      statusText = isAroused(lastReading) ? `DENIED ORGASM - COOLING DOWN` : `DENIED FOR ${lastReading.cooldown} MORE SECONDS`;
    } else if ((lastReading.runMode ?? "") === "ORGASM") {
      let lastPermit = lastReading.permit ?? 0;
      let timeStr: string = " IN " + (lastPermit > 60 ? 
        Math.ceil(lastPermit/60).toString() + " MINUTES" : 
        lastPermit.toString() + " SECOND" + (lastPermit > 1 ? "S" : ""));
      if (settings.max_denied.value > 0 && settings.max_denied.value < 100) {
        let remainingDenials = settings.max_denied.value - (lastReading.denied ?? 0);
        if (remainingDenials > 0) {
          timeStr += ` OR ${remainingDenials} DENIAL` + (remainingDenials != 1 ? "S" : "");
        } else {
          timeStr = "!!";
        }
      }
      statusText = `ORGASM PERMITTED${timeStr}`;
    }
    return statusText;
  }


  function handleUpdated(e: CustomEvent<number[]>) {
    updateChart();
  }

  function handleConfigList(configList: Object) {
    console.log("Received configuration data:", configList);
    for (const [key, value] of Object.entries(configList)) {
      if (key in settings) {
        settings[key as keyof typeof settings].value = Number(value);
      }
    }
  }

  function handleMessage(event: MessageEvent) {
    try {
      let wsMsg = JSON.parse(event.data);

      if (!wsMsg) {
        console.warn("Received empty data:", wsMsg);
        return;
      }
      if (!wsMsg.readings) {
        if (wsMsg.wifiStatus) {
          //console.log("Received WiFi status:", wsMsg.wifiStatus);
        } else if (wsMsg.configList) {
          handleConfigList(wsMsg.configList);
        } else if (
          wsMsg.setMode !== undefined ||
          wsMsg.setMotor !== undefined ||
          wsMsg.vibration_mode !== undefined
        ) {
          //console.log("Received ack for setting change:", wsMsg);
        } else {
          console.warn("Received unknown data:", wsMsg);
        }
        return;
      }
      wsMsg = wsMsg.readings;

      if (!wsMsg.millis) {
        console.warn("Received data without 'millis' field:", wsMsg);
        return;
      }
      if (
        wsMsg.pressure === undefined ||
        wsMsg.arousal === undefined ||
        wsMsg.motor === undefined
      ) {
        console.warn("Received data missing expected fields:", wsMsg);
        return;
      }
      wsMsg.pleasure = wsMsg.motor; //backwards compatibilitypermitpermit
      wsMsg.localTime = Date.now();
      readings.push(wsMsg);
      //currentPleasure = getNumericValue(wsMsg, "pleasure");
      while (
        readings.length > 0 &&
          ((wsMsg.millis - (readings[0].millis ?? 0) > settings.chart_window_s.value * 1000) ||  //the first and last reading are more than chartWindow seconds apart
          (Date.now() - (readings[0].localTime ?? 0) > settings.chart_window_s.value * 1000))  //the first reading is older than chartWindow seconds
      ) {
        readings.shift();
      }

      chartCanvas?.dispatchEvent(new CustomEvent("updated", {}));
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  function handleOpen() {
    isWsConnected = true;
    btDevice.disconnect();
    isBtConnected = false;
    console.log("WebSocket connection established");
    let msg = JSON.stringify({ configList: null });
    socket.send(msg);
    socket.send(JSON.stringify({ streamReadings: null }));
    chartCanvas?.dispatchEvent(new CustomEvent("ready", {}));

    setInterval(() => {
      let lastReadingTime = $state.snapshot(readings)[$state.snapshot(readings).length - 1].localTime ?? 0;
      if (Date.now() - lastReadingTime > 10000) { // 10 seconds threshold
        console.log("Data is stale...dropped connection?");
        if (lastConnection == "ws") {
          console.log("Reconnecting WebSocket...");
          isWsConnected = false;
          socket.close();
          socket = new WebSocket(wssUrl);
          initializeWebSocket(socket);
          console.log("Reconnecting to ", wssUrl, socket);
        } else {
          //should I just let bluetooth handle its state by itself?
          isBtConnected = false;
          btDevice?.disconnect();
        }
      }
    }, 5000); // Check for stale data every 5 seconds

  }

  function handleError(event: Event) {
    isWsConnected = false;
    console.error("WebSocket error observed:", event);
  }

  function handleSettingChange(setting_name: string, value: number) {
    settings[setting_name as keyof typeof settings].value = value;
    if (isWsConnected) {
      let msg = JSON.stringify({
        configSet: { [setting_name]: value },
      });
      socket.send(msg);
      console.log(`Sent ${setting_name} change:`, value);
    } else if (isBtConnected && mainSend != null) {
      mainSend.writeValue(
        new Uint8Array([
          0x02, // Command identifier for setting change
          ...new TextEncoder().encode(setting_name),
          0x3A, // Separator ':'
          ...new TextEncoder().encode(value.toString()), // Send value in hexadecimal
        ])
      ).then(() => {
        console.log(`Sent ${setting_name} change via Bluetooth:`,  value);
      }).catch((error: any) => {
        console.error('Error sending setting change via Bluetooth:', error, setting_name, value);
      });
      // Handle Bluetooth connection case
    }
  }

  function handleBasicChange(setting_name: string, value: number | string | null) {
    if (isWsConnected)  {
      let msg = JSON.stringify({
        [setting_name]: value,
      });
      socket.send(msg);
    } else if (isBtConnected) {
      let currentMode: number = setting_name == "setMode" ? runModes.indexOf(String(value)) : lastNumericValue("runMode");
      let btData;
      if (setting_name == "setMotor") {
        let currentPleasure: number = setting_name == "setMotor" ? Number(value) : lastNumericValue("pleasure");
        btData = new Uint8Array([0x01,currentMode, 0, 0, Number(currentPleasure)]);
      } else {
        //pleasure amount is optional at end of byte array
        btData = new Uint8Array([
          0x01,
          currentMode, 
          setting_name == "triggerArousal" ? 1 : 0, 
          setting_name == "resetDenied" ? 1 : 0
        ]);
      }
      console.log(`sending ${setting_name} change via Bluetooth:`, btData);
      mainSend.writeValue(btData).then(() => {
        console.log(`Sent ${setting_name} change via Bluetooth:`, value);
      }).catch((error: any) => {
        console.error('Error sending setting change via Bluetooth:', error);
      });
          
    } else {
      console.warn("Not connected via WebSocket or Bluetooth. Cannot send setting change.");
      return;
    }
    console.log(`Sent ${setting_name} change:`, value);
  }

  let debounceTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  const DEBOUNCE_DELAY = 30; //  delay in ms

  // This needs work
  function debouncedBasicChange(setting_name: string, value: number | string) {
    // Clear existing timeout for this setting
    const existingTimeout = debounceTimeouts.get(setting_name);
    if (existingTimeout !== undefined) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      handleBasicChange(setting_name, value);
      debounceTimeouts.delete(setting_name);
    }, DEBOUNCE_DELAY);
    
    debounceTimeouts.set(setting_name, timeoutId);
  }

  function initializeWebSocket(socket: WebSocket) {
    socket.onopen = handleOpen;
    socket.onerror = handleError;
    socket.onmessage = handleMessage;
  }

  const chart: Action<
    HTMLCanvasElement,
    undefined,
    {
      onready: (e: CustomEvent<void>) => void;
      onupdated: (e: CustomEvent<number[]>) => void;
    }
  > = (canvas) => {
    chartCanvas = canvas;
    ctx = chartCanvas.getContext("2d") as CanvasRenderingContext2D;

    function dispatch<T>(name: string, detail: T) {
      chartCanvas.dispatchEvent(new CustomEvent(name, { detail }));
    }
    onMount(() => {
      dispatch("ready", undefined);
    });
  };

  onMount(() => {
    //socket = new WebSocket(wssUrl);
    //initializeWebSocket(socket);

    setInterval(() => {
      console.log($state.snapshot(isWsConnected),isWsConnected,$state.snapshot(isBtConnected),isBtConnected);
      if (!(isWsConnected || isBtConnected)) {
        console.log("Not connected");
        return;
      }
      console.log(
        "Current readings:",
        $state.snapshot(readings)[$state.snapshot(readings).length - 1],
      );
    }, 30000); // Log every 30 seconds
  });

  function handleConnect() {
    const userInput = prompt("Enter WebSocket URL:", wssUrl);
    if (userInput !== null && userInput.trim() !== '') {
      wssUrl = userInput.trim();
      socket?.close();
      isWsConnected = false;
      socket = new WebSocket(wssUrl);
      lastConnection = "ws";
      initializeWebSocket(socket);
      console.log("Connecting to ", wssUrl, socket);
    }
  }

  function onDisconnected(event: any) {
    const eomDevice = event.target;
    mainSend = null;
    btDevice = null;
    console.log(`Device ${eomDevice.name} is disconnected.`);
    isBtConnected = false;
  }

  function sendConfigRequest() {
    if (isBtConnected && mainSend != null) {
      mainSend.writeValue(
        new Uint8Array([0x03]) // Command identifier for config request
      ).then(() => {
        console.log('Sent configuration request via Bluetooth.');
      }).catch((error: any) => {
        console.error('Error sending configuration request via Bluetooth:', error);
      });
    }
  }


  function getSettingLabel(id: string): string {
    const setting = settings[id as keyof typeof settings];
    if (setting.type === "%") {
      return Math.round((setting.value / setting.max) * 100).toString() + " %";
    } else if (setting.type === "yes/no") {
      return setting.value === 1 ? "Yes" : "No";
    } else if (id == "max_denied") {
        if (setting.value === 0 || setting.value === 100) {
          return "Unlimited";
        } else {
          return `${setting.value} denied orgasms`;
        }
    } else {
      return `${setting.value} ${setting.type}`;
    }
  }

  function applyPressure() {
    handleSettingChange("motor_ramp_time_s", settings.motor_ramp_time_s.value > 1 ? settings.motor_ramp_time_s.value - 1 : 1);
    setTimeout(() => {
      handleSettingChange("edge_delay", settings.edge_delay.value > 0 ? settings.edge_delay.value - 1 : 0);
    }, 100);
    setTimeout(() => {
      let threshold = $state.snapshot(readings)[$state.snapshot(readings).length - 1].threshold;
      handleSettingChange("sensitivity_threshold", threshold + thresholdStep > maxY ? maxY : threshold + thresholdStep);
    }, 200);
  }

  const bt = (navigator as any).bluetooth; 
  window.onresize = () => {
    chartReady();
  };

  function btConnect() {
    if (!bt) {
      alert('Web bluetooth is not available on iOS devices or Firefox.');
      return;
    }
    if (isBtConnected) {
      console.log('Disconnecting from Bluetooth device:', btDevice);
      btDevice?.gatt.disconnect();
      isBtConnected = false;
    } else {
      bt.requestDevice({
        optionalServices: [0x6969, 0x696A, 0x696B],
        filters: [{
          namePrefix: 'Libotoy',
        }]
      })
        .then((eomDevice: any) => {
          console.log('Connecting to device:', eomDevice);
          eomDevice.addEventListener('gattserverdisconnected', onDisconnected);
          btDevice = eomDevice;
          eomDevice.gatt.connect()
            .then((server: any) => {
              lastConnection = "bt";
              console.log('Connected to GATT server:', server);                      
              server.getPrimaryService(0x6969).then((service: any) => {
                console.log('Got primary service:', service);

                //readings
                service.getCharacteristic(0x696a).then((characteristic: any) => {
                  console.log('Got characteristic:', characteristic);

                  characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                    const value = event.target.value;
                    const data = new Uint8Array(value.buffer);
                    //console.log('Received data:', data);
                    let newReading: eomReading = {
                      pressure: data[0]* 16, // scale to 0-4096
                      arousal: data[1] * 16, // scale to 0-4096
                      threshold: data[2]* 16, // scale to 0-4096
                      motor: data[3],
                      pleasure: data[3],
                      cooldown: data[4],
                      denied: data[5],
                      runMode: runModes[data[6]] ?? "ENDLESS",
                      pleasureMode: data[7],
                      permit: data[8] * 255 + (data[9] ?? 0),
                      color: String(data[10]) + String(data[11]) + String(data[12]),
                      millis: Date.now(),
                      localTime: Date.now(),
                    };
                    readings.push(newReading);


                    //it is long past time to refactor all of this
                    if (BTLEDconnected && btledComponent) {
                      const r = Number(data[10]);
                      const g = Number(data[11]);
                      const b = Number(data[12]);
                      btledComponent.writeRGB(r, g, b).catch((err: any) => console.error('Failed to write RGB:', err));
                    }

                    deviceList.forEach((device: any) => {
                      device.controls.forEach((control: any) => {
                        if (control.mode != "manual") {
                          let value = 0;
                          switch (control.mode) {
                            case "arousal":
                              value = newReading.arousal / 16;
                              break;
                            case "pressure":
                              value = newReading.pressure / 16;
                              break;
                            case "denied":
                              value = (newReading.denied ?? 0) / settings.max_denied.value * 255;
                              break;
                            default:
                              value = newReading.pleasure ?? 0;
                              break;
                          }
                          if (control.sliderElement && value >= 0) {
                            if (control.invert) {
                              value = 255 - value;
                            }
                            //console.log('Updating control:', control, value,Math.round(value),control.sliderElement.value);
                            if (control.sliderElement.value != String(Math.round(value))) {
                              control.sliderElement.value = Math.round(value);
                              deviceComponent?.handleDeviceChange(device, control, value / 255.0);
                            }
                          }
                        }
                      });
                    });

                  while (
                      readings.length > 0 && (Date.now() - (readings[0].localTime ?? 0) > settings.chart_window_s.value * 1000)  
                    ) {
                      //the first reading is older than chartTime seconds
                      readings.shift();
                    }
                    currentPleasure = Number(newReading.pleasure);
                    chartCanvas?.dispatchEvent(new CustomEvent("updated", {}));

                  });

                  characteristic.startNotifications().then(() => {
                    console.log('Notifications started for characteristic:', characteristic.uuid);
                    socket?.close();
                    isWsConnected = false;
                    isBtConnected = true;
                  });

                });



                //controls
                service.getCharacteristic(0x696b).then((characteristic: any) => {
                  console.log('Got control characteristic:', characteristic);
                  mainSend = characteristic;
                  console.log('Ready to send control commands via Bluetooth.',mainSend);
                });

                //config
                service.getCharacteristic(0x696c).then((characteristic: any) => {
                  console.log('Got characteristic:', characteristic);

                  characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
                    const value = event.target.value;
                    // Create Uint8Array from the DataView with proper length
                    const data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
                    
                    // Find the actual length by looking for null terminator
                    let actualLength = data.length;
                    for (let i = 0; i < data.length; i++) {
                      if (data[i] === 0) {
                        actualLength = i;
                        break;
                      }
                    }
                    
                    // Convert Uint8Array to string and parse as JSON
                    const decoder = new TextDecoder();
                    const jsonString = '{' + decoder.decode(data.slice(0, actualLength)) + '}';

                    try {
                      console.log('Received config data:', jsonString, value);
                      const configObj = JSON.parse(jsonString);
                      for (const [key, val] of Object.entries(configObj)) {
                        if (key in settings) {
                          settings[key as keyof typeof settings].value = val as number;
                        }
                      }
                    } catch (error) {
                      console.error('Error parsing config JSON:', error, jsonString);
                    }
                  });

                  characteristic.startNotifications().then(() => {
                    console.log('Notifications started for characteristic:', characteristic.uuid);
                    sendConfigRequest();
                  });

                });


              })
              .catch((error: any) => {
                console.error('Error getting primary service:', error);
              });
            })
            .catch((error: any) => {
              console.error('Error connecting to GATT server:', error);
            });
        })
        .catch((error: any) => {
          console.error(error);
        });
    }

  }

</script>

{#snippet InputSlider(id: string)}
  <div style="width: 100%;">
    <label for={id} title="{settings[id as keyof typeof settings].description}">
      {settings[id as keyof typeof settings].label} :
      {getSettingLabel(id)}
      
    </label>
    <input
      {id}
      title="{settings[id as keyof typeof settings].description}"
      type="range"
      min={settings[id as keyof typeof settings].min}
      max={settings[id as keyof typeof settings].max}
      bind:value={settings[id as keyof typeof settings].value}
      style="width: 100%;"
      onchange={() =>
        handleSettingChange(id, settings[id as keyof typeof settings].value)}
    />
  </div>
{/snippet}

<div
  class="mainContainer"
  onclick={(e) => {
    if (e.target !== settingsDialog) settingsDialog.close();
  }}
  onkeyup={(e) => {
    if (e.key === "Escape") settingsDialog.close();
  }}
  role="none"
>
  <div style="position: relative; padding: 0; width: 100%; max-width: 100%; box-sizing: border-box; display: flex; justify-content: center; align-items: center; flex-direction: column; overflow-x: hidden;">
    <div style="display: flex; justify-content: space-between; width: 100%; max-width: 100%; box-sizing: border-box; padding: 4px; flex-wrap: wrap; gap: 0.5rem;">

      <div style={isBtConnected ? "visibility: hidden;" : "display: flex; align-items: center; flex-shrink: 1; min-width: 0;"}>
        <!-- <input
          id="url"
          type="text"
          bind:value={wssUrl}
          style="margin-bottom: .5%; max-width: 8vw;"
          onkeyup={(event) => {if (event.key === 'Enter') { handleConnect(); }}}
        /> --> 
        <button
          type="button"
          class="topButton"
          aria-label="Connect via WebSocket" 
          title="Use WebSockets to connect to EOM"

          style={isWsConnected ? "background-color: #3aada1; border-color: #0a9d91;" : "background-color: #999; border-color: #ccc;"}
          value={isWsConnected ? "Connected" : "Connect"}
          onclick={() => {
            handleConnect();
          }}
        ><svg width="20" height="20" viewBox="0 0 256 193" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path fill="#3F  F" d="M192.44 144.645h31.78V68.339l-35.805-35.804-22.472 22.472 26.497 26.497v63.14zm31.864 15.931H113.452L86.954 134.08l11.237-11.236 21.885 21.885h45.028l-44.357-44.441 11.32-11.32 44.357 44.358V88.296l-21.801-21.801 11.152-11.153L110.685 0H0l31.696 31.696v.084H97.436l23.227 23.227-33.96 33.96L63.476 65.74V47.712h-31.78v31.193l55.007 55.007L64.314 156.3l35.805 35.805H256l-31.696-31.529z"/></svg>
      </button>
      </div>

      <div style={isWsConnected ? "visibility: hidden;" : "display: flex; align-items: center; flex-shrink: 1; min-width: 0;"}>
        <button
          title="Use bluetooth to connect to EOM"
          onclick={() => {btConnect();}}
          class="topButton"
          style={bt ? (isBtConnected ? "background-color: #10b030; border-color: #30e060;" : "background-color: #3a6dc1; border-color: #0a3d91;") : "background-color: darkred; border-color: darkred;"}
          aria-label="Connect via bluetooth" 
          ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 976" width="20" height="20" aria-label="Bluetooth">
              <rect ry="291" height="976" width="640" fill="#0a3d91" />
                <path d="m157 330 305 307-147 178V179l147 170-305 299" stroke="#FFF" stroke-width="53" fill="none"/>
              </svg>
        </button>
      </div>
      <button
        onclick={() => {if (displayMode > 0) { displayMode = 0 } else { displayMode += 1 }}}
        class="topButton"
        title="Change display mode"
        style="background-color: #636; border-color: #969;"
        aria-label="Change display mode"
        ><svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Display mode"
        >
          {#if displayMode == 0}

            <g id="layer1">
              <path fill="#fff" d="M 0 2 L 0 18 L 20 18 L 20 17 L 1 17 L 1 2 L 0 2 z M 6.4921875 2.5 C 6.3623006 2.50207 6.2383174 2.554606 6.1464844 2.6464844 L 2.1464844 6.6464844 C 1.6556578 7.1177388 2.3822612 7.8443422 2.8535156 7.3535156 L 6.421875 3.7851562 L 10.083984 9.2773438 C 10.223774 9.4866441 10.49734 9.5594276 10.722656 9.4472656 L 14.400391 7.6074219 L 18.146484 11.353516 C 18.617739 11.844289 19.344289 11.117739 18.853516 10.646484 L 14.853516 6.6464844 C 14.701521 6.4947425 14.469605 6.457007 14.277344 6.5527344 L 10.671875 8.3554688 L 6.9160156 2.7226562 C 6.8217568 2.5812359 6.6621214 2.497372 6.4921875 2.5 z M 6.4824219 10.5 A 0.50083746 0.50083746 0 0 0 6.1464844 10.646484 L 2.1464844 14.646484 A 0.50083746 0.50083746 0 1 0 2.8535156 15.353516 L 6.5996094 11.609375 L 10.275391 13.447266 A 0.50083746 0.50083746 0 0 0 10.621094 13.486328 L 14.441406 12.53125 L 18.275391 14.447266 A 0.50083746 0.50083746 0 1 0 18.724609 13.552734 L 14.724609 11.552734 A 0.50083746 0.50083746 0 0 0 14.378906 11.513672 L 10.558594 12.46875 L 6.7246094 10.552734 A 0.50083746 0.50083746 0 0 0 6.4824219 10.5 z "/>
            </g>

           
          {:else if displayMode == 1}
            <path
              style="fill:#FFF;stroke-width:0.0396344"
              d="m 9.5788998,16.025677 c -1.636372,-0.440696 -1.7779796,-2.691081 -0.2086571,-3.315912 0.3097319,-0.123319 0.9571003,-0.124599 1.2616903,-0.0025 l 0.211378,0.08474 0.680395,-0.398571 c 4.096339,-2.3996051 3.934967,-2.315329 4.240392,-2.21453 0.302639,0.09988 0.470328,0.323998 0.475017,0.634866 0.0057,0.376356 0.02811,0.357471 -2.332508,1.963529 -2.086825,1.41978 -2.155499,1.47051 -2.156878,1.593333 -0.01228,1.094597 -1.118953,1.93832 -2.1708292,1.655037 z M 10.41902,15.043083 c 0.716453,-0.391923 0.409556,-1.508405 -0.414627,-1.508405 -0.5352253,0 -0.9159626,0.465181 -0.7982224,0.975261 0.1290306,0.558989 0.7037636,0.811631 1.2128494,0.533144 z M 0.5476717,14.267343 C -0.3123351,13.876775 0.40270156,10.429887 1.7776258,8.3382555 6.4456509,1.2369291 17.433438,3.0440653 19.512609,11.255087 c 0.430261,1.699179 0.41677,2.766464 -0.03792,2.999733 l -0.176035,0.09031 -1.862815,-0.01104 c -2.321522,-0.01377 -2.266148,0.0062 -2.307471,-0.832131 l -0.02009,-0.407577 0.541579,-0.367696 c 0.626721,-0.425502 0.594368,-0.426033 0.656374,0.01078 l 0.04785,0.337101 h 1.107035 1.107034 l -0.0243,-0.208085 C 18.342599,11.143335 17.720053,9.6254174 16.690077,8.3465436 l -0.280611,-0.3484221 -0.63621,0.6333056 c -0.480747,0.4785518 -0.679793,0.6500498 -0.814565,0.7018285 -0.09809,0.037688 -0.431096,0.2171516 -0.74,0.3988092 C 13.556323,10.121583 13.650135,10.104775 13.398956,9.8789342 10.28437,7.0785418 4.8915576,9.3072881 4.8915576,13.39488 c 0,0.497959 -0.1285649,0.770921 -0.4205679,0.892928 -0.2294177,0.09586 -3.70712911,0.07772 -3.923318,-0.02047 z M 3.683703,12.828194 C 3.7935499,11.881745 4.2552256,10.769218 4.895823,9.9072799 L 5.1577119,9.5549022 4.3785492,8.7764703 3.5993866,7.9980383 3.3199684,8.3465013 C 2.3403649,9.5681678 1.6693669,11.12542 1.5047257,12.559317 c -0.013766,0.119894 -0.034772,0.284872 -0.046678,0.366618 L 1.436399,13.074564 H 2.5457537 3.6551086 Z M 6.453015,8.4212682 C 7.2689669,7.8757311 8.2450722,7.5028055 9.1621621,7.3862258 L 9.3702427,7.3597746 V 6.2532627 5.1467507 l -0.148629,0.019728 C 7.9120834,5.3402992 7.1669907,5.5528932 6.2101618,6.0257228 5.7357731,6.2601482 4.9540646,6.7536605 4.6537513,7.0083237 L 4.515031,7.1259573 5.2875201,7.9005523 c 0.424869,0.4260276 0.7754775,0.7745953 0.7791299,0.7745953 0.00365,0 0.1775163,-0.1142458 0.386365,-0.2538794 z M 14.721266,7.9000381 15.493755,7.1249286 15.374852,7.0256999 C 14.216444,6.0589687 12.538775,5.3750254 10.826806,5.1715774 L 10.638543,5.149204 v 1.1052852 1.1052852 l 0.208081,0.026451 c 0.918772,0.1167934 1.926361,0.5061389 2.724863,1.0529229 0.185291,0.1268804 0.345982,0.2318854 0.357091,0.2333452 0.01111,0.00146 0.367819,-0.3461454 0.792688,-0.7724554 z"
              id="path1168" />
            {:else}
            <path
              fill="#fff"
              d="M3 5h4v2H3V5m0 6h4v2H3v-2m0 6h4v2H3v-2m6-12h4v2h-4V5m0 6h4v2h-4v-2m0 6h4v2h-4v-2m6-12h4v2h-4V5m0 6h4v2h-4v-2m0 6h4v2h-4v-2Z"
            />
          {/if}
        </svg>  
      </button>
      <button
        onclick={() => (showToys = true)}
        class="topButton"
        title="Connect to toys for stimulation"
        style="background-color: #99aaff; border-color: #6666ff;"
        aria-label="Connect to toys for stimulation"
        ><svg
          width="20"
          height="20"
          viewBox="0 -1.11 63.334 63.334"
          xmlns="http://www.w3.org/2000/svg">
          <g  id="Group_92" data-name="Group 92" transform="matrix(1.3362883,0,0,1.3362883,-249.74734,-236.08547)">
            <path id="Path_135" data-name="Path 135" d="m 231.9,193.447 a 2.36,2.36 0 0 0 -3.938,-1.162 c -3.856,3.867 -9.935,6.363 -16.778,6.363 -0.65,0 -1.288,-0.036 -1.922,-0.08 A 10.324,10.324 0 1 0 195.4,193.3 a 14.214,14.214 0 0 0 -5.334,10.736 c 0,8.93 9.451,16.169 21.109,16.169 11.658,0 19.73,-7.346 21.109,-16.169 A 25.633,25.633 0 0 0 231.9,193.447 Z" fill="#fff1b6" stroke="#333333" stroke-miterlimit="10" stroke-width="2"/>
            <path id="Path_136"  fill="#f77" data-name="Path 136" d="m 195.03,185.174 c -0.98574,0.50384 -2.06066,0.8096 -3.164,0.9 -0.67223,-0.0208 -2.40511,-0.13078 -3.0484,-0.327 -0.80795,-0.24121 -1.56005,0.5126 -1.317,1.32 0.17497,0.64347 1.12106,1.22421 1.61245,1.675 1.56023,1.41745 4.09215,2.15953 6.19795,2.064 1.10081,-0.24119 1.93718,-1.1389 2.1,-2.254 0.294,-2.252 -2.381,-3.378 -2.381,-3.378 z" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" style="stroke-width:1.18489;stroke-dasharray:none"/>
            <circle id="Ellipse_29" data-name="Ellipse 29" cx="0.954" cy="0.954" r="0.954" transform="translate(200.736,184.275)" fill="#ffffff" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <path id="Path_137" data-name="Path 137" d="m 223.754,204.037 c 0,2.977 -5.857,6.737 -13.174,6.737 -7.317,0 -11.6,-3.369 -12.2,-5.914 -0.782,-3.323 1.272,-8.009 11.153,-6.287" fill="none" stroke="#333333" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </g>
        </svg>
      </button>
      <button
        onclick={() => (showSettings = true)}
        class="topButton"
        aria-label="Open settings"
        title="Settings"
        style="background-color: #999; border-color: #ccc;"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          cursor="pointer"
          aria-label="Settings"
        >
          <path
            fill="#fff"
            d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
          />
        </svg>
      </button>
    </div>

    <div style={displayMode != 1 ? "display: none; width:100%;" : "width:100%;"}>
      <canvas
        style="position: relative; height:40vh; width:100%; "
        bind:this={chartCanvas}
        use:chart
        onupdated={handleUpdated}
        onready={chartReady}
        onresize={chartReady}
      ></canvas>

      <div class="statBoxes">
        <div class="statBoxButton" title="Click to halt pleasure immediately!"
          onclick={() => {
            handleBasicChange("setMode", "manual");
            handleBasicChange("setMotor", 0);
            currentPleasure = 0;
          }}
          style="border-color: orange; color: orange;" role="none"
        >
          Pleasure: {Math.floor(
            (lastNumericValue("pleasure") / maxY) *
              100,
          )
            ? Math.round(
                (lastNumericValue("pleasure") / maxY) *
                  99,
              ).toString() + "%"
            : "DENIED!"}
        </div>
        
        <div class="statBoxButton" title="Click to trigger a cooldown period"
          onclick={() => {
            handleBasicChange("triggerArousal", null);
          }}
          style="border-color: red; color: red;" role="none"
        >
          Arousal: {Math.floor(
            (lastNumericValue("arousal") / maxY) * 100,
          )} %
        </div>

        <div class="statBoxButton" title="Click to reset {settings.vibration_mode.value !== 3 ? 'denied ' : ''}orgasms count"
            onclick={() => {
            handleBasicChange("resetDenied", null);
          }}
        style="border-color: #FF7FFF; color: #FF7FFF;" role="none"
        >
          {settings.vibration_mode.value === 3 ? 'Orgasms' : 'Denied'}: {lastNumericValue("denied")}
        </div>

        <div class="statBoxButton" title="Click to apply pressure!"
            onclick={() => {
            applyPressure()
          }}
        style="border-color: green; color: green;" role="none"
        >
          Pressure: {Math.round(lastNumericValue("pressure") / maxY * 100)} %
        </div>

      </div>
    </div>
    <div class="gaugesWrapper" style={displayMode != 0 ? "display: none;" : ""}>
      <div class="gauges">
        <div class="gaugeRow">

          <div class="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#333"
              stroke-width="20"
              />
              <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="orange"
              stroke-width="20"
              stroke-dasharray={2 * Math.PI * 85}
              stroke-dashoffset={2 * Math.PI * 85 * (1 - currentPleasure / settings.max_pleasure.value)}
              transform="rotate(90 100 100)"
              stroke-linecap="round"
              class={lastNumericValue("cooldown") == 0 && lastNumericValue("pleasure") > 0 ? "cooldown-flash-stroke-orange" : ""}
              />
              <text
              x="100"
              y="100"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="orange"
              font-size="48"
              font-weight="bold"
              class={lastNumericValue("cooldown") == 0 && lastNumericValue("pleasure") > 0 ? "cooldown-flash-text-orange" : ""}
              >
              
              {Math.round((currentPleasure / settings.max_pleasure.value) * 100)}%
            </text>
            <text
            x="100"
            y="130"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="orange"
            font-size="16"
            font-weight="bold"
            class={lastNumericValue("cooldown") == 0 && lastNumericValue("pleasure") > 0 ? "cooldown-flash-text-orange" : ""}
            >
            Pleasure
          </text>
        </svg>
        <button 
        class="belowCircleButton"
        style="background-color: darkorange; border-color: orange;"
        onclick={() => {
          handleBasicChange("setMode", "manual");
          handleBasicChange("setMotor", 0);
          currentPleasure = 0;
        }}>Manual Full-Stop
          </button>
          </div>
          
          <!-- Arousal Indicator -->
          <div class="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#333"
              stroke-width="20"
              />
              <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
                stroke="red"
                stroke-width="20"
                stroke-dasharray={2 * Math.PI * 85}
                stroke-dashoffset={2 * Math.PI * 85 * (1 - Math.min(1.0,lastNumericValue("arousal") / maxY))}
                transform="rotate(90 100 100)"
                stroke-linecap="round"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-stroke" : ""}
              />
              <line
                x1="100"
                y1="50"
                x2="100"
                y2="0"
                stroke="#EEDD33"
                stroke-width="4"
                transform="rotate({(settings["mid_threshold"].value / maxY) * 360 - 180} 100 100)"
              />

              <line
                x1="100"
                y1="50"
                x2="100"
                y2="0"
                stroke="#FF6666"
                stroke-width="4"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-stroke" : ""}
                transform="rotate({(lastNumericValue("threshold") / maxY) * 360 - 180} 100 100)"
              />
              <text
                x="100"
                y="100"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="red"
                font-size="48"
                font-weight="bold"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-text" : ""}
              >
                {Math.round(lastNumericValue("arousal") / maxY * 100)}%
              </text>
              <text
                x="100"
                y="130"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="red"
                font-size="16"
                font-weight="bold"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-text" : ""}
              >
                Arousal
              </text>
            
            
          </svg>
          <button 
          class="belowCircleButton"
          style="background-color: red; border-color: darkred;"
          onclick={() => {
            handleBasicChange("triggerArousal", null);
          }}>Trigger Edge
            </button>
            
          </div>
        </div>
        <div class="gaugeRow">

          <!-- Denied Indicator -->
          <div class="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#333"
                stroke-width="20"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#FF7FFF"
                stroke-width="20"
                stroke-dasharray={2 * Math.PI * 85}
                stroke-dashoffset={2 * Math.PI * 85 * (1 - lastNumericValue("denied") / maxDenied)}
                transform="rotate(90 100 100)"
                stroke-linecap="round"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-stroke-pink" : ""}
              />
              <text
                x="100"
                y="100"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#FF7FFF"
                font-size="48"
                font-weight="bold"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-text-pink" : ""}
              >
                {lastNumericValue("denied")}
              </text>
              <text
                x="100"
                y="130"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#FF7FFF"
                font-size="16"
                font-weight="bold"
                class={lastNumericValue("cooldown") > 0 ? "cooldown-flash-text-pink" : ""}
              >
                Denied
              </text>
            </svg>
            <button
              onclick={() => handleBasicChange("resetDenied", null)}
              class="belowCircleButton"
              style="background-color: #FF7FFF; color: black; border-color: #FFBFFF;"
              title="Reset denied orgasms count"
            >
              Reset Denied
            </button>
          </div>

          <!-- Pressure Indicator -->
          <div class="circular-progress">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#333"
                stroke-width="20"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="green"
                stroke-width="20"
                stroke-dasharray={2 * Math.PI * 85}
                stroke-dashoffset={2 * Math.PI * 85 * (1 - lastNumericValue("pressure") / maxY)}
                transform="rotate(90 100 100)"
                stroke-linecap="round"
              />
              <text
                x="100"
                y="100"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="green"
                font-size="48"
                font-weight="bold"
              >
                {Math.round(lastNumericValue("pressure") / maxY * 100)}%
              </text>
              <text
                x="100"
                y="130"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="green"
                font-size="16"
                font-weight="bold"
              >
                Pressure
              </text>
            </svg>
            <button 
              class="belowCircleButton"
              style="background-color: green; border-color: darkgreen;"
              title="Everything happens one notch faster"
              onclick={() => {
                applyPressure();
              }}>
                Apply Pressure
            </button>
          </div>
        </div>

      </div>
      <div class={lastNumericValue("cooldown") > 0 ? "statusText cooldown-flash-text" : "statusText"}>
        {$state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode == "MANUAL" ? "MANUALLY CONTROLLING PLEASURE" : (edgeStatusText().length > 0 ? edgeStatusText() : "INCREASING PLEASURE")}
      </div>
    </div>

    <div style={displayMode != 2 ? "display: none;" : "display: flex; justify-content: center; align-items: center; height: 40vh; gap: 2rem;"}>
      <!-- Vertical indicators WIP -->
      <input 
        type="range" 
        min="0" 
        max={settings.max_pleasure.value} 
        step="1" 
        bind:value={currentPleasure} 
        style="
          accent-color: orange; 
          background: linear-gradient(to right, orange 0%, orange 100%);
          cursor: default;
          transform: rotate(-90deg); 
          pointer-events: none;
        " 
        readonly 
      />
    </div>
    <div class="radioBoxes">
      <div class="radioBox">
        <div style="font-weight: bold; margin-right: 2em; color:#999">Control:</div>
        {#each runModes as runMode, index}
          <div class="radioBoxItem">
            <input
              id="runmode-{index}"
              type="radio"
              onchange={() =>{
                handleBasicChange("setMode", runMode);
                if (runMode === 'ORGASM' && settings.vibration_mode.value === 3) {
                  handleSettingChange("vibration_mode", 2); //set to default mode if mode is 0
                }
              }}
              name="runmode"
              value={runMode}
              checked={$state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode == runMode}
            />
            <label for="runmode-{index}" class={$state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode == runMode ? "radioChosen" : "radioChoice"}>{runMode.substring(0, 1).toUpperCase() + runMode.substring(1).toLowerCase()}</label>
          </div>
        {/each}
      </div>
      <div
        class="radioBox"
      >
        <div style="font-weight: bold; margin-right: 0.5em; color:#999">&nbsp;&nbsp;Mode: </div>
        {#each Object.entries(vibration_modes) as [modeId, modeName], index}
          {#if $state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode !== 'ORGASM' || modeId !== '3'}
          <div class="radioBoxItem">
            <input
            id="vibemode-{modeId}"
            type="radio"
            onchange={() =>
                handleSettingChange("vibration_mode", Number(modeId))}
              name="vibemode"
              value={modeId}
              checked={settings.vibration_mode.value === Number(modeId)}
              />
              <label for="vibemode-{modeId}" class={settings.vibration_mode.value === Number(modeId) ? "radioChosen" : "radioChoice"} >{modeName}</label>
            </div>
            {/if}
        {/each}
      </div>
    </div>


    <div class="settingSliders">
      {#if $state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode === 'MANUAL'}
      <label for="pleasure" style="color:orange">Pleasure: {Math.floor(
                (lastNumericValue("pleasure") / maxY) *
                  100,
              )} %</label>
      <input
        id="currentPleasure"
        type="range"
        min="0"
        max={settings.max_pleasure.value}
        step="1"
        bind:value={currentPleasure}
        style="width: 100%;accent-color: orange; background: linear-gradient(to right, orange 0%, orange 100%);"
        oninput={() => {
            //console.log("Dragging pleasure to ", currentPleasure);
            debouncedBasicChange("setMotor",currentPleasure )
            //handleBasicChange("setMotor",currentPleasure )
          }
        }
      />
      {/if}
      
    
      {#if $state.snapshot(readings)[$state.snapshot(readings).length - 1].runMode === 'ORGASM'}
        {@render InputSlider("auto_edging_duration_minutes")}
        {@render InputSlider("max_denied")}
      {/if}

      {#each mainSettings as settingId}
        {@render InputSlider(settingId)}
      {/each}
    </div> 
  </div>
</div>

<dialog
  class="settingsDialog"
  style=""
  open={showSettings}
  bind:this={settingsDialog}
  onclose={() => (showSettings = false)}
>
  <div style="padding: 0; margin-top: 0;">
    <button
      style="color: red; float:right; padding: 0 .1em 0 .1em; font-size: 3em; background: #555; cursor: pointer; line-height: .75em; display: flex; align-items: center; justify-content: center;"
      aria-label="Close settings"
      onclick={() => settingsDialog.close()}
    >
      &times;
    </button>
    <h2>Settings</h2>
    <hr />
    {#each modalSettings as settingId}
      {@render InputSlider(settingId)}
    {/each}
  </div>
</dialog>

<dialog
  class="settingsDialog"
  style=""
  open={showToys}
  bind:this={toysDialog}
  onclose={() => (showToys = false)}
>
  <div style="padding: 0; margin-top: 0;">
    <button
      style="color: red; float:right; padding: 0 .1em 0 .1em; font-size: 3em; background: #555; cursor: pointer; line-height: .75em; display: flex; align-items: center; justify-content: center;"
      aria-label="Close settings"
      onclick={() => toysDialog.close()}
    >
      &times;
    </button>
    <h2>Connect to bluetooth toys <span style="font-size: small;">(WIP)</span></h2>
    <hr />
    <DeviceList bind:this={deviceComponent} bind:deviceList />
    <BTLED bind:this={btledComponent} bind:BTLEDconnected />
  </div>
</dialog>
