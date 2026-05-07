'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('medicos', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            apellido: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            especialidad: {
                type: Sequelize.ENUM(
                    'Médico General',
                    'Medicina Interna',
                    'Psicología',
                    'Podología',
                    'Radiología'
                ),
                allowNull: false,
            },
            cedula: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING(150),
                allowNull: false,
                unique: true,
            },
            telefono: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            bio: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            foto: {
                type: Sequelize.STRING(255),
                defaultValue: '',
            },
            activo: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('medicos');
    },
};