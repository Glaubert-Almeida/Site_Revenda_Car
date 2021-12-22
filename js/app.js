let estoqueRevenda = []
const API = 'https://app-revenda-mentoria.herokuapp.com/api/revenda'
const buscarCarros = () => {
    fetch(API) 
    .then(response => response.json()) 
    .then(json => json.data) 
    .then(estoque => {
        estoqueRevenda = estoque
        consultarEstoque(estoqueRevenda)
    }) 
    .catch(err => console.log(err))
}

//ACAO DO BOTAO NOVO ou SALVAR
const salvarCarro = () => {
    if(verificaCamposNaoPreenchidos()){
        Swal.fire('Verifique os dados da tela (campos não preenchidos)!')
        return
    }
    let carro = {
        marca: document.querySelector('#marca').value,
        modelo: document.querySelector('#modelo').value,
        ano: document.querySelector('#ano').value,
        valor: document.querySelector('#valor').value
    }

    if(document.querySelector('#idCarro').value !== ""){ 
        editarApi(carro, document.querySelector('#idCarro').value)
    }else{
        cadastrarApi(carro)
    }
    
}

const cadastrarApi = (carro) => {
    let paramsApi = { 
        method:'POST', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: Object.keys(carro).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(carro[k])}`).join('&')
    }
    fetch(API, paramsApi) 
    .then(response => {
        if (!response.ok) {
            return new Error('Falhou a inserção do carro') 
        }
        return response.json()
    }) 
    .then(e =>{
        buscarCarros()
        limparCamposCadastro()
        Swal.fire('Carro adicionado com sucesso!')
    }) 
    .catch(err => Swal.fire("OCORREU UM ERRO"))
}

const editarItem = (id) => {
    fetch(API+"/"+id) 
    .then(response => response.json()) 
    .then(json => json.data) 
    .then(carro => preencherCampoEditar(carro))
    .catch(err => console.error("OCORREU UM ERRO AO RETORNAR O VEICULO!"))
}

const preencherCampoEditar = (carro) => {
    document.querySelector('#marca').value = carro.marca
    document.querySelector('#modelo').value = carro.modelo
    document.querySelector('#ano').value = carro.ano
    document.querySelector('#valor').value = carro.valor
    document.querySelector('#idCarro').value = carro.id
    document.querySelector('#marca').focus()
    document.querySelector("#boxCadastro h2").textContent = "EDITANDO CARRO "+carro.id + " - " +carro.marca + " - "+carro.modelo 
    document.querySelector("#novo").textContent = "SALVAR"
}

const editarApi = (carro, id) => {
    let paramsApi = { 
        method:'PUT', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: Object.keys(carro).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(carro[k])}`).join('&')
    }
    fetch(API+"/"+id, paramsApi) 
    .then(response => response.json()) 
    .then(data => {
        buscarCarros()
        limparCamposCadastro()
        Swal.fire("Carro editado com sucesso!")
    }) 
    .catch(err => console.error("OCORREU UM ERRO AO RETORNAR O VEICULO!"))
}


const perguntarDeletarItem = (id) => {
    Swal.fire({
        title: 'Deseja remover o carro do estoque?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'SIM!',
        cancelButtonText: 'NÃO!',
    }).then((result) => {
        if (result.isConfirmed) {
            apiDeleteItem(id)
        }
    })
}

const apiDeleteItem = (id) => {
    let paramsApi = { 
        method:'DELETE'
    }
    fetch(API+"/"+id, paramsApi) 
    .then(response => {
        if(response.ok){
            buscarCarros()
            Swal.fire(
                'REMOVIDO!',
                'O carro foi removido com sucesso!',
                'success'
            )
        }
    })
    .catch(err => console.error(err))
}

const consultarEstoque = (estoque) => {
    let mostrarLinhaCarro = ''
    if(estoque.length === 0){
        Swal.fire('Carro não encontrado!')
        document.querySelector('#listaCarros').innerHTML = `<tr><td colspan="5" class="text-center">- NENHUM REGISTRO ENCONTRADO -</td></tr>`
        return
    }
    estoque.forEach(carro => mostrarLinhaCarro += construirLinha(carro))
    document.querySelector('#listaCarros').innerHTML = mostrarLinhaCarro
}

const construirLinha = (carro) => {
    return `<tr>
                <td>${carro.id}</td>
                <td>${carro.marca}</td>
                <td>${carro.modelo}</td>
                <td>${carro.ano}</td>
                <td>${carro.valor}</td>
                <td><a class="btn btn-primary" onclick="editarItem(${carro.id})">EDITAR</a> 
                    <a class="btn btn-danger" onclick="perguntarDeletarItem(${carro.id})">DELETE</a></td>
            </tr>`
}

const filtrarCarros = () => {
    if(document.querySelector('#pesquisar').value === '' &&  document.querySelector('#limite').value == ""){
        consultarEstoque(estoqueRevenda)
        return
    }
    let pesquisa = {
        nome: document.querySelector('#pesquisar').value,
        limite: Number(document.querySelector('#limite').value)
    }
    
    let dadoFiltrado = estoqueRevenda.filter((carro) => {
        let filterNome = carro.marca.includes(pesquisa.nome)
                        || carro.modelo.includes(pesquisa.nome)
                        || carro.ano.includes(pesquisa.nome)
        let filterPreco = Number(carro.valor) <= pesquisa.limite

        if(document.querySelector('#pesquisar').value !== '' && document.querySelector('#limite').value !== '') {
            return filterNome && filterPreco
        }
        if(document.querySelector('#pesquisar').value !== '' && document.querySelector('#limite').value === '') {
            return filterNome
        }
        if(document.querySelector('#pesquisar').value == '' && document.querySelector('#limite').value !== '') {
            return filterPreco
        }
    })
    consultarEstoque(dadoFiltrado)
}

const limparCamposPesquisa = () => {
    document.querySelector('#pesquisar').value = ""
    document.querySelector('#limite').value = ""
    document.querySelector('#pesquisar').focus()
}

const verificaCamposNaoPreenchidos = () => {
    return document.querySelector('#marca').value == "" ||
     document.querySelector('#modelo').value == "" ||
     document.querySelector('#ano').value == "" ||
     document.querySelector('#valor').value == ""
 }
 
 const limparCamposCadastro = () => {
     document.querySelector('#marca').value = ""
     document.querySelector('#modelo').value = ""
     document.querySelector('#ano').value = ""
     document.querySelector('#valor').value = ""
     document.querySelector('#idCarro').value = ""
     document.querySelector("#boxCadastro h2").textContent = "Cadastrar Novo"
     document.querySelector("#novo").innerHTML = `<i class="fas fa-plus-square"></i> Novo`
     document.querySelector('#marca').focus()
 }

window.addEventListener("load", buscarCarros)
novo.addEventListener("click", salvarCarro)
btnPesquisa.addEventListener("click", filtrarCarros)
