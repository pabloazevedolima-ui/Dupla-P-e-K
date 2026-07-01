const CHAVE_TOKEN = "mc_admin_token";

const secaoLogin = document.getElementById("loginAdmin");
const secaoPainel = document.getElementById("painelAdmin");
const formLogin = document.getElementById("formLogin");
const loginFeedback = document.getElementById("loginFeedback");
const painelFeedback = document.getElementById("painelFeedback");
const listaAdmin = document.getElementById("listaAdmin");
const filtroStatus = document.getElementById("filtroStatus");
const btnSair = document.getElementById("btnSair");

const NOMES_STATUS = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    concluido: "Concluído",
    rejeitado: "Rejeitado"
};

function pegarToken() {
    return localStorage.getItem(CHAVE_TOKEN);
}

function salvarToken(token) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

function limparToken() {
    localStorage.removeItem(CHAVE_TOKEN);
}

function mostrarFeedback(elemento, mensagem, tipo) {
    elemento.textContent = mensagem;
    elemento.className = "feedback " + tipo;

    setTimeout(() => {
        elemento.textContent = "";
        elemento.className = "feedback";
    }, 4000);
}

function formatarData(dataISO) {
    if (!dataISO) return "";
    const data = new Date(dataISO.replace(" ", "T") + "Z");
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function mostrarPainel() {
    secaoLogin.style.display = "none";
    secaoPainel.style.display = "block";
    carregarSugestoes();
}

function mostrarLogin() {
    secaoLogin.style.display = "flex";
    secaoPainel.style.display = "none";
}

// LOGIN
formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const senha = document.getElementById("senhaAdmin").value;

    try {
        const resposta = await fetch("/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarFeedback(loginFeedback, dados.mensagem || "Senha incorreta.", "erro");
            return;
        }

        salvarToken(dados.token);
        formLogin.reset();
        mostrarPainel();

    } catch (erro) {
        console.error(erro);
        mostrarFeedback(loginFeedback, "Erro ao conectar com o servidor.", "erro");
    }
});

// SAIR
btnSair.addEventListener("click", async () => {
    const token = pegarToken();

    try {
        await fetch("/admin/logout", {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });
    } catch (erro) {
        console.error(erro);
    }

    limparToken();
    mostrarLogin();
});

// CARREGAR LISTA
async function carregarSugestoes() {
    try {
        const resposta = await fetch("/sugestoes");

        if (!resposta.ok) throw new Error("Erro ao buscar sugestões");

        const sugestoes = await resposta.json();
        renderizarLista(sugestoes);

    } catch (erro) {
        console.error(erro);
        listaAdmin.innerHTML = "<p>Não foi possível carregar as sugestões.</p>";
    }
}

function renderizarLista(sugestoes) {

    const filtro = filtroStatus.value;

    const filtradas = filtro === "todos"
        ? sugestoes
        : sugestoes.filter((s) => (s.status || "pendente") === filtro);

    if (filtradas.length === 0) {
        listaAdmin.innerHTML = "<p>Nenhuma sugestão encontrada para esse filtro.</p>";
        return;
    }

    listaAdmin.innerHTML = filtradas.map((s) => {
        const status = s.status || "pendente";

        return `
        <div class="sugestao sugestao-admin">
            <div class="sugestao-cabecalho">
                <h3>${s.categoria}</h3>
                <span class="badge badge-${status}">${NOMES_STATUS[status]}</span>
            </div>

            <p><strong>${s.nome ? s.nome : "Anônimo"}</strong> — Turma ${s.turma}</p>
            <p>${s.descricao}</p>
            <p class="data">${formatarData(s.data_envio)}</p>

            <div class="sugestao-acoes">
                <button data-id="${s.id}" data-status="aprovado" class="btn-status btn-aprovar">Aprovar</button>
                <button data-id="${s.id}" data-status="concluido" class="btn-status btn-concluir">Concluir</button>
                <button data-id="${s.id}" data-status="rejeitado" class="btn-status btn-rejeitar">Rejeitar</button>
                <button data-id="${s.id}" data-status="pendente" class="btn-status btn-pendente">Voltar p/ Pendente</button>
                <button data-id="${s.id}" class="btn-status btn-excluir">Excluir</button>
            </div>
        </div>
        `;
    }).join("");
}

// AÇÕES (delegação de eventos nos botões da lista)
listaAdmin.addEventListener("click", async (evento) => {

    const botao = evento.target.closest(".btn-status");
    if (!botao) return;

    const id = botao.dataset.id;
    const status = botao.dataset.status;
    const token = pegarToken();

    try {

        let resposta;

        if (botao.classList.contains("btn-excluir")) {

            if (!confirm("Tem certeza que deseja excluir essa sugestão?")) return;

            resposta = await fetch(`/sugestoes/${id}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token }
            });

        } else {

            resposta = await fetch(`/sugestoes/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({ status })
            });
        }

        if (resposta.status === 401) {
            mostrarFeedback(painelFeedback, "Sessão expirada. Faça login novamente.", "erro");
            limparToken();
            mostrarLogin();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarFeedback(painelFeedback, dados.mensagem || "Erro ao atualizar.", "erro");
            return;
        }

        mostrarFeedback(painelFeedback, dados.mensagem, "sucesso");
        carregarSugestoes();

    } catch (erro) {
        console.error(erro);
        mostrarFeedback(painelFeedback, "Erro ao conectar com o servidor.", "erro");
    }
});

filtroStatus.addEventListener("change", carregarSugestoes);

// INICIALIZAÇÃO: se já existir token salvo, tenta ir direto pro painel
if (pegarToken()) {
    mostrarPainel();
} else {
    mostrarLogin();
}
