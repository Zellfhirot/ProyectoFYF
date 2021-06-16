const BTN = document.querySelector("#send");
const EMAIL = document.querySelector("#email");

BTN.addEventListener("click", () => sendEmail());

function sendEmail() {
  const options = {
    method: "POST",
    body: JSON.stringify({ email: EMAIL.value }),
    headers: { "Content-Type": "application/json" },
  };
  fetch("https://stormy-cliffs-44487.herokuapp.com/user/newpass", options)
    .then((data) => data.json())
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        alert(response.data);
        window.location.href = "https://fyf-greenteam.netlify.app/";
      } else if (response.status === 404) {
        alert(response.data);
        window.location.href = "https://fyf-greenteam.netlify.app/";
      } else if (response.status === 500) {
        alert(response.data);
        window.location.href = "https://fyf-greenteam.netlify.app/";
      } else {
        alert(response.data);
        window.location.href = "https://fyf-greenteam.netlify.app/";
      }
    })
    .catch((err) => console.log("Error con el servidor", err));
}
