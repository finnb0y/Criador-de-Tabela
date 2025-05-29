// script.js
let dados = [];
let editingCell = null;
let currentModal = null;

// --- THEME TOGGLE ---
const themeToggleBtn = document.getElementById('themeToggleBtn');
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggleBtn.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme(prefersDarkScheme.matches ? 'dark' : 'light');
}
// --- END THEME TOGGLE ---


function formatarPeso(pesoStr) {
    if (pesoStr === null || pesoStr === undefined) return null;
    pesoStr = String(pesoStr).trim();
    if (pesoStr === "") return null;

    if (pesoStr.includes(',') || pesoStr.includes('.')) {
        try {
            const peso = parseFloat(pesoStr.replace(',', '.'));
            return isNaN(peso) ? null : peso;
        } catch {
            return null;
        }
    }

    if (pesoStr.match(/^\d+$/)) {
        const numero = parseInt(pesoStr);
        if (numero > 999 && !pesoStr.includes('.') && !pesoStr.includes(',')) {
            return numero / 100.0;
        } else {
            return numero;
        }
    }
    return null;
}

function gerarCodigoCompleto() {
    const ano = document.getElementById('ano').value.trim();
    const pais = document.getElementById('pais').value.trim();

    if (!ano || !pais) {
        mostrarMensagem('Por favor, preencha o ano e código dos pais primeiro.', 'error', 'statusMessage');
        return null;
    }
    const anoFinal = ano.length === 4 ? ano.slice(-2) : ano;
    if (anoFinal.length !== 2 || !anoFinal.match(/^\d{2}$/)) {
        mostrarMensagem('Formato de ano inválido (use AA ou AAAA).', 'error', 'statusMessage');
        return null;
    }
    if (pais.length !== 2 || !pais.match(/^\d{2}$/)) {
        mostrarMensagem('Formato de código dos pais inválido (use DD).', 'error', 'statusMessage');
        return null;
    }
    return anoFinal + pais;
}

function adicionarClone() {
    const codigoBase = gerarCodigoCompleto();
    if (!codigoBase) return;

    const numeroCloneInput = document.getElementById('numeroClone');
    const numeroClone = numeroCloneInput.value.trim();
    if (!numeroClone) {
        mostrarMensagem('Por favor, digite o número do clone.', 'error', 'statusMessage');
        return;
    }
    const codigoCompleto = codigoBase + numeroClone;
    criarModalEntradaDados(codigoCompleto);
}

function handleModalEsc(event) {
    if (event.key === 'Escape' && currentModal) {
        currentModal.remove();
        currentModal = null;
        document.removeEventListener('keydown', handleModalEsc);
    }
}

