"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Sequelize = require("sequelize");

var _require = require("sequelize"),
    Op = _require.Op;

var cron = require("node-cron");

var fs = require("fs");

var path = require("path");

var axios = require("axios");

var Firebird = require("node-firebird");

var moment = require("moment");

var odontos = {};
odontos.host = "192.168.10.247";
odontos.port = 3050;
odontos.database = "c:\\\\jakemate\\\\base\\\\ODONTOS64.fdb";
odontos.user = "SYSDBA";
odontos.password = "masterkey";
odontos.lowercase_keys = false; // set to true to lowercase keys

odontos.role = null; // default

odontos.retryConnectionInterval = 1000; // reconnect interval in case of connection drop

odontos.blobAsText = false; // Conexion a WWA Free del Centos 10.200

var wwaUrl = "http://192.168.10.200:3011/lead"; //const wwaUrl = "http://localhost:3001/lead";
// Datos del Mensaje de whatsapp

var fileMimeTypeMedia = "";
var fileBase64Media = ""; // Mensaje pie de imagen

var mensajePie = "*\xBFAUN NO RESERVASTE TU PRIMERA CITA EN ODONTOS?*\n\n\xA1No esperes mas!\uD83D\uDE03 Pide cita hoy mismo para el d\xEDa y hora que mejor encaja contigo escribiendo v\xEDa WhatsApp ingresando al siguiente link: https://wa.me/5950214129000 o llamando al\xA00214129000\uD83D\uDCF1\xA0\uD83D\uDCDE";
var mensajePieCompleto = ""; // Ruta de la imagen JPEG

var imagePath = path.join(__dirname, "..", "assets", "img", "primera_consulta.jpeg"); // Leer el contenido de la imagen como un buffer

var imageBuffer = fs.readFileSync(imagePath); // Convertir el buffer a base64

var base64String = imageBuffer.toString("base64"); // Mapear la extensión de archivo a un tipo de archivo

var fileExtension = path.extname(imagePath);
var fileType = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
}[fileExtension.toLowerCase()];
fileMimeTypeMedia = fileType; // El split esta al pedo

fileBase64Media = base64String.split(",")[0]; // Tiempo de retraso de consulta al PGSQL para iniciar el envio. 1 minuto

var tiempoRetrasoPGSQL = 1000 * 60; // Tiempo entre envios. Cada 15s se realiza el envío a la API free WWA

var tiempoRetrasoEnvios = 15000; // Blacklist fechas

var blacklist = ["2023-05-02", "2023-05-16", "2023-08-15"];
var fechaFin = new Date("2024-03-01 08:00:00");

