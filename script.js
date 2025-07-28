// Espera a que todo el contenido del HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- Definición de Datos de la Malla Curricular ---
    const mallaData = [
        // 1er Semestre
        [
            { id: 'BIOL034', nombre: 'Biología Celular', req: [] },
            { id: 'BIOL035', nombre: 'Lab. Biocel.', req: [] },
            { id: 'DEBD221', nombre: 'Zoología', req: [] },
            { id: 'FMMP003', nombre: 'Matemática', req: [] },
            { id: 'MVET611', nombre: 'Intro. Med. Vet', req: [] },
            { id: 'QUI002', nombre: 'Química', req: [] }
        ],
        // 2do Semestre
        [
            { id: 'BIOL166', nombre: 'Bioquímica', req: ['BIOL034', 'QUI002'] },
            { id: 'CEGHC11', nombre: 'Hab.Comun.', req: [] },
            { id: 'ING119', nombre: 'Inglés I', req: [] },
            { id: 'MVET621', nombre: 'ADO I', req: [] },
            { id: 'MVET622', nombre: 'Cuerpo Animal I', req: ['BIOL035'] }
        ],
        // 3er Semestre
        [
            { id: 'DEBD130', nombre: 'Met.Cuant.RRNN', req: ['FMMP003'] },
            { id: 'ING129', nombre: 'Inglés II', req: ['ING119'] },
            { id: 'MVET631', nombre: 'ADO II', req: ['MVET621'] },
            { id: 'MVET632', nombre: 'Cuerpo Animal II', req: ['MVET622'] },
            { id: 'MVET633', nombre: 'FDO I', req: [] }
        ],
        // 4to Semestre
        [
            { id: 'DEBD140', nombre: 'Eco.General', req: ['DEBD130'] },
            { id: 'ING239', nombre: 'Inglés III', req: ['ING129'] },
            { id: 'MVET176', nombre: 'Genética', req: ['BIOL166'] },
            { id: 'MVET240', nombre: 'Anato.Clínica', req: ['MVET632'] },
            { id: 'MVET641', nombre: 'FDO II', req: ['MVET633'] }
        ],
        // 5to Semestre
        [
            { id: 'DEBD160', nombre: 'Bio.Conservacion', req: ['DEBD140'] },
            { id: 'ING249', nombre: 'Inglés IV', req: ['ING239'] },
            { id: 'MVET192', nombre: 'Farmacología', req: ['MVET176'] },
            { id: 'MVET340', nombre: 'Enf.Org.Acuaticos', req: [] },
            { id: 'MVET651', nombre: 'Anato.Patológica', req: ['MVET240'] },
            { id: 'MVET652', nombre: 'Nutri&Ali.Animal', req: [] }
        ],
        // 6to Semestre
        [
            { id: 'CEGCT12', nombre: 'Raz.Científico', req: [] },
            { id: 'MVET230', nombre: 'Patología Clínica', req: ['MVET651'] },
            { id: 'MVET310', nombre: 'Imagenología', req: ['MVET240'] },
            { id: 'MVET440', nombre: 'Epi&SaludPubl.', req: [] },
            { id: 'MVET661', nombre: 'Reproducción', req: ['MVET632'] }
        ],
        // 7mo Semestre
        [
            { id: 'DEBD161', nombre: 'Manejo F. S', req: ['DEBD160'] },
            { id: 'IAMB662', nombre: 'Legis&Ev.Imp.Amb', req: [] },
            { id: 'MVET671', nombre: 'Inocu. Alimentos', req: ['MVET652'] },
            { id: 'MVET673', nombre: 'Medicina', req: ['MVET192', 'MVET230'] },
            { id: 'MVET674', nombre: 'Sist.Prod.Animal', req: [] }
        ],
        // 8vo Semestre
        [
            { id: 'DEBD180', nombre: 'Form.Proy.RRNN', req: ['DEBD161'] },
            { id: 'MVET280', nombre: 'Cirugía', req: ['MVET673'] },
            { id: 'MVET370', nombre: 'Zoo&Enf.Emerg.', req: [] },
            { id: 'MVET681', nombre: 'Patobio.Molecular', req: ['MVET176'] },
            { id: 'MVET682', nombre: 'Pract.Profesional', req: [] }
        ],
        // 9no Semestre
        [
            { id: 'CEGPC13', nombre: 'Pens.Crítico', req: [] },
            { id: 'MVET691', nombre: 'Etica&Bien.Ani.', req: [] },
            { id: 'MVET692', nombre: 'Inn&Trans.Tecn.', req: [] },
            { id: 'MVET693', nombre: 'Clínica', req: ['MVET280'] },
            { id: 'MVET694', nombre: 'Proyecto Título', req: ['DEBD180'] }
        ],
        // 10mo Semestre
        [
            { id: 'CEGRS14', nombre: 'Respons.Social', req: [] },
            { id: 'MVET695', nombre: 'Electivo.Prof.I', req: [] },
            { id: 'MVET696', nombre: 'Electivo.Prof.II', req: [] },
            { id: 'MVET697', nombre: 'Internado', req: ['MVET693', 'MVET694'] }
        ]
    ];

    const contenedorMalla = document.getElementById('malla-curricular');
    let ramosAprobados = JSON.parse(localStorage.getItem('ramosAprobados')) || {};

    function guardarProgreso() {
        localStorage.setItem('ramosAprobados', JSON.stringify(ramosAprobados));
    }

    function getNombreRamoPorId(id) {
        for (const semestre of mallaData) {
            const ramo = semestre.find(r => r.id === id);
            if (ramo) {
                return ramo.nombre;
            }
        }
        return "Desconocido";
    }

    /**
     * Verifica si un ramo puede ser aprobado.
     * Reglas:
     * 1. Un ramo se desbloquea solo si TODOS los ramos del semestre anterior están aprobados.
     * 2. Además, debe cumplir con sus prerrequisitos específicos.
     * 3. Los ramos del primer semestre siempre están disponibles.
     * @param {object} ramo - El objeto del ramo a verificar.
     * @param {number} semestreIndex - El índice del semestre al que pertenece el ramo (0 para el primero).
     * @returns {boolean} - True si el ramo está desbloqueado, false si no.
     */
    function verificarRequisitos(ramo, semestreIndex) {
        if (semestreIndex === 0) {
            return true;
        }

        const ramosSemestreAnterior = mallaData[semestreIndex - 1];
        const prevSemestreCompleto = ramosSemestreAnterior.every(r => ramosAprobados[r.id]);

        if (!prevSemestre