function criarModalEntradaDados(codigoCompleto) {
    if (currentModal) currentModal.remove();

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    currentModal = modalBackdrop;

    modalBackdrop.innerHTML = `
        <div class="modal-content">
            <h3>📝 Dados para Clone: ${codigoCompleto}</h3>
            <div>
                <h4>⚖️ Pesos (g) - Casca+Raiz</h4>
                <div class="data-grid">
                    <input type="text" id="peso1" placeholder="Rep 1" class="data-input" inputmode="decimal">
                    <input type="text" id="peso2" placeholder="Rep 2" class="data-input" inputmode="decimal">
                    <input type="text" id="peso3" placeholder="Rep 3" class="data-input" inputmode="decimal">
                    <input type="text" id="peso4" placeholder="Rep 4" class="data-input" inputmode="decimal">
                </div>
            </div>
            <div>
                <h4>🦠 Nematoides Totais</h4>
                <div class="data-grid">
                    <input type="text" id="nema1" placeholder="Rep 1" class="data-input" inputmode="numeric">
                    <input type="text" id="nema2" placeholder="Rep 2" class="data-input" inputmode="numeric">
                    <input type="text" id="nema3" placeholder="Rep 3" class="data-input" inputmode="numeric">
                    <input type="text" id="nema4" placeholder="Rep 4" class="data-input" inputmode="numeric">
                </div>
            </div>
            <div style="text-align: center; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 25px;">
                <button class="btn btn-success" onclick="salvarDadosClone('${codigoCompleto}')">✅ Salvar</button>
                <button class="btn" style="background: #6c757d; color: white;"
                        onclick="this.closest('.modal-backdrop').remove(); currentModal = null; document.removeEventListener('keydown', handleModalEsc);">❌ Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalBackdrop);
    document.addEventListener('keydown', handleModalEsc);

    const firstInput = modalBackdrop.querySelector('input.data-input');
    if (firstInput) firstInput.focus();

    const modalInputs = modalBackdrop.querySelectorAll('input.data-input');
    modalInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const allInputs = Array.from(modalBackdrop.querySelectorAll('input.data-input'));
                const currentIndex = allInputs.indexOf(e.target);
                if (currentIndex < allInputs.length - 1) {
                    allInputs[currentIndex + 1].focus();
                } else {
                    salvarDadosClone(codigoCompleto);
                }
            }
        });
    });
    modalBackdrop.addEventListener('click', function(e) {
        if (e.target === modalBackdrop) {
            modalBackdrop.remove();
            currentModal = null;
            document.removeEventListener('keydown', handleModalEsc);
        }
    });
}

function salvarDadosClone(codigoCompleto) {
    if (!currentModal) return;

    const pesos = [
        currentModal.querySelector('#peso1').value, currentModal.querySelector('#peso2').value,
        currentModal.querySelector('#peso3').value, currentModal.querySelector('#peso4').value
    ];
    const nematoides = [
        currentModal.querySelector('#nema1').value, currentModal.querySelector('#nema2').value,
        currentModal.querySelector('#nema3').value, currentModal.querySelector('#nema4').value
    ];

    let hasData = false;
    for (let i = 0; i < 4; i++) {
        const pesoStr = pesos[i];
        const nemaStr = nematoides[i];
        if (pesoStr.trim() !== '' || nemaStr.trim() !== '') {
            hasData = true;
            const peso = formatarPeso(pesoStr);
            const nema = nemaStr && String(nemaStr).trim().match(/^\d+$/) ? parseInt(String(nemaStr).trim()) : null;
            dados.push({
                clone: codigoCompleto, rep: i + 1, peso: peso, nematoides: nema,
                nemaG: (peso && nema !== null && peso !== 0) ? (nema / peso).toFixed(2) : (nema === 0 && peso > 0 ? "0.00" : null),
                fr: null
            });
        }
    }

    if (hasData) {
        atualizarTabela();
        mostrarMensagem(`Dados para clone ${codigoCompleto} salvos!`, 'success', 'statusMessage');
    } else {
        mostrarMensagem(`Nenhum dado inserido para o clone ${codigoCompleto}.`, 'error', 'statusMessage');
    }

    currentModal.remove();
    currentModal = null;
    document.removeEventListener('keydown', handleModalEsc);
    const numeroCloneInput = document.getElementById('numeroClone');
    numeroCloneInput.value = '';
    numeroCloneInput.focus();
}

function atualizarTabela() {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    dados.forEach((item, index) => {
        const row = tbody.insertRow();
        item.nemaG = (item.peso && item.nematoides !== null && item.peso !== 0) ? (item.nematoides / item.peso).toFixed(2) : (item.nematoides === 0 && item.peso > 0 ? "0.00" : null);
        row.innerHTML = `
            <td onclick="editarCelula(this, ${index}, 'clone')">${item.clone !== null ? item.clone : ''}</td>
            <td onclick="editarCelula(this, ${index}, 'rep')">${item.rep !== null ? item.rep : ''}</td>
            <td class="editable" onclick="editarCelula(this, ${index}, 'peso')">${item.peso !== null ? item.peso : ''}</td>
            <td class="editable" onclick="editarCelula(this, ${index}, 'nematoides')">${item.nematoides !== null ? item.nematoides : ''}</td>
            <td>${item.nemaG !== null ? item.nemaG : ''}</td>
            <td class="editable" onclick="editarCelula(this, ${index}, 'fr')">${item.fr !== null ? item.fr : ''}</td>
        `;
    });
    document.getElementById('spreadsheetContainer').style.display = dados.length > 0 ? 'block' : 'none';
}

function editarCelula(cell, index, campo) {
    if (editingCell && editingCell !== cell) {
        const currentInput = editingCell.querySelector('input.edit-input');
        if (currentInput) currentInput.blur();
        if(editingCell) return;
    }
    if (editingCell === cell) return;

    editingCell = cell;
    const valorAtual = dados[index][campo];
    const valorDisplay = valorAtual !== null ? valorAtual : '';

    cell.innerHTML = '';
    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = valorDisplay;

    if (campo === 'peso' || campo === 'fr') {
        input.type = 'text';
        input.inputMode = 'decimal';
    } else if (campo === 'nematoides' || campo === 'rep') {
        input.type = 'text';
        input.inputMode = 'numeric';
    } else { // clone
        input.type = 'text';
    }

    cell.appendChild(input);
    input.focus();
    input.select();

    function finalizarEdicao() {
        if (!editingCell || !input.parentNode) return;

        let novoValorStr = input.value.trim();
        let novoValor = null;

        if (campo === 'peso' || campo === 'fr') {
            novoValor = formatarPeso(novoValorStr);
        } else if (campo === 'nematoides' || campo === 'rep') {
            novoValor = novoValorStr.match(/^\d+$/) ? parseInt(novoValorStr) : (novoValorStr === '' ? null : valorAtual);
        } else { // clone (text)
            novoValor = novoValorStr;
        }

        if (novoValor === null && novoValorStr !== '') {
            novoValor = valorAtual;
        }

        dados[index][campo] = novoValor;

        if (campo === 'peso' || campo === 'nematoides') {
            const item = dados[index];
            item.nemaG = (item.peso && item.nematoides !== null && item.peso !== 0) ? (item.nematoides / item.peso).toFixed(2) : (item.nematoides === 0 && item.peso > 0 ? "0.00" : null);
        }

        const displayValueFinal = novoValor !== null ? novoValor : '';
        cell.innerHTML = displayValueFinal;

        const nemaGCell = cell.parentNode.cells[4];
        if (nemaGCell && (campo === 'peso' || campo === 'nematoides')) {
             nemaGCell.textContent = dados[index].nemaG !== null ? dados[index].nemaG : '';
        }

        input.removeEventListener('blur', onBlur);
        input.removeEventListener('keypress', handleEditKeyPress);
        editingCell = null;
    }

    function onBlur() {
        setTimeout(() => { if (document.activeElement !== input) finalizarEdicao(); }, 50);
    }

    function handleEditKeyPress(e) {
        if (e.key === 'Enter') input.blur();
        else if (e.key === 'Escape') {
            cell.innerHTML = valorDisplay;
            editingCell = null;
            input.removeEventListener('blur', onBlur);
            input.removeEventListener('keypress', handleEditKeyPress);
        }
    }
    input.addEventListener('blur', onBlur);
    input.addEventListener('keypress', handleEditKeyPress);
}

// Função corrigida para exportar Excel com células centralizadas
function exportarExcel() {
    if (dados.length === 0) {
        mostrarMensagem('Nenhum dado para exportar.', 'error', 'statusMessage');
        return;
    }
    const nomeArquivoBase = document.getElementById('nomeArquivo').value.trim() || 'dados_clones';
    const nomeArquivoFinal = `${nomeArquivoBase.replace(/[^\w.-]+/g, '_')}.xlsx`;
    
    // Prepare data with correct JS types for aoa_to_sheet
    const dadosParaPlanilha = [['Clones', 'Rep', 'Peso g (casca+raiz)', 'Nematoides totais', 'Nema/g', 'FR']];
    dados.forEach(item => {
        let nemaGValue = (item.peso && item.nematoides !== null && item.peso !== 0) ? (item.nematoides / item.peso) : (item.nematoides === 0 && item.peso > 0 ? 0 : null);
        if (nemaGValue !== null) nemaGValue = parseFloat(nemaGValue.toFixed(2));

        dadosParaPlanilha.push([
            item.clone !== null ? String(item.clone) : '',
            item.rep !== null ? Number(item.rep) : null,
            item.peso !== null ? Number(item.peso) : null,
            item.nematoides !== null ? Number(item.nematoides) : null,
            nemaGValue,
            item.fr !== null ? Number(item.fr) : null
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dadosParaPlanilha);
    const range = XLSX.utils.decode_range(ws['!ref']);
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

    // Aplicar formatação centralizada a todas as células
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            let cell = ws[cellAddress];

            if (!cell) {
                cell = ws[cellAddress] = { t: 's', v: '' };
            }
            
            // Inicializar objeto de estilo
            if (!cell.s) {
                cell.s = {};
            }
            
            // IMPORTANTE: Aplicar alinhamento centralizado
            cell.s.alignment = {
                horizontal: 'center',
                vertical: 'center',
                wrapText: false // Adicionado para evitar quebra de texto indesejada
            };

            if (R === 0) { // Header row
                cell.s.font = { 
                    bold: true, 
                    color: { rgb: "FFFFFFFF" } 
                };
                cell.s.fill = { 
                    fgColor: { rgb: isDarkTheme ? "FF9055A2" : "FF4facfe" } 
                };
                cell.t = 's';
            } else { // Data rows
                // Aplicar formatação de número para células numéricas
                if (cell.t === 'n') {
                    if (C === 1 || C === 3) { // Rep, Nematoides (inteiros)
                        cell.z = '0';
                    } else if (C === 2 || C === 4 || C === 5) { // Peso, Nema/g, FR (decimais)
                        cell.z = '0.00';
                    } else {
                        cell.z = 'General';
                    }
                } else if (cell.t === 's' && (cell.v === null || cell.v === undefined)) {
                    cell.v = '';
                }
                
                // Aplicar cor de fundo alternada para melhor visualização (opcional)
                if (R % 2 === 0) { // Linhas pares de dados (R=2, R=4, etc.)
                    // Só aplica fundo alternado se não for o header
                    cell.s.fill = { // Sobrescreve o fill do header se R=0 e par (pouco provável)
                        fgColor: { rgb: isDarkTheme ? "FF3C3C3C" : "FFEFEFEF" } // Cores mais sutis
                    };
                }
            }
        }
    }
    
    // Definir largura das colunas
    ws['!cols'] = [
        { wch: 15 }, // Clones
        { wch: 8 },  // Rep
        { wch: 20 }, // Peso g (casca+raiz)
        { wch: 18 }, // Nematoides totais
        { wch: 12 }, // Nema/g
        { wch: 8 }   // FR
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    XLSX.writeFile(wb, nomeArquivoFinal);
    mostrarMensagem(`Arquivo ${nomeArquivoFinal} exportado com sucesso!`, 'success', 'statusMessage');
}

function limparDados() {
    if (confirm('⚠️ Tem certeza que deseja limpar todos os dados da coleta? Esta ação não pode ser desfeita.')) {
        dados = [];
        atualizarTabela();
        ['nomeArquivo', 'ano', 'pais', 'numeroClone'].forEach(id => document.getElementById(id).value = '');
        mostrarMensagem('Dados da coleta limpos com sucesso!', 'success', 'statusMessage');
    }
}

function mostrarMensagem(texto, tipo, elementId = 'statusMessage') {
    const container = document.getElementById(elementId);
    if (!container) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${tipo}`;
    messageDiv.textContent = texto;
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(messageDiv);
    setTimeout(() => { if (messageDiv.parentNode === container && messageDiv.parentNode.contains(messageDiv) ) container.removeChild(messageDiv); }, 4000);
}

