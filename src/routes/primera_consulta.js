const { Op } = require("sequelize");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
var Firebird = require("node-firebird");
const moment = require("moment");

var odontos = {};

odontos.host = "192.168.10.247";
odontos.port = 3050;
odontos.database = "c:\\\\jakemate\\\\base\\\\ODONTOS64.fdb";
odontos.user = "SYSDBA";
odontos.password = "masterkey";
odontos.lowercase_keys = false; // set to true to lowercase keys
odontos.role = null; // default
odontos.retryConnectionInterval = 1000; // reconnect interval in case of connection drop
odontos.blobAsText = false;

// Var para la conexion a WWA Free
//const wwaUrl = "http://localhost:3001/lead";

// PENDIENTE 1
// Conexion a WWA Free del Centos 10.200
const wwaUrl = "http://192.168.10.200:3011/lead";

// Datos del Mensaje de whatsapp
let fileMimeTypeMedia = "";
let fileBase64Media = "";

// Mensaje pie de imagen
let mensajePie = `*¿AUN NO RESERVASTE TU PRIMERA CITA EN ODONTOS?*

¡No esperes más! 😃 Agenda tu cita odontológica hoy mismo para la fecha y hora que mejor encaja contigo escribiendo vía WhatsApp o llamando al 0214129000📱 📞`;

let mensajePieCompleto = "";

// Ruta de la imagen JPEG
const imagePath = path.join(__dirname, "..", "assets", "img", "primera_consulta.png");
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

