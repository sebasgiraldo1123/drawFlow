var id = document.getElementById("drawflow"); // Contenedor principal del editor de nodos
var content_text = document.getElementById("content_text"); // Area de texto donde se escribe el código de los programas

const editor = new Drawflow(id);
editor.reroute = true;

const dataToImport = {
    "drawflow": {
        "Home": {
            "data": {}
        }
    }
}

editor.start();

// ----------------- Eventos --------------------

editor.on('nodeCreated', function (id) {
    console.log("Node created " + id);

    /***/
    formatNodes();
})

editor.on('nodeRemoved', function (id) {
    console.log("Node removed " + id);

    /***/
    formatNodes();
})

editor.on('nodeSelected', function (id) {
    console.log("Node selected " + id);

    /***/
    formatNodes();
})

editor.on('moduleCreated', function (name) {
    console.log("Module Created " + name);

    /***/
    formatNodes();
})

editor.on('moduleChanged', function (name) {
    console.log("Module Changed " + name);

    /***/
    formatNodes();
})

editor.on('connectionCreated', function (connection) {
    //console.log('Connection created');
    //console.log(connection);

    /***/
    formatNodes();
})

editor.on('connectionRemoved', function (connection) {
    //console.log('Connection removed');
    //console.log(connection);

    /***/
    formatNodes();
})

editor.on('mouseMove', function (position) {
    //console.log('Position mouse x:' + position.x + ' y:' + position.y);
})

editor.on('nodeMoved', function (id) {
    //console.log("Node moved " + id);
})

editor.on('zoom', function (zoom) {
    //console.log('Zoom level ' + zoom);
})

editor.on('translate', function (position) {
    //console.log('Translate x:' + position.x + ' y:' + position.y);
})

editor.on('addReroute', function (id) {
    //console.log("Reroute added " + id);
})

editor.on('removeReroute', function (id) {
    //console.log("Reroute removed " + id);
})

// ----------------------- Acciones del mouse --------------------------

var elements = document.getElementsByClassName('drag-drawflow');
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('touchend', drop, false);
    elements[i].addEventListener('touchmove', positionMobile, false);
    elements[i].addEventListener('touchstart', drag, false);
}

var mobile_item_selec = '';
var mobile_last_move = null;
function positionMobile(ev) {
    mobile_last_move = ev;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    if (ev.type === "touchstart") {
        mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
    } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    }
}

function drop(ev) {
    if (ev.type === "touchend") {
        var parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
        if (parentdrawflow != null) {
            addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
        }
        mobile_item_selec = '';
    } else {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    }
}

/**
 * Se llama cuando se suelta un nodo en una posición determinada
 * @param {*} name nombre del nodo
 * @param {*} pos_x 
 * @param {*} pos_y 
 * @returns 
 */
