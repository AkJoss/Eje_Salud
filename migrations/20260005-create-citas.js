'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('citas', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            paciente_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            medico_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'medicos',
                    key: 'id',
                },
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
            fecha: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            hora: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            motivo: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            estado: {
                type: Sequelize.ENUM('pendiente', 'confirmada', 'cancelada', 'completada'),
                defaultValue: 'pendiente',
            },
            notas: {
                type: Sequelize.STRING(1000),
                allowNull: true,
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
        await queryInterface.dropTable('citas');
    },
};