let produtos = JSON.parse(localStorage.getItem("produtos")) || {};

let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

// Função para salvar dados no localStorage

function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(produtos));

  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
}

// Função para exibir mensagens de feedback

function exibirMensagem(elemento, mensagem, tipo) {
  elemento.innerHTML = `
    <i class="fas ${tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    ${mensagem}
  `;
  elemento.className = `mensagem ${tipo}`;
  setTimeout(() => {
    elemento.style.opacity = '0';
    setTimeout(() => {
      elemento.innerHTML = '';
      elemento.style.opacity = '1';
    }, 300);
  }, 3000);
}

function exportarProdutosCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Cabeçalho do CSV

  csvContent += "Nome,Categoria,Marca,Número de Série,Quantidade\n";

  // Adicionar cada produto ao CSV

  for (let chave in produtos) {
    let { categoria, marca, serie, quantidade } = produtos[chave];

    csvContent += `${
      chave.split("-")[0]
    },${categoria},${marca},${serie},${quantidade}\n`;
  }

  // Criar um link para download do arquivo CSV

  let encodedUri = encodeURI(csvContent);

  let link = document.createElement("a");

  link.setAttribute("href", encodedUri);

  link.setAttribute("download", "produtos.csv");

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link); // Remover o link após o download
}

// Adicionar produto

document
  .getElementById("produto-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let nome = document.getElementById("nome").value.trim();

    let categoria = document.getElementById("categoria").value.trim();

    let marca = document.getElementById("marca").value.trim();

    let serie = document.getElementById("serie").value.trim();
    // Código de barras

    let quantidade = parseInt(document.getElementById("quantidade").value);

    if (
      !nome ||
      !categoria ||
      !marca ||
      !serie ||
      isNaN(quantidade) ||
      quantidade <= 0
    ) {
      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Preencha todos os campos corretamente.",
        "erro"
      );

      return;
    }

    let chave = `${nome}-${serie}`;

    if (produtos[chave]) {
      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Produto com este número de série já existe!",
        "erro"
      );
    } else {
      produtos[chave] = { categoria, marca, serie, quantidade };

      salvarDados();

      atualizarTabelaProdutos();

      // Mantém os campos preenchidos, exceto série e quantidade

      document.getElementById("serie").value = "";

      document.getElementById("quantidade").value = "";

      document.getElementById("serie").focus(); // Foca no código de barras para agilizar

      exibirMensagem(
        document.getElementById("mensagem-produto"),
        "Produto adicionado com sucesso!",
        "sucesso"
      );
    }

    calcularTotalProdutos();
  });

// Registrar movimentação

document

  .getElementById("movimentacao-form")

  .addEventListener("submit", function (event) {
    event.preventDefault();

    let usuario = document.getElementById("usuario").value.trim();

    let produto = document.getElementById("produto").value.trim();

    let serie = document.getElementById("serie-mov").value.trim();

    let quantidade = parseInt(document.getElementById("quantidade-mov").value);

    let tipo = document.getElementById("tipo-mov").value;

    let chamado = document.getElementById("chamado").value.trim();
    // Novo campo

    if (!usuario || !produto || !serie || isNaN(quantidade) || quantidade < 1) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),

        "Preencha todos os campos corretamente.",

        "erro"
      );

      return;
    }

    let chave = `${produto}-${serie}`;

    if (!produtos[chave]) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),

        "Produto não encontrado!",

        "erro"
      );

      return;
    }

    if (tipo === "saida" && produtos[chave].quantidade < quantidade) {
      exibirMensagem(
        document.getElementById("mensagem-movimentacao"),

        "Quantidade insuficiente em estoque!",

        "erro"
      );

      return;
    }

    if (tipo === "entrada") {
      produtos[chave].quantidade += quantidade;
    } else {
      produtos[chave].quantidade -= quantidade;
    }

    movimentacoes.push({
      usuario,

      produto,

      serie,

      quantidade,

      tipo,

      chamado, // Adicionando chamado à movimentação

      data: new Date().toLocaleString(),
    });

    salvarDados();

    atualizarTabelaProdutos();

    atualizarTabelaMovimentacoes();

    document.getElementById("movimentacao-form").reset();

    exibirMensagem(
      document.getElementById("mensagem-movimentacao"),

      "Movimentação registrada com sucesso!",

      "sucesso"
    );
  });

// Atualizar tabela de produtos

