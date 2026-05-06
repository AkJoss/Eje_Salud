'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('especialidades', [
      {
        nombre: 'Médico General',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: 'Medicina Interna',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: 'Psicología',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: 'Podología',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nombre: 'Radiología',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('especialidades', {
      nombre: [
        'Médico General',
        'Medicina Interna',
        'Psicología',
        'Podología',
        'Radiología',
      ],
    });
  },
};
