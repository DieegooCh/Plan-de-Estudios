document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE LA MALLA ---
    // Aquí puedes definir todos los ramos de tu carrera.
    // 'id': identificador único para cada ramo.
    // 'requisitos': lista de 'id' de los ramos que se deben aprobar primero.
    const mallaData = [
        { id: 'CI101', nombre: 'Cálculo I', semestre: 1, requisitos: [] },
        { id: 'FI101', nombre: 'Física I', semestre: 1, requisitos: [] },
        { id: 'AL101', nombre: 'Álgebra', semestre: 1, requisitos: [] },
        { id: 'IN101', nombre: 'Introducción a la Ing.', semestre: 1, requisitos: [] },

        { id: 'CI102', nombre: 'Cálculo II', semestre: 2, requisitos: ['CI101'] },
        { id: 'FI102', nombre: 'Física II', semestre: 2, requisitos: ['FI101', 'CI101'] },
        { id: 'PR101', nombre: 'Programación', semestre: 2, requisitos: ['AL101'] },
        { id: 'QU101', nombre: 'Química', semestre: 2, requisitos: [] },

        { id: 'CI201', nombre: 'Cálculo III', semestre: 3, requisitos: ['CI102'] },
        { id: 'ED101', nombre: 'Ecuaciones Diferenciales', semestre: 3, requisitos: ['CI102', 'AL101'] },
        { id: 'PR201', nombre: 'Estructura de Datos', semestre: 3, requisitos: ['PR101'] },
        { id: 'ME101', nombre: 'Mecánica', semestre: 3, requisitos: ['FI102'] },

        { id: 'BD101', nombre: 'Bases de Datos', semestre: 4, requisitos: ['PR201'] },
        { id: 'SO101', nombre: 'Sistemas Operativos', semestre: 4, requisitos: ['PR201'] },
        { id: 'ES101', nombre: 'Estadística', semestre: 4, requisitos: ['CI102'] },
    ];
    // --- FIN DE LA CONFIGURACIÓN ---

    const mallaContainer = document.getElementById('malla-curricular');
    const mensajeFlotante = document.getElementById('mensaje-flotante');

    // Cargar ramos aprobados desde localStorage o inicializar un set vacío.
    // Usamos un Set para búsquedas más eficientes (O(1) en promedio).
    let ramosAprobados = new Set(JSON.parse(localStorage.getItem('ramosAprobados')) || []);

    /**
     * Guarda el estado actual de los ramos aprobados en el localStorage del navegador.
     */
    const guardarEstado = () => {
        // Convertimos el Set a un Array para poder guardarlo como JSON.
        localStorage.setItem('ramosAprobados', JSON.stringify([...ramosAprobados]));
    };
    
    /**
     * Muestra un mensaje flotante en la parte inferior de la pantalla.
     * @param {string} texto - El mensaje a mostrar.
     * @param {number} duracion - Duración en milisegundos antes de que el mensaje desaparezca.
     */
    const mostrarMensaje = (texto, duracion = 3000) => {
        mensajeFlotante.textContent = texto;
        mensajeFlotante.classList.remove('oculto');
        setTimeout(() => {
            mensajeFlotante.classList.add('oculto');
        }, duracion);
    };

    /**
     * Genera dinámicamente la estructura HTML de la malla curricular a partir de mallaData.
     */
    const generarMalla = () => {
        // Agrupa los ramos por semestre
        const semestres = mallaData.reduce((acc, ramo) => {
            (acc[ramo.semestre] = acc[ramo.semestre] || []).push(ramo);
            return acc;
        }, {});

        mallaContainer.innerHTML = ''; // Limpiar contenedor
        
        // Crea las columnas para cada semestre
        Object.keys(semestres).sort().forEach(numSemestre => {
            const semestreDiv = document.createElement('div');
            semestreDiv.className = 'semestre';
            
            const titulo = document.createElement('h2');
            titulo.className = 'semestre-titulo';
            titulo.textContent = `Semestre ${numSemestre}`;
            semestreDiv.appendChild(titulo);

            // Crea los elementos de los ramos para el semestre actual
            semestres[numSemestre].forEach(ramo => {
                const ramoDiv = document.createElement('div');
                ramoDiv.className = 'ramo';
                ramoDiv.textContent = ramo.nombre;
                ramoDiv.dataset.id = ramo.id; // Guardamos el ID en un atributo data-*
                semestreDiv.appendChild(ramoDiv);
            });

            mallaContainer.appendChild(semestreDiv);
        });
    };
    
    /**
     * Actualiza el estado visual de todos los ramos (aprobado, bloqueado, normal).
     */
    const actualizarVisuales = () => {
        document.querySelectorAll('.ramo').forEach(ramoDiv => {
            const idRamo = ramoDiv.dataset.id;
            const ramoData = mallaData.find(r => r.id === idRamo);
            
            ramoDiv.classList.remove('aprobado', 'bloqueado');

            // Verifica si los requisitos están cumplidos
            const requisitosCumplidos = ramoData.requisitos.every(reqId => ramosAprobados.has(reqId));
            
            if (ramosAprobados.has(idRamo)) {
                ramoDiv.classList.add('aprobado');
            } else if (!requisitosCumplidos) {
                ramoDiv.classList.add('bloqueado');
            }
        });
    };
    
    /**
     * Maneja el evento de clic en un ramo.
     * @param {Event} e - El objeto del evento de clic.
     */
    const manejarClicRamo = (e) => {
        const ramoDiv = e.target.closest('.ramo');
        if (!ramoDiv) return; // Si no se hizo clic en un ramo, no hacer nada

        const idRamo = ramoDiv.dataset.id;
        const ramoData = mallaData.find(r => r.id === idRamo);

        // Si el ramo está bloqueado, mostrar mensaje y salir
        if (ramoDiv.classList.contains('bloqueado')) {
            const requisitosFaltantes = ramoData.requisitos
                .filter(reqId => !ramosAprobados.has(reqId))
                .map(reqId => mallaData.find(r => r.id === reqId).nombre);
            
            mostrarMensaje(`Requisitos pendientes: ${requisitosFaltantes.join(', ')}`);
            return;
        }

        // Alternar estado: si ya está aprobado, se desaprueba. Si no, se aprueba.
        if (ramosAprobados.has(idRamo)) {
            ramosAprobados.delete(idRamo);
        } else {
            ramosAprobados.add(idRamo);
        }

        guardarEstado();
        actualizarVisuales();
    };

    // --- INICIALIZACIÓN ---
    generarMalla();
    actualizarVisuales();
    mallaContainer.addEventListener('click', manejarClicRamo);

});
