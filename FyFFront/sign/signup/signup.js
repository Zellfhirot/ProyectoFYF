const EMAIL = document.querySelector("#email");
const PASS = document.querySelector("#pass");
const BTN = document.querySelector("#signup");

BTN.addEventListener("click", () => signup());

function signup() {
    const options = { 
      method: 'POST',
      body: JSON.stringify({email: EMAIL.value, pass:PASS.value }),
      headers:{'Content-Type': 'application/json'}
    }
    if (validateEmail(EMAIL.value) && validatePass(PASS.value) ){
        fetch("https://stormy-cliffs-44487.herokuapp.com/signup", options)
            .then(res => res.json())
            .then(response => {
                if (response.status === 200) {
                    alert(response.data)
                    window.location.href = "https://fyf-greenteam.netlify.app/sign/signin/"
                }
                else if (response.status === 400) {
                    alert(response.data)
                    window.location.href = "https://fyf-greenteam.netlify.app/sign/signin/"
                }
                else if (response.status === 406) {
                    alert(response.data)
                }
                else {
                    alert("Algo va mal...")
                }
            })
            .catch(err => console.log(err))
        }
        else if (!validateEmail(EMAIL.value)){
            alert ("Introduce un email válido")
        }
        else if(!validatePass(PASS.value)){
            alert ("Introduce un pass válido, con al menos una mayúscula, un número y ocho caracteres");
        };
}

function onSignIn(googleUser) {
    let profile = googleUser.getBasicProfile();
    const options = { 
        method: 'POST',
        body: JSON.stringify({email: profile.getEmail()}),
        headers:{'Content-Type': 'application/json'}
      }
      fetch("https://stormy-cliffs-44487.herokuapp.com/signup/google", options)
          .then(res => res.json())
          .then(response => {
              if (response.status === 200) {
                  alert(response.data)
                  localStorage.setItem('token', response.token)
                  window.location.href = "https://fyf-greenteam.netlify.app/"
              }
              else if (response.status === 405) {
                  alert(response.data)
                  window.location.href = "https://fyf-greenteam.netlify.app/sign/signin/"
              }
              else if (response.status === 400) {
                  alert(response.data)
              }
              else {
                  alert("Algo va mal...")
              }
          })
          .catch(err => console.log(err))
}

// Funciones de validación
function validateEmail(email) {
    let patternEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return patternEmail.test(email);  
}
    
function validatePass(pass) {
    let patternPass = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return patternPass.test(pass);  
}