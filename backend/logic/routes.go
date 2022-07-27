package logic

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/dgraph-io/dgo/v200/protos/api"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/sebasgiraldo1123/drawFlow/backend/database"
	"github.com/sebasgiraldo1123/drawFlow/backend/models"
)

/*
	Configura un enrutador con sus rutas predeterminadas
*/
func Route() *chi.Mux {

	// Define un nuevo enrutador
	mux := chi.NewMux()

	// Inicialización de parámetros
	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	// El middleware conecta el backend y frontend permitiendo que la data pase entre ellos
	mux.Use(
		middleware.Logger,
		middleware.Recoverer,
		cors.Handler,
	)

	// Modifica el esquema para permitir las consultas con filtros
	alterSchema()

	// Definición de rutas "End Points" urls sobre las que se hace la petición desde el frontend
	mux.Get("/listPrograms", listPrograms)
	mux.Get("/getProgram", getProgram)
	mux.Post("/saveProgram", saveProgram)
	mux.Get("/runProgram", runProgram)

	return mux
}

/*
	Genera un JSON con todos los programas almacenados en la BD para poderlos listar en el frontend
*/
func listPrograms(w http.ResponseWriter, r *http.Request) {

	// Genera el encabezado de la respuesta
	w.Header().Set("Content-Type", "application/json")

	// Establece un cliente dGraph
	client := database.NewClient()
	txn := client.NewTxn()

	// Estructura de la Query
	q := `
	{
		programs(func: has(name))
		{
			name
			content
		}
	}`

	// Envia la Query a la BD
	resp, err := txn.Query(context.Background(), q)

	// Si no existe error envia la respuesta
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("")
	w.Write(resp.Json)
}

/*
	Genera un JSON con el contenido del programa indicado
*/
func getProgram(w http.ResponseWriter, r *http.Request) {

	// Genera el encabezado de la respuesta
	w.Header().Set("Content-Type", "application/json")

	// Establece un cliente dGraph
	client := database.NewClient()
	txn := client.NewTxn()

	// Se obtiene el nombre del programa a buscar
	// Se recupera la data del form enviado por el frontend por el request
	r.ParseForm()
	name := r.FormValue("name")

	// Pruebas borrar ......
	fmt.Println("")
	fmt.Println("Buscando: ", name)

	// Estructura de la Query
	q := `
	query getProgram($name: string)
	{
		program(func: eq(name, $name)) 
		{
			name
			content
		}
	}`

	// Envia la Query a la BD con un mapa que contiene la variable
	resp, err := txn.QueryWithVars(context.Background(), q, map[string]string{"$name": name})

	// Si no existe error envia la respuesta
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("")
	w.Write(resp.Json)
}

/*
	Almacena la información de un programa en la BD
*/

func saveProgram(w http.ResponseWriter, r *http.Request) {

	// Genera el encabezadod de la respuesta
	w.Header().Set("Content-Type", "application/json")

	// Establece un cliente dGraph
	client := database.NewClient()
	txn := client.NewTxn()

	// Se recupera la data del form enviado por el frontend por el request
	r.ParseForm()

	name := r.FormValue("name")
	content := r.FormValue("content")

	// Almacena en P los datos a almacenar en formato preestablecido por el modelo
	p := models.Program{
		Name:    name,
		Content: content,
	}

	// Pruebas Borrar ...........
	fmt.Println("")
	fmt.Println("Se guardó el programa ....")

	// Lee la clave-valor desde el form-encoded request body de postman !!!!
	r.ParseForm()
	fmt.Println("name : ", name)
	fmt.Println("content :", content)
	fmt.Println("...")
	// Pruebas Borrar ...........

	// Genera el JSON
	pb, err := json.Marshal(p)

	if err != nil {
		log.Fatal(err)
	}

	// Genera una mutación para Dgraph
	mu := &api.Mutation{
		SetJson: pb,
	}

	// Envia la solicitud de mutación a la BD
	req := &api.Request{CommitNow: true, Mutations: []*api.Mutation{mu}}
	resp, err := txn.Do(context.Background(), req)
	if err != nil {
		log.Fatal(err)
	}

	// Si no existe error envia la respuesta
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("")
	w.Write(resp.Json)
}

/*
	Busca el programa dentro de la BD
	lo ejecuta y devuelve el resultado como un JSON
*/
func runProgram(w http.ResponseWriter, r *http.Request) {

	// Genera el encabezado de la respuesta
	w.Header().Set("Content-Type", "application/json")

	// Establece un cliente dGraph
	client := database.NewClient()
	txn := client.NewTxn()

	// Se encuentra el nombre del programa en la solicitud
	name := "programa_2"

	// Pruebas borrar ......
	fmt.Println("")
	fmt.Println(".... Buscando : ", name)

	// Estructura de la Query
	q := `
	query getProgram($name: string)
	{
		program(func: eq(name, $name)) 
		{
			name
			content
		}
	}`

	// Envia la Query a la BD con un mapa que contiene la variable
	resp, err := txn.QueryWithVars(context.Background(), q, map[string]string{"$name": name})

	if err != nil {
		log.Fatal(err)
	}

	// Decodifica el JSON de la resp para encontrar el codigo del programa solicitado
	var codeMap models.Programs

	err = json.Unmarshal([]byte(resp.Json), &codeMap)

	if err != nil {
		log.Fatal(err)
	}

	// Obtiene el código del programa
	code := codeMap.Programs[0].Content

	// Carga el codigo en script.py
	LoadScript(code)

	// Ejecuta el código y obtiene el buffer de respuesta "out" y errores "err"
	out, errores := RunScript()

	// Pruebas borrar ......
	fmt.Println(out, errores)

	// Se estructuran la salida y los errores
	p := models.RespCompiler{
		Out: out,
		Err: errores,
	}

	// Se genera un json y se envia como respuesta
	pb, err := json.Marshal(p)

	if err != nil {
		log.Fatal(err)
	}

	w.Write(pb)
}

/*
	Modifica el esquema y agrega indice en el predicado "name" para permitir las consultas filtradas
*/
func alterSchema() {

	// Define el esquema
	op := &api.Operation{}
	op.Schema = `
	name: string @index(exact) .
	content: string .
	`
	// Establece un cliente dGraph
	client := database.NewClient()

	// Modifica el esquema
	err := client.Alter(context.Background(), op)

	if err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("Schema Updated")
	}
}
