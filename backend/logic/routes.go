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
		AllowedMethods:   []string{"GET", "POST"},
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

	// Definición de rutas "End Points" urls sobre las que se hace la petición desde el frontend
	mux.Get("/listPrograms", listPrograms)
	mux.Post("/saveProgram", saveProgram)

	return mux
}

/*
	Genera un JSON con todos los programas almacenados en la BD para poderlos listar en el frontend
*/
func listPrograms(w http.ResponseWriter, r *http.Request) {

	// Genera el encabezadod de la respuesta
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
		Name: name,
		Content:  content,
	}
	
	// Pruebas Borrar ...........
	fmt.Println("")
	fmt.Println("Se guardo el programa ....")

	// Lee la clave-valor desde el form-encoded request body de postman !!!!
	r.ParseForm()
	fmt.Println("name : ", name)
	fmt.Println("content :", content)
	fmt.Println("Info....")
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
