package models

/*
	Estructura básica de un programa en Python
*/
type Program struct{
	Name string `json:"name"`
	Content string `json:"content"`
}