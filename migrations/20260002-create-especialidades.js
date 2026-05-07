'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('especialidades', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
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
        await queryInterface.dropTable('especialidades');
    },
};