document.getElementById('ano').addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
document.getElementById('pais').addEventListener('input', function() { this.value = this.value.replace(/\D/g, ''); });
document.getElementById('numeroClone').addEventListener('keypress', function(e) { if (e.key === 'Enter') adicionarClone(); });
document.addEventListener('DOMContentLoaded', function() {
    mostrarMensagem('🚀 Sistema de Coleta iniciado!', 'success', 'statusMessage');
    setupMultiplicador();
});

// --- MULTIPLICADOR FUNCTIONALITY ---
let multiplicatorWorkbook = null;
let multiplicatorSheetNames = [];
let multiplicatorSelectedSheetData = [];
let multiplicatorMultipliedData = [];

const mainAppView = document.getElementById('mainAppView');
const multiplicadorView = document.getElementById('multiplicadorView');
const dropZone = document.getElementById('dropZone');
const fileInputMulti = document.getElementById('fileInputMulti');
const sheetSelector = document.getElementById('sheetSelector');
const columnSelector = document.getElementById('columnSelector');
const startRowSelector = document.getElementById('startRowSelector');
const endRowSelector = document.getElementById('endRowSelector');
const colSelectionGroup = document.getElementById('colSelectionGroup');
const originalPreviewContainer = document.getElementById('originalPreviewContainer');
const originalDataTableBody = document.getElementById('originalDataTable').querySelector('tbody');
const originalDataTableHead = document.getElementById('originalDataTable').querySelector('thead');
const multipliedPreviewContainer = document.getElementById('multipliedPreviewContainer');
const multipliedDataTableBody = document.getElementById('multipliedDataTable').querySelector('tbody');
const multipliedDataTableHead = document.getElementById('multipliedDataTable').querySelector('thead');

