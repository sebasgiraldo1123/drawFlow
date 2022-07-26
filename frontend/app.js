const app = new Vue({

    el: '#app',
    
    data: {
        info: null,

        // Almacena los programas que se cargan desde el servidor
        programs: [],

        // Guarda el programa que está en ejecución
        program: []
    },

    methods:{

        // Solicita al servidor todos los programas disponibles en Dgraph
        async listPrograms(){
            let response = await axios.get('http://localhost:9000/listPrograms')
            this.programs = response.data.programs
        },

        async getProgram(){
            let response = await axios.get('http://localhost:9000/getProgram')
            this.program = response.data.program
            console.log(this.program.name)
        }

    },

    // Se ejecuta al cargar la página
    created(){
        this.listPrograms()
    }
})