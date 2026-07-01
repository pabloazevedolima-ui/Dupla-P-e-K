const form = document.getElementById("formSugestao");
const lista = document.getElementById("lista");
const feedback = document.getElementById("feedback");

function mostrarFeedback(mensagem, tipo) {
    feedback.textContent = mensagem;
    feedback.className = "feedback " + tipo;

    setTimeout(() => {
        feedback.textContent = "";
        feedback.className = "feedback";
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

const NOMES_STATUS = {
    pendente: "Pendente",
    aprovado: "Aprovado",
    concluido: "Concluído",
    rejeitado: "Rejeitado"
};

function renderizarLista(sugestoes) {
    if (!sugestoes || sugestoes.length === 0) {
        lista.innerHTML = "<p>Nenhuma sugestão enviada ainda. Seja o primeiro!</p>";
        return;
    }

    lista.innerHTML = sugestoes.map((s) => {
        const status = s.status || "pendente";

        return `
        <div class="sugestao">
            <div class="sugestao-cabecalho">
                <h3>${s.categoria}</h3>
                <span class="badge badge-${status}">${NOMES_STATUS[status]}</span>
            </div>
            <p><strong>${s.nome ? s.nome : "Anônimo"}</strong> — Turma ${s.turma}</p>
            <p>${s.descricao}</p>
            <p class="data">${formatarData(s.data_envio)}</p>
        </div>
        `;
    }).join("");
}

async function carregarSugestoes() {
    try {
        const resposta = await fetch("/sugestoes");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar sugestões");
        }

        const sugestoes = await resposta.json();
        renderizarLista(sugestoes);

    } catch (erro) {
        console.error(erro);
        lista.innerHTML = "<p>Não foi possível carregar as sugestões no momento.</p>";
    }
}

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const turma = document.getElementById("turma").value.trim();
    const categoria = document.getElementById("categoria").value;
    const descricao = document.getElementById("descricao").value.trim();

    if (!turma || !descricao) {
        mostrarFeedback("Preencha ao menos a turma e a sugestão.", "erro");
        return;
    }

    try {
        const resposta = await fetch("/sugestoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, turma, categoria, descricao })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarFeedback(dados.mensagem || "Erro ao enviar sugestão.", "erro");
            return;
        }

        mostrarFeedback("Sugestão enviada com sucesso!", "sucesso");
        form.reset();
        carregarSugestoes();

    } catch (erro) {
        console.error(erro);
        mostrarFeedback("Erro ao enviar sugestão. Tente novamente.", "erro");
    }
});

carregarSugestoes();