function atualizarTabelaProdutos() {
  let listaProdutos = document.getElementById("lista-produtos");

  listaProdutos.innerHTML = "";

  for (let chave in produtos) {
    let { categoria, marca, serie, quantidade } = produtos[chave];

    let newRow = listaProdutos.insertRow();

    newRow.innerHTML = `




      <td>${chave.split("-")[0]}</td>




      <td>${categoria}</td>




      <td>${marca}</td>




      <td>${serie}</td>




      <td class="${quantidade <= 5 ? "baixo-estoque" : ""}">${quantidade}</td>




      <td class="acoes">




        <button onclick="editarProduto('${chave}')">Editar</button>




        <button onclick="excluirProduto('${chave}')">Excluir</button>




      </td>

    `;
  }

  calcularTotalProdutos();
}

// Editar produto

function editarProduto(chave) {
  let produto = produtos[chave];

  document.getElementById("nome").value = chave.split("-")[0];

  document.getElementById("categoria").value = produto.categoria;

  document.getElementById("marca").value = produto.marca;

  document.getElementById("serie").value = produto.serie;

  document.getElementById("quantidade").value = produto.quantidade;

  delete produtos[chave];

  salvarDados();

  atualizarTabelaProdutos();

  calcularTotalProdutos();
}

// Excluir produto

function excluirProduto(chave) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    delete produtos[chave];

    salvarDados();

    atualizarTabelaProdutos();

    exibirMensagem(
      document.getElementById("mensagem-produto"),

      "Produto excluído com sucesso!",

      "sucesso"
    );
  }

  calcularTotalProdutos();
}

// Atualizar tabela de movimentações

function atualizarTabelaMovimentacoes() {
  let listaMovimentacoes = document.getElementById("lista-movimentacoes");

  listaMovimentacoes.innerHTML = "";

  movimentacoes.forEach((mov) => {
    let newRow = listaMovimentacoes.insertRow();

    newRow.innerHTML = `

          <td>${mov.usuario}</td>

          <td>${mov.produto}</td>

          <td>${mov.serie}</td>

          <td>${mov.quantidade}</td>

          <td>${mov.tipo}</td>

          <td>${mov.chamado ? mov.chamado : "N/A"}</td>

          <td>${mov.data}</td>

      `;
  });
}

// Filtros

