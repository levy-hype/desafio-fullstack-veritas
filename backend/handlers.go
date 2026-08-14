package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, statusCode int, message string) {
	respondJSON(w, statusCode, map[string]string{
		"error": message,
	})
}

// GET /tasks
// POST /tasks
func tasksHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	switch r.Method {
	case http.MethodGet:
		getTasks(w, r)

	case http.MethodPost:
		createTask(w, r)

	default:
		respondError(w, http.StatusMethodNotAllowed, "Método não permitido")
	}
}

// PUT /tasks/{id}
// DELETE /tasks/{id}
func taskHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	idString := strings.TrimPrefix(r.URL.Path, "/tasks/")

	id, err := strconv.Atoi(idString)
	if err != nil {
		respondError(w, http.StatusBadRequest, "ID inválido")
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateTask(w, r, id)

	case http.MethodDelete:
		deleteTask(w, r, id)

	default:
		respondError(w, http.StatusMethodNotAllowed, "Método não permitido")
	}
}

func getTasks(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	respondJSON(w, http.StatusOK, tasks)
}

func createTask(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if strings.TrimSpace(input.Title) == "" {
		respondError(w, http.StatusBadRequest, "Título é obrigatório")
		return
	}

	if input.Status == "" {
		input.Status = StatusTodo
	}

	if !isValidStatus(input.Status) {
		respondError(w, http.StatusBadRequest, "Status inválido")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	task := Task{
		ID:          nextID,
		Title:       strings.TrimSpace(input.Title),
		Description: strings.TrimSpace(input.Description),
		Status:      input.Status,
	}

	tasks = append(tasks, task)
	nextID++

	respondJSON(w, http.StatusCreated, task)
}

func updateTask(w http.ResponseWriter, r *http.Request, id int) {
	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		respondError(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if strings.TrimSpace(input.Title) == "" {
		respondError(w, http.StatusBadRequest, "Título é obrigatório")
		return
	}

	if !isValidStatus(input.Status) {
		respondError(w, http.StatusBadRequest, "Status inválido")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			tasks[i].Title = strings.TrimSpace(input.Title)
			tasks[i].Description = strings.TrimSpace(input.Description)
			tasks[i].Status = input.Status

			respondJSON(w, http.StatusOK, tasks[i])
			return
		}
	}

	respondError(w, http.StatusNotFound, "Tarefa não encontrada")
}

func deleteTask(w http.ResponseWriter, r *http.Request, id int) {
	mu.Lock()
	defer mu.Unlock()

	for i := range tasks {
		if tasks[i].ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)

			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	respondError(w, http.StatusNotFound, "Tarefa não encontrada")
}
