package main

import (
	"fmt"
	"github.com/sebasgiraldo1123/drawFlow/backend/logic"
)

func main() {

	fmt.Println("Initializing Server...")
	mux := logic.Route()
	server := logic.NewServer(mux)
	server.Run()
}
