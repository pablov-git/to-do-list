// Referencias a elementos del DOM

let textoInput = document.getElementById("textoAnyadir");
let botonInput = document.getElementById("botonAnyadir");
let lista = document.getElementById("lista");
let selector = document.getElementById("prioridad");


// Se inicializa la lista de tareas, si ya hay tareas guardadas, se recuperan y se transforman de texto a objeto
// Luego se muestran en la pantalla llamando a rederizarTareas()

let listaTareas = [];
if (localStorage.getItem("listaTareas") != null) {
  listaTareas = JSON.parse(localStorage.getItem("listaTareas"));
  renderizarTareas();
}

// Permite ordenar las tarjetas

new Sortable(lista, 
  {animation:150,
    ghostClass:"sortable-ghost",
    onEnd: function (evt){
      const elementosOrdenados = Array.from(lista.children);
      const nuevoOrdenIds = elementosOrdenados.map(elemento => elemento.dataset.id);
      const nuevoArrayOrdenado = nuevoOrdenIds.map(id => listaTareas.find(tarea => tarea.id === id)).filter(tarea => tarea !== undefined);
      listaTareas = nuevoArrayOrdenado;
      console.log(nuevoArrayOrdenado);
    }
  }
);

// Se llama a eliminar tareas y editarTareas para vincular los eventos onclick con los botones de eliminar y editar

eliminarTareas();
editarTareas();

// Evento onclick para añadir nuevas tareas
// Si el input está vacío, lanza un alert
// Si hay un texto, crea un objeto tarea con id, nombre y prioridad
// Añade el objeto al array listaTareas
// Guarda el array en localStorage (para lo cual hace falta transformarlo en String)
// Inserta el html de la nueva tarea en la lista para que pueda mostrarse en pantalla
// Limpia el input
// Vuelve a llamar a eliminarTareas() para que el nuevo botón de borrar de la nueva tarea funcione

