const SIGNIN = document.querySelector("#signin");
const SIGNUP = document.querySelector("#signup");
const MENU = document.querySelector("#menu");
const KEYWORD = document.querySelector("#keyword");
const UBICACION = document.querySelector("#ubicacion");
const BUSCAR = document.querySelector("#btn");
const RESET = document.querySelector("#btnReset");
const RESULT = document.querySelector("#result");

// FUNCIONES
function search() { 
  const options = { 
    method: 'GET',
    mode: 'cors',
    headers:{
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
  }

  UBICACION.value = UBICACION.value.trim()
  KEYWORD.value = KEYWORD.value.trim()
  
  if (UBICACION.value == "") {
      fetch(`https://stormy-cliffs-44487.herokuapp.com/search/${"nada"}/${KEYWORD.value}`, options)
      .then(res => res.json())
      .then(res => {
        document.querySelectorAll(".oferta").forEach(el => el.remove())
        res.map(el => pintar(el))
      })
      .catch(err => console.log("Algo va mal...", err))
  }
  else {
    fetch(`https://stormy-cliffs-44487.herokuapp.com/search/${UBICACION.value}/${KEYWORD.value}`, options)
      .then(res => res.json())
      .then(res => {
        document.querySelectorAll(".oferta").forEach(el => el.remove())
        res.map(el => pintar(el))
      })
      .catch(err => console.log("Algo va mal...", err))
  }
}

function pintar(data) {
  let div = document.createElement("div");
  div.setAttribute("class", "oferta")

  let h2 = document.createElement("a")
  let title = document.createTextNode(data.titulo)
  h2.setAttribute("target", "_blank")
  h2.setAttribute("href", data.url)
  h2.appendChild(title)
  div.appendChild(h2)

  let text = document.createElement("h3")
  let resm = document.createTextNode(data.resumen)
  text.appendChild(resm)
  div.appendChild(text)

  RESULT.appendChild(div)
  
  if (localStorage.getItem("token")) {
    if (data.ok) {
      let btnD = document.createElement("img")
      btnD.setAttribute("src", "../assets/heart-solid.svg")
      div.appendChild(btnD)

      btnD.addEventListener("click", async ()=> {
        await deleteFav2(data) 
        await search()
      })

    } else if (!data.ok || data.ok == null) {
      let btnS = document.createElement("img")
      btnS.setAttribute("src", "../assets/heart-regular.svg")
      div.appendChild(btnS)
  
      btnS.addEventListener("click", async ()=> {
        await guardarFav(data)
        await search()
      })
    }
  }
}

function logout() {
  fetch("https://stormy-cliffs-44487.herokuapp.com/signout", {
    method: 'PUT',
    headers: {
        'authorization': localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 406) {
        console.log(data.data);
      }
      else if (data.status === 200) {
        localStorage.setItem('token', "")
        alert(data.data)
        window.location.reload()
      }
      else if (data.status === 401) {
        console.log(data.data);
      }
    })
    .catch(err => console.log(err))
}

async function botones () {
  await SIGNIN.remove()
  await SIGNUP.remove()

  let btnFav = document.createElement("div")
  btnFav.setAttribute("class", "favoritos")
  let contA = document.createTextNode("FAVORITOS")
  btnFav.appendChild(contA)
  MENU.appendChild(btnFav)

  let btnOut = document.createElement("div")
  btnOut.setAttribute("class", "logout")
  let contB = document.createTextNode("LOGOUT")
  btnOut.appendChild(contB)
  MENU.appendChild(btnOut)

  btnFav.addEventListener("click", ()=> verFav())

  btnOut.addEventListener("click", ()=> logout())
}

function verFav() {
  const options = { 
    method: 'GET',
    headers:{
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
  }
  fetch("https://stormy-cliffs-44487.herokuapp.com/favorites/get", options)
    .then(res => res.json())
    .then(res => {
      if (res.status === 400) {
        console.log(res.data);
      }
      else if (res.length == 0) {
        document.querySelectorAll(".oferta").forEach(el => el.remove())
      }
      else {
        res.map(el => pintarFav(el))
      }
    })
    .catch(err => console.log("Algo va mal...", err))
}

async function pintarFav(data) {
    await document.querySelectorAll(".oferta").forEach(el => el.remove())
  
    let div = document.createElement("div");
    div.setAttribute("class", "oferta")
  
    let h2 = document.createElement("a")
    let title = document.createTextNode(data.titulo)
    h2.setAttribute("href", data.url)
    h2.setAttribute("target", "_blank")
    h2.appendChild(title)
    div.appendChild(h2)
  
    let text = document.createElement("h3")
    let resm = document.createTextNode(data.resumen)
    text.appendChild(resm)
    div.appendChild(text)

    let btn = document.createElement("img")
    btn.setAttribute("src", "../assets/heart-solid.svg")
    div.appendChild(btn)

    RESULT.appendChild(div)

    btn.addEventListener("click", ()=> deleteFav(data))
}

function guardarFav(data) {
  const options = { 
    method: 'POST',
    body: JSON.stringify( { titulo: data.titulo, resumen: data.resumen, url: data.url } ),
    headers:{
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
  }

  fetch("https://stormy-cliffs-44487.herokuapp.com/favorites/create", options)
    .then(response => response.json())
    .then(res => {
      if(res.status === 401){
        alert(res.data)
        window.location.reload()
      }
      else if (res.status === 406) {
        alert(res.data)
      }
      else if (res.status === 200) {
        // alert(res.data)
      }
      else {
        console.log("QUE COÑO PASA?");
      }
    })
    .catch(err => console.log("Algo va mal...", err))
}

function deleteFav(data) {
  const options = { 
    method: 'DELETE',
    body: JSON.stringify({url: data.url}),
    headers:{
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
  }

  fetch("https://stormy-cliffs-44487.herokuapp.com/favorites/delete", options)
    .then(res => res.json())
    .then(res => {
      if(res.status === 400) {
        console.log(res.data);
      }
      else if (res.status === 406) {
        console.log(res.data);
      }
      else if (res.status === 200) {
        // alert(res.data)
        verFav()
      }
      else if (res.status === 401) {
        alert(res.data)
      }
    })
    .catch(err => console.log("Algo va mal...", err))
}

function deleteFav2(data) {
  const options = { 
    method: 'DELETE',
    body: JSON.stringify({url: data.url}),
    headers:{
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')
    }
  }

  fetch("https://stormy-cliffs-44487.herokuapp.com/favorites/delete", options)
    .then(res => res.json())
    .then(res => {
      if(res.status === 400) {
        console.log(res.data);
      }
      else if (res.status === 406) {
        console.log(res.data);
      }
      else if (res.status === 200) {
        // alert(res.data)
      }
      else if (res.status === 401) {
        alert(res.data)
      }
    })
    .catch(err => console.log("Algo va mal...", err))
}

// CAMBIAR BOTONES
if (localStorage.getItem('token')) {
  botones()
}

// EVENTOS
BUSCAR.addEventListener("click", () => search());

RESET.addEventListener("click", () => {
  KEYWORD.value = "";
  UBICACION.value = "";
  document.querySelectorAll(".oferta").forEach(el => el.remove())
})

SIGNIN.addEventListener("click",() => {
    window.location.href = "sign/signin"
} )

SIGNUP.addEventListener("click",() => {
    window.location.href = "sign/signup"
} )

KEYWORD.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    search()
  }
})

UBICACION.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    search()
  }
})