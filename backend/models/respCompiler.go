package models

/*
	Estructura básica de la respuesta del compilador
*/
type RespCompiler struct{
	Out string `json:"out"`
	Err string `json:"err"`
}