let V;
let __tla = (async () => {
  var _a;
  var Je = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
  function Ke(i) {
    return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
  }
  var Me = {
    exports: {}
  }, Ze;
  function jt() {
    return Ze || (Ze = 1, (function(i) {
      var e = Object.prototype.hasOwnProperty, t = "~";
      function n() {
      }
      Object.create && (n.prototype = /* @__PURE__ */ Object.create(null), new n().__proto__ || (t = false));
      function c(h, l, f) {
        this.fn = h, this.context = l, this.once = f || false;
      }
      function v(h, l, f, u, p) {
        if (typeof f != "function") throw new TypeError("The listener must be a function");
        var A = new c(f, u || h, p), O = t ? t + l : l;
        return h._events[O] ? h._events[O].fn ? h._events[O] = [
          h._events[O],
          A
        ] : h._events[O].push(A) : (h._events[O] = A, h._eventsCount++), h;
      }
      function y(h, l) {
        --h._eventsCount === 0 ? h._events = new n() : delete h._events[l];
      }
      function d() {
        this._events = new n(), this._eventsCount = 0;
      }
      d.prototype.eventNames = function() {
        var l = [], f, u;
        if (this._eventsCount === 0) return l;
        for (u in f = this._events) e.call(f, u) && l.push(t ? u.slice(1) : u);
        return Object.getOwnPropertySymbols ? l.concat(Object.getOwnPropertySymbols(f)) : l;
      }, d.prototype.listeners = function(l) {
        var f = t ? t + l : l, u = this._events[f];
        if (!u) return [];
        if (u.fn) return [
          u.fn
        ];
        for (var p = 0, A = u.length, O = new Array(A); p < A; p++) O[p] = u[p].fn;
        return O;
      }, d.prototype.listenerCount = function(l) {
        var f = t ? t + l : l, u = this._events[f];
        return u ? u.fn ? 1 : u.length : 0;
      }, d.prototype.emit = function(l, f, u, p, A, O) {
        var R = t ? t + l : l;
        if (!this._events[R]) return false;
        var a = this._events[R], P = arguments.length, I, w;
        if (a.fn) {
          switch (a.once && this.removeListener(l, a.fn, void 0, true), P) {
            case 1:
              return a.fn.call(a.context), true;
            case 2:
              return a.fn.call(a.context, f), true;
            case 3:
              return a.fn.call(a.context, f, u), true;
            case 4:
              return a.fn.call(a.context, f, u, p), true;
            case 5:
              return a.fn.call(a.context, f, u, p, A), true;
            case 6:
              return a.fn.call(a.context, f, u, p, A, O), true;
          }
          for (w = 1, I = new Array(P - 1); w < P; w++) I[w - 1] = arguments[w];
          a.fn.apply(a.context, I);
        } else {
          var q = a.length, E;
          for (w = 0; w < q; w++) switch (a[w].once && this.removeListener(l, a[w].fn, void 0, true), P) {
            case 1:
              a[w].fn.call(a[w].context);
              break;
            case 2:
              a[w].fn.call(a[w].context, f);
              break;
            case 3:
              a[w].fn.call(a[w].context, f, u);
              break;
            case 4:
              a[w].fn.call(a[w].context, f, u, p);
              break;
            default:
              if (!I) for (E = 1, I = new Array(P - 1); E < P; E++) I[E - 1] = arguments[E];
              a[w].fn.apply(a[w].context, I);
          }
        }
        return true;
      }, d.prototype.on = function(l, f, u) {
        return v(this, l, f, u, false);
      }, d.prototype.once = function(l, f, u) {
        return v(this, l, f, u, true);
      }, d.prototype.removeListener = function(l, f, u, p) {
        var A = t ? t + l : l;
        if (!this._events[A]) return this;
        if (!f) return y(this, A), this;
        var O = this._events[A];
        if (O.fn) O.fn === f && (!p || O.once) && (!u || O.context === u) && y(this, A);
        else {
          for (var R = 0, a = [], P = O.length; R < P; R++) (O[R].fn !== f || p && !O[R].once || u && O[R].context !== u) && a.push(O[R]);
          a.length ? this._events[A] = a.length === 1 ? a[0] : a : y(this, A);
        }
        return this;
      }, d.prototype.removeAllListeners = function(l) {
        var f;
        return l ? (f = t ? t + l : l, this._events[f] && y(this, f)) : (this._events = new n(), this._eventsCount = 0), this;
      }, d.prototype.off = d.prototype.removeListener, d.prototype.addListener = d.prototype.on, d.prefixed = t, d.EventEmitter = d, i.exports = d;
    })(Me)), Me.exports;
  }
  var Ft = jt();
  const Gt = Ke(Ft);
  var K;
  (function(i) {
    i[i.Off = 0] = "Off", i[i.Error = 1] = "Error", i[i.Warn = 2] = "Warn", i[i.Info = 3] = "Info", i[i.Debug = 4] = "Debug", i[i.Trace = 5] = "Trace";
  })(K || (K = {}));
  class Ut {
    constructor(e, t) {
      const n = /* @__PURE__ */ new Date(), c = n.getHours(), v = n.getMinutes(), y = n.getSeconds();
      this.timestamp = `${c}:${v}:${y}`, this.logMessage = e, this.logLevel = t;
    }
    get Message() {
      return this.logMessage;
    }
    get LogLevel() {
      return this.logLevel;
    }
    get Timestamp() {
      return this.timestamp;
    }
    get FormattedMessage() {
      return `${K[this.logLevel]} : ${this.timestamp} : ${this.logMessage}`;
    }
  }
  class se extends Gt {
    static get Logger() {
      return se.sLogger === void 0 && (se.sLogger = new se()), this.sLogger;
    }
    constructor() {
      super(), this.maximumConsoleLogLevel = K.Off, this.maximumEventLogLevel = K.Off;
    }
    get MaximumConsoleLogLevel() {
      return this.maximumConsoleLogLevel;
    }
    set MaximumConsoleLogLevel(e) {
      this.maximumConsoleLogLevel = e;
    }
    get MaximumEventLogLevel() {
      return this.maximumEventLogLevel;
    }
    set MaximumEventLogLevel(e) {
      this.maximumEventLogLevel = e;
    }
    Error(e) {
      this.AddLogMessage(e, K.Error);
    }
    Warn(e) {
      this.AddLogMessage(e, K.Warn);
    }
    Info(e) {
      this.AddLogMessage(e, K.Info);
    }
    Debug(e) {
      this.AddLogMessage(e, K.Debug);
    }
    Trace(e) {
      this.AddLogMessage(e, K.Trace);
    }
    AddLogMessage(e, t) {
      if (t > this.maximumEventLogLevel && t > this.maximumConsoleLogLevel) return;
      const n = new Ut(e, t);
      t <= this.maximumConsoleLogLevel && console.log(n.FormattedMessage), t <= this.maximumEventLogLevel && this.emit("log", n);
    }
  }
  se.sLogger = void 0;
  var L;
  (function(i) {
    i[i.PLAIN_TO_CLASS = 0] = "PLAIN_TO_CLASS", i[i.CLASS_TO_PLAIN = 1] = "CLASS_TO_PLAIN", i[i.CLASS_TO_CLASS = 2] = "CLASS_TO_CLASS";
  })(L || (L = {}));
  var Wt = (function() {
    function i() {
      this._typeMetadatas = /* @__PURE__ */ new Map(), this._transformMetadatas = /* @__PURE__ */ new Map(), this._exposeMetadatas = /* @__PURE__ */ new Map(), this._excludeMetadatas = /* @__PURE__ */ new Map(), this._ancestorsMap = /* @__PURE__ */ new Map();
    }
    return i.prototype.addTypeMetadata = function(e) {
      this._typeMetadatas.has(e.target) || this._typeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._typeMetadatas.get(e.target).set(e.propertyName, e);
    }, i.prototype.addTransformMetadata = function(e) {
      this._transformMetadatas.has(e.target) || this._transformMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._transformMetadatas.get(e.target).has(e.propertyName) || this._transformMetadatas.get(e.target).set(e.propertyName, []), this._transformMetadatas.get(e.target).get(e.propertyName).push(e);
    }, i.prototype.addExposeMetadata = function(e) {
      this._exposeMetadatas.has(e.target) || this._exposeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._exposeMetadatas.get(e.target).set(e.propertyName, e);
    }, i.prototype.addExcludeMetadata = function(e) {
      this._excludeMetadatas.has(e.target) || this._excludeMetadatas.set(e.target, /* @__PURE__ */ new Map()), this._excludeMetadatas.get(e.target).set(e.propertyName, e);
    }, i.prototype.findTransformMetadatas = function(e, t, n) {
      return this.findMetadatas(this._transformMetadatas, e, t).filter(function(c) {
        return !c.options || c.options.toClassOnly === true && c.options.toPlainOnly === true ? true : c.options.toClassOnly === true ? n === L.CLASS_TO_CLASS || n === L.PLAIN_TO_CLASS : c.options.toPlainOnly === true ? n === L.CLASS_TO_PLAIN : true;
      });
    }, i.prototype.findExcludeMetadata = function(e, t) {
      return this.findMetadata(this._excludeMetadatas, e, t);
    }, i.prototype.findExposeMetadata = function(e, t) {
      return this.findMetadata(this._exposeMetadatas, e, t);
    }, i.prototype.findExposeMetadataByCustomName = function(e, t) {
      return this.getExposedMetadatas(e).find(function(n) {
        return n.options && n.options.name === t;
      });
    }, i.prototype.findTypeMetadata = function(e, t) {
      return this.findMetadata(this._typeMetadatas, e, t);
    }, i.prototype.getStrategy = function(e) {
      var t = this._excludeMetadatas.get(e), n = t && t.get(void 0), c = this._exposeMetadatas.get(e), v = c && c.get(void 0);
      return n && v || !n && !v ? "none" : n ? "excludeAll" : "exposeAll";
    }, i.prototype.getExposedMetadatas = function(e) {
      return this.getMetadata(this._exposeMetadatas, e);
    }, i.prototype.getExcludedMetadatas = function(e) {
      return this.getMetadata(this._excludeMetadatas, e);
    }, i.prototype.getExposedProperties = function(e, t) {
      return this.getExposedMetadatas(e).filter(function(n) {
        return !n.options || n.options.toClassOnly === true && n.options.toPlainOnly === true ? true : n.options.toClassOnly === true ? t === L.CLASS_TO_CLASS || t === L.PLAIN_TO_CLASS : n.options.toPlainOnly === true ? t === L.CLASS_TO_PLAIN : true;
      }).map(function(n) {
        return n.propertyName;
      });
    }, i.prototype.getExcludedProperties = function(e, t) {
      return this.getExcludedMetadatas(e).filter(function(n) {
        return !n.options || n.options.toClassOnly === true && n.options.toPlainOnly === true ? true : n.options.toClassOnly === true ? t === L.CLASS_TO_CLASS || t === L.PLAIN_TO_CLASS : n.options.toPlainOnly === true ? t === L.CLASS_TO_PLAIN : true;
      }).map(function(n) {
        return n.propertyName;
      });
    }, i.prototype.clear = function() {
      this._typeMetadatas.clear(), this._exposeMetadatas.clear(), this._excludeMetadatas.clear(), this._ancestorsMap.clear();
    }, i.prototype.getMetadata = function(e, t) {
      var n = e.get(t), c;
      n && (c = Array.from(n.values()).filter(function(u) {
        return u.propertyName !== void 0;
      }));
      for (var v = [], y = 0, d = this.getAncestors(t); y < d.length; y++) {
        var h = d[y], l = e.get(h);
        if (l) {
          var f = Array.from(l.values()).filter(function(u) {
            return u.propertyName !== void 0;
          });
          v.push.apply(v, f);
        }
      }
      return v.concat(c || []);
    }, i.prototype.findMetadata = function(e, t, n) {
      var c = e.get(t);
      if (c) {
        var v = c.get(n);
        if (v) return v;
      }
      for (var y = 0, d = this.getAncestors(t); y < d.length; y++) {
        var h = d[y], l = e.get(h);
        if (l) {
          var f = l.get(n);
          if (f) return f;
        }
      }
    }, i.prototype.findMetadatas = function(e, t, n) {
      var c = e.get(t), v;
      c && (v = c.get(n));
      for (var y = [], d = 0, h = this.getAncestors(t); d < h.length; d++) {
        var l = h[d], f = e.get(l);
        f && f.has(n) && y.push.apply(y, f.get(n));
      }
      return y.slice().reverse().concat((v || []).slice().reverse());
    }, i.prototype.getAncestors = function(e) {
      if (!e) return [];
      if (!this._ancestorsMap.has(e)) {
        for (var t = [], n = Object.getPrototypeOf(e.prototype.constructor); typeof n.prototype < "u"; n = Object.getPrototypeOf(n.prototype.constructor)) t.push(n);
        this._ancestorsMap.set(e, t);
      }
      return this._ancestorsMap.get(e);
    }, i;
  })(), z = new Wt();
  function $t() {
    if (typeof globalThis < "u") return globalThis;
    if (typeof global < "u") return global;
    if (typeof window < "u") return window;
    if (typeof self < "u") return self;
  }
  function qt(i) {
    return i !== null && typeof i == "object" && typeof i.then == "function";
  }
  var Xe = function(i, e, t) {
    if (t || arguments.length === 2) for (var n = 0, c = e.length, v; n < c; n++) (v || !(n in e)) && (v || (v = Array.prototype.slice.call(e, 0, n)), v[n] = e[n]);
    return i.concat(v || Array.prototype.slice.call(e));
  };
  function zt(i) {
    var e = new i();
    return !(e instanceof Set) && !("push" in e) ? [] : e;
  }
  var ne = (function() {
    function i(e, t) {
      this.transformationType = e, this.options = t, this.recursionStack = /* @__PURE__ */ new Set();
    }
    return i.prototype.transform = function(e, t, n, c, v, y) {
      var d = this;
      if (y === void 0 && (y = 0), Array.isArray(t) || t instanceof Set) {
        var h = c && this.transformationType === L.PLAIN_TO_CLASS ? zt(c) : [];
        return t.forEach(function(a, P) {
          var I = e ? e[P] : void 0;
          if (!d.options.enableCircularCheck || !d.isCircular(a)) {
            var w = void 0;
            if (typeof n != "function" && n && n.options && n.options.discriminator && n.options.discriminator.property && n.options.discriminator.subTypes) {
              if (d.transformationType === L.PLAIN_TO_CLASS) {
                w = n.options.discriminator.subTypes.find(function(B) {
                  return B.name === a[n.options.discriminator.property];
                });
                var q = {
                  newObject: h,
                  object: a,
                  property: void 0
                }, E = n.typeFunction(q);
                w === void 0 ? w = E : w = w.value, n.options.keepDiscriminatorProperty || delete a[n.options.discriminator.property];
              }
              d.transformationType === L.CLASS_TO_CLASS && (w = a.constructor), d.transformationType === L.CLASS_TO_PLAIN && (a[n.options.discriminator.property] = n.options.discriminator.subTypes.find(function(B) {
                return B.value === a.constructor;
              }).name);
            } else w = n;
            var $ = d.transform(I, a, w, void 0, a instanceof Map, y + 1);
            h instanceof Set ? h.add($) : h.push($);
          } else d.transformationType === L.CLASS_TO_CLASS && (h instanceof Set ? h.add(a) : h.push(a));
        }), h;
      } else {
        if (n === String && !v) return t == null ? t : String(t);
        if (n === Number && !v) return t == null ? t : Number(t);
        if (n === Boolean && !v) return t == null ? t : !!t;
        if ((n === Date || t instanceof Date) && !v) return t instanceof Date ? new Date(t.valueOf()) : t == null ? t : new Date(t);
        if ($t().Buffer && (n === Buffer || t instanceof Buffer) && !v) return t == null ? t : Buffer.from(t);
        if (qt(t) && !v) return new Promise(function(a, P) {
          t.then(function(I) {
            return a(d.transform(void 0, I, n, void 0, void 0, y + 1));
          }, P);
        });
        if (!v && t !== null && typeof t == "object" && typeof t.then == "function") return t;
        if (typeof t == "object" && t !== null) {
          !n && t.constructor !== Object && (!Array.isArray(t) && t.constructor === Array || (n = t.constructor)), !n && e && (n = e.constructor), this.options.enableCircularCheck && this.recursionStack.add(t);
          var l = this.getKeys(n, t, v), f = e || {};
          !e && (this.transformationType === L.PLAIN_TO_CLASS || this.transformationType === L.CLASS_TO_CLASS) && (v ? f = /* @__PURE__ */ new Map() : n ? f = new n() : f = {});
          for (var u = function(a) {
            if (a === "__proto__" || a === "constructor") return "continue";
            var P = a, I = a, w = a;
            if (!p.options.ignoreDecorators && n) {
              if (p.transformationType === L.PLAIN_TO_CLASS) {
                var q = z.findExposeMetadataByCustomName(n, a);
                q && (w = q.propertyName, I = q.propertyName);
              } else if (p.transformationType === L.CLASS_TO_PLAIN || p.transformationType === L.CLASS_TO_CLASS) {
                var q = z.findExposeMetadata(n, a);
                q && q.options && q.options.name && (I = q.options.name);
              }
            }
            var E = void 0;
            p.transformationType === L.PLAIN_TO_CLASS ? E = t[P] : t instanceof Map ? E = t.get(P) : t[P] instanceof Function ? E = t[P]() : E = t[P];
            var $ = void 0, B = E instanceof Map;
            if (n && v) $ = n;
            else if (n) {
              var G = z.findTypeMetadata(n, w);
              if (G) {
                var ge = {
                  newObject: f,
                  object: t,
                  property: w
                }, fe = G.typeFunction ? G.typeFunction(ge) : G.reflectedType;
                G.options && G.options.discriminator && G.options.discriminator.property && G.options.discriminator.subTypes ? t[P] instanceof Array ? $ = G : (p.transformationType === L.PLAIN_TO_CLASS && ($ = G.options.discriminator.subTypes.find(function(Z) {
                  if (E && E instanceof Object && G.options.discriminator.property in E) return Z.name === E[G.options.discriminator.property];
                }), $ === void 0 ? $ = fe : $ = $.value, G.options.keepDiscriminatorProperty || E && E instanceof Object && G.options.discriminator.property in E && delete E[G.options.discriminator.property]), p.transformationType === L.CLASS_TO_CLASS && ($ = E.constructor), p.transformationType === L.CLASS_TO_PLAIN && E && (E[G.options.discriminator.property] = G.options.discriminator.subTypes.find(function(Z) {
                  return Z.value === E.constructor;
                }).name)) : $ = fe, B = B || G.reflectedType === Map;
              } else if (p.options.targetMaps) p.options.targetMaps.filter(function(Z) {
                return Z.target === n && !!Z.properties[w];
              }).forEach(function(Z) {
                return $ = Z.properties[w];
              });
              else if (p.options.enableImplicitConversion && p.transformationType === L.PLAIN_TO_CLASS) {
                var ue = Reflect.getMetadata("design:type", n.prototype, w);
                ue && ($ = ue);
              }
            }
            var ce = Array.isArray(t[P]) ? p.getReflectedType(n, w) : void 0, de = e ? e[P] : void 0;
            if (f.constructor.prototype) {
              var pe = Object.getOwnPropertyDescriptor(f.constructor.prototype, I);
              if ((p.transformationType === L.PLAIN_TO_CLASS || p.transformationType === L.CLASS_TO_CLASS) && (pe && !pe.set || f[I] instanceof Function)) return "continue";
            }
            if (!p.options.enableCircularCheck || !p.isCircular(E)) {
              var ee = p.transformationType === L.PLAIN_TO_CLASS ? I : a, N = void 0;
              p.transformationType === L.CLASS_TO_PLAIN ? (N = t[ee], N = p.applyCustomTransformations(N, n, ee, t, p.transformationType), N = t[ee] === N ? E : N, N = p.transform(de, N, $, ce, B, y + 1)) : E === void 0 && p.options.exposeDefaultValues ? N = f[I] : (N = p.transform(de, E, $, ce, B, y + 1), N = p.applyCustomTransformations(N, n, ee, t, p.transformationType)), (N !== void 0 || p.options.exposeUnsetFields) && (f instanceof Map ? f.set(I, N) : f[I] = N);
            } else if (p.transformationType === L.CLASS_TO_CLASS) {
              var N = E;
              N = p.applyCustomTransformations(N, n, a, t, p.transformationType), (N !== void 0 || p.options.exposeUnsetFields) && (f instanceof Map ? f.set(I, N) : f[I] = N);
            }
          }, p = this, A = 0, O = l; A < O.length; A++) {
            var R = O[A];
            u(R);
          }
          return this.options.enableCircularCheck && this.recursionStack.delete(t), f;
        } else return t;
      }
    }, i.prototype.applyCustomTransformations = function(e, t, n, c, v) {
      var y = this, d = z.findTransformMetadatas(t, n, this.transformationType);
      return this.options.version !== void 0 && (d = d.filter(function(h) {
        return h.options ? y.checkVersion(h.options.since, h.options.until) : true;
      })), this.options.groups && this.options.groups.length ? d = d.filter(function(h) {
        return h.options ? y.checkGroups(h.options.groups) : true;
      }) : d = d.filter(function(h) {
        return !h.options || !h.options.groups || !h.options.groups.length;
      }), d.forEach(function(h) {
        e = h.transformFn({
          value: e,
          key: n,
          obj: c,
          type: v,
          options: y.options
        });
      }), e;
    }, i.prototype.isCircular = function(e) {
      return this.recursionStack.has(e);
    }, i.prototype.getReflectedType = function(e, t) {
      if (e) {
        var n = z.findTypeMetadata(e, t);
        return n ? n.reflectedType : void 0;
      }
    }, i.prototype.getKeys = function(e, t, n) {
      var c = this, v = z.getStrategy(e);
      v === "none" && (v = this.options.strategy || "exposeAll");
      var y = [];
      if ((v === "exposeAll" || n) && (t instanceof Map ? y = Array.from(t.keys()) : y = Object.keys(t)), n) return y;
      if (this.options.ignoreDecorators && this.options.excludeExtraneousValues && e) {
        var d = z.getExposedProperties(e, this.transformationType), h = z.getExcludedProperties(e, this.transformationType);
        y = Xe(Xe([], d, true), h, true);
      }
      if (!this.options.ignoreDecorators && e) {
        var d = z.getExposedProperties(e, this.transformationType);
        this.transformationType === L.PLAIN_TO_CLASS && (d = d.map(function(u) {
          var p = z.findExposeMetadata(e, u);
          return p && p.options && p.options.name ? p.options.name : u;
        })), this.options.excludeExtraneousValues ? y = d : y = y.concat(d);
        var l = z.getExcludedProperties(e, this.transformationType);
        l.length > 0 && (y = y.filter(function(u) {
          return !l.includes(u);
        })), this.options.version !== void 0 && (y = y.filter(function(u) {
          var p = z.findExposeMetadata(e, u);
          return !p || !p.options ? true : c.checkVersion(p.options.since, p.options.until);
        })), this.options.groups && this.options.groups.length ? y = y.filter(function(u) {
          var p = z.findExposeMetadata(e, u);
          return !p || !p.options ? true : c.checkGroups(p.options.groups);
        }) : y = y.filter(function(u) {
          var p = z.findExposeMetadata(e, u);
          return !p || !p.options || !p.options.groups || !p.options.groups.length;
        });
      }
      return this.options.excludePrefixes && this.options.excludePrefixes.length && (y = y.filter(function(f) {
        return c.options.excludePrefixes.every(function(u) {
          return f.substr(0, u.length) !== u;
        });
      })), y = y.filter(function(f, u, p) {
        return p.indexOf(f) === u;
      }), y;
    }, i.prototype.checkVersion = function(e, t) {
      var n = true;
      return n && e && (n = this.options.version >= e), n && t && (n = this.options.version < t), n;
    }, i.prototype.checkGroups = function(e) {
      return e ? this.options.groups.some(function(t) {
        return e.includes(t);
      }) : true;
    }, i;
  })(), re = {
    enableCircularCheck: false,
    enableImplicitConversion: false,
    excludeExtraneousValues: false,
    excludePrefixes: void 0,
    exposeDefaultValues: false,
    exposeUnsetFields: true,
    groups: void 0,
    ignoreDecorators: false,
    strategy: void 0,
    targetMaps: void 0,
    version: void 0
  }, H = function() {
    return H = Object.assign || function(i) {
      for (var e, t = 1, n = arguments.length; t < n; t++) {
        e = arguments[t];
        for (var c in e) Object.prototype.hasOwnProperty.call(e, c) && (i[c] = e[c]);
      }
      return i;
    }, H.apply(this, arguments);
  }, Ht = (function() {
    function i() {
    }
    return i.prototype.instanceToPlain = function(e, t) {
      var n = new ne(L.CLASS_TO_PLAIN, H(H({}, re), t));
      return n.transform(void 0, e, void 0, void 0, void 0, void 0);
    }, i.prototype.classToPlainFromExist = function(e, t, n) {
      var c = new ne(L.CLASS_TO_PLAIN, H(H({}, re), n));
      return c.transform(t, e, void 0, void 0, void 0, void 0);
    }, i.prototype.plainToInstance = function(e, t, n) {
      var c = new ne(L.PLAIN_TO_CLASS, H(H({}, re), n));
      return c.transform(void 0, t, e, void 0, void 0, void 0);
    }, i.prototype.plainToClassFromExist = function(e, t, n) {
      var c = new ne(L.PLAIN_TO_CLASS, H(H({}, re), n));
      return c.transform(e, t, void 0, void 0, void 0, void 0);
    }, i.prototype.instanceToInstance = function(e, t) {
      var n = new ne(L.CLASS_TO_CLASS, H(H({}, re), t));
      return n.transform(void 0, e, void 0, void 0, void 0, void 0);
    }, i.prototype.classToClassFromExist = function(e, t, n) {
      var c = new ne(L.CLASS_TO_CLASS, H(H({}, re), n));
      return c.transform(t, e, void 0, void 0, void 0, void 0);
    }, i.prototype.serialize = function(e, t) {
      return JSON.stringify(this.instanceToPlain(e, t));
    }, i.prototype.deserialize = function(e, t, n) {
      var c = JSON.parse(t);
      return this.plainToInstance(e, c, n);
    }, i.prototype.deserializeArray = function(e, t, n) {
      var c = JSON.parse(t);
      return this.plainToInstance(e, c, n);
    }, i;
  })();
  function Ae(i, e) {
    return e === void 0 && (e = {}), function(t, n) {
      var c = Reflect.getMetadata("design:type", t, n);
      z.addTypeMetadata({
        target: t.constructor,
        propertyName: n,
        reflectedType: c,
        typeFunction: i,
        options: e
      });
    };
  }
  var Ve = new Ht();
  function Jt(i, e) {
    return Ve.instanceToPlain(i, e);
  }
  function Zt(i, e, t) {
    return Ve.plainToInstance(i, e, t);
  }
  var Ye = {};
  var Be;
  function Xt() {
    if (Be) return Ye;
    Be = 1;
    var i;
    return (function(e) {
      (function(t) {
        var n = typeof globalThis == "object" ? globalThis : typeof Je == "object" ? Je : typeof self == "object" ? self : typeof this == "object" ? this : h(), c = v(e);
        typeof n.Reflect < "u" && (c = v(n.Reflect, c)), t(c, n), typeof n.Reflect > "u" && (n.Reflect = e);
        function v(l, f) {
          return function(u, p) {
            Object.defineProperty(l, u, {
              configurable: true,
              writable: true,
              value: p
            }), f && f(u, p);
          };
        }
        function y() {
          try {
            return Function("return this;")();
          } catch {
          }
        }
        function d() {
          try {
            return (0, eval)("(function() { return this; })()");
          } catch {
          }
        }
        function h() {
          return y() || d();
        }
      })(function(t, n) {
        var c = Object.prototype.hasOwnProperty, v = typeof Symbol == "function", y = v && typeof Symbol.toPrimitive < "u" ? Symbol.toPrimitive : "@@toPrimitive", d = v && typeof Symbol.iterator < "u" ? Symbol.iterator : "@@iterator", h = typeof Object.create == "function", l = {
          __proto__: []
        } instanceof Array, f = !h && !l, u = {
          create: h ? function() {
            return we(/* @__PURE__ */ Object.create(null));
          } : l ? function() {
            return we({
              __proto__: null
            });
          } : function() {
            return we({});
          },
          has: f ? function(r, o) {
            return c.call(r, o);
          } : function(r, o) {
            return o in r;
          },
          get: f ? function(r, o) {
            return c.call(r, o) ? r[o] : void 0;
          } : function(r, o) {
            return r[o];
          }
        }, p = Object.getPrototypeOf(Function), A = typeof Map == "function" && typeof Map.prototype.entries == "function" ? Map : It(), O = typeof Set == "function" && typeof Set.prototype.entries == "function" ? Set : Rt(), R = typeof WeakMap == "function" ? WeakMap : Nt(), a = v ? Symbol.for("@reflect-metadata:registry") : void 0, P = Ct(), I = Tt(P);
        function w(r, o, s, m) {
          if (b(s)) {
            if (!Fe(r)) throw new TypeError();
            if (!Ge(o)) throw new TypeError();
            return de(r, o);
          } else {
            if (!Fe(r)) throw new TypeError();
            if (!U(o)) throw new TypeError();
            if (!U(m) && !b(m) && !te(m)) throw new TypeError();
            return te(m) && (m = void 0), s = Q(s), pe(r, o, s, m);
          }
        }
        t("decorate", w);
        function q(r, o) {
          function s(m, x) {
            if (!U(m)) throw new TypeError();
            if (!b(x) && !Et(x)) throw new TypeError();
            Re(r, o, m, x);
          }
          return s;
        }
        t("metadata", q);
        function E(r, o, s, m) {
          if (!U(s)) throw new TypeError();
          return b(m) || (m = Q(m)), Re(r, o, s, m);
        }
        t("defineMetadata", E);
        function $(r, o, s) {
          if (!U(o)) throw new TypeError();
          return b(s) || (s = Q(s)), ee(r, o, s);
        }
        t("hasMetadata", $);
        function B(r, o, s) {
          if (!U(o)) throw new TypeError();
          return b(s) || (s = Q(s)), N(r, o, s);
        }
        t("hasOwnMetadata", B);
        function G(r, o, s) {
          if (!U(o)) throw new TypeError();
          return b(s) || (s = Q(s)), Z(r, o, s);
        }
        t("getMetadata", G);
        function ge(r, o, s) {
          if (!U(o)) throw new TypeError();
          return b(s) || (s = Q(s)), Ie(r, o, s);
        }
        t("getOwnMetadata", ge);
        function fe(r, o) {
          if (!U(r)) throw new TypeError();
          return b(o) || (o = Q(o)), Ne(r, o);
        }
        t("getMetadataKeys", fe);
        function ue(r, o) {
          if (!U(r)) throw new TypeError();
          return b(o) || (o = Q(o)), ke(r, o);
        }
        t("getOwnMetadataKeys", ue);
        function ce(r, o, s) {
          if (!U(o)) throw new TypeError();
          if (b(s) || (s = Q(s)), !U(o)) throw new TypeError();
          b(s) || (s = Q(s));
          var m = oe(o, s, false);
          return b(m) ? false : m.OrdinaryDeleteMetadata(r, o, s);
        }
        t("deleteMetadata", ce);
        function de(r, o) {
          for (var s = r.length - 1; s >= 0; --s) {
            var m = r[s], x = m(o);
            if (!b(x) && !te(x)) {
              if (!Ge(x)) throw new TypeError();
              o = x;
            }
          }
          return o;
        }
        function pe(r, o, s, m) {
          for (var x = r.length - 1; x >= 0; --x) {
            var j = r[x], W = j(o, s, m);
            if (!b(W) && !te(W)) {
              if (!U(W)) throw new TypeError();
              m = W;
            }
          }
          return m;
        }
        function ee(r, o, s) {
          var m = N(r, o, s);
          if (m) return true;
          var x = Se(o);
          return te(x) ? false : ee(r, x, s);
        }
        function N(r, o, s) {
          var m = oe(o, s, false);
          return b(m) ? false : je(m.OrdinaryHasOwnMetadata(r, o, s));
        }
        function Z(r, o, s) {
          var m = N(r, o, s);
          if (m) return Ie(r, o, s);
          var x = Se(o);
          if (!te(x)) return Z(r, x, s);
        }
        function Ie(r, o, s) {
          var m = oe(o, s, false);
          if (!b(m)) return m.OrdinaryGetOwnMetadata(r, o, s);
        }
        function Re(r, o, s, m) {
          var x = oe(s, m, true);
          x.OrdinaryDefineOwnMetadata(r, o, s, m);
        }
        function Ne(r, o) {
          var s = ke(r, o), m = Se(r);
          if (m === null) return s;
          var x = Ne(m, o);
          if (x.length <= 0) return s;
          if (s.length <= 0) return x;
          for (var j = new O(), W = [], C = 0, g = s; C < g.length; C++) {
            var _ = g[C], S = j.has(_);
            S || (j.add(_), W.push(_));
          }
          for (var M = 0, T = x; M < T.length; M++) {
            var _ = T[M], S = j.has(_);
            S || (j.add(_), W.push(_));
          }
          return W;
        }
        function ke(r, o) {
          var s = oe(r, o, false);
          return s ? s.OrdinaryOwnMetadataKeys(r, o) : [];
        }
        function De(r) {
          if (r === null) return 1;
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
        function b(r) {
          return r === void 0;
        }
        function te(r) {
          return r === null;
        }
        function Ot(r) {
          return typeof r == "symbol";
        }
        function U(r) {
          return typeof r == "object" ? r !== null : typeof r == "function";
        }
        function xt(r, o) {
          switch (De(r)) {
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
          var s = "string", m = Ue(r, y);
          if (m !== void 0) {
            var x = m.call(r, s);
            if (U(x)) throw new TypeError();
            return x;
          }
          return bt(r);
        }
        function bt(r, o) {
          var s, m, x;
          {
            var j = r.toString;
            if (le(j)) {
              var m = j.call(r);
              if (!U(m)) return m;
            }
            var s = r.valueOf;
            if (le(s)) {
              var m = s.call(r);
              if (!U(m)) return m;
            }
          }
          throw new TypeError();
        }
        function je(r) {
          return !!r;
        }
        function At(r) {
          return "" + r;
        }
        function Q(r) {
          var o = xt(r);
          return Ot(o) ? o : At(o);
        }
        function Fe(r) {
          return Array.isArray ? Array.isArray(r) : r instanceof Object ? r instanceof Array : Object.prototype.toString.call(r) === "[object Array]";
        }
        function le(r) {
          return typeof r == "function";
        }
        function Ge(r) {
          return typeof r == "function";
        }
        function Et(r) {
          switch (De(r)) {
            case 3:
              return true;
            case 4:
              return true;
            default:
              return false;
          }
        }
        function _e(r, o) {
          return r === o || r !== r && o !== o;
        }
        function Ue(r, o) {
          var s = r[o];
          if (s != null) {
            if (!le(s)) throw new TypeError();
            return s;
          }
        }
        function We(r) {
          var o = Ue(r, d);
          if (!le(o)) throw new TypeError();
          var s = o.call(r);
          if (!U(s)) throw new TypeError();
          return s;
        }
        function $e(r) {
          return r.value;
        }
        function qe(r) {
          var o = r.next();
          return o.done ? false : o;
        }
        function ze(r) {
          var o = r.return;
          o && o.call(r);
        }
        function Se(r) {
          var o = Object.getPrototypeOf(r);
          if (typeof r != "function" || r === p || o !== p) return o;
          var s = r.prototype, m = s && Object.getPrototypeOf(s);
          if (m == null || m === Object.prototype) return o;
          var x = m.constructor;
          return typeof x != "function" || x === r ? o : x;
        }
        function Lt() {
          var r;
          !b(a) && typeof n.Reflect < "u" && !(a in n.Reflect) && typeof n.Reflect.defineMetadata == "function" && (r = Pt(n.Reflect));
          var o, s, m, x = new R(), j = {
            registerProvider: W,
            getProvider: g,
            setProvider: S
          };
          return j;
          function W(M) {
            if (!Object.isExtensible(j)) throw new Error("Cannot add provider to a frozen registry.");
            switch (true) {
              case r === M:
                break;
              case b(o):
                o = M;
                break;
              case o === M:
                break;
              case b(s):
                s = M;
                break;
              case s === M:
                break;
              default:
                m === void 0 && (m = new O()), m.add(M);
                break;
            }
          }
          function C(M, T) {
            if (!b(o)) {
              if (o.isProviderFor(M, T)) return o;
              if (!b(s)) {
                if (s.isProviderFor(M, T)) return o;
                if (!b(m)) for (var k = We(m); ; ) {
                  var F = qe(k);
                  if (!F) return;
                  var X = $e(F);
                  if (X.isProviderFor(M, T)) return ze(k), X;
                }
              }
            }
            if (!b(r) && r.isProviderFor(M, T)) return r;
          }
          function g(M, T) {
            var k = x.get(M), F;
            return b(k) || (F = k.get(T)), b(F) && (F = C(M, T), b(F) || (b(k) && (k = new A(), x.set(M, k)), k.set(T, F))), F;
          }
          function _(M) {
            if (b(M)) throw new TypeError();
            return o === M || s === M || !b(m) && m.has(M);
          }
          function S(M, T, k) {
            if (!_(k)) throw new Error("Metadata provider not registered.");
            var F = g(M, T);
            if (F !== k) {
              if (!b(F)) return false;
              var X = x.get(M);
              b(X) && (X = new A(), x.set(M, X)), X.set(T, k);
            }
            return true;
          }
        }
        function Ct() {
          var r;
          return !b(a) && U(n.Reflect) && Object.isExtensible(n.Reflect) && (r = n.Reflect[a]), b(r) && (r = Lt()), !b(a) && U(n.Reflect) && Object.isExtensible(n.Reflect) && Object.defineProperty(n.Reflect, a, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: r
          }), r;
        }
        function Tt(r) {
          var o = new R(), s = {
            isProviderFor: function(_, S) {
              var M = o.get(_);
              return b(M) ? false : M.has(S);
            },
            OrdinaryDefineOwnMetadata: W,
            OrdinaryHasOwnMetadata: x,
            OrdinaryGetOwnMetadata: j,
            OrdinaryOwnMetadataKeys: C,
            OrdinaryDeleteMetadata: g
          };
          return P.registerProvider(s), s;
          function m(_, S, M) {
            var T = o.get(_), k = false;
            if (b(T)) {
              if (!M) return;
              T = new A(), o.set(_, T), k = true;
            }
            var F = T.get(S);
            if (b(F)) {
              if (!M) return;
              if (F = new A(), T.set(S, F), !r.setProvider(_, S, s)) throw T.delete(S), k && o.delete(_), new Error("Wrong provider for target.");
            }
            return F;
          }
          function x(_, S, M) {
            var T = m(S, M, false);
            return b(T) ? false : je(T.has(_));
          }
          function j(_, S, M) {
            var T = m(S, M, false);
            if (!b(T)) return T.get(_);
          }
          function W(_, S, M, T) {
            var k = m(M, T, true);
            k.set(_, S);
          }
          function C(_, S) {
            var M = [], T = m(_, S, false);
            if (b(T)) return M;
            for (var k = T.keys(), F = We(k), X = 0; ; ) {
              var He = qe(F);
              if (!He) return M.length = X, M;
              var kt = $e(He);
              try {
                M[X] = kt;
              } catch (Dt) {
                try {
                  ze(F);
                } finally {
                  throw Dt;
                }
              }
              X++;
            }
          }
          function g(_, S, M) {
            var T = m(S, M, false);
            if (b(T) || !T.delete(_)) return false;
            if (T.size === 0) {
              var k = o.get(S);
              b(k) || (k.delete(M), k.size === 0 && o.delete(k));
            }
            return true;
          }
        }
        function Pt(r) {
          var o = r.defineMetadata, s = r.hasOwnMetadata, m = r.getOwnMetadata, x = r.getOwnMetadataKeys, j = r.deleteMetadata, W = new R(), C = {
            isProviderFor: function(g, _) {
              var S = W.get(g);
              return !b(S) && S.has(_) ? true : x(g, _).length ? (b(S) && (S = new O(), W.set(g, S)), S.add(_), true) : false;
            },
            OrdinaryDefineOwnMetadata: o,
            OrdinaryHasOwnMetadata: s,
            OrdinaryGetOwnMetadata: m,
            OrdinaryOwnMetadataKeys: x,
            OrdinaryDeleteMetadata: j
          };
          return C;
        }
        function oe(r, o, s) {
          var m = P.getProvider(r, o);
          if (!b(m)) return m;
          if (s) {
            if (P.setProvider(r, o, I)) return I;
            throw new Error("Illegal state.");
          }
        }
        function It() {
          var r = {}, o = [], s = (function() {
            function C(g, _, S) {
              this._index = 0, this._keys = g, this._values = _, this._selector = S;
            }
            return C.prototype["@@iterator"] = function() {
              return this;
            }, C.prototype[d] = function() {
              return this;
            }, C.prototype.next = function() {
              var g = this._index;
              if (g >= 0 && g < this._keys.length) {
                var _ = this._selector(this._keys[g], this._values[g]);
                return g + 1 >= this._keys.length ? (this._index = -1, this._keys = o, this._values = o) : this._index++, {
                  value: _,
                  done: false
                };
              }
              return {
                value: void 0,
                done: true
              };
            }, C.prototype.throw = function(g) {
              throw this._index >= 0 && (this._index = -1, this._keys = o, this._values = o), g;
            }, C.prototype.return = function(g) {
              return this._index >= 0 && (this._index = -1, this._keys = o, this._values = o), {
                value: g,
                done: true
              };
            }, C;
          })(), m = (function() {
            function C() {
              this._keys = [], this._values = [], this._cacheKey = r, this._cacheIndex = -2;
            }
            return Object.defineProperty(C.prototype, "size", {
              get: function() {
                return this._keys.length;
              },
              enumerable: true,
              configurable: true
            }), C.prototype.has = function(g) {
              return this._find(g, false) >= 0;
            }, C.prototype.get = function(g) {
              var _ = this._find(g, false);
              return _ >= 0 ? this._values[_] : void 0;
            }, C.prototype.set = function(g, _) {
              var S = this._find(g, true);
              return this._values[S] = _, this;
            }, C.prototype.delete = function(g) {
              var _ = this._find(g, false);
              if (_ >= 0) {
                for (var S = this._keys.length, M = _ + 1; M < S; M++) this._keys[M - 1] = this._keys[M], this._values[M - 1] = this._values[M];
                return this._keys.length--, this._values.length--, _e(g, this._cacheKey) && (this._cacheKey = r, this._cacheIndex = -2), true;
              }
              return false;
            }, C.prototype.clear = function() {
              this._keys.length = 0, this._values.length = 0, this._cacheKey = r, this._cacheIndex = -2;
            }, C.prototype.keys = function() {
              return new s(this._keys, this._values, x);
            }, C.prototype.values = function() {
              return new s(this._keys, this._values, j);
            }, C.prototype.entries = function() {
              return new s(this._keys, this._values, W);
            }, C.prototype["@@iterator"] = function() {
              return this.entries();
            }, C.prototype[d] = function() {
              return this.entries();
            }, C.prototype._find = function(g, _) {
              if (!_e(this._cacheKey, g)) {
                this._cacheIndex = -1;
                for (var S = 0; S < this._keys.length; S++) if (_e(this._keys[S], g)) {
                  this._cacheIndex = S;
                  break;
                }
              }
              return this._cacheIndex < 0 && _ && (this._cacheIndex = this._keys.length, this._keys.push(g), this._values.push(void 0)), this._cacheIndex;
            }, C;
          })();
          return m;
          function x(C, g) {
            return C;
          }
          function j(C, g) {
            return g;
          }
          function W(C, g) {
            return [
              C,
              g
            ];
          }
        }
        function Rt() {
          var r = (function() {
            function o() {
              this._map = new A();
            }
            return Object.defineProperty(o.prototype, "size", {
              get: function() {
                return this._map.size;
              },
              enumerable: true,
              configurable: true
            }), o.prototype.has = function(s) {
              return this._map.has(s);
            }, o.prototype.add = function(s) {
              return this._map.set(s, s), this;
            }, o.prototype.delete = function(s) {
              return this._map.delete(s);
            }, o.prototype.clear = function() {
              this._map.clear();
            }, o.prototype.keys = function() {
              return this._map.keys();
            }, o.prototype.values = function() {
              return this._map.keys();
            }, o.prototype.entries = function() {
              return this._map.entries();
            }, o.prototype["@@iterator"] = function() {
              return this.keys();
            }, o.prototype[d] = function() {
              return this.keys();
            }, o;
          })();
          return r;
        }
        function Nt() {
          var r = 16, o = u.create(), s = m();
          return (function() {
            function g() {
              this._key = m();
            }
            return g.prototype.has = function(_) {
              var S = x(_, false);
              return S !== void 0 ? u.has(S, this._key) : false;
            }, g.prototype.get = function(_) {
              var S = x(_, false);
              return S !== void 0 ? u.get(S, this._key) : void 0;
            }, g.prototype.set = function(_, S) {
              var M = x(_, true);
              return M[this._key] = S, this;
            }, g.prototype.delete = function(_) {
              var S = x(_, false);
              return S !== void 0 ? delete S[this._key] : false;
            }, g.prototype.clear = function() {
              this._key = m();
            }, g;
          })();
          function m() {
            var g;
            do
              g = "@@WeakMap@@" + C();
            while (u.has(o, g));
            return o[g] = true, g;
          }
          function x(g, _) {
            if (!c.call(g, s)) {
              if (!_) return;
              Object.defineProperty(g, s, {
                value: u.create()
              });
            }
            return g[s];
          }
          function j(g, _) {
            for (var S = 0; S < _; ++S) g[S] = Math.random() * 255 | 0;
            return g;
          }
          function W(g) {
            if (typeof Uint8Array == "function") {
              var _ = new Uint8Array(g);
              return typeof crypto < "u" ? crypto.getRandomValues(_) : typeof msCrypto < "u" ? msCrypto.getRandomValues(_) : j(_, g), _;
            }
            return j(new Array(g), g);
          }
          function C() {
            var g = W(r);
            g[6] = g[6] & 79 | 64, g[8] = g[8] & 191 | 128;
            for (var _ = "", S = 0; S < r; ++S) {
              var M = g[S];
              (S === 4 || S === 6 || S === 8) && (_ += "-"), M < 16 && (_ += "0"), _ += M.toString(16).toLowerCase();
            }
            return _;
          }
        }
        function we(r) {
          return r.__ = void 0, delete r.__, r;
        }
      });
    })(i || (i = {})), Ye;
  }
  Xt();
  var Ee = function(i, e, t, n) {
    var c = arguments.length, v = c < 3 ? e : n === null ? n = Object.getOwnPropertyDescriptor(e, t) : n, y;
    if (typeof Reflect == "object" && typeof Reflect.decorate == "function") v = Reflect.decorate(i, e, t, n);
    else for (var d = i.length - 1; d >= 0; d--) (y = i[d]) && (v = (c < 3 ? y(v) : c > 3 ? y(e, t, v) : y(e, t)) || v);
    return c > 3 && v && Object.defineProperty(e, t, v), v;
  }, Le = function(i, e) {
    if (typeof Reflect == "object" && typeof Reflect.metadata == "function") return Reflect.metadata(i, e);
  };
  const et = 0, D = 1, Yt = 4294967295, Bt = 3;
  class ae {
    constructor(e) {
      Object.assign(this, e);
    }
    update() {
      var e, t, n, c, v;
      (e = this.ScalarCmd) === null || e === void 0 || e.forEach((y, d) => y.Index = d), (t = this.RotateCmd) === null || t === void 0 || t.forEach((y, d) => y.Index = d), (n = this.LinearCmd) === null || n === void 0 || n.forEach((y, d) => y.Index = d), (c = this.SensorReadCmd) === null || c === void 0 || c.forEach((y, d) => y.Index = d), (v = this.SensorSubscribeCmd) === null || v === void 0 || v.forEach((y, d) => y.Index = d);
    }
  }
  var xe;
  (function(i) {
    i.Unknown = "Unknown", i.Vibrate = "Vibrate", i.Rotate = "Rotate", i.Oscillate = "Oscillate", i.Constrict = "Constrict", i.Inflate = "Inflate", i.Position = "Position";
  })(xe || (xe = {}));
  var be;
  (function(i) {
    i.Unknown = "Unknown", i.Battery = "Battery", i.RSSI = "RSSI", i.Button = "Button", i.Pressure = "Pressure";
  })(be || (be = {}));
  class Qt {
    constructor(e) {
      this.Index = 0, Object.assign(this, e);
    }
  }
  class Kt {
    constructor(e) {
      this.Endpoints = e;
    }
  }
  class Vt {
    constructor(e) {
      this.Index = 0, Object.assign(this, e);
    }
  }
  class Y {
    constructor(e) {
      this.Id = e;
    }
    get Type() {
      return this.constructor;
    }
    toJSON() {
      return JSON.stringify(this.toProtocolFormat());
    }
    toProtocolFormat() {
      const e = {};
      return e[this.constructor.Name] = Jt(this), e;
    }
    update() {
    }
  }
  class J extends Y {
    constructor(e, t) {
      super(t), this.DeviceIndex = e, this.Id = t;
    }
  }
  class ie extends Y {
    constructor(e = et) {
      super(e), this.Id = e;
    }
  }
  class tt extends ie {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  tt.Name = "Ok";
  class nt extends Y {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  nt.Name = "Ping";
  var he;
  (function(i) {
    i[i.ERROR_UNKNOWN = 0] = "ERROR_UNKNOWN", i[i.ERROR_INIT = 1] = "ERROR_INIT", i[i.ERROR_PING = 2] = "ERROR_PING", i[i.ERROR_MSG = 3] = "ERROR_MSG", i[i.ERROR_DEVICE = 4] = "ERROR_DEVICE";
  })(he || (he = {}));
  let rt = class extends Y {
    constructor(e, t = he.ERROR_UNKNOWN, n = D) {
      super(n), this.ErrorMessage = e, this.ErrorCode = t, this.Id = n;
    }
    get Schemversion() {
      return 0;
    }
  };
  rt.Name = "Error";
  class Ce {
    constructor(e) {
      Object.assign(this, e);
    }
  }
  Ee([
    Ae(() => ae),
    Le("design:type", ae)
  ], Ce.prototype, "DeviceMessages", void 0);
  class Te extends Y {
    constructor(e, t = D) {
      super(t), this.Devices = e, this.Id = t;
    }
    update() {
      for (const e of this.Devices) e.DeviceMessages.update();
    }
  }
  Te.Name = "DeviceList";
  Ee([
    Ae(() => Ce),
    Le("design:type", Array)
  ], Te.prototype, "Devices", void 0);
  class Pe extends ie {
    constructor(e) {
      super(), Object.assign(this, e);
    }
    update() {
      this.DeviceMessages.update();
    }
  }
  Pe.Name = "DeviceAdded";
  Ee([
    Ae(() => ae),
    Le("design:type", ae)
  ], Pe.prototype, "DeviceMessages", void 0);
  class it extends ie {
    constructor(e) {
      super(), this.DeviceIndex = e;
    }
  }
  it.Name = "DeviceRemoved";
  class ot extends Y {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  ot.Name = "RequestDeviceList";
  class st extends Y {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  st.Name = "StartScanning";
  class at extends Y {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  at.Name = "StopScanning";
  class ft extends ie {
    constructor() {
      super();
    }
  }
  ft.Name = "ScanningFinished";
  class ut extends Y {
    constructor(e, t = 0, n = D) {
      super(n), this.ClientName = e, this.MessageVersion = t, this.Id = n;
    }
  }
  ut.Name = "RequestServerInfo";
  class ct extends ie {
    constructor(e, t, n, c = D) {
      super(), this.MessageVersion = e, this.MaxPingTime = t, this.ServerName = n, this.Id = c;
    }
  }
  ct.Name = "ServerInfo";
  class dt extends J {
    constructor(e = -1, t = D) {
      super(e, t), this.DeviceIndex = e, this.Id = t;
    }
  }
  dt.Name = "StopDeviceCmd";
  class pt extends Y {
    constructor(e = D) {
      super(e), this.Id = e;
    }
  }
  pt.Name = "StopAllDevices";
  class ve {
    constructor(e) {
      this.Index = e;
    }
  }
  class en extends ve {
    constructor(e, t, n) {
      super(e), this.Scalar = t, this.ActuatorType = n;
    }
  }
  class lt extends J {
    constructor(e, t = -1, n = D) {
      super(t, n), this.Scalars = e, this.DeviceIndex = t, this.Id = n;
    }
  }
  lt.Name = "ScalarCmd";
  class ht extends ve {
    constructor(e, t, n) {
      super(e), this.Speed = t, this.Clockwise = n;
    }
  }
  class ye extends J {
    static Create(e, t) {
      const n = new Array();
      let c = 0;
      for (const [v, y] of t) n.push(new ht(c, v, y)), ++c;
      return new ye(n, e);
    }
    constructor(e, t = -1, n = D) {
      super(t, n), this.Rotations = e, this.DeviceIndex = t, this.Id = n;
    }
  }
  ye.Name = "RotateCmd";
  class vt extends ve {
    constructor(e, t, n) {
      super(e), this.Position = t, this.Duration = n;
    }
  }
  class me extends J {
    static Create(e, t) {
      const n = new Array();
      let c = 0;
      for (const v of t) n.push(new vt(c, v[0], v[1])), ++c;
      return new me(n, e);
    }
    constructor(e, t = -1, n = D) {
      super(t, n), this.Vectors = e, this.DeviceIndex = t, this.Id = n;
    }
  }
  me.Name = "LinearCmd";
  class yt extends J {
    constructor(e, t, n, c = D) {
      super(e, c), this.DeviceIndex = e, this.SensorIndex = t, this.SensorType = n, this.Id = c;
    }
  }
  yt.Name = "SensorReadCmd";
  class mt extends J {
    constructor(e, t, n, c, v = D) {
      super(e, v), this.DeviceIndex = e, this.SensorIndex = t, this.SensorType = n, this.Data = c, this.Id = v;
    }
  }
  mt.Name = "SensorReading";
  class gt extends J {
    constructor(e, t, n, c, v = D) {
      super(e, v), this.DeviceIndex = e, this.Endpoint = t, this.ExpectedLength = n, this.Timeout = c, this.Id = v;
    }
  }
  gt.Name = "RawReadCmd";
  class _t extends J {
    constructor(e, t, n, c, v = D) {
      super(e, v), this.DeviceIndex = e, this.Endpoint = t, this.Data = n, this.WriteWithResponse = c, this.Id = v;
    }
  }
  _t.Name = "RawWriteCmd";
  class St extends J {
    constructor(e, t, n = D) {
      super(e, n), this.DeviceIndex = e, this.Endpoint = t, this.Id = n;
    }
  }
  St.Name = "RawSubscribeCmd";
  class wt extends J {
    constructor(e, t, n = D) {
      super(e, n), this.DeviceIndex = e, this.Endpoint = t, this.Id = n;
    }
  }
  wt.Name = "RawUnsubscribeCmd";
  class Mt extends J {
    constructor(e, t, n, c = D) {
      super(e, c), this.DeviceIndex = e, this.Endpoint = t, this.Data = n, this.Id = c;
    }
  }
  Mt.Name = "RawReading";
  const tn = Object.freeze(Object.defineProperty({
    __proto__: null,
    get ActuatorType() {
      return xe;
    },
    ButtplugDeviceMessage: J,
    ButtplugMessage: Y,
    ButtplugSystemMessage: ie,
    DEFAULT_MESSAGE_ID: D,
    DeviceAdded: Pe,
    DeviceInfo: Ce,
    DeviceList: Te,
    DeviceRemoved: it,
    Error: rt,
    get ErrorClass() {
      return he;
    },
    GenericDeviceMessageAttributes: Qt,
    GenericMessageSubcommand: ve,
    LinearCmd: me,
    MAX_ID: Yt,
    MESSAGE_SPEC_VERSION: Bt,
    MessageAttributes: ae,
    Ok: tt,
    Ping: nt,
    RawDeviceMessageAttributes: Kt,
    RawReadCmd: gt,
    RawReading: Mt,
    RawSubscribeCmd: St,
    RawUnsubscribeCmd: wt,
    RawWriteCmd: _t,
    RequestDeviceList: ot,
    RequestServerInfo: ut,
    RotateCmd: ye,
    RotateSubcommand: ht,
    SYSTEM_MESSAGE_ID: et,
    ScalarCmd: lt,
    ScalarSubcommand: en,
    ScanningFinished: ft,
    SensorDeviceMessageAttributes: Vt,
    SensorReadCmd: yt,
    SensorReading: mt,
    get SensorType() {
      return be;
    },
    ServerInfo: ct,
    StartScanning: st,
    StopAllDevices: pt,
    StopDeviceCmd: dt,
    StopScanning: at,
    VectorSubcommand: vt
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  function nn(i) {
    for (const e of Object.values(tn)) if (typeof e == "function" && "Name" in e && e.Name === i) return e;
    return null;
  }
  function rn(i) {
    const e = JSON.parse(i), t = [];
    for (const n of Array.from(e)) {
      const c = Object.getOwnPropertyNames(n)[0], v = nn(c);
      if (v) {
        const y = Zt(v, n[c]);
        y.update(), t.push(y);
      }
    }
    return t;
  }
  var Oe = {
    exports: {}
  }, Qe;
  function on() {
    return Qe || (Qe = 1, (function(i) {
      var e = Object.prototype.hasOwnProperty, t = "~";
      function n() {
      }
      Object.create && (n.prototype = /* @__PURE__ */ Object.create(null), new n().__proto__ || (t = false));
      function c(h, l, f) {
        this.fn = h, this.context = l, this.once = f || false;
      }
      function v(h, l, f, u, p) {
        if (typeof f != "function") throw new TypeError("The listener must be a function");
        var A = new c(f, u || h, p), O = t ? t + l : l;
        return h._events[O] ? h._events[O].fn ? h._events[O] = [
          h._events[O],
          A
        ] : h._events[O].push(A) : (h._events[O] = A, h._eventsCount++), h;
      }
      function y(h, l) {
        --h._eventsCount === 0 ? h._events = new n() : delete h._events[l];
      }
      function d() {
        this._events = new n(), this._eventsCount = 0;
      }
      d.prototype.eventNames = function() {
        var l = [], f, u;
        if (this._eventsCount === 0) return l;
        for (u in f = this._events) e.call(f, u) && l.push(t ? u.slice(1) : u);
        return Object.getOwnPropertySymbols ? l.concat(Object.getOwnPropertySymbols(f)) : l;
      }, d.prototype.listeners = function(l) {
        var f = t ? t + l : l, u = this._events[f];
        if (!u) return [];
        if (u.fn) return [
          u.fn
        ];
        for (var p = 0, A = u.length, O = new Array(A); p < A; p++) O[p] = u[p].fn;
        return O;
      }, d.prototype.listenerCount = function(l) {
        var f = t ? t + l : l, u = this._events[f];
        return u ? u.fn ? 1 : u.length : 0;
      }, d.prototype.emit = function(l, f, u, p, A, O) {
        var R = t ? t + l : l;
        if (!this._events[R]) return false;
        var a = this._events[R], P = arguments.length, I, w;
        if (a.fn) {
          switch (a.once && this.removeListener(l, a.fn, void 0, true), P) {
            case 1:
              return a.fn.call(a.context), true;
            case 2:
              return a.fn.call(a.context, f), true;
            case 3:
              return a.fn.call(a.context, f, u), true;
            case 4:
              return a.fn.call(a.context, f, u, p), true;
            case 5:
              return a.fn.call(a.context, f, u, p, A), true;
            case 6:
              return a.fn.call(a.context, f, u, p, A, O), true;
          }
          for (w = 1, I = new Array(P - 1); w < P; w++) I[w - 1] = arguments[w];
          a.fn.apply(a.context, I);
        } else {
          var q = a.length, E;
          for (w = 0; w < q; w++) switch (a[w].once && this.removeListener(l, a[w].fn, void 0, true), P) {
            case 1:
              a[w].fn.call(a[w].context);
              break;
            case 2:
              a[w].fn.call(a[w].context, f);
              break;
            case 3:
              a[w].fn.call(a[w].context, f, u);
              break;
            case 4:
              a[w].fn.call(a[w].context, f, u, p);
              break;
            default:
              if (!I) for (E = 1, I = new Array(P - 1); E < P; E++) I[E - 1] = arguments[E];
              a[w].fn.apply(a[w].context, I);
          }
        }
        return true;
      }, d.prototype.on = function(l, f, u) {
        return v(this, l, f, u, false);
      }, d.prototype.once = function(l, f, u) {
        return v(this, l, f, u, true);
      }, d.prototype.removeListener = function(l, f, u, p) {
        var A = t ? t + l : l;
        if (!this._events[A]) return this;
        if (!f) return y(this, A), this;
        var O = this._events[A];
        if (O.fn) O.fn === f && (!p || O.once) && (!u || O.context === u) && y(this, A);
        else {
          for (var R = 0, a = [], P = O.length; R < P; R++) (O[R].fn !== f || p && !O[R].once || u && O[R].context !== u) && a.push(O[R]);
          a.length ? this._events[A] = a.length === 1 ? a[0] : a : y(this, A);
        }
        return this;
      }, d.prototype.removeAllListeners = function(l) {
        var f;
        return l ? (f = t ? t + l : l, this._events[f] && y(this, f)) : (this._events = new n(), this._eventsCount = 0), this;
      }, d.prototype.off = d.prototype.removeListener, d.prototype.addListener = d.prototype.on, d.prefixed = t, d.EventEmitter = d, i.exports = d;
    })(Oe)), Oe.exports;
  }
  var sn = on();
  const an = Ke(sn);
  V = (_a = class extends an {
    constructor() {
      super(), this._connected = false, this.initialize = async () => {
      }, this.connect = async () => {
        await V.maybeLoadWasm(), this.client = V.wasmInstance.buttplug_create_embedded_wasm_server((e) => {
          this.emitMessage(e);
        }, this.serverPtr), this._connected = true;
      }, this.disconnect = async () => {
      }, this.send = (e) => {
        V.wasmInstance.buttplug_client_send_json_message(this.client, new TextEncoder().encode("[" + e.toJSON() + "]"), (t) => {
          this.emitMessage(t);
        });
      }, this.emitMessage = (e) => {
        let t = new TextDecoder().decode(e);
        this.emit("message", rn(t));
      };
    }
    get Connected() {
      return this._connected;
    }
  }, _a._loggingActivated = false, _a.maybeLoadWasm = async () => {
    V.wasmInstance == null && (V.wasmInstance = await import("./buttplug_wasm-CFzvm4H6.js").then(async (m) => {
      await m.__tla;
      return m;
    }));
  }, _a.activateLogging = async (e = "debug") => {
    if (await V.maybeLoadWasm(), _a._loggingActivated) {
      console.log("Logging already activated, ignoring.");
      return;
    }
    console.log("Turning on logging."), V.wasmInstance.buttplug_activate_env_logger(e);
  }, _a);
})();
export {
  V as ButtplugWasmClientConnector,
  __tla
};