function toggleViews() {
    const isMainHidden = mainAppView.style.display === 'none';
    mainAppView.style.display = isMainHidden ? 'block' : 'none';
    multiplicadorView.style.display = isMainHidden ? 'none' : 'block';
    mostrarMensagem(
        isMainHidden ? '🚀 Sistema de Coleta ativo!' : '⚙️ Multiplicador de Dados ativo! Carregue uma planilha.',
        'success',
        isMainHidden ? 'statusMessage' : 'multiplicadorStatusMessage'
    );
}

function setupMultiplicador() {
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            if (eventName === 'dragover') dropZone.classList.add('hover');
            else dropZone.classList.remove('hover');
            if (eventName === 'drop') {
                dropZone.classList.add('drop');
                if (e.dataTransfer.files.length) handleMultiplicatorFile(e.dataTransfer.files[0]);
                setTimeout(() => dropZone.classList.remove('drop'), 1000);
            }
        });
    });
    fileInputMulti.addEventListener('change', (e) => { if (e.target.files.length) handleMultiplicatorFile(e.target.files[0]); });
}

function handleMultiplicatorFile(file) {
    if (!file || !(/\.(xlsx|xls|csv)$/i.test(file.name) || ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type))) {
        mostrarMensagem('Tipo de arquivo inválido. Use .xlsx, .xls ou .csv.', 'error', 'multiplicadorStatusMessage');
        return;
    }
    mostrarMensagem(`Carregando arquivo: ${file.name}...`, 'success', 'multiplicadorStatusMessage');
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            multiplicatorWorkbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
            multiplicatorSheetNames = multiplicatorWorkbook.SheetNames;
            populateSheetSelector(); // Populates sheet dropdown
            colSelectionGroup.style.display = 'block';
            originalPreviewContainer.style.display = 'none';
            multipliedPreviewContainer.style.display = 'none';
            // Column selector will be populated by handleSheetSelection
            mostrarMensagem('Arquivo carregado. Selecione a planilha (aba).', 'success', 'multiplicadorStatusMessage');
        } catch (err) {
            console.error("Erro ao ler planilha:", err);
            mostrarMensagem('Erro ao processar a planilha. Verifique o formato.', 'error', 'multiplicadorStatusMessage');
            multiplicatorWorkbook = null;
        }
    };
    reader.onerror = () => { mostrarMensagem('Erro ao ler o arquivo.', 'error', 'multiplicadorStatusMessage'); multiplicatorWorkbook = null; };
    reader.readAsArrayBuffer(file);
}

