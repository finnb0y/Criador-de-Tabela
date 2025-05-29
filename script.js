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
    if (!pesoStr) return null;
    pesoStr = String(pesoStr).trim();
    
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
                    <input type="text" id="peso1" placeholder="Rep 1" class="data-input">
                    <input type="text" id="peso2" placeholder="Rep 2" class="data-input">
                    <input type="text" id="peso3" placeholder="Rep 3" class="data-input">
                    <input type="text" id="peso4" placeholder="Rep 4" class="data-input">
                </div>
            </div>
            <div>
                <h4>🦠 Nematoides Totais</h4>
                <div class="data-grid">
                    <input type="text" id="nema1" placeholder="Rep 1" class="data-input">
                    <input type="text" id="nema2" placeholder="Rep 2" class="data-input">
                    <input type="text" id="nema3" placeholder="Rep 3" class="data-input">
                    <input type="text" id="nema4" placeholder="Rep 4" class="data-input">
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
            const nema = nemaStr && nemaStr.match(/^\d+$/) ? parseInt(nemaStr) : null;
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
            <td onclick="editarCelula(this, ${index}, 'clone')">${item.clone}</td>
            <td onclick="editarCelula(this, ${index}, 'rep')">${item.rep}</td>
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
        if (currentInput) currentInput.blur(); // Tenta finalizar edição anterior
        if(editingCell) return; // Se ainda estiver editando, não abre nova
    }
    if (editingCell === cell) return;

    editingCell = cell;
    const valorAtual = dados[index][campo];
    const valorDisplay = valorAtual !== null ? valorAtual : '';
    
    cell.innerHTML = ''; 
    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = valorDisplay;
    input.type = (campo === 'peso' || campo === 'nematoides' || campo === 'rep' || campo === 'fr') ? 'text' : 'text';
    if (campo === 'peso') input.inputMode = 'decimal';
    else if (campo === 'nematoides' || campo === 'rep' || campo === 'fr') input.inputMode = 'numeric';
    
    cell.appendChild(input);
    input.focus();
    input.select();

    function finalizarEdicao() {
        if (!editingCell || !input.parentNode) return;

        let novoValorStr = input.value.trim();
        let novoValor = null;
        
        if (campo === 'peso' || campo === 'fr') novoValor = formatarPeso(novoValorStr);
        else if (campo === 'nematoides' || campo === 'rep') novoValor = novoValorStr.match(/^\d+$/) ? parseInt(novoValorStr) : (novoValorStr === '' ? null : valorAtual); // Manter valor se inválido e não vazio
        else novoValor = novoValorStr;

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
        setTimeout(() => { if (document.activeElement !== input) finalizarEdicao(); }, 0);
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

function exportarExcel() {
    if (dados.length === 0) {
        mostrarMensagem('Nenhum dado para exportar.', 'error', 'statusMessage');
        return;
    }
    const nomeArquivoBase = document.getElementById('nomeArquivo').value.trim() || 'dados_clones';
    const nomeArquivoFinal = `${nomeArquivoBase.replace(/\s+/g, '_')}.xlsx`;
    const dadosExportacao = [['Clones', 'Rep', 'Peso g (casca+raiz)', 'Nematoides totais', 'Nema/g', 'FR']];

    dados.forEach(item => {
        const nemaGExport = (item.peso && item.nematoides !== null && item.peso !== 0) ? (item.nematoides / item.peso).toFixed(2) : (item.nematoides === 0 && item.peso > 0 ? "0.00" : null);
        dadosExportacao.push([item.clone, item.rep, item.peso, item.nematoides, nemaGExport, item.fr]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dadosExportacao);
    const range = XLSX.utils.decode_range(ws['!ref']);
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            let cell = ws[cellAddress];
            if (!cell) cell = ws[cellAddress] = { t: 's', v: '' };
            cell.s = { alignment: { horizontal: 'center', vertical: 'center' } };
            if (R === 0) {
                cell.s.font = { bold: true, color: { rgb: "FFFFFFFF" } };
                cell.s.fill = { fgColor: { rgb: isDarkTheme ? "FF9055A2" : "FF4facfe" } };
            }
        }
    }
    ws['!cols'] = [{ wch: 15 }, { wch: 8 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 8 }];
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
    setTimeout(() => { if (messageDiv.parentNode === container) container.removeChild(messageDiv); }, 4000);
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
const startRowSelector = document.getElementById('startRowSelector'); // NOVO
const endRowSelector = document.getElementById('endRowSelector');     // NOVO
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
            multiplicatorWorkbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            multiplicatorSheetNames = multiplicatorWorkbook.SheetNames;
            populateSheetSelector();
            colSelectionGroup.style.display = 'block';
            originalPreviewContainer.style.display = 'none'; 
            multipliedPreviewContainer.style.display = 'none';
            mostrarMensagem('Arquivo carregado. Selecione a planilha (aba).', 'success', 'multiplicadorStatusMessage');
        } catch (err) {
            console.error("Erro ao ler planilha:", err);
            mostrarMensagem('Erro ao processar a planilha.', 'error', 'multiplicadorStatusMessage');
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
    columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
    startRowSelector.value = ''; endRowSelector.value = ''; // Reset row selectors
    startRowSelector.max = ''; endRowSelector.max = '';
}

function handleSheetSelection() {
    const sheetName = sheetSelector.value;
    if (!sheetName || !multiplicatorWorkbook) {
        originalPreviewContainer.style.display = 'none';
        columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
        startRowSelector.value = ''; endRowSelector.value = '';
        startRowSelector.max = ''; endRowSelector.max = '';
        return;
    }
    
    const ws = multiplicatorWorkbook.Sheets[sheetName];
    multiplicatorSelectedSheetData = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

    if (multiplicatorSelectedSheetData.length <= 1) { // No data rows or only header
        mostrarMensagem('A planilha selecionada está vazia ou contém apenas cabeçalho.', 'error', 'multiplicadorStatusMessage');
        originalPreviewContainer.style.display = 'none';
        columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
        startRowSelector.value = ''; endRowSelector.value = '';
        startRowSelector.max = ''; endRowSelector.max = '';
        return;
    }

    const headers = multiplicatorSelectedSheetData[0];
    const numDataRows = multiplicatorSelectedSheetData.length - 1;

    populateColumnSelector(headers);
    renderHtmlTable(originalDataTableHead, originalDataTableBody, headers, multiplicatorSelectedSheetData.slice(1));
    originalPreviewContainer.style.display = 'block';
    multipliedPreviewContainer.style.display = 'none';

    // Update row selectors
    startRowSelector.value = numDataRows > 0 ? 1 : '';
    startRowSelector.max = numDataRows > 0 ? numDataRows : '';
    endRowSelector.value = numDataRows > 0 ? numDataRows : '';
    endRowSelector.max = numDataRows > 0 ? numDataRows : '';
}

function populateColumnSelector(headers) {
    columnSelector.innerHTML = '<option value="">Selecione uma coluna...</option>';
    headers.forEach((header, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.textContent = header || `Coluna ${index + 1}`;
        columnSelector.appendChild(option);
    });
}

function renderHtmlTable(theadElement, tbodyElement, headers, dataRows) {
    theadElement.innerHTML = ''; tbodyElement.innerHTML = '';
    const trHead = document.createElement('tr');
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText || '';
        trHead.appendChild(th);
    });
    theadElement.appendChild(trHead);
    dataRows.forEach(rowArray => {
        const tr = document.createElement('tr');
        headers.forEach((_, colIndex) => { 
            const td = document.createElement('td');
            td.textContent = (rowArray[colIndex] !== undefined && rowArray[colIndex] !== null) ? rowArray[colIndex] : '';
            tr.appendChild(td);
        });
        tbodyElement.appendChild(tr);
    });
}

