package models

/*
	Estructura básica de un programa
*/
type Program struct{
	Name string `json:"name"`
	Content string `json:"content"`
}

/*
	Estructura de un conjunto de programas
*/
type Programs struct{
	Programs []Program `json:"program"`
}