function populateSheetSelector() {
    sheetSelector.innerHTML = '<option value="">Selecione uma aba...</option>';
    multiplicatorSheetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name; option.textContent = name;
        sheetSelector.appendChild(option);
    });
    // Clear other selectors that depend on sheet selection
    columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
    startRowSelector.value = ''; endRowSelector.value = '';
    startRowSelector.max = ''; endRowSelector.max = '';
    startRowSelector.min = '1'; endRowSelector.min = '1';
}

// Helper function to convert 0-based column index to Excel letter (A, B, ..., Z, AA, etc.)
function columnIndexToLetter(columnIndex) {
    let letter = '';
    let temp;
    while (columnIndex >= 0) {
        temp = columnIndex % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        columnIndex = Math.floor(columnIndex / 26) - 1;
    }
    return letter;
}

function handleSheetSelection() {
    const sheetName = sheetSelector.value;
    originalPreviewContainer.style.display = 'none';
    multipliedPreviewContainer.style.display = 'none';
    columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>'; // Reset column selector
    startRowSelector.value = ''; endRowSelector.value = '';
    startRowSelector.max = ''; endRowSelector.max = '';
    startRowSelector.min = '1'; endRowSelector.min = '1';


    if (!sheetName || !multiplicatorWorkbook) {
        return;
    }

    const ws = multiplicatorWorkbook.Sheets[sheetName];
    multiplicatorSelectedSheetData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: null });
    multiplicatorSelectedSheetData = multiplicatorSelectedSheetData.filter(row => row.some(cell => cell !== null && String(cell).trim() !== ''));

    if (multiplicatorSelectedSheetData.length === 0) {
        mostrarMensagem('A planilha selecionada está completamente vazia ou não contém dados válidos.', 'error', 'multiplicadorStatusMessage');
        return;
    }

    // Use the first row to determine the number of columns for the letter-based selector
    // And also for the table header in the preview
    const headersForUI = multiplicatorSelectedSheetData[0] || [];
    populateColumnSelectorWithOptions(headersForUI); // New function name for clarity

    renderHtmlTable(originalDataTableHead, originalDataTableBody, headersForUI, multiplicatorSelectedSheetData);
    originalPreviewContainer.style.display = 'block';

    const totalRowsInSheet = multiplicatorSelectedSheetData.length;

    if (totalRowsInSheet > 0) {
        startRowSelector.value = 1;
        startRowSelector.max = totalRowsInSheet;
        endRowSelector.value = totalRowsInSheet;
        endRowSelector.max = totalRowsInSheet;
    } else {
        startRowSelector.value = '';
        startRowSelector.max = '';
        endRowSelector.value = '';
        endRowSelector.max = '';
        mostrarMensagem('Planilha não contém dados para processar.', 'warning', 'multiplicadorStatusMessage');
    }
}

