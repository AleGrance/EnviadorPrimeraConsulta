module.exports = (sequelize, DataType) => {

    const Primera_consulta = sequelize.define('Primera_consulta', {
        id_cliente: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        COD_CLIENTE: {
            type: DataType.INTEGER,
            allowNull: false,
            unique: true
        },
        COD_CONFIGURACION: {
            type: DataType.INTEGER,
            allowNull: false,
        },
        NOMBRE: {
            type: DataType.STRING,
            allowNull: false
        },
        TELEFONO_MOVIL: {
            type: DataType.STRING,
            allowNull: true
        },
        FECHA_INGRESO: {
            type: DataType.DATE,
            allowNull: false
        },
        ASISTIO: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        ACTIVO: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        FECHA_ULT_ENVIO: {
            type: DataType.DATE,
            allowNull: true,
            defaultValue: '2023-08-24'
        },
        estado_envio: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        cant_envios: {
            type: DataType.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    });

    Primera_consulta.associate = (models) => {
        Primera_consulta.belongsTo(models.Users, {
            foreignKey: {
                name: 'user_id',
                allowNull: true,
                defaultValue: 1
              }
        });
    };
    return Primera_consulta;
};