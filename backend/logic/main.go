package main

import (
	"fmt"
	"github.com/sebasgiraldo1123/drawFlow/internal/database"
)

func main() {
	client := database.NewClient()
	fmt.Println(client)
}
