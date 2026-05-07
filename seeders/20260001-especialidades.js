'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('especialidades', [
      { nombre: 'Médico General', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Medicina Interna', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Psicología', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Podología', created_at: new Date(), updated_at: new Date() },
      { nombre: 'Radiología', created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('especialidades', null, {});
  },
};