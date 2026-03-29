/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

function load(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  load("header", "header.html");
  load("footer", "footer.html");
});