function addNodeToDrawFlow(name, pos_x, pos_y) {
    if (editor.editor_mode === 'fixed') {
        return false;
    }
    pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));


    switch (name) {

        case 'variable':
            var variableTemplate = `
                <div>
                  <div class="title-box"><i class="fas fa-code"></i> Variable</div>
                  <div class="box">
                    <p>enter name</p>
                    <input type="text" df-name>
                    <p>enter value</p>
                    <input type="text" df-value>
                    <p>select type</p>
                    <select df-type>
                        <option value="number">number</option>
                        <option value="string">string</option>
                        <option value="assign">other</option>
                    </select>
                  </div>
                </div>
                `;
            editor.addNode('variable', 0, 1, pos_x, pos_y, 'variable', { "name": '', "value": '', "type": 'number' }, variableTemplate);
            break;

        case 'print':
            var printTemplate = `
            <div>
              <div class="title-box"><i class="fas fa-code"></i> Print Message</div>
              <div class="box">
                <div class="row">
                    <div class="col-3">
                        <p>print</p>
                    </div>
                    <div class="col-8">
                        <input type="text" df-argument style="width: 112px;">
                    </div>
                </div>
              </div>
            </div>
            
            `;
            editor.addNode('print', 1, 1, pos_x, pos_y, 'print', { "argument": '' }, printTemplate);
            break;

        case 'math':
            var mathTemplate = `
                    <div>
                      <div class="title-box"><i class="fas fa-code"></i> Math</div>
                      <div class="box">
                        <p>select operation</p>
                        <select df-operation>
                            <option value="+">addition</option>
                            <option value="-">substraction</option>
                            <option value="*">multiplication</option>
                            <option value="/">division</option>
                        </select>
                      </div>
                    </div>
                    `;
            editor.addNode('math', 2, 1, pos_x, pos_y, 'math', { "operation": '+' }, mathTemplate);
            break;

        case 'conditional':
            var conditionalTemplate = `
                    <div>
                      <div class="title-box"><i class="fas fa-code"></i> Conditional</div>
                      <div class="box">
                        <div class="row">
                            <div class="col-1">
                                <p>if</p>
                            </div>
                            <div class="col-8">
                                <input type="text" df-condition style="width: 112px;">
                            </div>
                            <div class="col-1">
                                <p>:</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <p>else:</p>
                            </div>
                        </div>
                      </div>
                      </div>
                    </div>
                    `;
            editor.addNode('conditional', 2, 0, pos_x, pos_y, 'conditional', { "condition": '' }, conditionalTemplate);
            break;

        case 'loop':
            var loopTemplate = `
                    <div>
                      <div class="title-box"><i class="fas fa-code"></i> Loop</div>
                      <div class="box">
                        <div class="row">
                            <div class="col-4">
                                <select df-operation style="width: 64px;">
                                    <option value="for">for</option>
                                    <option value="while">while</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <input type="text" df-condition style="width: 83px;">
                            </div>
                            <div class="col-1">
                                <p>:</p>
                            </div>
                        </div>
                      </div>
                      </div>
                    </div>
                    `;
            editor.addNode('loop', 1, 0, pos_x, pos_y, 'loop', { "condition": '', "operation": 'for' }, loopTemplate);
            break;

        default:
    }
}

/**
 * Formatea el JSON que entrega el DrawFlow
 * Escribe el código linea por linea dentro del Content-text 
 */
function formatNodes() {

    // Se borra el contenido
    content_text.value = "";

    // Almacena los nodos que son excluidos por escribirse dentro de un condicional o bucle
    let excludedNodes = [];
    Object.values(editor.export().drawflow.Home.data).forEach(node => {

        if (node.name == "conditional") {
            let inputs_e1 = node.inputs.input_1.connections;
            let inputs_e2 = node.inputs.input_2.connections;

            // Excluyendo nodos del if
            if (inputs_e1.length != 0) {
                inputs_e1.forEach(connection => {
                    excludedNodes.push(connection.node);
                });
            }

            // Excluyendo nodos del else
            if (inputs_e2.length != 0) {
                inputs_e2.forEach(connection => {
                    excludedNodes.push(connection.node);
                });
            }
        }

        if (node.name == "loop") {
            let inputs_e3 = node.inputs.input_1.connections;

            // Excluyendo nodos del bucle
            if (inputs_e3.length != 0) {
                inputs_e3.forEach(connection => {
                    excludedNodes.push(connection.node);
                });
            }
        }
    });

    // Recorre primero las variables que no se encuentran dentro de un condicional o un bucle
    Object.values(editor.export().drawflow.Home.data).forEach(node => {
        if (!excludedNodes.includes(node.id.toString()) && node.name == "variable") {
            formatNode(node);
        }
    });

    // Recorre los nodos existentes excluyendo los que se encuentran dentro de un condicional o un loop y las variables
    Object.values(editor.export().drawflow.Home.data).forEach(node => {
        if (!excludedNodes.includes(node.id.toString()) && node.name != "variable") {
            formatNode(node);
        }
    });

    content_number();
}


/**
 * Convierte el nodo en texto entendible por el interprete de Python
 * @param {*} node objeto que contiene toda la información de un nodo en particular
 */