// Renamed from populateColumnSelector to avoid conflict if you had another one
function populateColumnSelectorWithOptions(firstRowAsHeaders) {
    columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
    if (!firstRowAsHeaders || firstRowAsHeaders.length === 0) {
        // Attempt to determine max columns from the whole dataset if first row is empty but others have data
        let maxCols = 0;
        if (multiplicatorSelectedSheetData && multiplicatorSelectedSheetData.length > 0) {
            multiplicatorSelectedSheetData.forEach(row => {
                if (row && row.length > maxCols) maxCols = row.length;
            });
        }
        if (maxCols === 0) return; // No columns to select

        for (let i = 0; i < maxCols; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Coluna ${columnIndexToLetter(i)}`;
            columnSelector.appendChild(option);
        }
        return;
    }

    // Use the length of the first row to determine number of columns
    firstRowAsHeaders.forEach((headerContent, index) => {
        const option = document.createElement('option');
        option.value = index; // The 0-based index is the important value
        // Display "Coluna A (Header Name)" if header name exists, otherwise just "Coluna A"
        const headerName = (headerContent !== null && headerContent !== undefined && String(headerContent).trim() !== '') ? ` (${String(headerContent).trim()})` : '';
        option.textContent = `Coluna ${columnIndexToLetter(index)}${headerName}`;
        columnSelector.appendChild(option);
    });
}


function renderHtmlTable(theadElement, tbodyElement, headers, dataRows) {
    theadElement.innerHTML = ''; tbodyElement.innerHTML = '';
    const headerRowToRender = headers && headers.length > 0 ? headers : (dataRows.length > 0 ? dataRows[0].map((_, idx) => `Coluna ${columnIndexToLetter(idx)}`) : []);


    const trHead = document.createElement('tr');
    headerRowToRender.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = (headerText !== null && headerText !== undefined) ? String(headerText) : '';
        trHead.appendChild(th);
    });
    theadElement.appendChild(trHead);

    dataRows.forEach(rowArray => {
        if (!rowArray) return;
        const tr = document.createElement('tr');
        // Use the number of columns from the effective header for consistency
        const cellCount = Math.max(headerRowToRender.length, rowArray.length);
        for (let colIndex = 0; colIndex < cellCount; colIndex++) {
            const td = document.createElement('td');
            const cellValue = rowArray[colIndex];
            td.textContent = (cellValue !== undefined && cellValue !== null) ? String(cellValue) : '';
            tr.appendChild(td);
        }
        tbodyElement.appendChild(tr);
    });
}

function processarMultiplicacao() {
    const columnIndexStr = columnSelector.value;
    if (columnIndexStr === "" || isNaN(parseInt(columnIndexStr))) {
        mostrarMensagem('Por favor, selecione uma coluna para multiplicar.', 'error', 'multiplicadorStatusMessage');
        return;
    }
    const columnIndex = parseInt(columnIndexStr);

    const dataToProcess = multiplicatorSelectedSheetData;

    if (!dataToProcess || dataToProcess.length === 0) {
        mostrarMensagem('Não há dados carregados da planilha. Selecione uma aba primeiro.', 'error', 'multiplicadorStatusMessage');
        return;
    }

    const totalAvailableDataRows = dataToProcess.length;

    if (totalAvailableDataRows === 0) {
        mostrarMensagem('A planilha não contém linhas de dados para processar.', 'warning', 'multiplicadorStatusMessage');
        multipliedPreviewContainer.style.display = 'none';
        return;
    }

    // Check if columnIndex is valid for the data (some rows might have fewer columns)
    // We use the first row's header for the multiplied data title, so check against that too.
    const firstRow = dataToProcess[0] || [];
    // No need to check columnIndex against firstRow.length here if populateColumnSelectorWithOptions is robust
    // as the column index should be valid if it was selectable.

    let startLineUser = parseInt(startRowSelector.value);
    let endLineUser = parseInt(endRowSelector.value);

    if (isNaN(startLineUser) || startLineUser < 1) {
        startLineUser = 1;
    } else if (startLineUser > totalAvailableDataRows) {
        startLineUser = totalAvailableDataRows;
    }

    if (isNaN(endLineUser) || endLineUser < startLineUser) {
        endLineUser = startLineUser;
    } else if (endLineUser > totalAvailableDataRows) {
        endLineUser = totalAvailableDataRows;
    }

    startRowSelector.value = startLineUser;
    endRowSelector.value = endLineUser;

    let headerOfSelectedColumnText = `Coluna ${columnIndexToLetter(columnIndex)}`;
    if (firstRow[columnIndex] !== null && firstRow[columnIndex] !== undefined && String(firstRow[columnIndex]).trim() !== '') {
        headerOfSelectedColumnText += ` (${String(firstRow[columnIndex]).trim()})`;
    }

    multiplicatorMultipliedData = [];

    for (let i = startLineUser - 1; i < endLineUser; i++) {
        if (i >= dataToProcess.length || i < 0) continue;

        const row = dataToProcess[i];
        if (row && columnIndex < row.length) { // Ensure row has this column
            const value = row[columnIndex];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                for (let j = 0; j < 4; j++) {
                    multiplicatorMultipliedData.push(value);
                }
            }
        }
    }

    if (multiplicatorMultipliedData.length === 0) {
        mostrarMensagem('Nenhum dado encontrado para multiplicar na coluna e intervalo selecionados, ou os valores estão vazios.', 'warning', 'multiplicadorStatusMessage');
        multipliedPreviewContainer.style.display = 'none';
        return;
    }

    const multipliedHeaders = [`Valores Multiplicados de ${headerOfSelectedColumnText}`];
    const multipliedDataAsRows = multiplicatorMultipliedData.map(val => [val]);

    renderHtmlTable(multipliedDataTableHead, multipliedDataTableBody, multipliedHeaders, multipliedDataAsRows);
    multipliedPreviewContainer.style.display = 'block';
    mostrarMensagem('Dados multiplicados com sucesso! Confira a pré-visualização.', 'success', 'multiplicadorStatusMessage');
}

// Função corrigida para exportar dados multiplicados com células centralizadas
function exportarDadosMultiplicados() {
    if (multiplicatorMultipliedData.length === 0) {
        mostrarMensagem('Nenhum dado multiplicado para exportar.', 'error', 'multiplicadorStatusMessage');
        return;
    }

    let selectedColumnNameForFile = "Dados";
    const colIdx = parseInt(columnSelector.value);
    if (!isNaN(colIdx)) {
        selectedColumnNameForFile = `Coluna_${columnIndexToLetter(colIdx)}`;
        if (multiplicatorSelectedSheetData && multiplicatorSelectedSheetData[0] && colIdx < multiplicatorSelectedSheetData[0].length &&
            multiplicatorSelectedSheetData[0][colIdx] !== null && multiplicatorSelectedSheetData[0][colIdx] !== undefined &&
            String(multiplicatorSelectedSheetData[0][colIdx]).trim() !== '') {
            selectedColumnNameForFile += `_${String(multiplicatorSelectedSheetData[0][colIdx]).trim()}`;
        }
    }

    const fileName = `dados_multiplicados_${selectedColumnNameForFile.replace(/[^\w.-]+/g, '_')}.xlsx`;
    
    let headerTextForSheet = `Valores Multiplicados`;
    if (!isNaN(colIdx)) {
         headerTextForSheet += ` (Coluna ${columnIndexToLetter(colIdx)}`;
         if (multiplicatorSelectedSheetData && multiplicatorSelectedSheetData[0] && colIdx < multiplicatorSelectedSheetData[0].length &&
            multiplicatorSelectedSheetData[0][colIdx] !== null && multiplicatorSelectedSheetData[0][colIdx] !== undefined &&
            String(multiplicatorSelectedSheetData[0][colIdx]).trim() !== '') {
            headerTextForSheet += `: ${String(multiplicatorSelectedSheetData[0][colIdx]).trim()}`;
        }
        headerTextForSheet += `)`;
    }
    
    const exportSheetName = `Multiplicado Col ${!isNaN(colIdx) ? columnIndexToLetter(colIdx) : 'Sel'}`.substring(0,30);

    const dadosParaPlanilha = [[headerTextForSheet]];
    multiplicatorMultipliedData.forEach(value => {
        const numValue = Number(value);
        if (value !== null && value !== '' && !isNaN(numValue)) {
            dadosParaPlanilha.push([numValue]);
        } else {
            dadosParaPlanilha.push([value !== null && value !== undefined ? String(value) : '']);
        }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dadosParaPlanilha);
    const range = XLSX.utils.decode_range(ws['!ref']);
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

    // Aplicar formatação centralizada a todas as células
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            let cell = ws[cellAddress];
            if (!cell) cell = ws[cellAddress] = { t: 's', v: '' };

            // Inicializar objeto de estilo
            if (!cell.s) {
                cell.s = {};
            }
            
            // IMPORTANTE: Aplicar alinhamento centralizado
            cell.s.alignment = {
                horizontal: 'center',
                vertical: 'center',
                wrapText: false // Adicionado para evitar quebra de texto indesejada
            };

            if (R === 0) { // Header
                cell.s.font = { 
                    bold: true, 
                    color: { rgb: "FFFFFFFF" } 
                };
                cell.s.fill = { 
                    fgColor: { rgb: isDarkTheme ? "FF9055A2" : "FF4facfe" } 
                };
                cell.t = 's';
            } else { // Data
                if (cell.t === 'n') {
                    if (String(cell.v).includes('.')) {
                        cell.z = '0.00';
                    } else {
                        cell.z = '0';
                    }
                } else if (cell.t === 's' && (cell.v === null || cell.v === undefined)) {
                    cell.v = '';
                }
                
                // Aplicar cor de fundo alternada (opcional)
                 if (R % 2 === 0) { // Linhas pares de dados (R=2, R=4, etc.)
                    // Só aplica fundo alternado se não for o header
                    cell.s.fill = { // Sobrescreve o fill do header se R=0 e par (pouco provável)
                        fgColor: { rgb: isDarkTheme ? "FF3C3C3C" : "FFEFEFEF" } // Cores mais sutis
                    };
                }
            }
        }
    }
    
    // Definir largura da coluna
    ws['!cols'] = [{ wch: Math.max(30, headerTextForSheet.length + 5) }];
    
    XLSX.utils.book_append_sheet(wb, ws, exportSheetName);
    XLSX.writeFile(wb, fileName);
    mostrarMensagem(`Arquivo ${fileName} exportado com sucesso!`, 'success', 'multiplicadorStatusMessage');
}
