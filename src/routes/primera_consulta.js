const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
// Conexion con Firebird
var Firebird = require("node-firebird");
// Datos de la conexion Firebird
import { firebird } from "../libs/config";

const moment = require("moment");

// Conexion a WWA Free del Centos 10.200
const wwaUrl = "http://192.168.10.200:3011/lead";
//const wwaUrl = "http://localhost:3001/lead";

// URL del notificador
const wwaUrl_Notificacion = "http://localhost:3088/lead";
//const wwaUrl_Notificacion = "http://localhost:3001/lead";

// Datos del Mensaje de whatsapp
let fileMimeTypeMedia = "";
let fileBase64Media = "";
// Mensaje del notificador
let mensajeBody = "";

// Mensaje pie de imagen
let mensajePie = `*¿AUN NO RESERVASTE TU PRIMERA CITA EN ODONTOS?*

¡No esperes mas!😃 Pide cita hoy mismo para el día y hora que mejor encaja contigo escribiendo vía WhatsApp ingresando al siguiente link: https://wa.me/5950214129000 o llamando al 0214129000📱 📞`;

let mensajePieCompleto = "";

// Ruta de la imagen JPEG
const imagePath = path.join(__dirname, "..", "img", "primera_consulta.jpeg");
// Leer el contenido de la imagen como un buffer
const imageBuffer = fs.readFileSync(imagePath);
// Convertir el buffer a base64
const base64String = imageBuffer.toString("base64");
// Mapear la extensión de archivo a un tipo de archivo
const fileExtension = path.extname(imagePath);
const fileType = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
}[fileExtension.toLowerCase()];

fileMimeTypeMedia = fileType;
// El split esta al pedo
fileBase64Media = base64String.split(",")[0];

// Tiempo de retraso de consulta al PGSQL para iniciar el envio. 1 minuto
var tiempoRetrasoPGSQL = 1000 * 60;
// Tiempo entre envios. Cada 15s se realiza el envío a la API free WWA
var tiempoRetrasoEnvios = 15000;

// Blacklist fechas
const blacklist = ["2023-05-02", "2023-05-16", "2023-08-15"];
var fechaFin = new Date("2024-03-01 08:00:00");

// Listado de clientes que no consultaron
var clientesPrimeraConsulta = [];

