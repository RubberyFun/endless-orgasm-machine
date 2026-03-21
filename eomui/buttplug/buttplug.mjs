function j(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var A = { exports: {} }, B;
function q() {
  return B || (B = 1, (function(s) {
    var e = Object.prototype.hasOwnProperty, t = "~";
    function n() {
    }
    Object.create && (n.prototype = /* @__PURE__ */ Object.create(null), new n().__proto__ || (t = !1));
    function r(h, i, a) {
      this.fn = h, this.context = i, this.once = a || !1;
    }
    function c(h, i, a, u, _) {
      if (typeof a != "function")
        throw new TypeError("The listener must be a function");
      var p = new r(a, u || h, _), g = t ? t + i : i;
      return h._events[g] ? h._events[g].fn ? h._events[g] = [h._events[g], p] : h._events[g].push(p) : (h._events[g] = p, h._eventsCount++), h;
    }
    function d(h, i) {
      --h._eventsCount === 0 ? h._events = new n() : delete h._events[i];
    }
    function l() {
      this._events = new n(), this._eventsCount = 0;
    }
    l.prototype.eventNames = function() {
      var i = [], a, u;
      if (this._eventsCount === 0) return i;
      for (u in a = this._events)
        e.call(a, u) && i.push(t ? u.slice(1) : u);
      return Object.getOwnPropertySymbols ? i.concat(Object.getOwnPropertySymbols(a)) : i;
    }, l.prototype.listeners = function(i) {
      var a = t ? t + i : i, u = this._events[a];
      if (!u) return [];
      if (u.fn) return [u.fn];
      for (var _ = 0, p = u.length, g = new Array(p); _ < p; _++)
        g[_] = u[_].fn;
      return g;
    }, l.prototype.listenerCount = function(i) {
      var a = t ? t + i : i, u = this._events[a];
      return u ? u.fn ? 1 : u.length : 0;
    }, l.prototype.emit = function(i, a, u, _, p, g) {
      var I = t ? t + i : i;
      if (!this._events[I]) return !1;
      var o = this._events[I], D = arguments.length, y, v;
      if (o.fn) {
        switch (o.once && this.removeListener(i, o.fn, void 0, !0), D) {
          case 1:
            return o.fn.call(o.context), !0;
          case 2:
            return o.fn.call(o.context, a), !0;
          case 3:
            return o.fn.call(o.context, a, u), !0;
          case 4:
            return o.fn.call(o.context, a, u, _), !0;
          case 5:
            return o.fn.call(o.context, a, u, _, p), !0;
          case 6:
            return o.fn.call(o.context, a, u, _, p, g), !0;
        }
        for (v = 1, y = new Array(D - 1); v < D; v++)
          y[v - 1] = arguments[v];
        o.fn.apply(o.context, y);
      } else {
        var U = o.length, M;
        for (v = 0; v < U; v++)
          switch (o[v].once && this.removeListener(i, o[v].fn, void 0, !0), D) {
            case 1:
              o[v].fn.call(o[v].context);
              break;
            case 2:
              o[v].fn.call(o[v].context, a);
              break;
            case 3:
              o[v].fn.call(o[v].context, a, u);
              break;
            case 4:
              o[v].fn.call(o[v].context, a, u, _);
              break;
            default:
              if (!y) for (M = 1, y = new Array(D - 1); M < D; M++)
                y[M - 1] = arguments[M];
              o[v].fn.apply(o[v].context, y);
          }
      }
      return !0;
    }, l.prototype.on = function(i, a, u) {
      return c(this, i, a, u, !1);
    }, l.prototype.once = function(i, a, u) {
      return c(this, i, a, u, !0);
    }, l.prototype.removeListener = function(i, a, u, _) {
      var p = t ? t + i : i;
      if (!this._events[p]) return this;
      if (!a)
        return d(this, p), this;
      var g = this._events[p];
      if (g.fn)
        g.fn === a && (!_ || g.once) && (!u || g.context === u) && d(this, p);
      else {
        for (var I = 0, o = [], D = g.length; I < D; I++)
          (g[I].fn !== a || _ && !g[I].once || u && g[I].context !== u) && o.push(g[I]);
        o.length ? this._events[p] = o.length === 1 ? o[0] : o : d(this, p);
      }
      return this;
    }, l.prototype.removeAllListeners = function(i) {
      var a;
      return i ? (a = t ? t + i : i, this._events[a] && d(this, a)) : (this._events = new n(), this._eventsCount = 0), this;
    }, l.prototype.off = l.prototype.removeListener, l.prototype.addListener = l.prototype.on, l.prefixed = t, l.EventEmitter = l, s.exports = l;
  })(A)), A.exports;
}
var z = q();
const k = /* @__PURE__ */ j(z);
var W = /* @__PURE__ */ ((s) => (s[s.Off = 0] = "Off", s[s.Error = 1] = "Error", s[s.Warn = 2] = "Warn", s[s.Info = 3] = "Info", s[s.Debug = 4] = "Debug", s[s.Trace = 5] = "Trace", s))(W || {});
class H {
  /** Timestamp for the log message */
  timestamp;
  /** Log Message */
  logMessage;
  /** Log Level */
  logLevel;
  /**
   * @param logMessage Log message.
   * @param logLevel: Log severity level.
   */
  constructor(e, t) {
    const n = /* @__PURE__ */ new Date(), r = n.getHours(), c = n.getMinutes(), d = n.getSeconds();
    this.timestamp = `${r}:${c}:${d}`, this.logMessage = e, this.logLevel = t;
  }
  /**
   * Returns the log message.
   */
  get Message() {
    return this.logMessage;
  }
  /**
   * Returns the log message level.
   */
  get LogLevel() {
    return this.logLevel;
  }
  /**
   * Returns the log message timestamp.
   */
  get Timestamp() {
    return this.timestamp;
  }
  /**
   * Returns a formatted string with timestamp, level, and message.
   */
  get FormattedMessage() {
    return `${W[this.logLevel]} : ${this.timestamp} : ${this.logMessage}`;
  }
}
class b extends k {
  /** Singleton instance for the logger */
  static sLogger = void 0;
  /** Sets maximum log level to log to console */
  maximumConsoleLogLevel = 0;
  /** Sets maximum log level for all log messages */
  maximumEventLogLevel = 0;
  /**
   * Returns the stored static instance of the logger, creating one if it
   * doesn't currently exist.
   */
  static get Logger() {
    return b.sLogger === void 0 && (b.sLogger = new b()), this.sLogger;
  }
  /**
   * Constructor. Can only be called internally since we regulate ButtplugLogger
   * ownership.
   */
  constructor() {
    super();
  }
  /**
   * Set the maximum log level to output to console.
   */
  get MaximumConsoleLogLevel() {
    return this.maximumConsoleLogLevel;
  }
  /**
   * Get the maximum log level to output to console.
   */
  set MaximumConsoleLogLevel(e) {
    this.maximumConsoleLogLevel = e;
  }
  /**
   * Set the global maximum log level
   */
  get MaximumEventLogLevel() {
    return this.maximumEventLogLevel;
  }
  /**
   * Get the global maximum log level
   */
  set MaximumEventLogLevel(e) {
    this.maximumEventLogLevel = e;
  }
  /**
   * Log new message at Error level.
   */
  Error(e) {
    this.AddLogMessage(
      e,
      1
      /* Error */
    );
  }
  /**
   * Log new message at Warn level.
   */
  Warn(e) {
    this.AddLogMessage(
      e,
      2
      /* Warn */
    );
  }
  /**
   * Log new message at Info level.
   */
  Info(e) {
    this.AddLogMessage(
      e,
      3
      /* Info */
    );
  }
  /**
   * Log new message at Debug level.
   */
  Debug(e) {
    this.AddLogMessage(
      e,
      4
      /* Debug */
    );
  }
  /**
   * Log new message at Trace level.
   */
  Trace(e) {
    this.AddLogMessage(
      e,
      5
      /* Trace */
    );
  }
  /**
   * Checks to see if message should be logged, and if so, adds message to the
   * log buffer. May also print message and emit event.
   */
  AddLogMessage(e, t) {
    if (t > this.maximumEventLogLevel && t > this.maximumConsoleLogLevel)
      return;
    const n = new H(e, t);
    t <= this.maximumConsoleLogLevel && console.log(n.FormattedMessage), t <= this.maximumEventLogLevel && this.emit("log", n);
  }
}
class m extends Error {
  get ErrorClass() {
    return this.errorClass;
  }
  get InnerError() {
    return this.innerError;
  }
  get Id() {
    return this.messageId;
  }
  get ErrorMessage() {
    return {
      Error: {
        Id: this.Id,
        ErrorCode: this.ErrorClass,
        ErrorMessage: this.message
      }
    };
  }
  static LogAndError(e, t, n, r = S) {
    return t.Error(n), new e(n, r);
  }
  static FromError(e) {
    switch (e.ErrorCode) {
      case w.ERROR_DEVICE:
        return new E(e.ErrorMessage, e.Id);
      case w.ERROR_INIT:
        return new G(e.ErrorMessage, e.Id);
      case w.ERROR_UNKNOWN:
        return new J(e.ErrorMessage, e.Id);
      case w.ERROR_PING:
        return new K(e.ErrorMessage, e.Id);
      case w.ERROR_MSG:
        return new x(e.ErrorMessage, e.Id);
      default:
        throw new Error(`Message type ${e.ErrorCode} not handled`);
    }
  }
  errorClass = w.ERROR_UNKNOWN;
  innerError;
  messageId;
  constructor(e, t, n = S, r) {
    super(e), this.errorClass = t, this.innerError = r, this.messageId = n;
  }
}
class G extends m {
  constructor(e, t = S) {
    super(e, w.ERROR_INIT, t);
  }
}
class E extends m {
  constructor(e, t = S) {
    super(e, w.ERROR_DEVICE, t);
  }
}
class x extends m {
  constructor(e, t = S) {
    super(e, w.ERROR_MSG, t);
  }
}
class K extends m {
  constructor(e, t = S) {
    super(e, w.ERROR_PING, t);
  }
}
class J extends m {
  constructor(e, t = S) {
    super(e, w.ERROR_UNKNOWN, t);
  }
}
const S = 0, ce = 1, ue = 4294967295, X = 4, Y = 0;
function $(s) {
  for (let [e, t] of Object.entries(s))
    if (t != null)
      return t.Id;
  throw new x(`Message ${s} does not have an ID.`);
}
function Q(s, e) {
  for (let [t, n] of Object.entries(s))
    if (n != null) {
      n.Id = e;
      return;
    }
  throw new x(`Message ${s} does not have an ID.`);
}
var w = /* @__PURE__ */ ((s) => (s[s.ERROR_UNKNOWN = 0] = "ERROR_UNKNOWN", s[s.ERROR_INIT = 1] = "ERROR_INIT", s[s.ERROR_PING = 2] = "ERROR_PING", s[s.ERROR_MSG = 3] = "ERROR_MSG", s[s.ERROR_DEVICE = 4] = "ERROR_DEVICE", s))(w || {});
function Z(s) {
  if (!Array.isArray(s)) return s;
  const e = {}, t = {
    SensorReadCmd: "Read",
    SensorSubscribeCmd: "Subscribe",
    SensorUnsubscribeCmd: "Unsubscribe"
  };
  return s.forEach((n, r) => {
    const c = {
      FeatureDescriptor: n.description || "",
      Output: {},
      Input: {},
      FeatureIndex: r
    }, d = n["feature-type"] || "Unknown";
    if (n.actuator) {
      const l = n.actuator["step-range"] || n.actuator["step-limit"] || [0, 1];
      c.Output[d] = { Value: l[1] || 1 };
    }
    if (n.sensor) {
      const l = n.sensor["value-range"], h = n.sensor.messages || [];
      c.Input[d] = {
        Value: l ? l[0] : [0, 1],
        Command: h.map((i) => t[i] || i)
      };
    }
    e[r] = c;
  }), e;
}
function T(s) {
  return {
    DeviceIndex: s.DeviceIndex,
    DeviceName: s.DeviceName,
    DeviceFeatures: Z(s.DeviceFeatures),
    DeviceDisplayName: s.DeviceDisplayName,
    DeviceMessageTimingGap: s.DeviceMessageTimingGap
  };
}
var f = /* @__PURE__ */ ((s) => (s.Unknown = "Unknown", s.Vibrate = "Vibrate", s.Rotate = "Rotate", s.Oscillate = "Oscillate", s.Constrict = "Constrict", s.Inflate = "Inflate", s.Position = "Position", s.HwPositionWithDuration = "HwPositionWithDuration", s.Temperature = "Temperature", s.Spray = "Spray", s.Led = "Led", s))(f || {}), O = /* @__PURE__ */ ((s) => (s.Unknown = "Unknown", s.Battery = "Battery", s.RSSI = "RSSI", s.Button = "Button", s.Pressure = "Pressure", s))(O || {}), L = /* @__PURE__ */ ((s) => (s.Read = "Read", s.Subscribe = "Subscribe", s.Unsubscribe = "Unsubscribe", s))(L || {});
class ee {
  constructor(e, t, n, r) {
    this._deviceIndex = e, this._deviceName = t, this._feature = n, this._sendClosure = r;
  }
  send = async (e) => await this._sendClosure(e);
  sendMsgExpectOk = async (e) => {
    const t = await this.send(e);
    if (t.Ok === void 0)
      throw t.Error !== void 0 ? m.FromError(t) : new x("Expected Ok or Error, and didn't get either!");
  };
  isOutputValid(e) {
    if (this._feature.Output !== void 0 && !this._feature.Output.hasOwnProperty(e))
      throw new E(`Feature index ${this._feature.FeatureIndex} does not support type ${e} for device ${this._deviceName}`);
  }
  isInputValid(e) {
    if (this._feature.Input !== void 0 && !this._feature.Input.hasOwnProperty(e))
      throw new E(`Feature index ${this._feature.FeatureIndex} does not support type ${e} for device ${this._deviceName}`);
  }
  async sendOutputCmd(e) {
    if (this.isOutputValid(e.outputType), e.value === void 0)
      throw new E(`${e.outputType} requires value defined`);
    const t = e.outputType;
    let n;
    if (e.value.percent !== void 0)
      n = e.value.percent;
    else {
      const c = this._feature.Output[t]?.Value ?? 1;
      n = c > 0 ? e.value.steps / c : 0;
    }
    let r;
    if (t === f.Rotate)
      r = {
        RotateCmd: {
          Id: 1,
          DeviceIndex: this._deviceIndex,
          Rotations: [{
            Index: this._feature.FeatureIndex,
            Speed: n,
            Clockwise: !0
          }]
        }
      };
    else if (t === f.Position || t === f.HwPositionWithDuration) {
      if (e.duration === void 0)
        throw new E("Position commands require duration");
      r = {
        LinearCmd: {
          Id: 1,
          DeviceIndex: this._deviceIndex,
          Vectors: [{
            Index: this._feature.FeatureIndex,
            Duration: e.duration,
            Position: n
          }]
        }
      };
    } else
      r = {
        ScalarCmd: {
          Id: 1,
          DeviceIndex: this._deviceIndex,
          Scalars: [{
            Index: this._feature.FeatureIndex,
            Scalar: n,
            ActuatorType: t
          }]
        }
      };
    await this.sendMsgExpectOk(r);
  }
  hasOutput(e) {
    return this._feature.Output !== void 0 ? this._feature.Output.hasOwnProperty(e.toString()) : !1;
  }
  hasInput(e) {
    return this._feature.Input !== void 0 ? this._feature.Input.hasOwnProperty(e.toString()) : !1;
  }
  async runOutput(e) {
    if (this._feature.Output !== void 0 && this._feature.Output.hasOwnProperty(e.outputType.toString()))
      return this.sendOutputCmd(e);
    throw new E(`Output type ${e.outputType} not supported by feature.`);
  }
  async runInput(e, t) {
    this.isInputValid(e);
    const n = {
      Id: 1,
      DeviceIndex: this._deviceIndex,
      FeatureIndex: this._feature.FeatureIndex,
      SensorType: e
    };
    let r;
    if (t === L.Read ? r = { SensorReadCmd: n } : t === L.Subscribe ? r = { SensorSubscribeCmd: n } : r = { SensorUnsubscribeCmd: n }, t === L.Read) {
      const c = await this.send(r);
      if (c.SensorReading !== void 0) {
        let d = c.SensorReading.Data[0];
        return c.SensorReading.SensorType === O.Battery && (d > 100 ? d = d / 1e4 : d > 1 && (d = d / 100)), {
          DeviceIndex: c.SensorReading.DeviceIndex,
          FeatureIndex: c.SensorReading.FeatureIndex,
          Reading: {
            [c.SensorReading.SensorType]: { Value: d }
          },
          Id: c.SensorReading.Id
        };
      } else throw c.Error !== void 0 ? m.FromError(c) : new x("Expected SensorReading or Error, and didn't get either!");
    } else
      await this.sendMsgExpectOk(r);
  }
}
class N extends k {
  //
  //  // Map of messages and their attributes (feature count, etc...)
  //  private allowedMsgs: Map<string, Messages.MessageAttributes> = new Map<
  //    string,
  //    Messages.MessageAttributes
  //  >();
  //
  /**
   * @param _index Index of the device, as created by the device manager.
   * @param _name Name of the device.
   * @param allowedMsgs Buttplug messages the device can receive.
   */
  constructor(e, t) {
    super(), this._deviceInfo = e, this._sendClosure = t, this._features = new Map(Object.entries(e.DeviceFeatures).map(([n, r]) => [parseInt(n), new ee(e.DeviceIndex, e.DeviceName, r, t)]));
  }
  _features;
  /**
   * Return the name of the device.
   */
  get name() {
    return this._deviceInfo.DeviceName;
  }
  /**
   * Return the user set name of the device.
   */
  get displayName() {
    return this._deviceInfo.DeviceDisplayName;
  }
  /**
   * Return the index of the device.
   */
  get index() {
    return this._deviceInfo.DeviceIndex;
  }
  /**
   * Return the index of the device.
   */
  get messageTimingGap() {
    return this._deviceInfo.DeviceMessageTimingGap;
  }
  get features() {
    return this._features;
  }
  //  /**
  //   * Return a list of message types the device accepts.
  //   */
  //  public get messageAttributes(): Messages.MessageAttributes {
  //    return this._deviceInfo.DeviceMessages;
  //  }
  //
  static fromMsg(e, t) {
    return new N(e, t);
  }
  async send(e) {
    return await this._sendClosure(e);
  }
  sendMsgExpectOk = async (e) => {
    const t = await this.send(e);
    if (t.Ok === void 0 && t.Error !== void 0)
      throw m.FromError(t);
  };
  isOutputValid(e, t) {
    if (!this._deviceInfo.DeviceFeatures.hasOwnProperty(e.toString()))
      throw new E(`Feature index ${e} does not exist for device ${this.name}`);
    if (this._deviceInfo.DeviceFeatures[e.toString()].Outputs !== void 0 && !this._deviceInfo.DeviceFeatures[e.toString()].Outputs.hasOwnProperty(t))
      throw new E(`Feature index ${e} does not support type ${t} for device ${this.name}`);
  }
  hasOutput(e) {
    return Array.from(this._features.values()).some((t) => t.hasOutput(e));
  }
  hasInput(e) {
    return Array.from(this._features.values()).some((t) => t.hasInput(e));
  }
  async runOutput(e) {
    let t = [];
    for (let n of this._features.values())
      n.hasOutput(e.outputType) && t.push(n.runOutput(e));
    if (t.length == 0)
      return Promise.reject(`No features with output type ${e.outputType}`);
    await Promise.all(t);
  }
  async stop() {
    await this.sendMsgExpectOk({ StopDeviceCmd: { Id: 1, DeviceIndex: this.index } });
  }
  async battery() {
    for (let e of this._features.values())
      if (e.hasInput(O.Battery)) {
        let t = await e.runInput(O.Battery, L.Read);
        if (t === void 0)
          throw new x("Got incorrect message back.");
        if (t.Reading[O.Battery] === void 0)
          throw new x("Got reading with no Battery info.");
        return t.Reading[O.Battery].Value;
      }
    throw new E("No battery present on this device.");
  }
  emitDisconnected() {
    this.emit("deviceremoved");
  }
}
class te {
  constructor(e) {
    this._useCounter = e;
  }
  _counter = 1;
  _waitingMsgs = /* @__PURE__ */ new Map();
  // One of the places we should actually return a promise, as we need to store
  // them while waiting for them to return across the line.
  // tslint:disable:promise-function-async
  PrepareOutgoingMessage(e) {
    this._useCounter && (Q(e, this._counter), this._counter += 1);
    let t, n;
    const r = new Promise(
      (c, d) => {
        t = c, n = d;
      }
    );
    return this._waitingMsgs.set($(e), [t, n]), r;
  }
  ParseIncomingMessages(e) {
    const t = [];
    for (const n of e) {
      let r = $(n);
      if (r !== S && this._waitingMsgs.has(r)) {
        const [c, d] = this._waitingMsgs.get(r);
        if (n.Error !== void 0) {
          d(m.FromError(n.Error));
          continue;
        }
        c(n);
        continue;
      } else
        t.push(n);
    }
    return t;
  }
}
class se extends m {
  constructor(e) {
    super(e, w.ERROR_UNKNOWN);
  }
}
class de extends k {
  _pingTimer = null;
  _connector = null;
  _devices = /* @__PURE__ */ new Map();
  _clientName;
  _logger = b.Logger;
  _isScanning = !1;
  _sorter = new te(!0);
  constructor(e = "Generic Buttplug Client") {
    super(), this._clientName = e, this._logger.Debug(`ButtplugClient: Client ${e} created.`);
  }
  get connected() {
    return this._connector !== null && this._connector.Connected;
  }
  get devices() {
    return this.checkConnector(), this._devices;
  }
  get isScanning() {
    return this._isScanning;
  }
  connect = async (e) => {
    this._logger.Info(
      `ButtplugClient: Connecting using ${e.constructor.name}`
    ), await e.connect(), this._connector = e, this._connector.addListener("message", this.parseMessages), this._connector.addListener("disconnect", this.disconnectHandler), await this.initializeConnection();
  };
  disconnect = async () => {
    this._logger.Debug("ButtplugClient: Disconnect called"), this._devices.clear(), this.checkConnector(), await this.shutdownConnection(), await this._connector.disconnect();
  };
  startScanning = async () => {
    this._logger.Debug("ButtplugClient: StartScanning called"), this._isScanning = !0, await this.sendMsgExpectOk({ StartScanning: { Id: 1 } });
  };
  stopScanning = async () => {
    this._logger.Debug("ButtplugClient: StopScanning called"), this._isScanning = !1, await this.sendMsgExpectOk({ StopScanning: { Id: 1 } });
  };
  stopAllDevices = async () => {
    this._logger.Debug("ButtplugClient: StopAllDevices"), await this.sendMsgExpectOk({ StopAllDevices: { Id: 1 } });
  };
  disconnectHandler = () => {
    this._logger.Info("ButtplugClient: Disconnect event receieved."), this.emit("disconnect");
  };
  parseMessages = (e) => {
    const t = this._sorter.ParseIncomingMessages(e);
    for (const n of t)
      if (n.DeviceList !== void 0) {
        this.parseDeviceList(n);
        break;
      } else n.DeviceAdded !== void 0 ? this.parseDeviceAdded(n.DeviceAdded) : n.DeviceRemoved !== void 0 ? this.parseDeviceRemoved(n.DeviceRemoved) : n.ScanningFinished !== void 0 ? (this._isScanning = !1, this.emit("scanningfinished", n)) : n.InputReading !== void 0 ? this.emit("inputreading", n) : n.SensorReading !== void 0 ? this.emit("sensorreading", n) : console.log(`Unhandled message: ${JSON.stringify(n)}`);
  };
  initializeConnection = async () => {
    this.checkConnector();
    const e = await this.sendMessage(
      {
        RequestServerInfo: {
          ClientName: this._clientName,
          Id: 1,
          ProtocolVersionMajor: X,
          ProtocolVersionMinor: Y
        }
      }
    );
    if (e.ServerInfo !== void 0) {
      const t = e;
      return this._logger.Info(
        `ButtplugClient: Connected to Server ${t.ServerName}`
      ), t.MaxPingTime, await this.requestDeviceList(), !0;
    } else if (e.Error !== void 0) {
      await this._connector.disconnect();
      const t = e.Error;
      throw m.LogAndError(
        G,
        this._logger,
        `Cannot connect to server. ${t.ErrorMessage}`
      );
    }
    return !1;
  };
  parseDeviceList = (e) => {
    for (let [t, n] of Object.entries(e.Devices)) {
      const r = T(n);
      if (this._devices.has(r.DeviceIndex))
        this._logger.Debug(`ButtplugClient: Device already added: ${n}`);
      else {
        const c = N.fromMsg(
          r,
          this.sendMessageClosure
        );
        this._logger.Debug(`ButtplugClient: Adding Device: ${c}`), this._devices.set(r.DeviceIndex, c), this.emit("deviceadded", c);
      }
    }
    for (let [t, n] of this._devices.entries())
      e.Devices.hasOwnProperty(t.toString()) || (this._devices.delete(t), this.emit("deviceremoved", n));
  };
  parseDeviceAdded = (e) => {
    const t = T(e);
    if (!this._devices.has(t.DeviceIndex)) {
      const n = N.fromMsg(
        t,
        this.sendMessageClosure
      );
      this._logger.Debug(`ButtplugClient: Device added: ${t.DeviceName}`), this._devices.set(t.DeviceIndex, n), this.emit("deviceadded", n);
    }
  };
  parseDeviceRemoved = (e) => {
    const t = this._devices.get(e.DeviceIndex);
    t && (this._devices.delete(e.DeviceIndex), t.emitDisconnected(), this.emit("deviceremoved", t));
  };
  requestDeviceList = async () => {
    this.checkConnector(), this._logger.Debug("ButtplugClient: ReceiveDeviceList called");
    const e = await this.sendMessage(
      {
        RequestDeviceList: { Id: 1 }
      }
    );
    this.parseDeviceList(e.DeviceList);
  };
  shutdownConnection = async () => {
    await this.stopAllDevices(), this._pingTimer !== null && (clearInterval(this._pingTimer), this._pingTimer = null);
  };
  async sendMessage(e) {
    this.checkConnector();
    const t = this._sorter.PrepareOutgoingMessage(e);
    return await this._connector.send(e), await t;
  }
  checkConnector() {
    if (!this.connected)
      throw new se(
        "ButtplugClient not connected"
      );
  }
  sendMsgExpectOk = async (e) => {
    const t = await this.sendMessage(e);
    if (t.Ok === void 0)
      throw t.Error !== void 0 ? m.FromError(t) : m.LogAndError(
        x,
        this._logger,
        `Message ${t} not handled by SendMsgExpectOk`
      );
  };
  sendMessageClosure = async (e) => await this.sendMessage(e);
}
class ne extends k {
  constructor(e) {
    super(), this._url = e;
  }
  _ws;
  _websocketConstructor = null;
  get Connected() {
    return this._ws !== void 0;
  }
  connect = async () => new Promise((e, t) => {
    const n = new (this._websocketConstructor ?? WebSocket)(this._url), r = (d) => {
      t(d);
    }, c = (d) => t(d.reason);
    n.addEventListener("open", async () => {
      this._ws = n;
      try {
        await this.initialize(), this._ws.addEventListener("message", (d) => {
          this.parseIncomingMessage(d);
        }), this._ws.removeEventListener("close", c), this._ws.removeEventListener("error", r), this._ws.addEventListener("close", this.disconnect), e();
      } catch (d) {
        t(d);
      }
    }), n.addEventListener("error", r), n.addEventListener("close", c);
  });
  disconnect = async () => {
    this.Connected && (this._ws.close(), this._ws = void 0, this.emit("disconnect"));
  };
  sendMessage(e) {
    if (!this.Connected)
      throw new Error("ButtplugBrowserWebsocketConnector not connected");
    this._ws.send("[" + JSON.stringify(e) + "]");
  }
  initialize = async () => Promise.resolve();
  parseIncomingMessage(e) {
    if (typeof e.data == "string") {
      const t = JSON.parse(e.data);
      this.emit("message", t);
    } else e.data instanceof Blob;
  }
  onReaderLoad(e) {
    const t = JSON.parse(e.target.result);
    this.emit("message", t);
  }
}
class re extends ne {
  send = (e) => {
    if (!this.Connected)
      throw new Error("ButtplugClient not connected");
    this.sendMessage(e);
  };
}
var F, V;
function ie() {
  return V || (V = 1, F = function() {
    throw new Error(
      "ws does not work in the browser. Browser clients must use the native WebSocket object"
    );
  }), F;
}
var oe = ie();
class he extends re {
  _websocketConstructor = oe.WebSocket;
}
class C {
  _percent;
  _steps;
  get percent() {
    return this._percent;
  }
  get steps() {
    return this._steps;
  }
  static createSteps(e) {
    let t = new C();
    return t._steps = e, t;
  }
  static createPercent(e) {
    if (e < 0 || e > 1)
      throw new E(`Percent value ${e} is not in the range 0.0 <= x <= 1.0`);
    let t = new C();
    return t._percent = e, t;
  }
}
class P {
  constructor(e, t, n) {
    this._outputType = e, this._value = t, this._duration = n;
  }
  get outputType() {
    return this._outputType;
  }
  get value() {
    return this._value;
  }
  get duration() {
    return this._duration;
  }
}
class R {
  constructor(e) {
    this._outputType = e;
  }
  steps(e) {
    return new P(this._outputType, C.createSteps(e), void 0);
  }
  percent(e) {
    return new P(this._outputType, C.createPercent(e), void 0);
  }
}
class ae {
  steps(e, t) {
    return new P(f.Position, C.createSteps(e), t);
  }
  percent(e, t) {
    return new P(f.HwPositionWithDuration, C.createPercent(e), t);
  }
}
class le {
  constructor() {
  }
  static get Vibrate() {
    return new R(f.Vibrate);
  }
  static get Rotate() {
    return new R(f.Rotate);
  }
  static get Oscillate() {
    return new R(f.Oscillate);
  }
  static get Constrict() {
    return new R(f.Constrict);
  }
  static get Inflate() {
    return new R(f.Inflate);
  }
  static get Temperature() {
    return new R(f.Temperature);
  }
  static get Led() {
    return new R(f.Led);
  }
  static get Spray() {
    return new R(f.Spray);
  }
  static get Position() {
    return new R(f.Position);
  }
  static get PositionWithDuration() {
    return new ae();
  }
}
export {
  re as ButtplugBrowserWebsocketClientConnector,
  de as ButtplugClient,
  se as ButtplugClientConnectorException,
  N as ButtplugClientDevice,
  E as ButtplugDeviceError,
  m as ButtplugError,
  G as ButtplugInitError,
  W as ButtplugLogLevel,
  b as ButtplugLogger,
  x as ButtplugMessageError,
  te as ButtplugMessageSorter,
  he as ButtplugNodeWebsocketClientConnector,
  K as ButtplugPingError,
  J as ButtplugUnknownError,
  ce as DEFAULT_MESSAGE_ID,
  le as DeviceOutput,
  P as DeviceOutputCommand,
  ae as DeviceOutputPositionWithDurationConstructor,
  R as DeviceOutputValueConstructor,
  w as ErrorClass,
  L as InputCommandType,
  O as InputType,
  H as LogMessage,
  ue as MAX_ID,
  X as MESSAGE_SPEC_VERSION_MAJOR,
  Y as MESSAGE_SPEC_VERSION_MINOR,
  f as OutputType,
  S as SYSTEM_MESSAGE_ID,
  $ as msgId,
  Z as normalizeDeviceFeatures,
  T as normalizeDeviceInfo,
  Q as setMsgId
};
