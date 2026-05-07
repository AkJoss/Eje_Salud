'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
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
            email: {
                type: Sequelize.STRING(150),
                allowNull: false,
                unique: true,
            },
            telefono: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            fecha_nacimiento: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            rol: {
                type: Sequelize.ENUM('paciente', 'medico', 'admin'),
                defaultValue: 'paciente',
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
        await queryInterface.dropTable('users');
    },
};