function processarMultiplicacao() {
    const columnIndex = parseInt(columnSelector.value);
    if (isNaN(columnIndex) || !multiplicatorSelectedSheetData || multiplicatorSelectedSheetData.length <= 1) { // Check for header too
        mostrarMensagem('Selecione uma aba e coluna válidas para multiplicar.', 'error', 'multiplicadorStatusMessage');
        return;
    }

    let startLine = parseInt(startRowSelector.value);
    let endLine = parseInt(endRowSelector.value);
    const totalDataRows = multiplicatorSelectedSheetData.length - 1; // Number of actual data rows

    // Validate and default row range
    if (isNaN(startLine) || startLine < 1 || startLine > totalDataRows) {
        startLine = 1; // Default to first data row
    }
    if (isNaN(endLine) || endLine < startLine || endLine > totalDataRows) {
        endLine = totalDataRows; // Default to last data row
    }
    // Update input fields if defaulted
    startRowSelector.value = startLine;
    endRowSelector.value = endLine;


    const headerOfSelectedColumn = multiplicatorSelectedSheetData[0][columnIndex] || `Coluna ${columnIndex + 1}`;
    multiplicatorMultipliedData = [];
    
    // User's line numbers are 1-based. `multiplicatorSelectedSheetData[0]` is header.
    // So, user's line `L` corresponds to `multiplicatorSelectedSheetData[L]`.
    for (let i = startLine; i <= endLine; i++) {
        // `i` is already the correct 1-based index for multiplicatorSelectedSheetData (since 0 is header)
        if (i >= multiplicatorSelectedSheetData.length) break; // Safety break

        const row = multiplicatorSelectedSheetData[i];
        if (row) { 
            const value = row[columnIndex];
            if (value !== undefined && value !== null && String(value).trim() !== '') { // Also check for non-empty strings
                for (let j = 0; j < 4; j++) {
                    multiplicatorMultipliedData.push(value);
                }
            }
        }
    }

    if (multiplicatorMultipliedData.length === 0) {
        mostrarMensagem('Nenhum dado para multiplicar na coluna e intervalo selecionados, ou valores vazios.', 'warning', 'multiplicadorStatusMessage');
        multipliedPreviewContainer.style.display = 'none';
        return;
    }
    
    const multipliedHeaders = [`Valores Multiplicados (${headerOfSelectedColumn})`];
    const multipliedDataAsRows = multiplicatorMultipliedData.map(val => [val]); 
    
    renderHtmlTable(multipliedDataTableHead, multipliedDataTableBody, multipliedHeaders, multipliedDataAsRows);
    multipliedPreviewContainer.style.display = 'block';
    mostrarMensagem('Dados multiplicados com sucesso! Confira a pré-visualização.', 'success', 'multiplicadorStatusMessage');
}