function formatNode(node) {

    switch (node.name) {
        case 'variable':
            if (node.data.name != "" && node.data.value != "") {
                if (node.data.type == "string") {
                    content_text.value += node.data.name + "='" + node.data.value + "'" + "\n";
                }
                else {
                    content_text.value += node.data.name + "=" + node.data.value + "\n";
                }
            }
            break;

        case 'print':
            let inputs_p = node.inputs.input_1.connections;
            if (inputs_p.length != 0) {

                let print = "print(";

                inputs_p.forEach(connection => {
                    let connectedNode = editor.getNodeFromId(connection.node);

                    // Imprime variables
                    if (connectedNode.name == "variable") {
                        print += connectedNode.data.name + ",";
                    }

                    // Imprime una operación matemática
                    if (connectedNode.name == "math") {
                        let inputs_m1 = connectedNode.inputs.input_1.connections;
                        let inputs_m2 = connectedNode.inputs.input_2.connections;
                        if (inputs_m1.length != 0 && inputs_m2.length != 0) {

                            let op_1 = editor.getNodeFromId(inputs_m1[0].node).data.name;
                            let op_2 = editor.getNodeFromId(inputs_m2[0].node).data.name;

                            print += op_1 + connectedNode.data.operation + op_2 + ",";
                        }
                    }
                });

                print = print.slice(0, print.length - 1); // Elimino la última coma "," que no es necesario
                print += ")" + "\n";
                content_text.value += print;
            }
            else {
                content_text.value += "print(" + node.data.argument + ")" + "\n";
            }
            break;

        case 'conditional':
            let inputs_c1 = node.inputs.input_1.connections;
            let inputs_c2 = node.inputs.input_2.connections;

            if (inputs_c1.length != 0) {
                content_text.value += "if " + node.data.condition + ":" + "\n";

                inputs_c1.forEach(connection => {
                    let if_Node = editor.getNodeFromId(connection.node);
                    content_text.value += "   ";
                    formatNode(if_Node);
                });

                if (inputs_c2.length != 0) {
                    content_text.value += "else:" + "\n";

                    inputs_c2.forEach(connection => {
                        let else_Node = editor.getNodeFromId(connection.node);
                        content_text.value += "   ";
                        formatNode(else_Node);
                    });
                }
            }
            break;

        case 'loop':
            let inputs_l = node.inputs.input_1.connections;

            if (inputs_l.length != 0) {
                content_text.value += node.data.operation + " " + node.data.condition + ":" + "\n";

                inputs_l.forEach(connection => {
                    let loop_Node = editor.getNodeFromId(connection.node);
                    content_text.value += "   ";
                    formatNode(loop_Node);
                });
            }
            break;

        default:
    }
}

//let objeto = editor.export();
//console.log(objeto.drawflow.Home.data)
//console.log(Object.keys(objeto.drawflow.Home.data).length)

//console.log(JSON.stringify(editor.export(), null, 4));

//content_text.value = editor.getNodeFromId('1').data.name
//content_text.value = editor.getNodesFromName("variable");
//formatNodes(JSON.stringify(editor.export(), null, 4));



var transform = '';
function showpopup(e) {
    e.target.closest(".drawflow-node").style.zIndex = "9999";
    e.target.children[0].style.display = "block";
    //document.getElementById("modalfix").style.display = "block";

    //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
    transform = editor.precanvas.style.transform;
    editor.precanvas.style.transform = '';
    editor.precanvas.style.left = editor.canvas_x + 'px';
    editor.precanvas.style.top = editor.canvas_y + 'px';
    console.log(transform);

    //e.target.children[0].style.top  =  -editor.canvas_y - editor.container.offsetTop +'px';
    //e.target.children[0].style.left  =  -editor.canvas_x  - editor.container.offsetLeft +'px';
    editor.editor_mode = "fixed";
}

function closemodal(e) {
    e.target.closest(".drawflow-node").style.zIndex = "2";
    e.target.parentElement.parentElement.style.display = "none";
    //document.getElementById("modalfix").style.display = "none";
    editor.precanvas.style.transform = transform;
    editor.precanvas.style.left = '0px';
    editor.precanvas.style.top = '0px';
    editor.editor_mode = "edit";
}

function changeModule(event) {
    var all = document.querySelectorAll(".menu ul li");
    for (var i = 0; i < all.length; i++) {
        all[i].classList.remove('selected');
    }
    event.target.classList.add('selected');
}

function changeMode(option) {
    //console.log(lock.id);
    if (option == 'lock') {
        lock.style.display = 'none';
        unlock.style.display = 'block';
    } else {
        lock.style.display = 'block';
        unlock.style.display = 'none';
    }

}