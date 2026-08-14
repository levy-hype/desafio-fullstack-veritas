package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/tasks", tasksHandler)
	mux.HandleFunc("/tasks/", taskHandler)

	port := ":8080"

	fmt.Printf("Servidor iniciado em http://localhost%s\n", port)

	err := http.ListenAndServe(port, mux)
	if err != nil {
		log.Fatal(err)
	}
}
