package database

import (
	"log"

	dgo "github.com/dgraph-io/dgo/v200"
	"github.com/dgraph-io/dgo/v200/protos/api"
	"google.golang.org/grpc"
)

/*
	Abre una conexión por medio del puerto local 9080 con la BD de Dgraph
	Retorna una conexion o nil
*/
func NewClient() *dgo.Dgraph {

	conn, err := grpc.Dial("localhost:9080", grpc.WithInsecure())
	if err != nil {
		log.Fatal(err)
		return nil
	}

	return dgo.NewDgraphClient(api.NewDgraphClient(conn))
}
