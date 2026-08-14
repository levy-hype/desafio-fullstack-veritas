package main

import "sync"

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

const (
	StatusTodo       = "todo"
	StatusInProgress = "in_progress"
	StatusDone       = "done"
)

var validStatuses = map[string]bool{
	StatusTodo:       true,
	StatusInProgress: true,
	StatusDone:       true,
}

var (
	tasks  = []Task{}
	nextID = 1
	mu     sync.Mutex
)

func isValidStatus(status string) bool {
	return validStatuses[status]
}
