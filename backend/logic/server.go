package logic

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
)

/*
	Crea la estructura del servidor
*/
type MyServer struct {
	server *http.Server
}

/*
	Crea un nuevo servidor
*/
func NewServer(mux *chi.Mux) *MyServer {
	server := &http.Server{
		Addr:           ":9000",
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	return &MyServer{server}
}

/*
	Arranca el servidor
*/
func (server *MyServer) Run() {
	fmt.Print("Server is running on port 9000")
	log.Fatal(server.server.ListenAndServe())
}