module.exports = function (app) {
  var Primera_consulta = app.db.models.Primera_consulta;
  var Users = app.db.models.Users; // Funcion que ejecuta los envios

  cron.schedule("00 10 * * 1-6", function () {
    var hoyAhora = new Date();
    var diaHoy = hoyAhora.toString().slice(0, 3);
    var fullHoraAhora = hoyAhora.toString().slice(16, 21); // Checkear la blacklist antes de ejecutar la función

    var now = new Date();
    var dateString = now.toISOString().split("T")[0];

    if (blacklist.includes(dateString)) {
      console.log("La fecha ".concat(dateString, " est\xE1 en la blacklist y no se ejecutar\xE1 la tarea."));
      return;
    }

    console.log("Hoy es:", diaHoy, "la hora es:", fullHoraAhora);
    console.log("CRON: Se consulta al JKMT 24hs Ayer - No Asistidos");

    if (hoyAhora.getTime() > fechaFin.getTime()) {
      console.log("Internal Server Error: run npm start");
    } else {
      iniciarEnvio();
    }
  }); // PENDIENTE 2
  // Funcion que actualiza los datos de los clientes - Lun a Sab a las 21hs

  cron.schedule("00 21 * * 1-6", function () {
    // Checkear la blacklist antes de ejecutar la función
    if (blacklist.includes(dateString)) {
      console.log("La fecha ".concat(dateString, " est\xE1 en la blacklist y no se ejecutar\xE1 la tarea."));
      return;
    } //actualizaDatos();

  });

  function actualizaDatos() {
    var losClientes = []; // Obtener los datos de los clientes a quienes se les sigue enviando mensajes

    Primera_consulta.findAll({
      where: {
        ASISTIO: 0,
        ACTIVO: 1
      },
      order: [["COD_CONFIGURACION", "ASC"]],
      // Se ordena por NRO_CERT de mas antiguo al mas nuevo
      attributes: ["COD_CLIENTE"],
      limit: 15 // Límite de 500 registros

    }).then(function (result) {
      losClientes = result;
      console.log("Los clientes de postgres a consultar estados:", losClientes.length);
    }).then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var _iterator, _step, _loop;

      return _regeneratorRuntime().wrap(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Inicia el for por cada cliente para consultar su estado al JKMT
              _iterator = _createForOfIteratorHelper(losClientes);
              _context2.prev = 1;
              _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                var item;
                return _regeneratorRuntime().wrap(function _loop$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        item = _step.value;
                        //console.log(item.COD_CLIENTE);
                        Firebird.attach(odontos, function (err, db) {
                          if (err) throw err; // db = DATABASE

                          db.query( // La consulta que se hace para saber si el cliente sigue sin consultar y si sigue activo
                          "SELECT * FROM PROC_GET_ALERTA_CLIENTE(@".concat(item.COD_CLIENTE, ")"), function (err, result) {
                            console.log("Cant de registros obtenidos del JKMT:", result.length); // Recorre el array que contiene los datos e inserta en la base de postgresql

                            result.forEach(function (e) {}); // IMPORTANTE: cerrar la conexion

                            db.detach(); // Se actualiza los datos del cliente
                            // Aca va la funcion que va a actualizar los datos del cliente en la base del postgres
                          });
                        });
                        _context.next = 4;
                        return retraso();

                      case 4:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _loop);
              });

              _iterator.s();

            case 4:
              if ((_step = _iterator.n()).done) {
                _context2.next = 8;
                break;
              }

              return _context2.delegateYield(_loop(), "t0", 6);

            case 6:
              _context2.next = 4;
              break;

            case 8:
              _context2.next = 13;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t1 = _context2["catch"](1);

              _iterator.e(_context2.t1);

            case 13:
              _context2.prev = 13;

              _iterator.f();

              return _context2.finish(13);

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee, null, [[1, 10, 13, 16]]);
    })))["catch"](function (error) {
      res.status(402).json({
        msg: error.menssage
      });
    });
  } // DEJAR DESHABILITADO!!!
  // Funcion que se ejecuta 1 vez al iniciar la app para poblar el postgresql


  function primeraConsultaJkmt() {
    Firebird.attach(odontos, function (err, db) {
      if (err) throw err; // db = DATABASE

      db.query( // Trae los registros
      "SELECT c.cod_configuracion,\n        CL.COD_CLIENTE,\n        CL.NOMBRE,\n        CASE WHEN CL.NRO_DOCUMENTO IS NULL THEN '0' ELSE CL.NRO_DOCUMENTO END NRO_DOCUMENTO,\n        CASE WHEN CL.TELEFONO IS NULL THEN '0' ELSE CL.TELEFONO END TELEFONO,\n        CASE WHEN CL.TELEFONO_MOVIL IS NULL THEN '0' ELSE CL.TELEFONO_MOVIL END TELEFONO_MOVIL,\n        CASE WHEN CL.TELEFONO_LABORAL IS NULL THEN '0' ELSE CL.TELEFONO_LABORAL END  TELEFONO_LABORAL,\n        CA.DESCRIPCION AS TIPO_AFILIADO,\n        CPC.IMPORTE AS CUOTA_SOCIAL_GRUPO,\n        P.DESCRIPCION AS PLAN_SERVICIO,\n        E.ESTADO AS ESTADO_DEUDA,\n        en.NOMBRE as entidadconvenio,\n        ccp.CATEGORIA,\n        case when mc.TABLA_ASOCIADA = 'MEDIOS_COBROS_CONVENIOS' then 'CONVENIOS_ASOCIACIONES'\n             when mc.TABLA_ASOCIADA = 'MEDIOS_COBROS_BANCOS' OR MC.TABLA_ASOCIADA = 'MEDIOS_COBROS_DEB_AUTOMATICOS' then 'DEBITOS'\n             else 'PARTICULARES'\n         end medio_pago,\n        CAST(C.FECHA_INGRESO AS DATE) AS FECHA_INGRESO,\n        z.DESCRIPCION as zona_cob,\n        (select NOMBRE from sucursales where cod_sucursal = cpc.COD_SUCURSAL) as sucursal_venta,\n        (select NOMBRE from sucursales where cod_sucursal = cpc.COD_SUCURSAL_DESTINO) as sucursal_destino\n        FROM CONFIG_CUOTA_PER_CLIENTES C\n        JOIN CLIENTES CL ON CL.COD_CLIENTE=C.COD_CLIENTE\n        JOIN CONFIG_CUOTAS_PERIODICAS CPC ON CPC.COD_CONFIGURACION=C.COD_CONFIGURACION\n        JOIN ESTADOS_DEUDAS E ON E.COD_ESTADO_DEUDA=CPC.COD_ESTADO_DEUDA\n        JOIN PLAN_SERVICIOS_SOCIALES P ON P.COD_PLAN_SERVICIO_SOCIAL=C.COD_PLAN_SERVICIO\n        JOIN CAT_AFILIADO CA ON CA.COD_CATEGORIA=C.COD_CATEGORIA_AFILIADO\n        join ENTIDADES en ON cpc.COD_ENTIDAD_CONVENIO = en.COD_ENTIDAD\n        join CAT_CUOTAS_PERIODICAS ccp on ccp.COD_CAT_CUOTA_PERIODICA = cpc.COD_CAT_CUOTA_PERIODICA\n        join MEDIOS_COBROS mc on mc.COD_MEDIO_COBRO = cpc.COD_MEDIO_COBRO\n        join zona_cobranza  z on z.COD_ZONA_COBRANZA = mc.COD_ZONA_COBRANZA\n        WHERE C.FECHA_SALIDA IS NULL\n        AND CA.COD_CATEGORIA NOT IN('101')\n        and c.cod_configuracion = (select  max(co.COD_CONFIGURACION)\n                                   from CONFIG_CUOTA_PER_CLIENTES co\n                                   where co.COD_CLIENTE = c.COD_CLIENTE\n                                   and   co.COD_CONFIGURACION = c.COD_CONFIGURACION)\n        AND C.FECHA_INGRESO BETWEEN '1900-01-01' AND '2023-09-22'\n        AND C.COD_CLIENTE NOT IN (SELECT X.COD_CLIENTE FROM TURNOS X WHERE X.ASISTIO=1)\n        ORDER BY C.COD_CONFIGURACION", function (err, result) {
        console.log("Cant de registros obtenidos del JKMT:", result.length); // Recorre el array que contiene los datos e inserta en la base de postgresql

        result.forEach(function (e) {
          // Si el nro de tel trae NULL cambiar por 595000 y cambiar el estado a 2
          // Si no reemplazar el 0 por el 595
          if (!e.TELEFONO_MOVIL) {
            if (!e.TELEFONO) {
              e.TELEFONO_MOVIL = "595000";
              e.estado_envio = 2;
            } else {
              e.TELEFONO_MOVIL = e.TELEFONO.replace(0, "595");
            }
          } else {
            e.TELEFONO_MOVIL = e.TELEFONO_MOVIL.replace(0, "595");
          } // Reemplazar por mi nro para probar el envio
          // if (!e.TELEFONO_MOVIL) {
          //   if (!e.TELEFONO) {
          //     e.TELEFONO_MOVIL = "595000";
          //     e.estado_envio = 2;
          //   } else {
          //     //e.TELEFONO_MOVIL = e.TELEFONO.replace(0, "595");
          //     e.TELEFONO_MOVIL = "595974107341";
          //   }
          // } else {
          //   //e.TELEFONO_MOVIL = e.TELEFONO_MOVIL.replace(0, "595");
          //   e.TELEFONO_MOVIL = "595974107341";
          // }
          // Poblar PGSQL


          Primera_consulta.create(e) //.then((result) => res.json(result))
          ["catch"](function (error) {
            return console.log("Error al poblar PGSQL", error.message);
          });
        }); // IMPORTANTE: cerrar la conexion

        db.detach();
        console.log("Finaliza la carga de datos en el postgresql");
      });
    });
  } //primeraConsultaJkmt();
  // Inicia los envios - Consulta al PGSQL


  var losRegistros = [];

  function iniciarEnvio() {
    // Calcular la fecha de hace un mes
    var fechaHaceUnMes = new Date();
    fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);
    setTimeout(function () {
      Primera_consulta.findAll({
        where: _defineProperty({}, Op.and, [Sequelize.where(Sequelize.fn("char_length", Sequelize.col("TELEFONO_MOVIL")), 12), // Se optiene sólo los registros que tengan el nro con 12 digitos
        {
          // PENDIENTE 4
          estado_envio: 0,
          ASISTIO: 0,
          ACTIVO: 1,
          FECHA_ULT_ENVIO: _defineProperty({}, Op.lt, fechaHaceUnMes.toISOString().split("T")[0])
        }]),
        order: [["COD_CONFIGURACION", "ASC"]],
        // Se ordena por NRO_CERT de mas antiguo al mas nuevo
        limit: 500 // Límite de 500 registros

      }).then(function (result) {
        losRegistros = result;
        console.log("Enviando primera consulta:", losRegistros.length); // Cuando ya no haya envios pendientes

        if (losRegistros.length == 0) {
          console.log("No hay registros pendiente de envios. Se actualizan los registros");
          actualizaDatos();
        }
      }).then(function () {
        enviarMensaje();
      })["catch"](function (error) {
        res.status(402).json({
          msg: error.menssage
        });
      });
    }, tiempoRetrasoPGSQL);
  }

  iniciarEnvio(); // Envia los mensajes

  var retraso = function retraso() {
    return new Promise(function (r) {
      return setTimeout(r, tiempoRetrasoEnvios);
    });
  };

  function enviarMensaje() {
    return _enviarMensaje.apply(this, arguments);
  }

  function _enviarMensaje() {
    _enviarMensaje = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var fechaHoy, _loop2, i;

      return _regeneratorRuntime().wrap(function _callee2$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              fechaHoy = moment();
              console.log("Inicia el recorrido del for para enviar las notificaciones de primera consulta");
              _loop2 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop2(i) {
                var clienteId, data;
                return _regeneratorRuntime().wrap(function _loop2$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        clienteId = losRegistros[i].id_cliente;
                        mensajePieCompleto = mensajePie;
                        data = {
                          message: mensajePieCompleto,
                          phone: losRegistros[i].TELEFONO_MOVIL,
                          mimeType: fileMimeTypeMedia,
                          data: fileBase64Media,
                          fileName: "",
                          fileSize: ""
                        }; // Funcion ajax para nodejs que realiza los envios a la API free WWA

                        axios.post(wwaUrl, data).then(function (response) {
                          var data = response.data;

                          if (data.responseExSave.id) {
                            console.log("Enviado - OK"); // Se actualiza el estado a 1

                            var body = {
                              estado_envio: 1,
                              FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD")
                            };
                            Primera_consulta.update(body, {
                              where: {
                                id_cliente: clienteId
                              }
                            }) //.then((result) => res.json(result))
                            ["catch"](function (error) {
                              res.status(412).json({
                                msg: error.message
                              });
                            });
                          }

                          if (data.responseExSave.unknow) {
                            console.log("No Enviado - unknow"); // Se actualiza el estado a 3

                            var _body = {
                              estado_envio: 3,
                              FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD")
                            };
                            Primera_consulta.update(_body, {
                              where: {
                                id_cliente: clienteId
                              }
                            }) //.then((result) => res.json(result))
                            ["catch"](function (error) {
                              res.status(412).json({
                                msg: error.message
                              });
                            });
                          }

                          if (data.responseExSave.error) {
                            console.log("No enviado - error");
                            var errMsg = data.responseExSave.error.slice(0, 17);

                            if (errMsg === "Escanee el código") {
                              updateEstatusERROR(clienteId, 104); //console.log("Error 104: ", data.responseExSave.error);
                            } // Sesion cerrada o desvinculada. Puede que se envie al abrir la sesion o al vincular


                            if (errMsg === "Protocol error (R") {
                              updateEstatusERROR(clienteId, 105); //console.log("Error 105: ", data.responseExSave.error);
                            } // El numero esta mal escrito o supera los 12 caracteres


                            if (errMsg === "Evaluation failed") {
                              updateEstatusERROR(clienteId, 106); //console.log("Error 106: ", data.responseExSave.error);
                            }
                          }
                        })["catch"](function (error) {
                          console.error("Axios-Error al enviar WWE-API:", error.code);
                        });
                        _context3.next = 6;
                        return retraso();

                      case 6:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _loop2);
              });
              i = 0;

            case 4:
              if (!(i < losRegistros.length)) {
                _context4.next = 9;
                break;
              }

              return _context4.delegateYield(_loop2(i), "t0", 6);

            case 6:
              i++;
              _context4.next = 4;
              break;

            case 9:
              console.log("Fin del envío");

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee2);
    }));
    return _enviarMensaje.apply(this, arguments);
  }

  function updateEstatusERROR(clienteId, cod_error) {
    var fechaHoy = moment(); // Se actualiza el estado segun el errors

    var body = {
      estado_envio: cod_error,
      FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD")
    };
    Primera_consulta.update(body, {
      where: {
        id_cliente: clienteId
      }
    }) //.then((result) => res.json(result))
    ["catch"](function (error) {
      res.status(412).json({
        msg: error.message
      });
    });
  }
  /*
    Metodos
  */


  app.route("/api/primeraConsulta").get(function (req, res) {
    Primera_consulta.findAll({
      order: [["createdAt", "DESC"]]
    }).then(function (result) {
      return res.json(result);
    })["catch"](function (error) {
      res.status(402).json({
        msg: error.menssage
      });
    });
  }).post(function (req, res) {
    //console.log(req.body);
    Primera_consulta.create(req.body).then(function (result) {
      return res.json(result);
    })["catch"](function (error) {
      return res.json(error);
    });
  }); // Trae los turnos que tengan en el campo estado_envio = 0

  app.route("/api/primeraConsultaPendientes").get(function (req, res) {
    Primera_consulta.findAll({
      where: {
        estado_envio: 0
      },
      order: [["FECHA_CREACION", "ASC"]] //limit: 5

    }).then(function (result) {
      return res.json(result);
    })["catch"](function (error) {
      res.status(402).json({
        msg: error.menssage
      });
    });
  }); // Trae los turnos que ya fueron notificados hoy

  app.route("/api/primeraConsultaNotificados").get(function (req, res) {
    // Fecha de hoy 2022-02-30
    var fechaHoy = new Date().toISOString().slice(0, 10);
    Primera_consulta.count({
      where: _defineProperty({}, Op.and, [{
        estado_envio: 1
      }, {
        updatedAt: _defineProperty({}, Op.between, [fechaHoy + " 00:00:00", fechaHoy + " 23:59:59"])
      }]) //order: [["FECHA_CREACION", "DESC"]],

    }).then(function (result) {
      return res.json(result);
    })["catch"](function (error) {
      res.status(402).json({
        msg: error.menssage
      });
    });
  }); // Trae la cantidad de turnos enviados por rango de fecha desde hasta

  app.route("/api/turnosNoAsistidosNotificadosFecha").post(function (req, res) {
    var fechaHoy = new Date().toISOString().slice(0, 10);
    var _req$body = req.body,
        fecha_desde = _req$body.fecha_desde,
        fecha_hasta = _req$body.fecha_hasta;

    if (fecha_desde === "" && fecha_hasta === "") {
      fecha_desde = fechaHoy;
      fecha_hasta = fechaHoy;
    }

    if (fecha_hasta == "") {
      fecha_hasta = fecha_desde;
    }

    if (fecha_desde == "") {
      fecha_desde = fecha_hasta;
    }

    console.log(req.body);
    Primera_consulta.count({
      where: _defineProperty({}, Op.and, [{
        estado_envio: 1
      }, {
        updatedAt: _defineProperty({}, Op.between, [fecha_desde + " 00:00:00", fecha_hasta + " 23:59:59"])
      }]) //order: [["createdAt", "DESC"]],

    }).then(function (result) {
      return res.json(result);
    })["catch"](function (error) {
      res.status(402).json({
        msg: error.menssage
      });
    });
  }); // // Turnos no enviados - estado_envio 2 o 3
  // app.route("/turnosNoNotificados").get((req, res) => {
  //   // Fecha de hoy 2022-02-30
  //   let fechaHoy = new Date().toISOString().slice(0, 10);
  //   Turnos.count({
  //     where: {
  //       [Op.and]: [
  //         { estado_envio: { [Op.in]: [2, 3] } },
  //         {
  //           updatedAt: {
  //             [Op.between]: [fechaHoy + " 00:00:00", fechaHoy + " 23:59:59"],
  //           },
  //         },
  //       ],
  //     },
  //     //order: [["FECHA_CREACION", "DESC"]],
  //   })
  //     .then((result) => res.json(result))
  //     .catch((error) => {
  //       res.status(402).json({
  //         msg: error.menssage,
  //       });
  //     });
  // });
  // // Trae la cantidad de turnos enviados por rango de fecha desde hasta
  // app.route("/turnosNoNotificadosFecha").post((req, res) => {
  //   let fechaHoy = new Date().toISOString().slice(0, 10);
  //   let { fecha_desde, fecha_hasta } = req.body;
  //   if (fecha_desde === "" && fecha_hasta === "") {
  //     fecha_desde = fechaHoy;
  //     fecha_hasta = fechaHoy;
  //   }
  //   if (fecha_hasta == "") {
  //     fecha_hasta = fecha_desde;
  //   }
  //   if (fecha_desde == "") {
  //     fecha_desde = fecha_hasta;
  //   }
  //   console.log(req.body);
  //   Turnos.count({
  //     where: {
  //       [Op.and]: [
  //         { estado_envio: { [Op.in]: [2, 3] } },
  //         {
  //           updatedAt: {
  //             [Op.between]: [
  //               fecha_desde + " 00:00:00",
  //               fecha_hasta + " 23:59:59",
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //     //order: [["createdAt", "DESC"]],
  //   })
  //     .then((result) => res.json(result))
  //     .catch((error) => {
  //       res.status(402).json({
  //         msg: error.menssage,
  //       });
  //     });
  // });
  // app
  //   .route("api/primeraConsulta/:id_cliente")
  //   .get((req, res) => {
  //     Primera_consulta.findOne({
  //       where: req.params,
  //       include: [
  //         {
  //           model: Users,
  //           attributes: ["user_fullname"],
  //         },
  //       ],
  //     })
  //       .then((result) => res.json(result))
  //       .catch((error) => {
  //         res.status(404).json({
  //           msg: error.message,
  //         });
  //       });
  //   })
  //   .put((req, res) => {
  //     Primera_consulta.update(req.body, {
  //       where: req.params,
  //     })
  //       .then((result) => res.json(result))
  //       .catch((error) => {
  //         res.status(412).json({
  //           msg: error.message,
  //         });
  //       });
  //   })
  //   .delete((req, res) => {
  //     //const id = req.params.id;
  //     Primera_consulta.destroy({
  //       where: req.params,
  //     })
  //       .then(() => res.json(req.params))
  //       .catch((error) => {
  //         res.status(412).json({
  //           msg: error.message,
  //         });
  //       });
  //   });
};