var Gt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function hn(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var Ht = { exports: {} };
(function(s) {
  var e = Object.prototype.hasOwnProperty, t = "~";
  function n() {
  }
  Object.create && (n.prototype = /* @__PURE__ */ Object.create(null), new n().__proto__ || (t = !1));
  function o(v, _, l) {
    this.fn = v, this.context = _, this.once = l || !1;
  }
  function u(v, _, l, w, h) {
    if (typeof l != "function")
      throw new TypeError("The listener must be a function");
    var P = new o(l, w || v, h), I = t ? t + _ : _;
    return v._events[I] ? v._events[I].fn ? v._events[I] = [v._events[I], P] : v._events[I].push(P) : (v._events[I] = P, v._eventsCount++), v;
  }
  function c(v, _) {
    --v._eventsCount === 0 ? v._events = new n() : delete v._events[_];
  }
  function f() {
    this._events = new n(), this._eventsCount = 0;
  }
  f.prototype.eventNames = function() {
    var _ = [], l, w;
    if (this._eventsCount === 0) return _;
    for (w in l = this._events)
      e.call(l, w) && _.push(t ? w.slice(1) : w);
    return Object.getOwnPropertySymbols ? _.concat(Object.getOwnPropertySymbols(l)) : _;
  }, f.prototype.listeners = function(_) {
    var l = t ? t + _ : _, w = this._events[l];
    if (!w) return [];
    if (w.fn) return [w.fn];
    for (var h = 0, P = w.length, I = new Array(P); h < P; h++)
      I[h] = w[h].fn;
    return I;
  }, f.prototype.listenerCount = function(_) {
    var l = t ? t + _ : _, w = this._events[l];
    return w ? w.fn ? 1 : w.length : 0;
  }, f.prototype.emit = function(_, l, w, h, P, I) {
    var W = t ? t + _ : _;
    if (!this._events[W]) return !1;
    var y = this._events[W], R = arguments.length, T, x;
    if (y.fn) {
      switch (y.once && this.removeListener(_, y.fn, void 0, !0), R) {
        case 1:
          return y.fn.call(y.context), !0;
        case 2:
          return y.fn.call(y.context, l), !0;
        case 3:
          return y.fn.call(y.context, l, w), !0;
        case 4:
          return y.fn.call(y.context, l, w, h), !0;
        case 5:
          return y.fn.call(y.context, l, w, h, P), !0;
        case 6:
          return y.fn.call(y.context, l, w, h, P, I), !0;
      }
      for (x = 1, T = new Array(R - 1); x < R; x++)
        T[x - 1] = arguments[x];
      y.fn.apply(y.context, T);
    } else {
      var J = y.length, A;
      for (x = 0; x < J; x++)
        switch (y[x].once && this.removeListener(_, y[x].fn, void 0, !0), R) {
          case 1:
            y[x].fn.call(y[x].context);
            break;
          case 2:
            y[x].fn.call(y[x].context, l);
            break;
          case 3:
            y[x].fn.call(y[x].context, l, w);
            break;
          case 4:
            y[x].fn.call(y[x].context, l, w, h);
            break;
          default:
            if (!T) for (A = 1, T = new Array(R - 1); A < R; A++)
              T[A - 1] = arguments[A];
            y[x].fn.apply(y[x].context, T);
        }
    }
    return !0;
  }, f.prototype.on = function(_, l, w) {
    return u(this, _, l, w, !1);
  }, f.prototype.once = function(_, l, w) {
    return u(this, _, l, w, !0);
  }, f.prototype.removeListener = function(_, l, w, h) {
    var P = t ? t + _ : _;
    if (!this._events[P]) return this;
    if (!l)
      return c(this, P), this;
    var I = this._events[P];
    if (I.fn)
      I.fn === l && (!h || I.once) && (!w || I.context === w) && c(this, P);
    else {
      for (var W = 0, y = [], R = I.length; W < R; W++)
        (I[W].fn !== l || h && !I[W].once || w && I[W].context !== w) && y.push(I[W]);
      y.length ? this._events[P] = y.length === 1 ? y[0] : y : c(this, P);
    }
    return this;
  }, f.prototype.removeAllListeners = function(_) {
    var l;
    return _ ? (l = t ? t + _ : _, this._events[l] && c(this, l)) : (this._events = new n(), this._eventsCount = 0), this;
  }, f.prototype.off = f.prototype.removeListener, f.prototype.addListener = f.prototype.on, f.prefixed = t, f.EventEmitter = f, s.exports = f;
})(Ht);
var ln = Ht.exports;
const qe = /* @__PURE__ */ hn(ln);
/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */
var Jt = /* @__PURE__ */ ((s) => (s[s.Off = 0] = "Off", s[s.Error = 1] = "Error", s[s.Warn = 2] = "Warn", s[s.Info = 3] = "Info", s[s.Debug = 4] = "Debug", s[s.Trace = 5] = "Trace", s))(Jt || {});
class pn {
  /**
   * @param logMessage Log message.
   * @param logLevel: Log severity level.
   */
  constructor(e, t) {
    const n = /* @__PURE__ */ new Date(), o = n.getHours(), u = n.getMinutes(), c = n.getSeconds();
    this.timestamp = `${o}:${u}:${c}`, this.logMessage = e, this.logLevel = t;
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
    return `${Jt[this.logLevel]} : ${this.timestamp} : ${this.logMessage}`;
  }
}
const fe = class fe extends qe {
  /**
   * Constructor. Can only be called internally since we regulate ButtplugLogger
   * ownership.
   */
  constructor() {
    super(), this.maximumConsoleLogLevel = 0, this.maximumEventLogLevel = 0;
  }
  /**
   * Returns the stored static instance of the logger, creating one if it
   * doesn't currently exist.
   */
  static get Logger() {
    return fe.sLogger === void 0 && (fe.sLogger = new fe()), this.sLogger;
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
    const n = new pn(e, t);
    t <= this.maximumConsoleLogLevel && console.log(n.FormattedMessage), t <= this.maximumEventLogLevel && this.emit("log", n);
  }
};
fe.sLogger = void 0;
let et = fe;
var O;
(function(s) {
  s[s.PLAIN_TO_CLASS = 0] = "PLAIN_TO_CLASS", s[s.CLASS_TO_PLAIN = 1] = "CLASS_TO_PLAIN", s[s.CLASS_TO_CLASS = 2] = "CLASS_TO_CLASS";
})(O || (O = {}));
var gn = (
  /** @class */
  function() {
    function s() {
      this._typeMetadatas = /* @__PURE__ */ new Map(), this._transformMetadatas = /* @__PURE__ */ new Map(), this._exposeMetadatas = /* @__PURE__ */ new Map(), this._excludeMetadatas = /* @__PURE__ */ new Map(), this._ancestorsMap = /* @__PURE__ */ new Map();
    }
    return s.prototype.addTypeMetadata = function(e) {
      this._typeMetadatas.has(e.target) || this._typeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._typeMetadatas.get(e.target).set(e.propertyName, e);
    }, s.prototype.addTransformMetadata = function(e) {
      this._transformMetadatas.has(e.target) || this._transformMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._transformMetadatas.get(e.target).has(e.propertyName) || this._transformMetadatas.get(e.target).set(e.propertyName, []), this._transformMetadatas.get(e.target).get(e.propertyName).push(e);
    }, s.prototype.addExposeMetadata = function(e) {
      this._exposeMetadatas.has(e.target) || this._exposeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._exposeMetadatas.get(e.target).set(e.propertyName, e);
    }, s.prototype.addExcludeMetadata = function(e) {
      this._excludeMetadatas.has(e.target) || this._excludeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._excludeMetadatas.get(e.target).set(e.propertyName, e);
    }, s.prototype.findTransformMetadatas = function(e, t, n) {
      return this.findMetadatas(this._transformMetadatas, e, t).filter(function(o) {
        return !o.options || o.options.toClassOnly === !0 && o.options.toPlainOnly === !0 ? !0 : o.options.toClassOnly === !0 ? n === O.CLASS_TO_CLASS || n === O.PLAIN_TO_CLASS : o.options.toPlainOnly === !0 ? n === O.CLASS_TO_PLAIN : !0;
      });
    }, s.prototype.findExcludeMetadata = function(e, t) {
      return this.findMetadata(this._excludeMetadatas, e, t);
    }, s.prototype.findExposeMetadata = function(e, t) {
      return this.findMetadata(this._exposeMetadatas, e, t);
    }, s.prototype.findExposeMetadataByCustomName = function(e, t) {
      return this.getExposedMetadatas(e).find(function(n) {
        return n.options && n.options.name === t;
      });
    }, s.prototype.findTypeMetadata = function(e, t) {
      return this.findMetadata(this._typeMetadatas, e, t);
    }, s.prototype.getStrategy = function(e) {
      var t = this._excludeMetadatas.get(e), n = t && t.get(void 0), o = this._exposeMetadatas.get(e), u = o && o.get(void 0);
      return n && u || !n && !u ? "none" : n ? "excludeAll" : "exposeAll";
    }, s.prototype.getExposedMetadatas = function(e) {
      return this.getMetadata(this._exposeMetadatas, e);
    }, s.prototype.getExcludedMetadatas = function(e) {
      return this.getMetadata(this._excludeMetadatas, e);
    }, s.prototype.getExposedProperties = function(e, t) {
      return this.getExposedMetadatas(e).filter(function(n) {
        return !n.options || n.options.toClassOnly === !0 && n.options.toPlainOnly === !0 ? !0 : n.options.toClassOnly === !0 ? t === O.CLASS_TO_CLASS || t === O.PLAIN_TO_CLASS : n.options.toPlainOnly === !0 ? t === O.CLASS_TO_PLAIN : !0;
      }).map(function(n) {
        return n.propertyName;
      });
    }, s.prototype.getExcludedProperties = function(e, t) {
      return this.getExcludedMetadatas(e).filter(function(n) {
        return !n.options || n.options.toClassOnly === !0 && n.options.toPlainOnly === !0 ? !0 : n.options.toClassOnly === !0 ? t === O.CLASS_TO_CLASS || t === O.PLAIN_TO_CLASS : n.options.toPlainOnly === !0 ? t === O.CLASS_TO_PLAIN : !0;
      }).map(function(n) {
        return n.propertyName;
      });
    }, s.prototype.clear = function() {
      this._typeMetadatas.clear(), this._exposeMetadatas.clear(), this._excludeMetadatas.clear(), this._ancestorsMap.clear();
    }, s.prototype.getMetadata = function(e, t) {
      var n = e.get(t), o;
      n && (o = Array.from(n.values()).filter(function(w) {
        return w.propertyName !== void 0;
      }));
      for (var u = [], c = 0, f = this.getAncestors(t); c < f.length; c++) {
        var v = f[c], _ = e.get(v);
        if (_) {
          var l = Array.from(_.values()).filter(function(w) {
            return w.propertyName !== void 0;
          });
          u.push.apply(u, l);
        }
      }
      return u.concat(o || []);
    }, s.prototype.findMetadata = function(e, t, n) {
      var o = e.get(t);
      if (o) {
        var u = o.get(n);
        if (u)
          return u;
      }
      for (var c = 0, f = this.getAncestors(t); c < f.length; c++) {
        var v = f[c], _ = e.get(v);
        if (_) {
          var l = _.get(n);
          if (l)
            return l;
        }
      }
    }, s.prototype.findMetadatas = function(e, t, n) {
      var o = e.get(t), u;
      o && (u = o.get(n));
      for (var c = [], f = 0, v = this.getAncestors(t); f < v.length; f++) {
        var _ = v[f], l = e.get(_);
        l && l.has(n) && c.push.apply(c, l.get(n));
      }
      return c.slice().reverse().concat((u || []).slice().reverse());
    }, s.prototype.getAncestors = function(e) {
      if (!e)
        return [];
      if (!this._ancestorsMap.has(e)) {
        for (var t = [], n = Object.getPrototypeOf(e.prototype.constructor); typeof n.prototype < "u"; n = Object.getPrototypeOf(n.prototype.constructor))
          t.push(n);
        this._ancestorsMap.set(e, t);
      }
      return this._ancestorsMap.get(e);
    }, s;
  }()
), z = new gn();
function yn() {
  if (typeof globalThis < "u")
    return globalThis;
  if (typeof global < "u")
    return global;
  if (typeof window < "u")
    return window;
  if (typeof self < "u")
    return self;
}
function vn(s) {
  return s !== null && typeof s == "object" && typeof s.then == "function";
}
var Wt = function(s, e, t) {
  if (t || arguments.length === 2) for (var n = 0, o = e.length, u; n < o; n++)
    (u || !(n in e)) && (u || (u = Array.prototype.slice.call(e, 0, n)), u[n] = e[n]);
  return s.concat(u || Array.prototype.slice.call(e));
};
function mn(s) {
  var e = new s();
  return !(e instanceof Set) && !("push" in e) ? [] : e;
}
var ce = (
  /** @class */
  function() {
    function s(e, t) {
      this.transformationType = e, this.options = t, this.recursionStack = /* @__PURE__ */ new Set();
    }
    return s.prototype.transform = function(e, t, n, o, u, c) {
      var f = this;
      if (c === void 0 && (c = 0), Array.isArray(t) || t instanceof Set) {
        var v = o && this.transformationType === O.PLAIN_TO_CLASS ? mn(o) : [];
        return t.forEach(function(y, R) {
          var T = e ? e[R] : void 0;
          if (!f.options.enableCircularCheck || !f.isCircular(y)) {
            var x = void 0;
            if (typeof n != "function" && n && n.options && n.options.discriminator && n.options.discriminator.property && n.options.discriminator.subTypes) {
              if (f.transformationType === O.PLAIN_TO_CLASS) {
                x = n.options.discriminator.subTypes.find(function(V) {
                  return V.name === y[n.options.discriminator.property];
                });
                var J = { newObject: v, object: y, property: void 0 }, A = n.typeFunction(J);
                x === void 0 ? x = A : x = x.value, n.options.keepDiscriminatorProperty || delete y[n.options.discriminator.property];
              }
              f.transformationType === O.CLASS_TO_CLASS && (x = y.constructor), f.transformationType === O.CLASS_TO_PLAIN && (y[n.options.discriminator.property] = n.options.discriminator.subTypes.find(function(V) {
                return V.value === y.constructor;
              }).name);
            } else
              x = n;
            var U = f.transform(T, y, x, void 0, y instanceof Map, c + 1);
            v instanceof Set ? v.add(U) : v.push(U);
          } else f.transformationType === O.CLASS_TO_CLASS && (v instanceof Set ? v.add(y) : v.push(y));
        }), v;
      } else {
        if (n === String && !u)
          return t == null ? t : String(t);
        if (n === Number && !u)
          return t == null ? t : Number(t);
        if (n === Boolean && !u)
          return t == null ? t : !!t;
        if ((n === Date || t instanceof Date) && !u)
          return t instanceof Date ? new Date(t.valueOf()) : t == null ? t : new Date(t);
        if (yn().Buffer && (n === Buffer || t instanceof Buffer) && !u)
          return t == null ? t : Buffer.from(t);
        if (vn(t) && !u)
          return new Promise(function(y, R) {
            t.then(function(T) {
              return y(f.transform(void 0, T, n, void 0, void 0, c + 1));
            }, R);
          });
        if (!u && t !== null && typeof t == "object" && typeof t.then == "function")
          return t;
        if (typeof t == "object" && t !== null) {
          !n && t.constructor !== Object && (!Array.isArray(t) && t.constructor === Array || (n = t.constructor)), !n && e && (n = e.constructor), this.options.enableCircularCheck && this.recursionStack.add(t);
          var _ = this.getKeys(n, t, u), l = e || {};
          !e && (this.transformationType === O.PLAIN_TO_CLASS || this.transformationType === O.CLASS_TO_CLASS) && (u ? l = /* @__PURE__ */ new Map() : n ? l = new n() : l = {});
          for (var w = function(y) {
            if (y === "__proto__" || y === "constructor")
              return "continue";
            var R = y, T = y, x = y;
            if (!h.options.ignoreDecorators && n) {
              if (h.transformationType === O.PLAIN_TO_CLASS) {
                var J = z.findExposeMetadataByCustomName(n, y);
                J && (x = J.propertyName, T = J.propertyName);
              } else if (h.transformationType === O.CLASS_TO_PLAIN || h.transformationType === O.CLASS_TO_CLASS) {
                var J = z.findExposeMetadata(n, y);
                J && J.options && J.options.name && (T = J.options.name);
              }
            }
            var A = void 0;
            h.transformationType === O.PLAIN_TO_CLASS ? A = t[R] : t instanceof Map ? A = t.get(R) : t[R] instanceof Function ? A = t[R]() : A = t[R];
            var U = void 0, V = A instanceof Map;
            if (n && u)
              U = n;
            else if (n) {
              var $ = z.findTypeMetadata(n, x);
              if ($) {
                var Ye = { newObject: l, object: t, property: x }, _e = $.typeFunction ? $.typeFunction(Ye) : $.reflectedType;
                $.options && $.options.discriminator && $.options.discriminator.property && $.options.discriminator.subTypes ? t[R] instanceof Array ? U = $ : (h.transformationType === O.PLAIN_TO_CLASS && (U = $.options.discriminator.subTypes.find(function(Y) {
                  if (A && A instanceof Object && $.options.discriminator.property in A)
                    return Y.name === A[$.options.discriminator.property];
                }), U === void 0 ? U = _e : U = U.value, $.options.keepDiscriminatorProperty || A && A instanceof Object && $.options.discriminator.property in A && delete A[$.options.discriminator.property]), h.transformationType === O.CLASS_TO_CLASS && (U = A.constructor), h.transformationType === O.CLASS_TO_PLAIN && A && (A[$.options.discriminator.property] = $.options.discriminator.subTypes.find(function(Y) {
                  return Y.value === A.constructor;
                }).name)) : U = _e, V = V || $.reflectedType === Map;
              } else if (h.options.targetMaps)
                h.options.targetMaps.filter(function(Y) {
                  return Y.target === n && !!Y.properties[x];
                }).forEach(function(Y) {
                  return U = Y.properties[x];
                });
              else if (h.options.enableImplicitConversion && h.transformationType === O.PLAIN_TO_CLASS) {
                var be = Reflect.getMetadata("design:type", n.prototype, x);
                be && (U = be);
              }
            }
            var Se = Array.isArray(t[R]) ? h.getReflectedType(n, x) : void 0, xe = e ? e[R] : void 0;
            if (l.constructor.prototype) {
              var le = Object.getOwnPropertyDescriptor(l.constructor.prototype, T);
              if ((h.transformationType === O.PLAIN_TO_CLASS || h.transformationType === O.CLASS_TO_CLASS) && // eslint-disable-next-line @typescript-eslint/unbound-method
              (le && !le.set || l[T] instanceof Function))
                return "continue";
            }
            if (!h.options.enableCircularCheck || !h.isCircular(A)) {
              var ne = h.transformationType === O.PLAIN_TO_CLASS ? T : y, N = void 0;
              h.transformationType === O.CLASS_TO_PLAIN ? (N = t[ne], N = h.applyCustomTransformations(N, n, ne, t, h.transformationType), N = t[ne] === N ? A : N, N = h.transform(xe, N, U, Se, V, c + 1)) : A === void 0 && h.options.exposeDefaultValues ? N = l[T] : (N = h.transform(xe, A, U, Se, V, c + 1), N = h.applyCustomTransformations(N, n, ne, t, h.transformationType)), (N !== void 0 || h.options.exposeUnsetFields) && (l instanceof Map ? l.set(T, N) : l[T] = N);
            } else if (h.transformationType === O.CLASS_TO_CLASS) {
              var N = A;
              N = h.applyCustomTransformations(N, n, y, t, h.transformationType), (N !== void 0 || h.options.exposeUnsetFields) && (l instanceof Map ? l.set(T, N) : l[T] = N);
            }
          }, h = this, P = 0, I = _; P < I.length; P++) {
            var W = I[P];
            w(W);
          }
          return this.options.enableCircularCheck && this.recursionStack.delete(t), l;
        } else
          return t;
      }
    }, s.prototype.applyCustomTransformations = function(e, t, n, o, u) {
      var c = this, f = z.findTransformMetadatas(t, n, this.transformationType);
      return this.options.version !== void 0 && (f = f.filter(function(v) {
        return v.options ? c.checkVersion(v.options.since, v.options.until) : !0;
      })), this.options.groups && this.options.groups.length ? f = f.filter(function(v) {
        return v.options ? c.checkGroups(v.options.groups) : !0;
      }) : f = f.filter(function(v) {
        return !v.options || !v.options.groups || !v.options.groups.length;
      }), f.forEach(function(v) {
        e = v.transformFn({ value: e, key: n, obj: o, type: u, options: c.options });
      }), e;
    }, s.prototype.isCircular = function(e) {
      return this.recursionStack.has(e);
    }, s.prototype.getReflectedType = function(e, t) {
      if (e) {
        var n = z.findTypeMetadata(e, t);
        return n ? n.reflectedType : void 0;
      }
    }, s.prototype.getKeys = function(e, t, n) {
      var o = this, u = z.getStrategy(e);
      u === "none" && (u = this.options.strategy || "exposeAll");
      var c = [];
      if ((u === "exposeAll" || n) && (t instanceof Map ? c = Array.from(t.keys()) : c = Object.keys(t)), n)
        return c;
      if (this.options.ignoreDecorators && this.options.excludeExtraneousValues && e) {
        var f = z.getExposedProperties(e, this.transformationType), v = z.getExcludedProperties(e, this.transformationType);
        c = Wt(Wt([], f, !0), v, !0);
      }
      if (!this.options.ignoreDecorators && e) {
        var f = z.getExposedProperties(e, this.transformationType);
        this.transformationType === O.PLAIN_TO_CLASS && (f = f.map(function(w) {
          var h = z.findExposeMetadata(e, w);
          return h && h.options && h.options.name ? h.options.name : w;
        })), this.options.excludeExtraneousValues ? c = f : c = c.concat(f);
        var _ = z.getExcludedProperties(e, this.transformationType);
        _.length > 0 && (c = c.filter(function(w) {
          return !_.includes(w);
        })), this.options.version !== void 0 && (c = c.filter(function(w) {
          var h = z.findExposeMetadata(e, w);
          return !h || !h.options ? !0 : o.checkVersion(h.options.since, h.options.until);
        })), this.options.groups && this.options.groups.length ? c = c.filter(function(w) {
          var h = z.findExposeMetadata(e, w);
          return !h || !h.options ? !0 : o.checkGroups(h.options.groups);
        }) : c = c.filter(function(w) {
          var h = z.findExposeMetadata(e, w);
          return !h || !h.options || !h.options.groups || !h.options.groups.length;
        });
      }
      return this.options.excludePrefixes && this.options.excludePrefixes.length && (c = c.filter(function(l) {
        return o.options.excludePrefixes.every(function(w) {
          return l.substr(0, w.length) !== w;
        });
      })), c = c.filter(function(l, w, h) {
        return h.indexOf(l) === w;
      }), c;
    }, s.prototype.checkVersion = function(e, t) {
      var n = !0;
      return n && e && (n = this.options.version >= e), n && t && (n = this.options.version < t), n;
    }, s.prototype.checkGroups = function(e) {
      return e ? this.options.groups.some(function(t) {
        return e.includes(t);
      }) : !0;
    }, s;
  }()
), ue = {
  enableCircularCheck: !1,
  enableImplicitConversion: !1,
  excludeExtraneousValues: !1,
  excludePrefixes: void 0,
  exposeDefaultValues: !1,
  exposeUnsetFields: !0,
  groups: void 0,
  ignoreDecorators: !1,
  strategy: void 0,
  targetMaps: void 0,
  version: void 0
}, Z = function() {
  return Z = Object.assign || function(s) {
    for (var e, t = 1, n = arguments.length; t < n; t++) {
      e = arguments[t];
      for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && (s[o] = e[o]);
    }
    return s;
  }, Z.apply(this, arguments);
}, wn = (
  /** @class */
  function() {
    function s() {
    }
    return s.prototype.instanceToPlain = function(e, t) {
      var n = new ce(O.CLASS_TO_PLAIN, Z(Z({}, ue), t));
      return n.transform(void 0, e, void 0, void 0, void 0, void 0);
    }, s.prototype.classToPlainFromExist = function(e, t, n) {
      var o = new ce(O.CLASS_TO_PLAIN, Z(Z({}, ue), n));
      return o.transform(t, e, void 0, void 0, void 0, void 0);
    }, s.prototype.plainToInstance = function(e, t, n) {
      var o = new ce(O.PLAIN_TO_CLASS, Z(Z({}, ue), n));
      return o.transform(void 0, t, e, void 0, void 0, void 0);
    }, s.prototype.plainToClassFromExist = function(e, t, n) {
      var o = new ce(O.PLAIN_TO_CLASS, Z(Z({}, ue), n));
      return o.transform(e, t, void 0, void 0, void 0, void 0);
    }, s.prototype.instanceToInstance = function(e, t) {
      var n = new ce(O.CLASS_TO_CLASS, Z(Z({}, ue), t));
      return n.transform(void 0, e, void 0, void 0, void 0, void 0);
    }, s.prototype.classToClassFromExist = function(e, t, n) {
      var o = new ce(O.CLASS_TO_CLASS, Z(Z({}, ue), n));
      return o.transform(t, e, void 0, void 0, void 0, void 0);
    }, s.prototype.serialize = function(e, t) {
      return JSON.stringify(this.instanceToPlain(e, t));
    }, s.prototype.deserialize = function(e, t, n) {
      var o = JSON.parse(t);
      return this.plainToInstance(e, o, n);
    }, s.prototype.deserializeArray = function(e, t, n) {
      var o = JSON.parse(t);
      return this.plainToInstance(e, o, n);
    }, s;
  }()
);
function rt(s, e) {
  return e === void 0 && (e = {}), function(t, n) {
    var o = Reflect.getMetadata("design:type", t, n);
    z.addTypeMetadata({
      target: t.constructor,
      propertyName: n,
      reflectedType: o,
      typeFunction: s,
      options: e
    });
  };
}
var Zt = new wn();
function Mn(s, e) {
  return Zt.instanceToPlain(s, e);
}
function _n(s, e, t) {
  return Zt.plainToInstance(s, e, t);
}
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Ut;
(function(s) {
  (function(e) {
    var t = typeof globalThis == "object" ? globalThis : typeof Gt == "object" ? Gt : typeof self == "object" ? self : typeof this == "object" ? this : f(), n = o(s);
    typeof t.Reflect < "u" && (n = o(t.Reflect, n)), e(n, t), typeof t.Reflect > "u" && (t.Reflect = s);
    function o(v, _) {
      return function(l, w) {
        Object.defineProperty(v, l, { configurable: !0, writable: !0, value: w }), _ && _(l, w);
      };
    }
    function u() {
      try {
        return Function("return this;")();
      } catch {
      }
    }
    function c() {
      try {
        return (0, eval)("(function() { return this; })()");
      } catch {
      }
    }
    function f() {
      return u() || c();
    }
  })(function(e, t) {
    var n = Object.prototype.hasOwnProperty, o = typeof Symbol == "function", u = o && typeof Symbol.toPrimitive < "u" ? Symbol.toPrimitive : "@@toPrimitive", c = o && typeof Symbol.iterator < "u" ? Symbol.iterator : "@@iterator", f = typeof Object.create == "function", v = { __proto__: [] } instanceof Array, _ = !f && !v, l = {
      // create an object in dictionary mode (a.k.a. "slow" mode in v8)
      create: f ? function() {
        return Ve(/* @__PURE__ */ Object.create(null));
      } : v ? function() {
        return Ve({ __proto__: null });
      } : function() {
        return Ve({});
      },
      has: _ ? function(r, i) {
        return n.call(r, i);
      } : function(r, i) {
        return i in r;
      },
      get: _ ? function(r, i) {
        return n.call(r, i) ? r[i] : void 0;
      } : function(r, i) {
        return r[i];
      }
    }, w = Object.getPrototypeOf(Function), h = typeof Map == "function" && typeof Map.prototype.entries == "function" ? Map : an(), P = typeof Set == "function" && typeof Set.prototype.entries == "function" ? Set : cn(), I = typeof WeakMap == "function" ? WeakMap : un(), W = o ? Symbol.for("@reflect-metadata:registry") : void 0, y = rn(), R = sn(y);
    function T(r, i, a, d) {
      if (S(a)) {
        if (!Tt(r))
          throw new TypeError();
        if (!Nt(i))
          throw new TypeError();
        return Se(r, i);
      } else {
        if (!Tt(r))
          throw new TypeError();
        if (!F(i))
          throw new TypeError();
        if (!F(d) && !S(d) && !ae(d))
          throw new TypeError();
        return ae(d) && (d = void 0), a = ee(a), xe(r, i, a, d);
      }
    }
    e("decorate", T);
    function x(r, i) {
      function a(d, b) {
        if (!F(d))
          throw new TypeError();
        if (!S(b) && !tn(b))
          throw new TypeError();
        At(r, i, d, b);
      }
      return a;
    }
    e("metadata", x);
    function J(r, i, a, d) {
      if (!F(a))
        throw new TypeError();
      return S(d) || (d = ee(d)), At(r, i, a, d);
    }
    e("defineMetadata", J);
    function A(r, i, a) {
      if (!F(i))
        throw new TypeError();
      return S(a) || (a = ee(a)), le(r, i, a);
    }
    e("hasMetadata", A);
    function U(r, i, a) {
      if (!F(i))
        throw new TypeError();
      return S(a) || (a = ee(a)), ne(r, i, a);
    }
    e("hasOwnMetadata", U);
    function V(r, i, a) {
      if (!F(i))
        throw new TypeError();
      return S(a) || (a = ee(a)), N(r, i, a);
    }
    e("getMetadata", V);
    function $(r, i, a) {
      if (!F(i))
        throw new TypeError();
      return S(a) || (a = ee(a)), Y(r, i, a);
    }
    e("getOwnMetadata", $);
    function Ye(r, i) {
      if (!F(r))
        throw new TypeError();
      return S(i) || (i = ee(i)), It(r, i);
    }
    e("getMetadataKeys", Ye);
    function _e(r, i) {
      if (!F(r))
        throw new TypeError();
      return S(i) || (i = ee(i)), Lt(r, i);
    }
    e("getOwnMetadataKeys", _e);
    function be(r, i, a) {
      if (!F(i))
        throw new TypeError();
      if (S(a) || (a = ee(a)), !F(i))
        throw new TypeError();
      S(a) || (a = ee(a));
      var d = pe(
        i,
        a,
        /*Create*/
        !1
      );
      return S(d) ? !1 : d.OrdinaryDeleteMetadata(r, i, a);
    }
    e("deleteMetadata", be);
    function Se(r, i) {
      for (var a = r.length - 1; a >= 0; --a) {
        var d = r[a], b = d(i);
        if (!S(b) && !ae(b)) {
          if (!Nt(b))
            throw new TypeError();
          i = b;
        }
      }
      return i;
    }
    function xe(r, i, a, d) {
      for (var b = r.length - 1; b >= 0; --b) {
        var D = r[b], G = D(i, a, d);
        if (!S(G) && !ae(G)) {
          if (!F(G))
            throw new TypeError();
          d = G;
        }
      }
      return d;
    }
    function le(r, i, a) {
      var d = ne(r, i, a);
      if (d)
        return !0;
      var b = Ke(i);
      return ae(b) ? !1 : le(r, b, a);
    }
    function ne(r, i, a) {
      var d = pe(
        i,
        a,
        /*Create*/
        !1
      );
      return S(d) ? !1 : Rt(d.OrdinaryHasOwnMetadata(r, i, a));
    }
    function N(r, i, a) {
      var d = ne(r, i, a);
      if (d)
        return Y(r, i, a);
      var b = Ke(i);
      if (!ae(b))
        return N(r, b, a);
    }
    function Y(r, i, a) {
      var d = pe(
        i,
        a,
        /*Create*/
        !1
      );
      if (!S(d))
        return d.OrdinaryGetOwnMetadata(r, i, a);
    }
    function At(r, i, a, d) {
      var b = pe(
        a,
        d,
        /*Create*/
        !0
      );
      b.OrdinaryDefineOwnMetadata(r, i, a, d);
    }
    function It(r, i) {
      var a = Lt(r, i), d = Ke(r);
      if (d === null)
        return a;
      var b = It(d, i);
      if (b.length <= 0)
        return a;
      if (a.length <= 0)
        return b;
      for (var D = new P(), G = [], C = 0, p = a; C < p.length; C++) {
        var g = p[C], m = D.has(g);
        m || (D.add(g), G.push(g));
      }
      for (var M = 0, E = b; M < E.length; M++) {
        var g = E[M], m = D.has(g);
        m || (D.add(g), G.push(g));
      }
      return G;
    }
    function Lt(r, i) {
      var a = pe(
        r,
        i,
        /*create*/
        !1
      );
      return a ? a.OrdinaryOwnMetadataKeys(r, i) : [];
    }
    function Pt(r) {
      if (r === null)
        return 1;
      switch (typeof r) {
        case "undefined":
          return 0;
        case "boolean":
          return 2;
        case "string":
          return 3;
        case "symbol":
          return 4;
        case "number":
          return 5;
        case "object":
          return r === null ? 1 : 6;
        default:
          return 6;
      }
    }
    function S(r) {
      return r === void 0;
    }
    function ae(r) {
      return r === null;
    }
    function Qt(r) {
      return typeof r == "symbol";
    }
    function F(r) {
      return typeof r == "object" ? r !== null : typeof r == "function";
    }
    function Kt(r, i) {
      switch (Pt(r)) {
        case 0:
          return r;
        case 1:
          return r;
        case 2:
          return r;
        case 3:
          return r;
        case 4:
          return r;
        case 5:
          return r;
      }
      var a = "string", d = kt(r, u);
      if (d !== void 0) {
        var b = d.call(r, a);
        if (F(b))
          throw new TypeError();
        return b;
      }
      return Vt(r);
    }
    function Vt(r, i) {
      var a, d, b;
      {
        var D = r.toString;
        if (Oe(D)) {
          var d = D.call(r);
          if (!F(d))
            return d;
        }
        var a = r.valueOf;
        if (Oe(a)) {
          var d = a.call(r);
          if (!F(d))
            return d;
        }
      }
      throw new TypeError();
    }
    function Rt(r) {
      return !!r;
    }
    function en(r) {
      return "" + r;
    }
    function ee(r) {
      var i = Kt(r);
      return Qt(i) ? i : en(i);
    }
    function Tt(r) {
      return Array.isArray ? Array.isArray(r) : r instanceof Object ? r instanceof Array : Object.prototype.toString.call(r) === "[object Array]";
    }
    function Oe(r) {
      return typeof r == "function";
    }
    function Nt(r) {
      return typeof r == "function";
    }
    function tn(r) {
      switch (Pt(r)) {
        case 3:
          return !0;
        case 4:
          return !0;
        default:
          return !1;
      }
    }
    function Qe(r, i) {
      return r === i || r !== r && i !== i;
    }
    function kt(r, i) {
      var a = r[i];
      if (a != null) {
        if (!Oe(a))
          throw new TypeError();
        return a;
      }
    }
    function Dt(r) {
      var i = kt(r, c);
      if (!Oe(i))
        throw new TypeError();
      var a = i.call(r);
      if (!F(a))
        throw new TypeError();
      return a;
    }
    function jt(r) {
      return r.value;
    }
    function $t(r) {
      var i = r.next();
      return i.done ? !1 : i;
    }
    function Bt(r) {
      var i = r.return;
      i && i.call(r);
    }
    function Ke(r) {
      var i = Object.getPrototypeOf(r);
      if (typeof r != "function" || r === w || i !== w)
        return i;
      var a = r.prototype, d = a && Object.getPrototypeOf(a);
      if (d == null || d === Object.prototype)
        return i;
      var b = d.constructor;
      return typeof b != "function" || b === r ? i : b;
    }
    function nn() {
      var r;
      !S(W) && typeof t.Reflect < "u" && !(W in t.Reflect) && typeof t.Reflect.defineMetadata == "function" && (r = on(t.Reflect));
      var i, a, d, b = new I(), D = {
        registerProvider: G,
        getProvider: p,
        setProvider: m
      };
      return D;
      function G(M) {
        if (!Object.isExtensible(D))
          throw new Error("Cannot add provider to a frozen registry.");
        switch (!0) {
          case r === M:
            break;
          case S(i):
            i = M;
            break;
          case i === M:
            break;
          case S(a):
            a = M;
            break;
          case a === M:
            break;
          default:
            d === void 0 && (d = new P()), d.add(M);
            break;
        }
      }
      function C(M, E) {
        if (!S(i)) {
          if (i.isProviderFor(M, E))
            return i;
          if (!S(a)) {
            if (a.isProviderFor(M, E))
              return i;
            if (!S(d))
              for (var L = Dt(d); ; ) {
                var j = $t(L);
                if (!j)
                  return;
                var Q = jt(j);
                if (Q.isProviderFor(M, E))
                  return Bt(L), Q;
              }
          }
        }
        if (!S(r) && r.isProviderFor(M, E))
          return r;
      }
      function p(M, E) {
        var L = b.get(M), j;
        return S(L) || (j = L.get(E)), S(j) && (j = C(M, E), S(j) || (S(L) && (L = new h(), b.set(M, L)), L.set(E, j))), j;
      }
      function g(M) {
        if (S(M))
          throw new TypeError();
        return i === M || a === M || !S(d) && d.has(M);
      }
      function m(M, E, L) {
        if (!g(L))
          throw new Error("Metadata provider not registered.");
        var j = p(M, E);
        if (j !== L) {
          if (!S(j))
            return !1;
          var Q = b.get(M);
          S(Q) && (Q = new h(), b.set(M, Q)), Q.set(E, L);
        }
        return !0;
      }
    }
    function rn() {
      var r;
      return !S(W) && F(t.Reflect) && Object.isExtensible(t.Reflect) && (r = t.Reflect[W]), S(r) && (r = nn()), !S(W) && F(t.Reflect) && Object.isExtensible(t.Reflect) && Object.defineProperty(t.Reflect, W, {
        enumerable: !1,
        configurable: !1,
        writable: !1,
        value: r
      }), r;
    }
    function sn(r) {
      var i = new I(), a = {
        isProviderFor: function(g, m) {
          var M = i.get(g);
          return S(M) ? !1 : M.has(m);
        },
        OrdinaryDefineOwnMetadata: G,
        OrdinaryHasOwnMetadata: b,
        OrdinaryGetOwnMetadata: D,
        OrdinaryOwnMetadataKeys: C,
        OrdinaryDeleteMetadata: p
      };
      return y.registerProvider(a), a;
      function d(g, m, M) {
        var E = i.get(g), L = !1;
        if (S(E)) {
          if (!M)
            return;
          E = new h(), i.set(g, E), L = !0;
        }
        var j = E.get(m);
        if (S(j)) {
          if (!M)
            return;
          if (j = new h(), E.set(m, j), !r.setProvider(g, m, a))
            throw E.delete(m), L && i.delete(g), new Error("Wrong provider for target.");
        }
        return j;
      }
      function b(g, m, M) {
        var E = d(
          m,
          M,
          /*Create*/
          !1
        );
        return S(E) ? !1 : Rt(E.has(g));
      }
      function D(g, m, M) {
        var E = d(
          m,
          M,
          /*Create*/
          !1
        );
        if (!S(E))
          return E.get(g);
      }
      function G(g, m, M, E) {
        var L = d(
          M,
          E,
          /*Create*/
          !0
        );
        L.set(g, m);
      }
      function C(g, m) {
        var M = [], E = d(
          g,
          m,
          /*Create*/
          !1
        );
        if (S(E))
          return M;
        for (var L = E.keys(), j = Dt(L), Q = 0; ; ) {
          var Ft = $t(j);
          if (!Ft)
            return M.length = Q, M;
          var fn = jt(Ft);
          try {
            M[Q] = fn;
          } catch (dn) {
            try {
              Bt(j);
            } finally {
              throw dn;
            }
          }
          Q++;
        }
      }
      function p(g, m, M) {
        var E = d(
          m,
          M,
          /*Create*/
          !1
        );
        if (S(E) || !E.delete(g))
          return !1;
        if (E.size === 0) {
          var L = i.get(m);
          S(L) || (L.delete(M), L.size === 0 && i.delete(L));
        }
        return !0;
      }
    }
    function on(r) {
      var i = r.defineMetadata, a = r.hasOwnMetadata, d = r.getOwnMetadata, b = r.getOwnMetadataKeys, D = r.deleteMetadata, G = new I(), C = {
        isProviderFor: function(p, g) {
          var m = G.get(p);
          return !S(m) && m.has(g) ? !0 : b(p, g).length ? (S(m) && (m = new P(), G.set(p, m)), m.add(g), !0) : !1;
        },
        OrdinaryDefineOwnMetadata: i,
        OrdinaryHasOwnMetadata: a,
        OrdinaryGetOwnMetadata: d,
        OrdinaryOwnMetadataKeys: b,
        OrdinaryDeleteMetadata: D
      };
      return C;
    }
    function pe(r, i, a) {
      var d = y.getProvider(r, i);
      if (!S(d))
        return d;
      if (a) {
        if (y.setProvider(r, i, R))
          return R;
        throw new Error("Illegal state.");
      }
    }
    function an() {
      var r = {}, i = [], a = (
        /** @class */
        function() {
          function C(p, g, m) {
            this._index = 0, this._keys = p, this._values = g, this._selector = m;
          }
          return C.prototype["@@iterator"] = function() {
            return this;
          }, C.prototype[c] = function() {
            return this;
          }, C.prototype.next = function() {
            var p = this._index;
            if (p >= 0 && p < this._keys.length) {
              var g = this._selector(this._keys[p], this._values[p]);
              return p + 1 >= this._keys.length ? (this._index = -1, this._keys = i, this._values = i) : this._index++, { value: g, done: !1 };
            }
            return { value: void 0, done: !0 };
          }, C.prototype.throw = function(p) {
            throw this._index >= 0 && (this._index = -1, this._keys = i, this._values = i), p;
          }, C.prototype.return = function(p) {
            return this._index >= 0 && (this._index = -1, this._keys = i, this._values = i), { value: p, done: !0 };
          }, C;
        }()
      ), d = (
        /** @class */
        function() {
          function C() {
            this._keys = [], this._values = [], this._cacheKey = r, this._cacheIndex = -2;
          }
          return Object.defineProperty(C.prototype, "size", {
            get: function() {
              return this._keys.length;
            },
            enumerable: !0,
            configurable: !0
          }), C.prototype.has = function(p) {
            return this._find(
              p,
              /*insert*/
              !1
            ) >= 0;
          }, C.prototype.get = function(p) {
            var g = this._find(
              p,
              /*insert*/
              !1
            );
            return g >= 0 ? this._values[g] : void 0;
          }, C.prototype.set = function(p, g) {
            var m = this._find(
              p,
              /*insert*/
              !0
            );
            return this._values[m] = g, this;
          }, C.prototype.delete = function(p) {
            var g = this._find(
              p,
              /*insert*/
              !1
            );
            if (g >= 0) {
              for (var m = this._keys.length, M = g + 1; M < m; M++)
                this._keys[M - 1] = this._keys[M], this._values[M - 1] = this._values[M];
              return this._keys.length--, this._values.length--, Qe(p, this._cacheKey) && (this._cacheKey = r, this._cacheIndex = -2), !0;
            }
            return !1;
          }, C.prototype.clear = function() {
            this._keys.length = 0, this._values.length = 0, this._cacheKey = r, this._cacheIndex = -2;
          }, C.prototype.keys = function() {
            return new a(this._keys, this._values, b);
          }, C.prototype.values = function() {
            return new a(this._keys, this._values, D);
          }, C.prototype.entries = function() {
            return new a(this._keys, this._values, G);
          }, C.prototype["@@iterator"] = function() {
            return this.entries();
          }, C.prototype[c] = function() {
            return this.entries();
          }, C.prototype._find = function(p, g) {
            if (!Qe(this._cacheKey, p)) {
              this._cacheIndex = -1;
              for (var m = 0; m < this._keys.length; m++)
                if (Qe(this._keys[m], p)) {
                  this._cacheIndex = m;
                  break;
                }
            }
            return this._cacheIndex < 0 && g && (this._cacheIndex = this._keys.length, this._keys.push(p), this._values.push(void 0)), this._cacheIndex;
          }, C;
        }()
      );
      return d;
      function b(C, p) {
        return C;
      }
      function D(C, p) {
        return p;
      }
      function G(C, p) {
        return [C, p];
      }
    }
    function cn() {
      var r = (
        /** @class */
        function() {
          function i() {
            this._map = new h();
          }
          return Object.defineProperty(i.prototype, "size", {
            get: function() {
              return this._map.size;
            },
            enumerable: !0,
            configurable: !0
          }), i.prototype.has = function(a) {
            return this._map.has(a);
          }, i.prototype.add = function(a) {
            return this._map.set(a, a), this;
          }, i.prototype.delete = function(a) {
            return this._map.delete(a);
          }, i.prototype.clear = function() {
            this._map.clear();
          }, i.prototype.keys = function() {
            return this._map.keys();
          }, i.prototype.values = function() {
            return this._map.keys();
          }, i.prototype.entries = function() {
            return this._map.entries();
          }, i.prototype["@@iterator"] = function() {
            return this.keys();
          }, i.prototype[c] = function() {
            return this.keys();
          }, i;
        }()
      );
      return r;
    }
    function un() {
      var r = 16, i = l.create(), a = d();
      return (
        /** @class */
        function() {
          function p() {
            this._key = d();
          }
          return p.prototype.has = function(g) {
            var m = b(
              g,
              /*create*/
              !1
            );
            return m !== void 0 ? l.has(m, this._key) : !1;
          }, p.prototype.get = function(g) {
            var m = b(
              g,
              /*create*/
              !1
            );
            return m !== void 0 ? l.get(m, this._key) : void 0;
          }, p.prototype.set = function(g, m) {
            var M = b(
              g,
              /*create*/
              !0
            );
            return M[this._key] = m, this;
          }, p.prototype.delete = function(g) {
            var m = b(
              g,
              /*create*/
              !1
            );
            return m !== void 0 ? delete m[this._key] : !1;
          }, p.prototype.clear = function() {
            this._key = d();
          }, p;
        }()
      );
      function d() {
        var p;
        do
          p = "@@WeakMap@@" + C();
        while (l.has(i, p));
        return i[p] = !0, p;
      }
      function b(p, g) {
        if (!n.call(p, a)) {
          if (!g)
            return;
          Object.defineProperty(p, a, { value: l.create() });
        }
        return p[a];
      }
      function D(p, g) {
        for (var m = 0; m < g; ++m)
          p[m] = Math.random() * 255 | 0;
        return p;
      }
      function G(p) {
        if (typeof Uint8Array == "function") {
          var g = new Uint8Array(p);
          return typeof crypto < "u" ? crypto.getRandomValues(g) : typeof msCrypto < "u" ? msCrypto.getRandomValues(g) : D(g, p), g;
        }
        return D(new Array(p), p);
      }
      function C() {
        var p = G(r);
        p[6] = p[6] & 79 | 64, p[8] = p[8] & 191 | 128;
        for (var g = "", m = 0; m < r; ++m) {
          var M = p[m];
          (m === 4 || m === 6 || m === 8) && (g += "-"), M < 16 && (g += "0"), g += M.toString(16).toLowerCase();
        }
        return g;
      }
    }
    function Ve(r) {
      return r.__ = void 0, delete r.__, r;
    }
  });
})(Ut || (Ut = {}));
var bn = Object.defineProperty, st = (s, e, t, n) => {
  for (var o = void 0, u = s.length - 1, c; u >= 0; u--)
    (c = s[u]) && (o = c(e, t, o) || o);
  return o && bn(e, t, o), o;
};
const te = 0, k = 1, Sn = 4294967295, Ce = 3;
class it {
  constructor(e) {
    Object.assign(this, e);
  }
  update() {
    var e, t, n, o, u;
    (e = this.ScalarCmd) == null || e.forEach((c, f) => c.Index = f), (t = this.RotateCmd) == null || t.forEach((c, f) => c.Index = f), (n = this.LinearCmd) == null || n.forEach((c, f) => c.Index = f), (o = this.SensorReadCmd) == null || o.forEach((c, f) => c.Index = f), (u = this.SensorSubscribeCmd) == null || u.forEach((c, f) => c.Index = f);
  }
}
var ie = /* @__PURE__ */ ((s) => (s.Unknown = "Unknown", s.Vibrate = "Vibrate", s.Rotate = "Rotate", s.Oscillate = "Oscillate", s.Constrict = "Constrict", s.Inflate = "Inflate", s.Position = "Position", s))(ie || {}), re = /* @__PURE__ */ ((s) => (s.Unknown = "Unknown", s.Battery = "Battery", s.RSSI = "RSSI", s.Button = "Button", s.Pressure = "Pressure", s))(re || {});
class xn {
  constructor(e) {
    this.Index = 0, Object.assign(this, e);
  }
}
class On {
  constructor(e) {
    this.Endpoints = e;
  }
}
class Cn {
  constructor(e) {
    this.Index = 0, Object.assign(this, e);
  }
}
class K {
  constructor(e) {
    this.Id = e;
  }
  // tslint:disable-next-line:ban-types
  get Type() {
    return this.constructor;
  }
  toJSON() {
    return JSON.stringify(this.toProtocolFormat());
  }
  toProtocolFormat() {
    const e = {};
    return e[this.constructor.Name] = Mn(this), e;
  }
  update() {
  }
}
class X extends K {
  constructor(e, t) {
    super(t), this.DeviceIndex = e, this.Id = t;
  }
}
class he extends K {
  constructor(e = te) {
    super(e), this.Id = e;
  }
}
const at = class at extends he {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
at.Name = "Ok";
let ye = at;
const ct = class ct extends K {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
ct.Name = "Ping";
let tt = ct;
var q = /* @__PURE__ */ ((s) => (s[s.ERROR_UNKNOWN = 0] = "ERROR_UNKNOWN", s[s.ERROR_INIT = 1] = "ERROR_INIT", s[s.ERROR_PING = 2] = "ERROR_PING", s[s.ERROR_MSG = 3] = "ERROR_MSG", s[s.ERROR_DEVICE = 4] = "ERROR_DEVICE", s))(q || {}), de;
let se = (de = class extends K {
  constructor(e, t = 0, n = k) {
    super(n), this.ErrorMessage = e, this.ErrorCode = t, this.Id = n;
  }
  get Schemversion() {
    return 0;
  }
}, de.Name = "Error", de);
class ot {
  constructor(e) {
    Object.assign(this, e);
  }
}
st([
  rt(() => it)
], ot.prototype, "DeviceMessages");
const ut = class ut extends K {
  constructor(e, t = k) {
    super(t), this.Devices = e, this.Id = t;
  }
  update() {
    for (const e of this.Devices)
      e.DeviceMessages.update();
  }
};
ut.Name = "DeviceList";
let Ae = ut;
st([
  rt(() => ot)
], Ae.prototype, "Devices");
const ft = class ft extends he {
  constructor(e) {
    super(), Object.assign(this, e);
  }
  update() {
    this.DeviceMessages.update();
  }
};
ft.Name = "DeviceAdded";
let ve = ft;
st([
  rt(() => it)
], ve.prototype, "DeviceMessages");
const dt = class dt extends he {
  constructor(e) {
    super(), this.DeviceIndex = e;
  }
};
dt.Name = "DeviceRemoved";
let Ie = dt;
const ht = class ht extends K {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
ht.Name = "RequestDeviceList";
let Le = ht;
const lt = class lt extends K {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
lt.Name = "StartScanning";
let Pe = lt;
const pt = class pt extends K {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
pt.Name = "StopScanning";
let Re = pt;
const gt = class gt extends he {
  constructor() {
    super();
  }
};
gt.Name = "ScanningFinished";
let Te = gt;
const yt = class yt extends K {
  constructor(e, t = 0, n = k) {
    super(n), this.ClientName = e, this.MessageVersion = t, this.Id = n;
  }
};
yt.Name = "RequestServerInfo";
let Ne = yt;
const vt = class vt extends he {
  constructor(e, t, n, o = k) {
    super(), this.MessageVersion = e, this.MaxPingTime = t, this.ServerName = n, this.Id = o;
  }
};
vt.Name = "ServerInfo";
let ke = vt;
const mt = class mt extends X {
  constructor(e = -1, t = k) {
    super(e, t), this.DeviceIndex = e, this.Id = t;
  }
};
mt.Name = "StopDeviceCmd";
let De = mt;
const wt = class wt extends K {
  constructor(e = k) {
    super(e), this.Id = e;
  }
};
wt.Name = "StopAllDevices";
let je = wt;
class Xe {
  constructor(e) {
    this.Index = e;
  }
}
class Ee extends Xe {
  constructor(e, t, n) {
    super(e), this.Scalar = t, this.ActuatorType = n;
  }
}
const Mt = class Mt extends X {
  constructor(e, t = -1, n = k) {
    super(t, n), this.Scalars = e, this.DeviceIndex = t, this.Id = n;
  }
};
Mt.Name = "ScalarCmd";
let me = Mt;
class qt extends Xe {
  constructor(e, t, n) {
    super(e), this.Speed = t, this.Clockwise = n;
  }
}
const Je = class Je extends X {
  constructor(e, t = -1, n = k) {
    super(t, n), this.Rotations = e, this.DeviceIndex = t, this.Id = n;
  }
  static Create(e, t) {
    const n = new Array();
    let o = 0;
    for (const [u, c] of t)
      n.push(new qt(o, u, c)), ++o;
    return new Je(n, e);
  }
};
Je.Name = "RotateCmd";
let we = Je;
class Xt extends Xe {
  constructor(e, t, n) {
    super(e), this.Position = t, this.Duration = n;
  }
}
const Ze = class Ze extends X {
  constructor(e, t = -1, n = k) {
    super(t, n), this.Vectors = e, this.DeviceIndex = t, this.Id = n;
  }
  static Create(e, t) {
    const n = new Array();
    let o = 0;
    for (const u of t)
      n.push(new Xt(o, u[0], u[1])), ++o;
    return new Ze(n, e);
  }
};
Ze.Name = "LinearCmd";
let Me = Ze;
const _t = class _t extends X {
  constructor(e, t, n, o = k) {
    super(e, o), this.DeviceIndex = e, this.SensorIndex = t, this.SensorType = n, this.Id = o;
  }
};
_t.Name = "SensorReadCmd";
let $e = _t;
const bt = class bt extends X {
  constructor(e, t, n, o, u = k) {
    super(e, u), this.DeviceIndex = e, this.SensorIndex = t, this.SensorType = n, this.Data = o, this.Id = u;
  }
};
bt.Name = "SensorReading";
let Be = bt;
const St = class St extends X {
  constructor(e, t, n, o, u = k) {
    super(e, u), this.DeviceIndex = e, this.Endpoint = t, this.ExpectedLength = n, this.Timeout = o, this.Id = u;
  }
};
St.Name = "RawReadCmd";
let Fe = St;
const xt = class xt extends X {
  constructor(e, t, n, o, u = k) {
    super(e, u), this.DeviceIndex = e, this.Endpoint = t, this.Data = n, this.WriteWithResponse = o, this.Id = u;
  }
};
xt.Name = "RawWriteCmd";
let Ge = xt;
const Ot = class Ot extends X {
  constructor(e, t, n = k) {
    super(e, n), this.DeviceIndex = e, this.Endpoint = t, this.Id = n;
  }
};
Ot.Name = "RawSubscribeCmd";
let We = Ot;
const Ct = class Ct extends X {
  constructor(e, t, n = k) {
    super(e, n), this.DeviceIndex = e, this.Endpoint = t, this.Id = n;
  }
};
Ct.Name = "RawUnsubscribeCmd";
let Ue = Ct;
const Et = class Et extends X {
  constructor(e, t, n, o = k) {
    super(e, o), this.DeviceIndex = e, this.Endpoint = t, this.Data = n, this.Id = o;
  }
};
Et.Name = "RawReading";
let ze = Et;
const En = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ActuatorType: ie,
  ButtplugDeviceMessage: X,
  ButtplugMessage: K,
  ButtplugSystemMessage: he,
  DEFAULT_MESSAGE_ID: k,
  DeviceAdded: ve,
  DeviceInfo: ot,
  DeviceList: Ae,
  DeviceRemoved: Ie,
  Error: se,
  ErrorClass: q,
  GenericDeviceMessageAttributes: xn,
  GenericMessageSubcommand: Xe,
  LinearCmd: Me,
  MAX_ID: Sn,
  MESSAGE_SPEC_VERSION: Ce,
  MessageAttributes: it,
  Ok: ye,
  Ping: tt,
  RawDeviceMessageAttributes: On,
  RawReadCmd: Fe,
  RawReading: ze,
  RawSubscribeCmd: We,
  RawUnsubscribeCmd: Ue,
  RawWriteCmd: Ge,
  RequestDeviceList: Le,
  RequestServerInfo: Ne,
  RotateCmd: we,
  RotateSubcommand: qt,
  SYSTEM_MESSAGE_ID: te,
  ScalarCmd: me,
  ScalarSubcommand: Ee,
  ScanningFinished: Te,
  SensorDeviceMessageAttributes: Cn,
  SensorReadCmd: $e,
  SensorReading: Be,
  SensorType: re,
  ServerInfo: ke,
  StartScanning: Pe,
  StopAllDevices: je,
  StopDeviceCmd: De,
  StopScanning: Re,
  VectorSubcommand: Xt
}, Symbol.toStringTag, { value: "Module" }));
/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */
class H extends Error {
  constructor(e, t, n = te, o) {
    super(e), this.errorClass = q.ERROR_UNKNOWN, this.errorClass = t, this.innerError = o, this.messageId = n;
  }
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
    return new se(this.message, this.ErrorClass, this.Id);
  }
  static LogAndError(e, t, n, o = te) {
    return t.Error(n), new e(n, o);
  }
  static FromError(e) {
    switch (e.ErrorCode) {
      case q.ERROR_DEVICE:
        return new B(e.ErrorMessage, e.Id);
      case q.ERROR_INIT:
        return new nt(e.ErrorMessage, e.Id);
      case q.ERROR_UNKNOWN:
        return new In(e.ErrorMessage, e.Id);
      case q.ERROR_PING:
        return new An(e.ErrorMessage, e.Id);
      case q.ERROR_MSG:
        return new ge(e.ErrorMessage, e.Id);
      default:
        throw new Error(`Message type ${e.ErrorCode} not handled`);
    }
  }
}
class nt extends H {
  constructor(e, t = te) {
    super(e, q.ERROR_INIT, t);
  }
}
class B extends H {
  constructor(e, t = te) {
    super(e, q.ERROR_DEVICE, t);
  }
}
class ge extends H {
  constructor(e, t = te) {
    super(e, q.ERROR_MSG, t);
  }
}
class An extends H {
  constructor(e, t = te) {
    super(e, q.ERROR_PING, t);
  }
}
class In extends H {
  constructor(e, t = te) {
    super(e, q.ERROR_UNKNOWN, t);
  }
}
function Yt(s) {
  for (const e of Object.values(En))
    if (typeof e == "function" && "Name" in e && e.Name === s)
      return e;
  return null;
}
function oe(s) {
  return Yt(Object.getPrototypeOf(s).constructor.Name);
}
function zt(s) {
  const e = JSON.parse(s), t = [];
  for (const n of Array.from(e)) {
    const o = Object.getOwnPropertyNames(n)[0], u = Yt(o);
    if (u) {
      const c = _n(
        u,
        n[o]
      );
      c.update(), t.push(c);
    }
  }
  return t;
}
class He extends qe {
  /**
   * @param _index Index of the device, as created by the device manager.
   * @param _name Name of the device.
   * @param allowedMsgs Buttplug messages the device can receive.
   */
  constructor(e, t) {
    super(), this._deviceInfo = e, this._sendClosure = t, this.allowedMsgs = /* @__PURE__ */ new Map(), e.DeviceMessages.update();
  }
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
  /**
   * Return a list of message types the device accepts.
   */
  get messageAttributes() {
    return this._deviceInfo.DeviceMessages;
  }
  static fromMsg(e, t) {
    return new He(e, t);
  }
  async send(e) {
    return await this._sendClosure(this, e);
  }
  async sendExpectOk(e) {
    const t = await this.send(e);
    switch (oe(t)) {
      case ye:
        return;
      case se:
        throw H.FromError(t);
      default:
        throw new ge(
          `Message type ${t.constructor} not handled by SendMsgExpectOk`
        );
    }
  }
  async scalar(e) {
    Array.isArray(e) ? await this.sendExpectOk(new me(e, this.index)) : await this.sendExpectOk(new me([e], this.index));
  }
  async scalarCommandBuilder(e, t, n) {
    var c;
    const o = (c = this.messageAttributes.ScalarCmd) == null ? void 0 : c.filter(
      (f) => f.ActuatorType === t
    );
    if (!o || o.length === 0)
      throw new B(
        `Device ${this.name} has no ${t} capabilities`
      );
    const u = [];
    if (typeof e == "number")
      if (n !== void 0) {
        if (n >= o.length)
          throw new B(
            `Index ${n} out of range for device ${this.name} with ${o.length} ${t} actuators`
          );
        o.forEach(
          (f) => (
            //push to all actuators when a single unindexed value is sent
            u.push(new Ee(f.Index, e, t))
          )
        );
      } else
        u.push(new Ee(n ?? 0, e, t));
    else if (Array.isArray(e)) {
      if (e.length > o.length)
        throw new B(
          `${e.length} commands send to a device with ${o.length} vibrators`
        );
      o.forEach((f, v) => {
        u.push(new Ee(f.Index, e[v], t));
      });
    } else
      throw new B(
        `${t} can only take numbers or arrays of numbers.`
      );
    await this.scalar(u);
  }
  get vibrateAttributes() {
    var e;
    return ((e = this.messageAttributes.ScalarCmd) == null ? void 0 : e.filter(
      (t) => t.ActuatorType === ie.Vibrate
    )) ?? [];
  }
  async vibrate(e) {
    await this.scalarCommandBuilder(e, ie.Vibrate);
  }
  get oscillateAttributes() {
    var e;
    return ((e = this.messageAttributes.ScalarCmd) == null ? void 0 : e.filter(
      (t) => t.ActuatorType === ie.Oscillate
    )) ?? [];
  }
  async oscillate(e, t) {
    await this.scalarCommandBuilder(e, ie.Oscillate, t);
  }
  get rotateAttributes() {
    return this.messageAttributes.RotateCmd ?? [];
  }
  async rotate(e, t) {
    const n = this.messageAttributes.RotateCmd;
    if (!n || n.length === 0)
      throw new B(
        `Device ${this.name} has no Rotate capabilities`
      );
    let o;
    if (typeof e == "number")
      o = we.Create(
        this.index,
        new Array(n.length).fill([e, t])
      );
    else if (Array.isArray(e))
      o = we.Create(this.index, e);
    else
      throw new B(
        "SendRotateCmd can only take a number and boolean, or an array of number/boolean tuples"
      );
    await this.sendExpectOk(o);
  }
  get linearAttributes() {
    var e;
    return ((e = this.messageAttributes.ScalarCmd) == null ? void 0 : e.filter(
      (t) => t.ActuatorType === ie.Position
    )) ?? [];
  }
  async linear(e, t) {
    const n = this.linearAttributes;
    if (!n || n.length === 0)
      throw new B(
        `Device ${this.name} has no Linear capabilities`
      );
    let o;
    if (typeof e == "number") {
      const u = t !== void 0 ? [e, t] : [e];
      o = Me.Create(
        this.index,
        new Array(n.length).fill(u)
      );
    } else if (Array.isArray(e))
      o = Me.Create(this.index, e);
    else
      throw new B(
        "SendLinearCmd can only take a number and number, or an array of number/number tuples"
      );
    await this.sendExpectOk(o);
  }
  async sensorRead(e, t) {
    const n = await this.send(
      new $e(this.index, e, t)
    );
    switch (oe(n)) {
      case Be:
        return n.Data;
      case se:
        throw H.FromError(n);
      default:
        throw new ge(
          `Message type ${n.constructor} not handled by sensorRead`
        );
    }
  }
  get hasBattery() {
    var t;
    const e = (t = this.messageAttributes.SensorReadCmd) == null ? void 0 : t.filter(
      (n) => n.SensorType === re.Battery
    );
    return e !== void 0 && e.length > 0;
  }
  async battery() {
    var n;
    if (!this.hasBattery)
      throw new B(
        `Device ${this.name} has no Battery capabilities`
      );
    const e = (n = this.messageAttributes.SensorReadCmd) == null ? void 0 : n.filter(
      (o) => o.SensorType === re.Battery
    );
    return (await this.sensorRead(
      e[0].Index,
      re.Battery
    ))[0] / 100;
  }
  get hasRssi() {
    var t;
    const e = (t = this.messageAttributes.SensorReadCmd) == null ? void 0 : t.filter(
      (n) => n.SensorType === re.RSSI
    );
    return e !== void 0 && e.length === 0;
  }
  async rssi() {
    var n;
    if (!this.hasRssi)
      throw new B(
        `Device ${this.name} has no RSSI capabilities`
      );
    const e = (n = this.messageAttributes.SensorReadCmd) == null ? void 0 : n.filter(
      (o) => o.SensorType === re.RSSI
    );
    return (await this.sensorRead(
      e[0].Index,
      re.RSSI
    ))[0];
  }
  async rawRead(e, t, n) {
    if (!this.messageAttributes.RawReadCmd)
      throw new B(
        `Device ${this.name} has no raw read capabilities`
      );
    if (this.messageAttributes.RawReadCmd.Endpoints.indexOf(e) === -1)
      throw new B(
        `Device ${this.name} has no raw readable endpoint ${e}`
      );
    const o = await this.send(
      new Fe(this.index, e, t, n)
    );
    switch (oe(o)) {
      case ze:
        return new Uint8Array(o.Data);
      case se:
        throw H.FromError(o);
      default:
        throw new ge(
          `Message type ${o.constructor} not handled by rawRead`
        );
    }
  }
  async rawWrite(e, t, n) {
    if (!this.messageAttributes.RawWriteCmd)
      throw new B(
        `Device ${this.name} has no raw write capabilities`
      );
    if (this.messageAttributes.RawWriteCmd.Endpoints.indexOf(e) === -1)
      throw new B(
        `Device ${this.name} has no raw writable endpoint ${e}`
      );
    await this.sendExpectOk(
      new Ge(this.index, e, t, n)
    );
  }
  async rawSubscribe(e) {
    if (!this.messageAttributes.RawSubscribeCmd)
      throw new B(
        `Device ${this.name} has no raw subscribe capabilities`
      );
    if (this.messageAttributes.RawSubscribeCmd.Endpoints.indexOf(e) === -1)
      throw new B(
        `Device ${this.name} has no raw subscribable endpoint ${e}`
      );
    await this.sendExpectOk(new We(this.index, e));
  }
  async rawUnsubscribe(e) {
    if (!this.messageAttributes.RawSubscribeCmd)
      throw new B(
        `Device ${this.name} has no raw unsubscribe capabilities`
      );
    if (this.messageAttributes.RawSubscribeCmd.Endpoints.indexOf(e) === -1)
      throw new B(
        `Device ${this.name} has no raw unsubscribable endpoint ${e}`
      );
    await this.sendExpectOk(
      new Ue(this.index, e)
    );
  }
  async stop() {
    await this.sendExpectOk(new De(this.index));
  }
  emitDisconnected() {
    this.emit("deviceremoved");
  }
}
/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */
class Ln {
  constructor(e) {
    this._useCounter = e, this._counter = 1, this._waitingMsgs = /* @__PURE__ */ new Map();
  }
  // One of the places we should actually return a promise, as we need to store
  // them while waiting for them to return across the line.
  // tslint:disable:promise-function-async
  PrepareOutgoingMessage(e) {
    this._useCounter && (e.Id = this._counter, this._counter += 1);
    let t, n;
    const o = new Promise(
      (u, c) => {
        t = u, n = c;
      }
    );
    return this._waitingMsgs.set(e.Id, [t, n]), o;
  }
  ParseIncomingMessages(e) {
    const t = [];
    for (const n of e)
      if (n.Id !== te && this._waitingMsgs.has(n.Id)) {
        const [o, u] = this._waitingMsgs.get(n.Id);
        if (n.Type === se) {
          u(H.FromError(n));
          continue;
        }
        o(n);
        continue;
      } else
        t.push(n);
    return t;
  }
}
/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */
class Pn extends H {
  constructor(e) {
    super(e, q.ERROR_UNKNOWN);
  }
}
class kn extends qe {
  constructor(e = "Generic Buttplug Client") {
    super(), this._pingTimer = null, this._connector = null, this._devices = /* @__PURE__ */ new Map(), this._logger = et.Logger, this._isScanning = !1, this._sorter = new Ln(!0), this.connect = async (t) => {
      this._logger.Info(
        `ButtplugClient: Connecting using ${t.constructor.name}`
      ), await t.connect(), this._connector = t, this._connector.addListener("message", this.parseMessages), this._connector.addListener("disconnect", this.disconnectHandler), await this.initializeConnection();
    }, this.disconnect = async () => {
      this._logger.Debug("ButtplugClient: Disconnect called"), this.checkConnector(), await this.shutdownConnection(), await this._connector.disconnect();
    }, this.startScanning = async () => {
      this._logger.Debug("ButtplugClient: StartScanning called"), this._isScanning = !0, await this.sendMsgExpectOk(new Pe());
    }, this.stopScanning = async () => {
      this._logger.Debug("ButtplugClient: StopScanning called"), this._isScanning = !1, await this.sendMsgExpectOk(new Re());
    }, this.stopAllDevices = async () => {
      this._logger.Debug("ButtplugClient: StopAllDevices"), await this.sendMsgExpectOk(new je());
    }, this.disconnectHandler = () => {
      this._logger.Info("ButtplugClient: Disconnect event receieved."), this.emit("disconnect");
    }, this.parseMessages = (t) => {
      const n = this._sorter.ParseIncomingMessages(t);
      for (const o of n)
        switch (oe(o)) {
          case ve: {
            const u = o, c = He.fromMsg(
              u,
              this.sendDeviceMessageClosure
            );
            this._devices.set(u.DeviceIndex, c), this.emit("deviceadded", c);
            break;
          }
          case Ie: {
            const u = o;
            if (this._devices.has(u.DeviceIndex)) {
              const c = this._devices.get(u.DeviceIndex);
              c == null || c.emitDisconnected(), this._devices.delete(u.DeviceIndex), this.emit("deviceremoved", c);
            }
            break;
          }
          case Te:
            this._isScanning = !1, this.emit("scanningfinished", o);
            break;
        }
    }, this.initializeConnection = async () => {
      this.checkConnector();
      const t = await this.sendMessage(
        new Ne(
          this._clientName,
          Ce
        )
      );
      switch (oe(t)) {
        case ke: {
          const n = t;
          if (this._logger.Info(
            `ButtplugClient: Connected to Server ${n.ServerName}`
          ), n.MaxPingTime, n.MessageVersion < Ce)
            throw await this._connector.disconnect(), H.LogAndError(
              nt,
              this._logger,
              `Server protocol version ${n.MessageVersion} is older than client protocol version ${Ce}. Please update server.`
            );
          return await this.requestDeviceList(), !0;
        }
        case se: {
          await this._connector.disconnect();
          const n = t;
          throw H.LogAndError(
            nt,
            this._logger,
            `Cannot connect to server. ${n.ErrorMessage}`
          );
        }
      }
      return !1;
    }, this.requestDeviceList = async () => {
      this.checkConnector(), this._logger.Debug("ButtplugClient: ReceiveDeviceList called"), (await this.sendMessage(
        new Le()
      )).Devices.forEach((n) => {
        if (this._devices.has(n.DeviceIndex))
          this._logger.Debug(`ButtplugClient: Device already added: ${n}`);
        else {
          const o = He.fromMsg(
            n,
            this.sendDeviceMessageClosure
          );
          this._logger.Debug(`ButtplugClient: Adding Device: ${o}`), this._devices.set(n.DeviceIndex, o), this.emit("deviceadded", o);
        }
      });
    }, this.shutdownConnection = async () => {
      await this.stopAllDevices(), this._pingTimer !== null && (clearInterval(this._pingTimer), this._pingTimer = null);
    }, this.sendMsgExpectOk = async (t) => {
      const n = await this.sendMessage(t);
      switch (oe(n)) {
        case ye:
          return;
        case se:
          throw H.FromError(n);
        default:
          throw H.LogAndError(
            ge,
            this._logger,
            `Message type ${oe(n).constructor} not handled by SendMsgExpectOk`
          );
      }
    }, this.sendDeviceMessageClosure = async (t, n) => await this.sendDeviceMessage(t, n), this._clientName = e, this._logger.Debug(`ButtplugClient: Client ${e} created.`);
  }
  get connected() {
    return this._connector !== null && this._connector.Connected;
  }
  get devices() {
    this.checkConnector();
    const e = [];
    return this._devices.forEach((t) => {
      e.push(t);
    }), e;
  }
  get isScanning() {
    return this._isScanning;
  }
  async sendDeviceMessage(e, t) {
    if (this.checkConnector(), this._devices.get(e.index) === void 0)
      throw H.LogAndError(
        B,
        this._logger,
        `Device ${e.index} not available.`
      );
    return t.DeviceIndex = e.index, await this.sendMessage(t);
  }
  async sendMessage(e) {
    this.checkConnector();
    const t = this._sorter.PrepareOutgoingMessage(e);
    return await this._connector.send(e), await t;
  }
  checkConnector() {
    if (!this.connected)
      throw new Pn(
        "ButtplugClient not connected"
      );
  }
}
class Rn extends qe {
  constructor(e) {
    super(), this._url = e, this._websocketConstructor = null, this.connect = async () => new Promise((t, n) => {
      const o = new (this._websocketConstructor ?? WebSocket)(this._url), u = (f) => {
        n(f);
      }, c = (f) => n(f.reason);
      o.addEventListener("open", async () => {
        this._ws = o;
        try {
          await this.initialize(), this._ws.addEventListener("message", (f) => {
            this.parseIncomingMessage(f);
          }), this._ws.removeEventListener("close", c), this._ws.removeEventListener("error", u), this._ws.addEventListener("close", this.disconnect), t();
        } catch (f) {
          n(f);
        }
      }), o.addEventListener("error", u), o.addEventListener("close", c);
    }), this.disconnect = async () => {
      this.Connected && (this._ws.close(), this._ws = void 0, this.emit("disconnect"));
    }, this.initialize = async () => Promise.resolve();
  }
  get Connected() {
    return this._ws !== void 0;
  }
  sendMessage(e) {
    if (!this.Connected)
      throw new Error("ButtplugBrowserWebsocketConnector not connected");
    this._ws.send("[" + e.toJSON() + "]");
  }
  parseIncomingMessage(e) {
    if (typeof e.data == "string") {
      const t = zt(e.data);
      this.emit("message", t);
    } else e.data instanceof Blob;
  }
  onReaderLoad(e) {
    const t = zt(e.target.result);
    this.emit("message", t);
  }
}
class Tn extends Rn {
  constructor() {
    super(...arguments), this.send = (e) => {
      if (!this.Connected)
        throw new Error("ButtplugClient not connected");
      this.sendMessage(e);
    };
  }
}
var Nn = function() {
  throw new Error(
    "ws does not work in the browser. Browser clients must use the native WebSocket object"
  );
};
class Dn extends Tn {
  constructor() {
    super(...arguments), this._websocketConstructor = Nn.WebSocket;
  }
}
export {
  ie as ActuatorType,
  Tn as ButtplugBrowserWebsocketClientConnector,
  kn as ButtplugClient,
  Pn as ButtplugClientConnectorException,
  He as ButtplugClientDevice,
  B as ButtplugDeviceError,
  X as ButtplugDeviceMessage,
  H as ButtplugError,
  nt as ButtplugInitError,
  Jt as ButtplugLogLevel,
  et as ButtplugLogger,
  K as ButtplugMessage,
  ge as ButtplugMessageError,
  Ln as ButtplugMessageSorter,
  Dn as ButtplugNodeWebsocketClientConnector,
  An as ButtplugPingError,
  he as ButtplugSystemMessage,
  In as ButtplugUnknownError,
  k as DEFAULT_MESSAGE_ID,
  ve as DeviceAdded,
  ot as DeviceInfo,
  Ae as DeviceList,
  Ie as DeviceRemoved,
  se as Error,
  q as ErrorClass,
  xn as GenericDeviceMessageAttributes,
  Xe as GenericMessageSubcommand,
  Me as LinearCmd,
  pn as LogMessage,
  Sn as MAX_ID,
  Ce as MESSAGE_SPEC_VERSION,
  it as MessageAttributes,
  ye as Ok,
  tt as Ping,
  On as RawDeviceMessageAttributes,
  Fe as RawReadCmd,
  ze as RawReading,
  We as RawSubscribeCmd,
  Ue as RawUnsubscribeCmd,
  Ge as RawWriteCmd,
  Le as RequestDeviceList,
  Ne as RequestServerInfo,
  we as RotateCmd,
  qt as RotateSubcommand,
  te as SYSTEM_MESSAGE_ID,
  me as ScalarCmd,
  Ee as ScalarSubcommand,
  Te as ScanningFinished,
  Cn as SensorDeviceMessageAttributes,
  $e as SensorReadCmd,
  Be as SensorReading,
  re as SensorType,
  ke as ServerInfo,
  Pe as StartScanning,
  je as StopAllDevices,
  De as StopDeviceCmd,
  Re as StopScanning,
  Xt as VectorSubcommand,
  zt as fromJSON,
  oe as getMessageClassFromMessage
};
