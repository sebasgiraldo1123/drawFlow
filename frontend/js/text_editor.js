const drawFlowEditor = new Vue({

    el: '#editor',

    data: {
        info: null,

        // Almacena los programas que se cargan desde el servidor
        programs: [],

        // Guarda el programa que está en ejecución
        program: [],
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
         * Guarda un programa en la base de datos
         */
        async saveProgram() {

            try {
                // Obtiene los datos del programa
                let name = document.getElementById("program_label").innerHTML
                let content = this.formatContent(document.getElementById("content_text").value)
                let nodes = editor.export()

                // Se formatea el contenido para evitar problemas con las comillas dobles y el + que se toma como 
                //concatenación dentro del código del servidor
                content = content.replaceAll(/["]+/g, "'")
                content = content.replaceAll("+", "@")

                let stringConvert = JSON.stringify(nodes)
                nodes = window.btoa(window.encodeURIComponent(stringConvert))


                if (name != "" && content != "") {
                    if (this.existProgram(name)) {
                        await axios.get('http://localhost:9000/updateProgram' + '?name=' + name + '&content=' + content + '&nodes=' + nodes)
                    }
                    else {
                        await axios.get('http://localhost:9000/saveProgram' + '?name=' + name + '&content=' + content + '&nodes=' + nodes)
                    }
                }
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

                // Obtiene el nombre del programa que se desea correr
                let name = document.getElementById("program_label").innerText

                if (name != "") {

                    // Guarda el programa antes de correrlo
                    await this.saveProgram()

                    let response = await axios.get('http://localhost:9000/runProgram' + '?name=' + name)
                    document.getElementById("terminal_text").value = response.data.out + response.data.err
                }
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

            // Importo la información de los nodos en el editor
            let decode = window.decodeURIComponent(window.atob(program.nodes))

            editor.import(JSON.parse(decode))

            // Asigna el nombre del programa
            document.getElementById("program_label").innerText = program.name

            // Se borra el content_text y el content_number
            let content_text = document.getElementById("content_text")
            content_text.value = ""

            let content_number = document.getElementById("content_number")
            content_number.value = ""

            let number_line = 1

            // Se formatea lo que se trae del servidor
            program.content = program.content.replaceAll("@", "+")

            // Se escribe linea por linea
            program.content.split("|").forEach(line => {
                content_text.value += line + "\n"
                content_number.value += ">>" + number_line + "\n"
                number_line += 1
            });
        },

        /**
         * Formatea el contenido del programa agregando "|" en cada Salto de linea
         */
        formatContent(content) {

            let formated = ""
            let lines = content.split('\n')
            lines.forEach(line => {
                formated += line + "|"
            });
            return formated.slice(0, formated.length - 1); // Elimina el último "|" que no es necesario
            //return formated
        },

        /**
         * Genera un programa nuevo con el nombre dado por el usuario
         */
        newProgram() {

            // Verifica si el nombre del programa ya existe
            let newName = document.getElementById("newProgram_input").value
            if (newName != "") {
                if (!this.existProgram(newName)) {
                    document.getElementById("program_label").innerText = newName
                    document.getElementById("content_text").value = ""
                    document.getElementById("terminal_text").value = "Welcome to Drawflow by sebasgiraldo1123"
                    editor.clear()
                }
                else {
                    window.alert(newName + " exist !!");
                }
            }
        },

        /**
         * Verifica si existe un programa dado su nombre
         * @return true or false
         */
        existProgram(name) {

            // Actualiza la lista de programas
            this.listPrograms()

            let exist = false
            this.programs.forEach(program => {
                if (program.name == name) {
                    exist = true
                }
            });
            return exist
        }
    },

    // Se ejecuta al cargar la página
    created() {
        this.listPrograms()
    }
})

/**
* Detecta los cambios del código y numera las lineas escritas
*/
function content_number() {
    let content = document.getElementById("content_text");
    let content_number = document.getElementById("content_number");
    content_number.value = ""

    let number_line = 1

    content.value.split("\n").forEach(line => {
        content_number.value += ">>" + number_line + "\n"
        number_line += 1
    });
}