botonInput.onclick = () => {
  if (textoInput.value === "") {
    alert("No ha introducido ningún texto");
  } else {
    if (
      listaTareas.find((tarea) => tarea.nombre == textoInput.value) == undefined
    ) {
      const tarea = {
        id: crypto.randomUUID(),
        nombre: textoInput.value,
        prioridad: selector.value,
      };

      listaTareas.push(tarea);
      localStorage.setItem("listaTareas", JSON.stringify(listaTareas));

      let clasePrioridad =
        tarea.prioridad === "alta"
          ? "red-card"
          : tarea.prioridad === "media"
          ? "orange-card"
          : "green-card";

      lista.innerHTML += `<div class="card ${clasePrioridad}" data-id=${tarea.id}> 
        <span class="texto-tarea">${textoInput.value}</span>
        <div class="acciones">
            <button class="btnEdit" id="${tarea.nombre}"><i class="fa-solid fa-pencil"></i></button>
            <button class="btnDelete" id=${tarea.id}><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;

      textoInput.value = "";
      eliminarTareas();
      editarTareas();
    } else {
      alert("Esa tarea ya existe");
    }
  }
};

// Recorre el array listaTareas y va agregando al HTML una tarjeta para cada una

function renderizarTareas() {
  for (let i = 0; i < listaTareas.length; i++) {
    let tarea = listaTareas[i];

    let clasePrioridad;

    if (tarea.prioridad === "alta") {
      clasePrioridad = "red-card";
    } else if (tarea.prioridad === "media") {
      clasePrioridad = "orange-card";
    } else {
      clasePrioridad = "green-card";
    }

    lista.innerHTML += `<div class="card ${clasePrioridad}" data-id=${tarea.id}> 
            <span class="texto-tarea">${tarea.nombre}</span>
            <div class="acciones">
                <button class="btnEdit" id="${tarea.nombre}"><i class="fa-solid fa-pencil"></i></button>
                <button class="btnDelete" id=${tarea.id}><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
  }
}

//Evento onclick para eliminar tareas
// Se obtiene la lista actualizada de botones .btnDelete congetElementsByClassName
// Es necesario inicilizarlos en esta función porque los botones de eliminar se tienen que crear al añadir nuevas tareas
// Filtra el array para quitar la tarea con el id que corresponde a la tarea que hemos elegido borrar, y mete el array resultante en otro nuevo
// Se actualiza el array listaTareas usando ese nuevo array que hemos filtrado
// Guarda la nueva lista en localStorage para que no vuelva a aparecer la tarea al recargar la página
// Borra el contenido del html de todas las tareas para limpiarlo antes de volver a generarlas con renderizar
// Vuelve a renderizar las tareas (para que el usuario vea cómo se elimina)
// Llama de nuevo a eliminarTareas() para volver a enganchar los botones de eliminar recién creados (al renderizar)

function eliminarTareas() {
  let botonesEliminar = document.getElementsByClassName("btnDelete");
  for (let boton of botonesEliminar) {
    boton.onclick = () => {
      let nuevaLista = listaTareas.filter((tarea) => tarea.id != boton.id);
      listaTareas = nuevaLista;
      localStorage.setItem("listaTareas", JSON.stringify(listaTareas));
      lista.innerHTML = "";
      renderizarTareas();
      eliminarTareas();
    };
  }
}

// Evento onclick para editar tareas
// Se obtiene la lista de botones .btnEdit con getElementsByClassName
// Se recorre la lista y se asigna una función onclick a cada botón de editar
// Al hacer clic, se pide al usuario un nuevo nombre para la tarea mediante prompt (si está vacío, se vuelve a pedir)
// También se pide una nueva prioridad (1, 2 o 3), y se sigue pidiendo mientras no sea válida
// Se comprueba que no exista ya otra tarea con ese mismo nombre para evitar duplicados
// Si no hay duplicados:
//   - Se busca el índice de la tarea actual usando el nombre como identificador
//   - Si se encuentra, se reemplaza esa tarea en el array por una nueva con el nombre y prioridad actualizados
//   - Se guarda la nueva lista en localStorage
//   - Se borra el contenido del HTML para regenerarlo desde cero
//   - Se llama a renderizarTareas() para mostrar las tareas actualizadas
//   - Se llama de nuevo a eliminarTareas() y editarTareas() para reconectar los eventos con los botones generados
// Si ya existe una tarea con ese nombre, se lanza un alert

function editarTareas() {
  let botonesEditar = document.getElementsByClassName("btnEdit");

  for (let boton of botonesEditar) {
    boton.onclick = () => {
      let tareaActualizada = prompt("Edite la tarea " + boton.id);

      if (tareaActualizada === null){
        return;
      }

      while (tareaActualizada == "") {
        tareaActualizada = prompt("Edite la tarea " + boton.id);
      }

      let prioridadActualizada = prompt(
        "Nueva prioridad: 1 - Alta / 2 - Media / 3 - Baja"
      );

      /*
      if (prioridadActualizada === null){
        return;
      }
      */

      while (
        prioridadActualizada != 1 &&
        prioridadActualizada != 2 &&
        prioridadActualizada != 3
      ) {
        prioridadActualizada = prompt(
          "Nueva prioridad: 1 - Alta / 2 - Media / 3 - Baja"
        );

        if (prioridadActualizada === null) {
          return;
        }

      }

      if (
        listaTareas.find((tarea) => tarea.nombre == tareaActualizada) ==
        undefined
      ) {
        let indice = listaTareas.findIndex((tarea) => tarea.nombre == boton.id);
        let objeto = listaTareas[indice];

        if(prioridadActualizada == 1){
          prioridadActualizada = "alta";
        }else if(prioridadActualizada == 2){
          prioridadActualizada = "media";
        }else if(prioridadActualizada == 3){
          prioridadActualizada = "baja";
        }

        if (indice != -1) {
          listaTareas.splice(indice, 1, {
            ...objeto,
            nombre: tareaActualizada,
            prioridad: prioridadActualizada,
          });

          localStorage.setItem("listaTareas", JSON.stringify(listaTareas));
          lista.innerHTML = "";
          
          renderizarTareas();
          eliminarTareas();
          editarTareas();
        } else {
          console.log(listaTareas);
          alert("Tarea inexistente");
        }
      } else {
        alert("Esa tarea ya existe");
      }
    };
  }
}