module.exports = (app) => {
  const Primera_consulta = app.db.models.Primera_consulta;

  // Funcion que ejecuta los envios - Lun a Sab a las 10:00
  cron.schedule("00 10 * * 1-6", () => {
    let hoyAhora = new Date();
    let diaHoy = hoyAhora.toString().slice(0, 3);
    let fullHoraAhora = hoyAhora.toString().slice(16, 21);

    // Checkear la blacklist antes de ejecutar la función
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];
    if (blacklist.includes(dateString)) {
      console.log(`La fecha ${dateString} está en la blacklist y no se ejecutará la tarea.`);
      return;
    }

    console.log("Hoy es:", diaHoy, "la hora es:", fullHoraAhora);
    console.log("CRON: Se consulta al PGSQL - Primera Consulta");

    if (hoyAhora.getTime() > fechaFin.getTime()) {
      console.log("Internal Server Error: run npm start");
    } else {
      iniciarEnvio();
    }
  });

  // Funcion que se ejecuta para obtener los datos de los clientes que nunca consultaron - Lun a Sab a las 20hs
  cron.schedule("00 20 * * 1-6", () => {
    // Checkear la blacklist antes de ejecutar la función
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];
    if (blacklist.includes(dateString)) {
      console.log(`La fecha ${dateString} está en la blacklist y no se ejecutará la tarea.`);
      return;
    }

    // funcionPromesa()
    //   .then(() => {
    //     // Primera consutla - Obtiene los datos
    //     return getClientesPrimeraConsulta();
    //   })
    //   .then(() => {
    //     // Segunda consulta - Inserta los datos
    //     return insertClientesPrimeraConsulta();
    //   })
    //   .then(() => {
    //     // Tercera consulta - Sincroniza los datos
    //     return sincDatosClientes();
    //   });
  });

  // Inicia las funciones promesas
  function funcionPromesa() {
    return new Promise((resolve, reject) => {
      console.log("Se instancia la promesa");
      resolve();
    });
  }

  // Trae los datos del Firebird - Intenta cada 1 min en caso de error de conexion
  function tryAgain() {
    console.log("Error de conexion con el Firebird, se intenta nuevamente luego de 10s...");
    setTimeout(() => {
      // Inicia de vuelta la promesa
      funcionPromesa()
        .then(() => {
          // Primera consutla - Obtiene los datos
          return getClientesPrimeraConsulta();
        })
        .then(() => {
          // Segunda consulta - Inserta los datos
          return insertClientesPrimeraConsulta();
        })
        .then(() => {
          // Tercera consulta - Sincroniza los datos
          return sincDatosClientes();
        });
    }, 1000 * 60);
  }

  // Funcion que se ejecuta para obtener los datos de los clientes que nunca consultaron - Lun a Sab a las 21hs
  function getClientesPrimeraConsulta() {
    return new Promise((resolve, reject) => {
      console.log("Promesa dentro de getClientesPrimeraConsulta");

      Firebird.attach(firebird, function (err, db) {
        if (err) {
          console.log(err);
          return tryAgain();
        }

        // db = DATABASE
        db.query(
          // Trae los registros
          `SELECT c.cod_configuracion,
        CL.COD_CLIENTE,
        CL.NOMBRE,
        CASE WHEN CL.NRO_DOCUMENTO IS NULL THEN '0' ELSE CL.NRO_DOCUMENTO END NRO_DOCUMENTO,
        CASE WHEN CL.TELEFONO IS NULL THEN '0' ELSE CL.TELEFONO END TELEFONO,
        CASE WHEN CL.TELEFONO_MOVIL IS NULL THEN '0' ELSE CL.TELEFONO_MOVIL END TELEFONO_MOVIL,
        CASE WHEN CL.TELEFONO_LABORAL IS NULL THEN '0' ELSE CL.TELEFONO_LABORAL END  TELEFONO_LABORAL,
        CA.DESCRIPCION AS TIPO_AFILIADO,
        CPC.IMPORTE AS CUOTA_SOCIAL_GRUPO,
        P.DESCRIPCION AS PLAN_SERVICIO,
        E.ESTADO AS ESTADO_DEUDA,
        en.NOMBRE as entidadconvenio,
        ccp.CATEGORIA,
        case when mc.TABLA_ASOCIADA = 'MEDIOS_COBROS_CONVENIOS' then 'CONVENIOS_ASOCIACIONES'
             when mc.TABLA_ASOCIADA = 'MEDIOS_COBROS_BANCOS' OR MC.TABLA_ASOCIADA = 'MEDIOS_COBROS_DEB_AUTOMATICOS' then 'DEBITOS'
             else 'PARTICULARES'
         end medio_pago,
        CAST(C.FECHA_INGRESO AS DATE) AS FECHA_INGRESO,
        z.DESCRIPCION as zona_cob,
        (select NOMBRE from sucursales where cod_sucursal = cpc.COD_SUCURSAL) as sucursal_venta,
        (select NOMBRE from sucursales where cod_sucursal = cpc.COD_SUCURSAL_DESTINO) as sucursal_destino
        FROM CONFIG_CUOTA_PER_CLIENTES C
        JOIN CLIENTES CL ON CL.COD_CLIENTE=C.COD_CLIENTE
        JOIN CONFIG_CUOTAS_PERIODICAS CPC ON CPC.COD_CONFIGURACION=C.COD_CONFIGURACION
        JOIN ESTADOS_DEUDAS E ON E.COD_ESTADO_DEUDA=CPC.COD_ESTADO_DEUDA
        JOIN PLAN_SERVICIOS_SOCIALES P ON P.COD_PLAN_SERVICIO_SOCIAL=C.COD_PLAN_SERVICIO
        JOIN CAT_AFILIADO CA ON CA.COD_CATEGORIA=C.COD_CATEGORIA_AFILIADO
        join ENTIDADES en ON cpc.COD_ENTIDAD_CONVENIO = en.COD_ENTIDAD
        join CAT_CUOTAS_PERIODICAS ccp on ccp.COD_CAT_CUOTA_PERIODICA = cpc.COD_CAT_CUOTA_PERIODICA
        join MEDIOS_COBROS mc on mc.COD_MEDIO_COBRO = cpc.COD_MEDIO_COBRO
        join zona_cobranza  z on z.COD_ZONA_COBRANZA = mc.COD_ZONA_COBRANZA
        WHERE C.FECHA_SALIDA IS NULL
        AND CA.COD_CATEGORIA NOT IN('101')
        and c.cod_configuracion = (select  max(co.COD_CONFIGURACION)
                                   from CONFIG_CUOTA_PER_CLIENTES co
                                   where co.COD_CLIENTE = c.COD_CLIENTE
                                   and   co.COD_CONFIGURACION = c.COD_CONFIGURACION)
        AND C.FECHA_INGRESO BETWEEN '1900-01-01' AND DATEADD(MONTH, -1, CURRENT_DATE)
        AND C.COD_CLIENTE NOT IN (SELECT X.COD_CLIENTE FROM TURNOS X WHERE X.ASISTIO=1)
        ORDER BY C.COD_CONFIGURACION`,

          function (err, result) {
            console.log("Cant de registros obtenidos del JKMT:", result.length);
            clientesPrimeraConsulta = result;

            // IMPORTANTE: cerrar la conexion
            db.detach();
            resolve();
          }
        );
      });
    });
  }

  // Inserta los datos obtenidos en la primera consulta
  function insertClientesPrimeraConsulta() {
    return new Promise((resolve, reject) => {
      clientesPrimeraConsulta.forEach((e) => {
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
        }

        // Reemplazar por mi nro para probar el envio
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
        if (e.TELEFONO_MOVIL.length == 12) {
          Primera_consulta.create(e)
            //.then((result) => res.json(result))
            .catch((error) => {
              console.log("Error al poblar PGSQL", error.message);
            });
        }
      });

      resolve();
    });
  }

  // Funcion que sincroniza los datos existentes con los obtenidos con getClientesPrimeraConsulta
  function sincDatosClientes() {
    console.log("Consulta al PGSQL");
    return new Promise((resolve, reject) => {
      console.log("Promesa dentro de sincDatos");

      Primera_consulta.findAll({
        where: {
          estado_envio: 0,
          ACTIVO: 1,
          ASISTIO: 0,
        },
      })
        .then((resultado) => {
          console.log("Datos del PGSQL", resultado.length);
        })
        .then(() => {
          console.log("Datos del JKMT", clientesPrimeraConsulta.length);
        })
        .catch((error) => {
          console.log(error);
        });

      resolve();
    });
  }

  // Inicia los envios - Consulta al PGSQL
  let losRegistros = [];
  function iniciarEnvio() {
    // Calcular la fecha de hace un mes
    const fechaHaceUnMes = new Date();
    fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);

    setTimeout(() => {
      Primera_consulta.findAll({
        where: {
          [Op.and]: [
            Sequelize.where(Sequelize.fn("char_length", Sequelize.col("TELEFONO_MOVIL")), 12), // Se optiene sólo los registros que tengan el nro con 12 digitos
            {
              // PENDIENTE 4
              estado_envio: 0,
              ASISTIO: 0,
              ACTIVO: 1,
              FECHA_ULT_ENVIO: {
                [Op.lt]: fechaHaceUnMes.toISOString().split("T")[0], // Fecha de creación menor que hace un mes en formato YYYY-MM-DD
              },
            },
          ],
        },

        order: [["COD_CONFIGURACION", "ASC"]], // Se ordena por NRO_CERT de mas antiguo al mas nuevo
        limit: 500, // Límite de 500 registros
      })
        .then((result) => {
          losRegistros = result;
          console.log("Enviando primera consulta:", losRegistros.length);

          // Cuando ya no haya envios pendientes - Se debe poner a 0 el campo estado_envio en todos los registros
          if (losRegistros.length == 0) {
            console.log("No hay registros pendiente de envios. Se actualizan los registros");
          }
        })
        .then(() => {
          enviarMensaje();
        })
        .catch((error) => {
          console.log(error);
        });
    }, tiempoRetrasoPGSQL);
  }

  // Solo para test
  //iniciarEnvio();

  // Reintentar envio si la API WWA falla
  function retry() {
    console.log("Se va a intentar enviar nuevamente luego de 2m ...");
    setTimeout(() => {
      iniciarEnvio();
    }, 1000 * 60);
  }

  // Envia los mensajes
  let retraso = () => new Promise((r) => setTimeout(r, tiempoRetrasoEnvios));
  async function enviarMensaje() {
    let fechaHoy = moment();
    console.log("Inicia el recorrido del for para notificaciones de Primera Consulta");
    try {
      for (let i = 0; i < losRegistros.length; i++) {
        try {
          const clienteId = losRegistros[i].id_cliente;
          mensajePieCompleto = mensajePie;

          const dataBody = {
            message: mensajePieCompleto,
            phone: losRegistros[i].TELEFONO_MOVIL,
            mimeType: fileMimeTypeMedia,
            data: fileBase64Media,
            fileName: "",
            fileSize: "",
          };

          const response = await axios.post(wwaUrl, dataBody, { timeout: 1000 * 60 });
          // Procesar la respuesta aquí...
          const data = response.data;

          if (data.responseExSave.id) {
            console.log("Enviado - OK");
            // Se actualiza el estado a 1
            const body = {
              estado_envio: 1,
              FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD"),
            };

            Primera_consulta.update(body, {
              where: { id_cliente: clienteId },
            })
              //.then((result) => res.json(result))
              .catch((error) => {
                res.status(412).json({
                  msg: error.message,
                });
              });
          }

          if (data.responseExSave.unknow) {
            console.log("No Enviado - unknow");
            // Se actualiza el estado a 3
            const body = {
              estado_envio: 3,
              FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD"),
            };

            Primera_consulta.update(body, {
              where: { id_cliente: clienteId },
            })
              //.then((result) => res.json(result))
              .catch((error) => {
                res.status(412).json({
                  msg: error.message,
                });
              });
          }

          if (data.responseExSave.error) {
            console.log("No enviado - error");
            const errMsg = data.responseExSave.error.slice(0, 17);
            if (errMsg === "Escanee el código") {
              console.log("Error 104: ", errMsg);
              // Vacia el array de los turnos para no notificar por cada turno cada segundo
              losRegistros = [];
              throw new Error(`Error en sesión en respuesta de la solicitud Axios - ${errMsg}`);
            }
            // Sesion cerrada o desvinculada. Puede que se envie al abrir la sesion o al vincular
            if (errMsg === "Protocol error (R") {
              console.log("Error 105: ", errMsg);
              // Vacia el array de los turnos para no notificar por cada turno cada segundo
              losRegistros = [];
              throw new Error(`Error en sesión en respuesta de la solicitud Axios - ${errMsg}`);
            }
            // El numero esta mal escrito o supera los 12 caracteres
            if (errMsg === "Evaluation failed") {
              updateEstatusERROR(clienteId, 106);
              //console.log("Error 106: ", data.responseExSave.error);
            }
          }
        } catch (error) {
          console.log(error);
          // Manejo de errores aquí...
          if (error.code === "ECONNABORTED") {
            console.error("La solicitud tardó demasiado y se canceló", error.code);
            notificarSesionOff("Error02 de conexión con la API: " + error.code);
          } else {
            console.error("Error de conexión con la API: ", error);
            notificarSesionOff("Error02 de conexión con la API: " + error);
          }
          // Lanzar una excepción para detener el bucle
          losRegistros = [];
          throw new Error(`"Error de conexión en la solicitud Axios - ${error.code}`);
        }

        // Esperar 15 segundos antes de la próxima iteración
        await retraso();
      }
      console.log("Fin del envío");
    } catch (error) {
      console.error("Error en el bucle principal:", error.message);
      // Manejar el error del bucle aquí
    }
  }

  // async function enviarMensaje() {
  //   let fechaHoy = moment();
  //   console.log("Inicia el recorrido del for para enviar las notificaciones de primera consulta");

  //   for (let i = 0; i < losRegistros.length; i++) {
  //     const clienteId = losRegistros[i].id_cliente;
  //     mensajePieCompleto = mensajePie;

  //     const data = {
  //       message: mensajePieCompleto,
  //       phone: losRegistros[i].TELEFONO_MOVIL,
  //       mimeType: fileMimeTypeMedia,
  //       data: fileBase64Media,
  //       fileName: "",
  //       fileSize: "",
  //     };

  //     // Funcion ajax para nodejs que realiza los envios a la API free WWA
  //     axios
  //       .post(wwaUrl, data, { timeout: 60000 })
  //       .then((response) => {
  //         const data = response.data;

  //         if (data.responseExSave.id) {
  //           console.log("Enviado - OK");
  //           // Se actualiza el estado a 1
  //           const body = {
  //             estado_envio: 1,
  //             FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD"),
  //           };

  //           Primera_consulta.update(body, {
  //             where: { id_cliente: clienteId },
  //           })
  //             //.then((result) => res.json(result))
  //             .catch((error) => {
  //               res.status(412).json({
  //                 msg: error.message,
  //               });
  //             });
  //         }

  //         if (data.responseExSave.unknow) {
  //           console.log("No Enviado - unknow");
  //           // Se actualiza el estado a 3
  //           const body = {
  //             estado_envio: 3,
  //             FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD"),
  //           };

  //           Primera_consulta.update(body, {
  //             where: { id_cliente: clienteId },
  //           })
  //             //.then((result) => res.json(result))
  //             .catch((error) => {
  //               res.status(412).json({
  //                 msg: error.message,
  //               });
  //             });
  //         }

  //         if (data.responseExSave.error) {
  //           console.log("No enviado - error");
  //           const errMsg = data.responseExSave.error.slice(0, 17);
  //           if (errMsg === "Escanee el código") {
  //             updateEstatusERROR(clienteId, 104);
  //             //console.log("Error 104: ", data.responseExSave.error);
  //           }
  //           // Sesion cerrada o desvinculada. Puede que se envie al abrir la sesion o al vincular
  //           if (errMsg === "Protocol error (R") {
  //             //updateEstatusERROR(clienteId, 105);
  //             //console.log("Error 105: ", data.responseExSave.error);
  //             console.error("Error de conexión con la API: ", error);
  //             notificarSesionOff("Error02 de conexión con la API: " + error);
  //           }
  //           // El numero esta mal escrito o supera los 12 caracteres
  //           if (errMsg === "Evaluation failed") {
  //             updateEstatusERROR(clienteId, 106);
  //             //console.log("Error 106: ", data.responseExSave.error);
  //           }
  //         }
  //       })
  //       .catch((error) => {
  //         if (error.code === "ECONNABORTED") {
  //           console.error("La solicitud tardó demasiado y se canceló", error.code);
  //           notificarSesionOff("Error02 de conexión con la API: " + error.code);
  //           losRegistros = [];
  //         } else {
  //           console.error("Error de conexión con la API: ", error.code);
  //           notificarSesionOff("Error02 de conexión con la API: " + error.code);
  //           losRegistros = [];
  //         }
  //       });

  //     await retraso();
  //   }

  //   console.log("Fin del envío");
  // }

  function updateEstatusERROR(clienteId, cod_error) {
    let fechaHoy = moment();
    // Se actualiza el estado segun el errors
    const body = {
      estado_envio: cod_error,
      FECHA_ULT_ENVIO: fechaHoy.format("YYYY-MM-DD"),
    };

    Primera_consulta.update(body, {
      where: { id_cliente: clienteId },
    })
      //.then((result) => res.json(result))
      .catch((error) => {
        res.status(412).json({
          msg: error.message,
        });
      });
  }

  /**
   *  NOTIFICADOR DE ERRORES
   */
  let retrasoNotificador = () => new Promise((r) => setTimeout(r, 5000));

  let numerosNotificados = [
    { NOMBRE: "Alejandro", NUMERO: "595986153301" },
    { NOMBRE: "Alejandro Corpo", NUMERO: "595974107341" },
    //{ NOMBRE: "Juan Corpo", NUMERO: "595991711570" },
  ];

  async function notificarSesionOff(error) {
    for (let item of numerosNotificados) {
      console.log(item);

      mensajeBody = {
        message: `*Error en la API - EnviadorPrimeraConsulta*
${error}`,
        phone: item.NUMERO,
        mimeType: "",
        data: "",
        fileName: "",
        fileSize: "",
      };

      // Envia el mensaje
      axios
        .post(wwaUrl_Notificacion, mensajeBody, { timeout: 10000 })
        .then((response) => {
          const data = response.data;

          if (data.responseExSave.id) {
            console.log("**Notificacion de ERROR Enviada - OK");
          }

          if (data.responseExSave.error) {
            console.log("**Notificacion de ERROR No enviado - error");
            console.log("**Verificar la sesion local: " + wwaUrl_Notificacion);
          }
        })
        .catch((error) => {
          console.error("**Ocurrió un error - Notificacion de ERROR No enviado:", error.code);
          console.log("**Verificar la sesion local: " + wwaUrl_Notificacion);
        });

      // Espera 5s
      await retrasoNotificador();
    }

    // Reintentar el envio luego de 1m
    retry();
  }

  /*
    Metodos
  */

  app
    .route("/api/primeraConsulta")
    .get((req, res) => {
      Primera_consulta.findAll({
        order: [["createdAt", "DESC"]],
      })
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(402).json({
            msg: error.menssage,
          });
        });
    })
    .post((req, res) => {
      //console.log(req.body);
      Primera_consulta.create(req.body)
        .then((result) => res.json(result))
        .catch((error) => res.json(error));
    });

  // Trae los que tengan en el campo estado_envio = 0
  app.route("/api/primeraConsultaPendientes").get((req, res) => {
    Primera_consulta.findAll({
      where: { estado_envio: 0 },
      order: [["FECHA_CREACION", "ASC"]],
      //limit: 5
    })
      .then((result) => res.json(result))
      .catch((error) => {
        res.status(402).json({
          msg: error.menssage,
        });
      });
  });

  // Trae los que ya fueron notificados hoy
  app.route("/api/primeraConsultaNotificados").get((req, res) => {
    // Fecha de hoy 2022-02-30
    let fechaHoy = new Date().toISOString().slice(0, 10);

    Primera_consulta.count({
      where: {
        [Op.and]: [
          { estado_envio: 1 },
          {
            updatedAt: {
              [Op.between]: [fechaHoy + " 00:00:00", fechaHoy + " 23:59:59"],
            },
          },
        ],
      },
      //order: [["FECHA_CREACION", "DESC"]],
    })
      .then((result) => res.json(result))
      .catch((error) => {
        res.status(402).json({
          msg: error.menssage,
        });
      });
  });

  // Trae la cantidad de enviados por rango de fecha desde hasta
  app.route("/api/turnosNoAsistidosNotificadosFecha").post((req, res) => {
    let fechaHoy = new Date().toISOString().slice(0, 10);
    let { fecha_desde, fecha_hasta } = req.body;

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
      where: {
        [Op.and]: [
          { estado_envio: 1 },
          {
            updatedAt: {
              [Op.between]: [fecha_desde + " 00:00:00", fecha_hasta + " 23:59:59"],
            },
          },
        ],
      },
      //order: [["createdAt", "DESC"]],
    })
      .then((result) => res.json(result))
      .catch((error) => {
        res.status(402).json({
          msg: error.menssage,
        });
      });
  });
};
