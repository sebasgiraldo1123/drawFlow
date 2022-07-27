const app = new Vue({

    el: '#app',

    data: {
        info: null,

        // Almacena los programas que se cargan desde el servidor
        programs: [],

        // Guarda el programa que está en ejecución
        program: [],

        // Nombre del programa en ejecución que se muestra en el dropDown
        dropDownProgramName: ""
    },

    methods: {

        // ------------------------------ Solicitudes al Servidor ----------------------------------------

        /**
         * Almacena en un vector todos los programas disponibles en Dgraph
         */
        async listPrograms() {
            let response = await axios.get('http://localhost:9000/listPrograms')
            this.programs = response.data.programs
        },

        /**
         * Encuentra un programa dado su nombre
         */
        async getProgram(programName) {

            let response = await axios.get('http://localhost:9000/getProgram' + '?name=' + programName)
            this.program = response.data.program

            // Se escriben los datos del programa en el editor
            this.writeEditor(this.program[0])
        },

        // -------------------------------- Métodos de Apoyo ---------------------------------------------

        /**
         * Escribe el nombre y el contenido de un programa en el editor
         */
        writeEditor(program) {

            // Asigna el nombre del programa
            document.getElementById("editorName").innerText = program.name

            // Se borra el editorContent
            let editorContent = document.getElementById("editorContent")
            editorContent.value = ""

            // Se escribe linea por linea
            program.content.split("|").forEach(line => {
                editorContent.value += line + "\n"
            });
        }
    },

    // Se ejecuta al cargar la página
    created() {
        this.listPrograms()
    }
})