function exportarDadosMultiplicados() {
    if (multiplicatorMultipliedData.length === 0) {
        mostrarMensagem('Nenhum dado multiplicado para exportar.', 'error', 'multiplicadorStatusMessage');
        return;
    }
    const selectedColumnHeader = (multiplicatorSelectedSheetData && multiplicatorSelectedSheetData[0] && columnSelector.value !== "") 
                               ? (multiplicatorSelectedSheetData[0][parseInt(columnSelector.value)] || `Coluna_${parseInt(columnSelector.value)+1}`)
                               : "Dados";
    const fileName = `dados_multiplicados_${selectedColumnHeader.replace(/[^\w.-]+/g, '_')}.xlsx`; // Sanitize filename
    const exportSheetName = `Multiplicado ${selectedColumnHeader.substring(0,20)}`;
    const dataToExport = [[`Valores Multiplicados de '${selectedColumnHeader}'`]];
    multiplicatorMultipliedData.forEach(value => { dataToExport.push([value]); });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    const range = XLSX.utils.decode_range(ws['!ref']);
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            let cell = ws[cellAddress];
            if (!cell) cell = ws[cellAddress] = { t: 's', v: '' };
            cell.s = { alignment: { horizontal: 'center', vertical: 'center' } };
            if (R === 0) { 
                cell.s.font = { bold: true, color: { rgb: "FFFFFFFF" } };
                cell.s.fill = { fgColor: { rgb: isDarkTheme ? "FF9055A2" : "FF4facfe" } };
            }
        }
    }
    ws['!cols'] = [{ wch: Math.max(30, selectedColumnHeader.length + 25) }]; 
    XLSX.utils.book_append_sheet(wb, ws, exportSheetName);
    XLSX.writeFile(wb, fileName);
    mostrarMensagem(`Arquivo ${fileName} exportado com sucesso!`, 'success', 'multiplicadorStatusMessage');
}