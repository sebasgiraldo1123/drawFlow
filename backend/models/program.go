package models

/*
	Estructura básica de un programa
*/
type Program struct{
	Name string `json:"name"`
	Content string `json:"content"`
  Nodes string `json:"nodes"`
}

/*
	Estructura de un conjunto de programas
*/
type Programs struct{
	Programs []Program `json:"program"`
}


/*

{
  "data": {
    "program": [
      {
        "name": "programa",
        "content": "print(3)"
      },
      {
        "name": "programa_2",
        "content": "print(4)"
      }
    ]
  }
}

*/