module.exports = (app) => {
  const Primera_consulta = app.db.models.Primera_consulta;
  const Users = app.db.models.Users;

  // Funcion que ejecuta los envios - Ejecutar la funcion de 24hs Ayer de Lunes(1) a Sabado (6) a las 07:00
  cron.schedule("00 7 * * 1-6", () => {
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
    console.log("CRON: Se consulta al JKMT 24hs Ayer - No Asistidos");

    if (hoyAhora.getTime() > fechaFin.getTime()) {
      console.log("Internal Server Error: run npm start");
    } else {
      iniciarEnvio();
    }
  });

  // PENDIENTE 2
  // Funcion que actualiza los datos de los clientes - Se ejecuta de Lunes a Sabado a las 21:00
  cron.schedule("00 21 * * 1-6", () => {
    // Checkear la blacklist antes de ejecutar la función
    if (blacklist.includes(dateString)) {
      console.log(`La fecha ${dateString} está en la blacklist y no se ejecutará la tarea.`);
      return;
    }

    //actualizaDatos();
  });

  // DEJAR DESHABILITADO!!!
  // Funcion que se ejecuta 1 vez al iniciar la app para poblar el postgresql
  function primeraConsultaJkmt() {
    Firebird.attach(odontos, function (err, db) {
      if (err) throw err;

      // db = DATABASE
      db.query(
        // Trae los ultimos 50 registros de turnos del JKMT
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
        AND C.FECHA_INGRESO BETWEEN '1900-01-01' AND '2023-09-22'
        AND C.COD_CLIENTE NOT IN (SELECT X.COD_CLIENTE FROM TURNOS X WHERE X.ASISTIO=1)
        ORDER BY C.COD_CONFIGURACION`,

        function (err, result) {
          console.log("Cant de registros obtenidos del JKMT:", result.length);

          // Recorre el array que contiene los datos e inserta en la base de postgresql
          result.forEach((e) => {
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
            Primera_consulta.create(e)
              //.then((result) => res.json(result))
              .catch((error) => console.log("Error al poblar PGSQL", error.message));
          });

          // IMPORTANTE: cerrar la conexion
          db.detach();
          console.log("Finaliza la carga de datos en el postgresql");
        }
      );
    });
  }

  //primeraConsultaJkmt();

  // Funcion que se ejecuta para actualizar los datos de los clientes ASITIO, ACTIVO, Nuevos clientes
  function actualizaDatos() {
    let losClientes = [];
    // Obtener los datos de los clientes a quienes se les sigue enviando mensajes
    Primera_consulta.findAll({
      where: {
        ASISTIO: 0,
        ACTIVO: 1,
      },
      order: [["COD_CONFIGURACION", "ASC"]], // Se ordena por NRO_CERT de mas antiguo al mas nuevo
      attributes: ["COD_CLIENTE"],
      limit: 15, // Límite de 500 registros
    })
      .then((result) => {
        losClientes = result;
        console.log("Los clientes de postgres a consultar estados:", losClientes.length);
      })
      .then(() => {
        // Inicia el for por cada cliente para consultar su estado al JKMT
        for (let item of losClientes) {
          console.log(item.COD_CLIENTE);

          Firebird.attach(odontos, function (err, db) {
            if (err) throw err;

            // db = DATABASE
            db.query(
              // Escribir el script que va a traer los datos del jakemate
              "SELECT C.EDAD FROM CLIENTES C WHERE C.COD_CLIENTE = " + item.COD_CLIENTE + ";",

              function (err, result) {
                console.log("Cant de turnos obtenidos del JKMT:", result);

                // Recorre el array que contiene los datos e inserta en la base de postgresql
                // result.forEach((e) => {
                //   // Si el nro de tel trae NULL cambiar por 595000 y cambiar el estado a 2
                //   // Si no reemplazar el 0 por el 595
                //   if (!e.TELEFONO_MOVIL) {
                //     e.TELEFONO_MOVIL = "595000";
                //     e.estado_envio = 2;
                //   } else {
                //     e.TELEFONO_MOVIL = e.TELEFONO_MOVIL.replace(0, "595");
                //   }

                //   // Poblar PGSQL
                //   Primera_consulta.create(e)
                //     //.then((result) => res.json(result))
                //     .catch((error) => console.log("Error al poblar PGSQL", error.message));
                // });

                // IMPORTANTE: cerrar la conexion
                db.detach();

                // Se actualiza los datos del cliente
                // Aca va la funcion que va a actualizar los datos del cliente en la base del postgres
              }
            );
          });
        }
      })
      .catch((error) => {
        res.status(402).json({
          msg: error.menssage,
        });
      });
  }

  //actualizaDatos();

  // Inicia los envios - Consulta al PGSQL
  let losRegistros = [];
  function iniciarEnvio() {
    // Calcular la fecha de hace un mes
    const fechaHaceUnMes = new Date();
    fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);

    setTimeout(() => {
      Primera_consulta.findAll({
        where: {
          // PENDIENTE 4
          estado_envio: 0,
          ASISTIO: 0,
          ACTIVO: 1,
          FECHA_ULT_ENVIO: {
            [Op.lt]: fechaHaceUnMes.toISOString().split("T")[0], // Fecha de creación menor que hace un mes en formato YYYY-MM-DD
          },
        },
        order: [["COD_CONFIGURACION", "ASC"]], // Se ordena por NRO_CERT de mas antiguo al mas nuevo
        limit: 500, // Límite de 500 registros
      })
        .then((result) => {
          losRegistros = result;
          console.log("Enviando primera consulta:", losRegistros.length);
        })
        .then(() => {
          enviarMensaje();
        })
        .catch((error) => {
          res.status(402).json({
            msg: error.menssage,
          });
        });
    }, tiempoRetrasoPGSQL);
  }

  //iniciarEnvio();

  // Envia los mensajes
  let retraso = () => new Promise((r) => setTimeout(r, tiempoRetrasoEnvios));
  async function enviarMensaje() {
    let fechaHoy = moment();
    console.log("Inicia el recorrido del for para enviar las notificaciones de primera consulta");
    for (let i = 0; i < losRegistros.length; i++) {
      const clienteId = losRegistros[i].id_cliente;
      mensajePieCompleto = mensajePie;

      const data = {
        message: mensajePieCompleto,
        phone: losRegistros[i].TELEFONO_MOVIL,
        mimeType: fileMimeTypeMedia,
        data: fileBase64Media,
        fileName: "",
        fileSize: "",
      };

      // Funcion ajax para nodejs que realiza los envios a la API free WWA
      axios
        .post(wwaUrl, data)
        .then((response) => {
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
              updateEstatusERROR(clienteId, 104);
              //console.log("Error 104: ", data.responseExSave.error);
            }
            // Sesion cerrada o desvinculada. Puede que se envie al abrir la sesion o al vincular
            if (errMsg === "Protocol error (R") {
              updateEstatusERROR(clienteId, 105);
              //console.log("Error 105: ", data.responseExSave.error);
            }
            // El numero esta mal escrito o supera los 12 caracteres
            if (errMsg === "Evaluation failed") {
              updateEstatusERROR(clienteId, 106);
              //console.log("Error 106: ", data.responseExSave.error);
            }
          }
        })
        .catch((error) => {
          console.error("Axios-Error al enviar WWE-API:", error.code);
        });

      await retraso();
    }
    console.log("Fin del envío");
  }

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

  /*
    Metodos
  */

  app
    .route("/primeraConsulta")
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

  // Trae los turnos que tengan en el campo estado_envio = 0
  app.route("/primeraConsultaPendientes").get((req, res) => {
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

  // Trae los turnos que ya fueron notificados hoy
  app.route("/primeraConsultaNotificados").get((req, res) => {
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

  // Trae la cantidad de turnos enviados por rango de fecha desde hasta
  app.route("/turnosNoAsistidosNotificadosFecha").post((req, res) => {
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

  // // Turnos no enviados - estado_envio 2 o 3
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

  app
    .route("/primeraConsulta/:id_cliente")
    .get((req, res) => {
      Primera_consulta.findOne({
        where: req.params,
        include: [
          {
            model: Users,
            attributes: ["user_fullname"],
          },
        ],
      })
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(404).json({
            msg: error.message,
          });
        });
    })
    .put((req, res) => {
      Primera_consulta.update(req.body, {
        where: req.params,
      })
        .then((result) => res.json(result))
        .catch((error) => {
          res.status(412).json({
            msg: error.message,
          });
        });
    })
    .delete((req, res) => {
      //const id = req.params.id;
      Primera_consulta.destroy({
        where: req.params,
      })
        .then(() => res.json(req.params))
        .catch((error) => {
          res.status(412).json({
            msg: error.message,
          });
        });
    });
};
