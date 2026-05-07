'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('medicos', [
            {
                nombre: 'Daniel',
                apellido: 'Reyes Martínez',
                especialidad: 'Médico General',
                cedula: '3842917',
                email: 'danireyes@ejesalud.com',
                telefono: '5523456789',
                bio: 'Médico general con 10 años de experiencia en atención primaria.',
                foto: '',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                nombre: 'Diego David',
                apellido: 'Estrada Dominguez',
                especialidad: 'Medicina Interna',
                cedula: '7215634',
                email: 'diegoestr@ejesalud.com',
                telefono: '5548127634',
                bio: 'Especialista en medicina interna y enfermedades crónicas.',
                foto: '',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                nombre: 'José Carlos',
                apellido: 'Arangua de Luna',
                especialidad: 'Psicología',
                cedula: '5093481',
                email: 'josearangua@ejesalud.com',
                telefono: '5571839204',
                bio: 'Psicólogo clínico con enfoque cognitivo-conductual.',
                foto: '',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                nombre: 'Adrian Alejandro',
                apellido: 'Gaspar Corona',
                especialidad: 'Podología',
                cedula: '6748205',
                email: 'adriancorona@ejesalud.com',
                telefono: '5534920817',
                bio: 'Podólogo especializado en patologías del pie y tobillo.',
                foto: '',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                nombre: 'Gerardo',
                apellido: 'Martínez Puente',
                especialidad: 'Radiología',
                cedula: '9321076',
                email: 'gerardomartnz@ejesalud.com',
                telefono: '5562748391',
                bio: 'Radiólogo con especialidad en diagnóstico por imagen.',
                foto: '',
                activo: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('medicos', null, {});
    },
};