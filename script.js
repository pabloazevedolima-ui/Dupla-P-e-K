const inicio = document.getElementById("inicio");
const criacao = document.getElementById("criacao");
const alimentacao = document.getElementById("alimentacao")
const desemvolvimento = document.getElementById("desemvolvimento")

const ucriacao = document.getElementById("ucriacao");
const ualimentacao = document.getElementById("ualimentacao")
const udesemvolvimento = document.getElementById("udesemvolvimento")

if (inicio) {
inicio.addEventListener("click", () => {
    window.location.href= "index.html";
});
}

if (criacao) {
criacao.addEventListener("click", () => {
    window.location.href= "criacao.html";
});
}

if (alimentacao) {
alimentacao.addEventListener("click", () => {
    window.location.href= "alimentacao.html";
});
}

if (desemvolvimento) {
desemvolvimento.addEventListener("click", () => {
    window.location.href= "desemvolvimento.html";
});
}

if (ucriacao){
ucriacao.addEventListener("click", () => {
    window.location.href= "criacao.html";
});
}

if (ualimentacao){
ualimentacao.addEventListener("click", () => {
    window.location.href= "alimentacao.html";
});
}

if (udesemvolvimento) {
udesemvolvimento.addEventListener("click", () => {
    window.location.href= "desemvolvimento.html";
});
}



