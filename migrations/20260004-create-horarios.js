'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('horarios', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            medico_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'medicos',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            dia: {
                type: Sequelize.ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'),
                allowNull: false,
            },
            hora_inicio: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            hora_fin: {
                type: Sequelize.TIME,
                allowNull: false,
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
        await queryInterface.dropTable('horarios');
    },
};