function filtrarProdutos() {
  let busca = document.getElementById("busca-produto").value.toLowerCase();

  let linhas = document.querySelectorAll("#lista-produtos tr");

  linhas.forEach((linha) => {
    let nome = linha.cells[0].textContent.toLowerCase();

    let categoria = linha.cells[1].textContent.toLowerCase();

    let marca = linha.cells[2].textContent.toLowerCase();

    let serie = linha.cells[3].textContent.toLowerCase();

    if (
      nome.includes(busca) ||
      categoria.includes(busca) ||
      marca.includes(busca) ||
      serie.includes(busca)
    ) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
}

function calcularTotalProdutos() {
  let total = 0;

  for (let chave in produtos) {
    total += produtos[chave].quantidade;
  }

  document.getElementById(
    "total-produtos"
  ).textContent = `Total em estoque: ${total}`;
}

function calcularQuantidadePorNomeECategoria(nomeBuscado, categoriaBuscada) {
  let total = 0;

  for (let chave in produtos) {
    let [nomeProduto] = chave.split("-"); // Pegando o nome do produto

    let categoriaProduto = produtos[chave].categoria;

    if (
      nomeProduto.toLowerCase() === nomeBuscado.toLowerCase() &&
      categoriaProduto.toLowerCase() === categoriaBuscada.toLowerCase()
    ) {
      total += produtos[chave].quantidade;
    }
  }

  return total;
}

// Exibir resultado na tela

function exibirQuantidadePorNomeECategoria() {
  let nomeBuscado = document.getElementById("busca-quantidade").value.trim();

  let categoriaBuscada = document
    .getElementById("busca-categoria")
    .value.trim();

  if (!nomeBuscado || !categoriaBuscada) {
    document.getElementById("resultado-quantidade").textContent =
      "Por favor, preencha ambos os campos.";

    return;
  }

  let total = calcularQuantidadePorNomeECategoria(
    nomeBuscado,
    categoriaBuscada
  );

  document.getElementById("resultado-quantidade").textContent =
    total > 0
      ? `Total de "${nomeBuscado}" na categoria "${categoriaBuscada}":
${total}`
      : `Produto não encontrado nesta categoria`;
}

function calcularQuantidadePorNome() {
  let nomeBuscado = document

    .getElementById("busca-quantidade")

    .value.trim()

    .toLowerCase();

  let total = 0;

  for (let chave in produtos) {
    let nomeProduto = chave.split("-")[0].toLowerCase();

    if (nomeProduto === nomeBuscado) {
      total += produtos[chave].quantidade;
    }
  }

  document.getElementById("resultado-quantidade").textContent =
    total > 0
      ? `Total de "${nomeBuscado}": ${total}`
      : `Produto não encontrado`;
}

function filtrarMovimentacoes() {
  let filtro = document.getElementById("filtro-movimentacao").value;

  let linhas = document.querySelectorAll("#lista-movimentacoes tr");

  linhas.forEach((linha) => {
    let tipo = linha.cells[4].textContent.toLowerCase();

    linha.style.display = filtro === "todos" || tipo === filtro ? "" : "none";
  });
}

// Exportar dados

function exportarDados(formato) {
  if (formato === "csv") {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Nome,Categoria,Marca,Número de Série,Quantidade\n";

    for (let chave in produtos) {
      let { categoria, marca, serie, quantidade } = produtos[chave];

      csvContent += `${
        chave.split("-")[0]
      },${categoria},${marca},${serie},${quantidade}\n`;
    }

    csvContent +=
      "\nUsuário,Produto,Número de Série,Quantidade,Tipo,Data/Hora\n";

    movimentacoes.forEach((mov) => {
      csvContent += `${mov.usuario},${mov.produto},${mov.serie},${mov.quantidade},${mov.tipo},${mov.data}\n`;
    });

    let encodedUri = encodeURI(csvContent);

    let link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute("download", "estoque.csv");

    document.body.appendChild(link);

    link.click();
  } else if (formato === "json") {
    let data = { produtos, movimentacoes };

    let jsonContent = JSON.stringify(data, null, 2);

    let blob = new Blob([jsonContent], { type: "application/json" });

    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "estoque.json";

    link.click();
  }
}

function login() {
  const usuario = document.getElementById("usuario").value;

  const senha = document.getElementById("senha").value;

  // Verificação básica (substitua por uma verificação segura no backend)

  if (usuario === "admin" && senha === "admin123") {
    document.getElementById("login").style.display = "none";

    document.getElementById("conteudo").style.display = "block";
  } else {
    alert("Usuário ou senha incorretos!");
  }
}

// Carregar dados ao iniciar

window.onload = () => {
  calcularTotalProdutos();

  atualizarTabelaProdutos();

  atualizarTabelaMovimentacoes();
};

function showTab(tabName) {
  // Esconde todas as tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });

  // Mostra a tab selecionada
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function atualizarDashboard() {
    // Atualiza total de itens
    let totalItems = Object.keys(produtos).length;
    document.getElementById('total-items').textContent = totalItems;

    // Atualiza itens críticos
    let itensCriticos = Object.values(produtos).filter(p => p.quantidade <= 5).length;
    document.getElementById('items-criticos').textContent = itensCriticos;

    // Atualiza última atualização
    document.getElementById('ultima-atualizacao').textContent = new Date().toLocaleTimeString();

    // Atualiza movimentações do dia
    let hoje = new Date().toLocaleDateString();
    let movHoje = movimentacoes.filter(m => m.data.includes(hoje)).length;
    document.getElementById('movimentacoes-hoje').textContent = movHoje;

    // Calcula tendência
    let tendencia = calcularTendencia();
    document.getElementById('tendencia').textContent = tendencia;
}

function calcularTendencia() {
    let hoje = new Date().toLocaleDateString();
    let movHoje = movimentacoes.filter(m => m.data.includes(hoje));
    let entradas = movHoje.filter(m => m.tipo === 'entrada').length;
    let saidas = movHoje.filter(m => m.tipo === 'saida').length;
    
    if (entradas > saidas) return 'Em Alta ↑';
    if (saidas > entradas) return 'Em Baixa ↓';
    return 'Estável →';
}

function gerarRelatorio(tipo) {
    let relatorio = [];
    let hoje = new Date();
    let titulo = '';
    
    switch(tipo) {
        case 'diario':
            titulo = `Relatório Diário - ${hoje.toLocaleDateString()}`;
            relatorio = movimentacoes.filter(mov => 
                mov.data.includes(hoje.toLocaleDateString())
            );
            break;
            
        case 'mensal':
            let mes = hoje.getMonth() + 1;
            let ano = hoje.getFullYear();
            titulo = `Relatório Mensal - ${mes}/${ano}`;
            relatorio = movimentacoes.filter(mov => {
                let dataMov = new Date(mov.data);
                return dataMov.getMonth() + 1 === mes && 
                       dataMov.getFullYear() === ano;
            });
            break;
            
        case 'criticos':
            titulo = 'Relatório de Itens Críticos';
            for (let chave in produtos) {
                if (produtos[chave].quantidade <= 5) {
                    relatorio.push({
                        produto: chave.split('-')[0],
                        ...produtos[chave]
                    });
                }
            }
            break;
    }
    
    // Gera o HTML do relatório
    let conteudoRelatorio = `
        <h2>${titulo}</h2>
        <table>
            <thead>
                <tr>
                    ${tipo === 'criticos' ? `
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                    ` : `
                        <th>Data</th>
                        <th>Usuário</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Tipo</th>
                        <th>Chamado</th>
                    `}
                </tr>
            </thead>
            <tbody>
                ${tipo === 'criticos' ? 
                    relatorio.map(item => `
                        <tr>
                            <td>${item.produto}</td>
                            <td>${item.categoria}</td>
                            <td class="baixo-estoque">${item.quantidade}</td>
                        </tr>
                    `).join('') : 
                    relatorio.map(mov => `
                        <tr>
                            <td>${mov.data}</td>
                            <td>${mov.usuario}</td>
                            <td>${mov.produto}</td>
                            <td>${mov.quantidade}</td>
                            <td>${mov.tipo}</td>
                            <td>${mov.chamado || 'N/A'}</td>
                        </tr>
                    `).join('')
                }
            </tbody>
        </table>
        <div class="report-summary">
            <p>Total de registros: ${relatorio.length}</p>
            <p>Gerado em: ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    // Cria uma nova janela para o relatório
    let win = window.open('', '_blank');
    win.document.write(`
        <html>
            <head>
                <title>${titulo}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    th { background: #0077cc; color: white; }
                    .baixo-estoque { color: red; font-weight: bold; }
                    .report-summary { margin-top: 20px; font-style: italic; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${conteudoRelatorio}
                <div class="no-print">
                    <button onclick="window.print()">Imprimir</button>
                </div>
            </body>
        </html>
    `);
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        window.location.href = 'login.html';
    }
}

// Atualizar dashboard a cada minuto
setInterval(atualizarDashboard, 60000);

// Inicialização
window.onload = () => {
    atualizarDashboard();
    calcularTotalProdutos();
    atualizarTabelaProdutos();
    atualizarTabelaMovimentacoes();
};

// Sistema de Notificações
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Modal
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = content;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Activity Feed
function addActivity(activity) {
    const feed = document.getElementById('activity-feed');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <i class="fas fa-clock"></i>
        ${activity}
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    feed.insertBefore(item, feed.firstChild);
    
    if (feed.children.length > 10) {
        feed.removeChild(feed.lastChild);
    }
}

// Backup e Restauração
function backupDados() {
    const dados = {
        produtos,
        movimentacoes,
        configuracoes: {
            darkMode: document.body.classList.contains('dark-mode'),
            alertThreshold: document.getElementById('alertThreshold').value
        }
    };
    
    const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_estoque_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showToast('Backup realizado com sucesso!', 'success');
}

function restaurarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const dados = JSON.parse(event.target.result);
                produtos = dados.produtos;
                movimentacoes = dados.movimentacoes;
                
                if (dados.configuracoes) {
                    document.body.classList.toggle('dark-mode', dados.configuracoes.darkMode);
                    document.getElementById('alertThreshold').value = dados.configuracoes.alertThreshold;
                }
                
                salvarDados();
                atualizarTabelaProdutos();
                atualizarTabelaMovimentacoes();
                showToast('Dados restaurados com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao restaurar dados!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Gestão de Categorias
function adicionarCategoria() {
    showModal(`
        <h3>Nova Categoria</h3>
        <input type="text" id="nova-categoria" placeholder="Nome da categoria">
        <button onclick="salvarCategoria()">Salvar</button>
    `);
}

function salvarCategoria() {
    const categoria = document.getElementById('nova-categoria').value.trim();
    if (categoria) {
        const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
        categorias.push(categoria);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        atualizarCategorias();
        closeModal();
        showToast('Categoria adicionada com sucesso!', 'success');
    }
}

// Inicialização Melhorada
window.onload = () => {
    // Inicializações existentes
    atualizarDashboard();
    calcularTotalProdutos();
    atualizarTabelaProdutos();
    atualizarTabelaMovimentacoes();
    
    // Novas inicializações
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Event Listeners
    document.querySelector('.close').onclick = closeModal;
    window.onclick = e => {
        if (e.target === document.getElementById('modal')) {
            closeModal();
        }
    };
    
    document.getElementById('darkMode').onchange = toggleDarkMode;
    
    // Verificar notificações
    setInterval(verificarNotificacoes, 300000); // 5 minutos
};

function verificarNotificacoes() {
    const threshold = document.getElementById('alertThreshold').value || 5;
    const itensCriticos = Object.entries(produtos)
        .filter(([_, produto]) => produto.quantidade <= threshold);
    
    if (itensCriticos.length > 0 && document.getElementById('notifications').checked) {
        showToast(`${itensCriticos.length} itens com estoque crítico!`, 'warning');
    }
}
