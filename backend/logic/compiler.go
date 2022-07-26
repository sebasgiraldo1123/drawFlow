package logic

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os/exec"
	"strings"
)

// Limita el número de ciclos que se pueden ejecutar para evitar los bucles infinitos y por ende
// la ocupacioón indefinida del servidor en una solictud.
const loopLimiter = 1000

var loops int

/*
	Carga en script.py el código que se envia desde el frontend
*/
func LoadScript(code string) {

	// Pruebas borrar ......
	fmt.Println(".... Cargando")
	fmt.Println(code)

	// Se separa el código en lineas usando el separador y sea agregan a un []byte
	lines := strings.Split(code, "|")
	var ctx = []byte{}

	for _, line := range lines {
		ctx = append(ctx, []byte(line)...)
		ctx = append(ctx, []byte("\n")...)
	}

	// Se reescribe el archivo que contiene el script, si no existe lo crea
	err := ioutil.WriteFile("scripts/script.py", ctx, 0644)
	if err != nil {
		log.Fatal(err)
	}
}

/*
	Ejecuta script.py
*/
func RunScript() (string, string) {

	// Pruebas borrar ......
	fmt.Println(".... Corriendo")

	// Inicia el contador del limitador
	loops = 0

	// Genera una estructura con las lineas del código del script lista para su ejecución
	cmd := exec.Command("python", "scripts/script.py")

	// Abre un canal por el cual se pueden leer todas las salidas de la ejecución
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		panic(err)
	}

	// Abre un canal por el cual se pueden leer los errores si se producen durante la ejecución
	stderr, err := cmd.StderrPipe()
	if err != nil {
		panic(err)
	}

	// Inicia la ejecucion de los comandos
	err = cmd.Start()
	if err != nil {
		panic(err)
	}

	// Hace un llamado recurrente y llena los buffer out y err con la infor que genera la ejecución
	var outBuf bytes.Buffer
	var errBuf bytes.Buffer
	go copyOutput(stdout, &outBuf, cmd)
	go copyOutput(stderr, &errBuf, cmd)

	// Espera a que terminen las goroutinas y cierra los canales y cmd
	cmd.Wait()

	// Se verifica si se excedió el número de ciclos permitidos y se envía el error
	if loops >= loopLimiter {
		errBuf.WriteString("MaxLoopsPermited: The " + fmt.Sprint(loopLimiter) + " cycle limit has been exceeded or an infinite cycle exists")
	}

	return outBuf.String(), errBuf.String()
}

/*
	Llena un buffer con los datos que se transmiten desde su canal específico
	Si llenar el buffer excede el número de ciclos permitidos, mata el proceso
*/
func copyOutput(r io.Reader, out *bytes.Buffer, cmd *exec.Cmd) {

	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		out.WriteString(scanner.Text())
		out.WriteString("\n")

		// limitador de ciclos
		if loops < loopLimiter {
			loops += 1
		} else {
			cmd.Process.Kill()
			return
		}
	}
}
