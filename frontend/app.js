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
            try {
                let response = await axios.get('http://localhost:9000/listPrograms')
                this.programs = response.data.programs
            }
            catch (error) {
                console.log(error.message)
            }
        },

        /**
         * Encuentra un programa dado su nombre
         */
        async getProgram(programName) {
            try {
                let response = await axios.get('http://localhost:9000/getProgram' + '?name=' + programName)
                this.program = response.data.program

                // Se escriben los datos del programa en el editor
                this.writeEditor(this.program[0])
            }
            catch (error) {
                console.log(error.message)
            }
        },

        /**
         * Guarda un programa válido en la base de datos
         */
        async saveProgram() {

            try {
                // ---------- Falta el nombre repetido ---------------
                let name = document.getElementById("saveProgramName").value
                let content = this.formatContent(document.getElementById("saveProgramContent").value)

                let response = await axios.post('http://localhost:9000/saveProgram' + '?name=' + name + '&content=' + content)
            }
            catch (error) {
                console.log(error.message)
            }
        },

        /**
         * Corre el programa cargado en el editor y escribe el resultado en el terminal
         */

        async runProgram() {

            try {
                let name = document.getElementById("editorName").innerText
                let response = await axios.get('http://localhost:9000/runProgram' + '?name=' + name)

                document.getElementById("editorTerminal").value = response.data.out + response.data.err
            }
            catch (error) {
                console.log(error.message)
            }
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
        },

        /**
         * Formatea el contenido del programa agregando "|" en cada Salto de linea
         */
        formatContent(content){

            let formated = ""
            let lines = content.split('\n')
            lines.forEach(line => {
                formated += line + "|"
            });
            return formated
        }
    },

    // Se ejecuta al cargar la página
    created() {
        this.listPrograms()
    }
})