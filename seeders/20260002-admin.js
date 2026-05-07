'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface) {
        const hash = await bcrypt.hash('admin123', 12);
        await queryInterface.bulkInsert('users', [{
            nombre: 'Admin',
            apellido: 'EjeSalud',
            email: 'admin@ejesalud.com',
            telefono: '5500000000',
            fecha_nacimiento: null,
            password: hash,
            rol: 'admin',
            activo: true,
            created_at: new Date(),
            updated_at: new Date(),
        }]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', { email: 'admin@ejesalud.com' });
    },
};