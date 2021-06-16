const PASS = document.querySelector("#pass");
const PASS2 = document.querySelector("#pass2");
const BTN = document.querySelector("#enviar");

BTN.addEventListener("click", () => newPass());

function newPass() {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('token');
    if (PASS.value === PASS2.value) {
        const options = { 
            method: 'PUT',
            body: JSON.stringify({ pass:PASS.value }),
            headers:{
                'Content-Type': 'application/json',
                'authorization': myParam
            }
        }
        if (validatePass(PASS.value) ){
            fetch("https://stormy-cliffs-44487.herokuapp.com/user/changepass", options)
                .then(data => data.json())
                .then(response => {
                    if (response.status === 200) {
                        alert(response.data)
                        window.location.href = "https://fyf-greenteam.netlify.app//sign/signin"
                    }
                    else if (response.status === 400) {
                        alert(response.data)
                    }
                    else if (response.status ===401) {
                        alert(response.status)
                    }
                    else if (response.status === 500) {
                        alert(response.data)
                    }
                    else if (response.status === 406) {
                        alert(response.data)
                    }
                    else{
                        alert("No se que va mal...")
                    }
                })
                .catch(err => console.log("Error con el servidor", err))
        }
        else if(!validatePass(PASS.value)){
            alert ("Introduce un pass válido");
        };
    }
    else {
        alert("Las contraseñas no coinciden")
    }
}

function validatePass(pass) {
    let patternPass = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return patternPass.test(pass);  
}