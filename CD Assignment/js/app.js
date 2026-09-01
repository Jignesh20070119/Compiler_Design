/**
 * Intelligent Compiler - App Controller & UI Renderer
 * Wires the source code editor, analysis pipeline, tab switching, and visualization displays.
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const sourceEditor = document.getElementById('source-code');
  const lineCountBadge = document.getElementById('editor-line-count');
  
  const btnAnalyze = document.getElementById('btn-analyze');
  const btnLoadExample = document.getElementById('btn-load-example');
  const btnClear = document.getElementById('btn-clear');
  
  const btnDemoPanic = document.getElementById('btn-demo-panic');
  const btnDemoPhrase = document.getElementById('btn-demo-phrase');

  const symbolTableBody = document.getElementById('symbol-table-body');
  const scopeTreeContainer = document.getElementById('scope-tree-container');
  const resolutionTableBody = document.getElementById('resolution-table-body');
  const astContainer = document.getElementById('ast-container');
  const tokensContainer = document.getElementById('tokens-container');
  const errorsContainer = document.getElementById('errors-container');
  const recoveryLogsContainer = document.getElementById('recovery-logs-container');
  const quickSummary = document.getElementById('quick-summary');
  const errorBadgeCount = document.getElementById('error-badge-count');

  // Load Primary Example on initial launch
  sourceEditor.value = DEMO_PRESETS.primaryExample;
  updateLineCount();

  // Event Listeners
  sourceEditor.addEventListener('input', updateLineCount);

  btnAnalyze.addEventListener('click', () => {
    runCompilerPipeline();
  });

  btnLoadExample.addEventListener('click', () => {
    sourceEditor.value = DEMO_PRESETS.primaryExample;
    updateLineCount();
    runCompilerPipeline();
  });

  btnClear.addEventListener('click', () => {
    sourceEditor.value = '';
    updateLineCount();
  });

  btnDemoPanic.addEventListener('click', () => {
    sourceEditor.value = DEMO_PRESETS.panicMode;
    updateLineCount();
    runCompilerPipeline();
    // Switch to recovery tab
    const recoveryTabBtn = document.getElementById('tab-recovery-btn');
    if (recoveryTabBtn) {
      new bootstrap.Tab(recoveryTabBtn).show();
    }
  });

  btnDemoPhrase.addEventListener('click', () => {
    sourceEditor.value = DEMO_PRESETS.phraseLevel;
    updateLineCount();
    runCompilerPipeline();
    const recoveryTabBtn = document.getElementById('tab-recovery-btn');
    if (recoveryTabBtn) {
      new bootstrap.Tab(recoveryTabBtn).show();
    }
  });

  // Preset Test Case dropdown wiring
  for (let i = 1; i <= 8; i++) {
    const testElem = document.getElementById(`load-test-${i}`);
    if (testElem) {
      testElem.addEventListener('click', (e) => {
        e.preventDefault();
        const testObj = TEST_CASES[`test${i}`];
        if (testObj) {
          sourceEditor.value = testObj.code;
          updateLineCount();
          runCompilerPipeline();
        }
      });
    }
  }

  // Initial Run
  runCompilerPipeline();

  // --- Helper Functions ---

  function updateLineCount() {
    const lines = sourceEditor.value.split('\n').length;
    lineCountBadge.textContent = `${lines} ${lines === 1 ? 'Line' : 'Lines'}`;
  }

  function runCompilerPipeline() {
    const code = sourceEditor.value;

    // 1. Lexical Analysis
    const lexer = new Lexer(code);
    const lexResult = lexer.tokenize();
    const tokens = lexResult.tokens;
    const lexErrors = lexResult.errors;

    // 2. Syntax Analysis & AST Construction
    const parser = new Parser(tokens);
    const parseResult = parser.parseProgram();
    const ast = parseResult.ast;
    const syntaxErrors = parseResult.errors;
    const recoveryLogs = parseResult.recoveryLogs;

    // 3. Scope Management & Semantic Analysis
    const scopeManager = new ScopeManager();
    const analyzer = new SemanticAnalyzer(ast, scopeManager);
    const semResult = analyzer.analyze();
    const semanticErrors = semResult.errors;
    const resolutions = semResult.resolutions;

    // Combine all errors
    const allErrors = [...lexErrors, ...syntaxErrors, ...semanticErrors];

    // Update UI Visualizations
    renderTokens(tokens);
    renderAST(ast);
    renderScopeTree(scopeManager);
    renderSymbolTable(scopeManager);
    renderResolutions(resolutions);
    ErrorReporter.renderErrorList(errorsContainer, recoveryLogsContainer, allErrors, recoveryLogs);
    renderQuickSummary(scopeManager, allErrors, resolutions);

    // Update Badge
    errorBadgeCount.textContent = allErrors.length;
    if (allErrors.length > 0) {
      errorBadgeCount.className = 'badge bg-danger rounded-pill ms-1';
    } else {
      errorBadgeCount.className = 'badge bg-success rounded-pill ms-1';
    }
  }

  function renderTokens(tokens) {
    if (!tokensContainer) return;
    tokensContainer.innerHTML = '';
    tokens.forEach(tok => {
      if (tok.type === 'EOF') return;
      const chip = document.createElement('div');
      chip.className = 'token-chip';
      chip.innerHTML = `
        <span class="tok-type">${tok.type}</span>
        <span class="tok-val">${escapeHtml(tok.value)}</span>
        <span class="tok-pos">L${tok.line}:C${tok.column}</span>
      `;
      tokensContainer.appendChild(chip);
    });
  }

  function renderAST(ast) {
    if (!astContainer) return;
    astContainer.innerHTML = '';

    function buildAstHtml(node, label = '') {
      if (!node) return '';
      let html = '<div class="ast-tree-node">';
      const title = label ? `<strong>${label}:</strong> ${node.type}` : node.type;
      html += `<span class="ast-node-title">${title}</span>`;

      if (node.name) html += ` <span class="ast-node-value">name='${node.name}'</span>`;
      if (node.dataType) html += ` <span class="ast-node-value">type='${node.dataType}'</span>`;
      if (node.operator) html += ` <span class="ast-node-value">op='${node.operator}'</span>`;
      if (node.value !== undefined) html += ` <span class="ast-node-value">val=${JSON.stringify(node.value)}</span>`;

      // Children
      if (node.declarations && node.declarations.length) {
        node.declarations.forEach(child => { html += buildAstHtml(child, 'Decl'); });
      }
      if (node.statements && node.statements.length) {
        node.statements.forEach(child => { html += buildAstHtml(child, 'Stmt'); });
      }
      if (node.parameters && node.parameters.length) {
        html += `<div class="ast-tree-node"><span class="ast-node-title">Params:</span> [${node.parameters.join(', ')}]</div>`;
      }
      if (node.body) {
        html += buildAstHtml(node.body, 'Body');
      }
      if (node.expression) {
        html += buildAstHtml(node.expression, 'Expr');
      }
      if (node.left) {
        html += buildAstHtml(node.left, 'Left');
      }
      if (node.right) {
        html += buildAstHtml(node.right, 'Right');
      }

      html += '</div>';
      return html;
    }

    astContainer.innerHTML = buildAstHtml(ast);
  }

  function renderScopeTree(scopeManager) {
    if (!scopeTreeContainer) return;
    scopeTreeContainer.innerHTML = '';

    const rootScope = scopeManager.globalScope;

    function buildScopeTreeHtml(scope) {
      const symbols = Object.values(scope.symbols);
      const levelClass = `scope-level-${Math.min(scope.level, 3)}`;

      let html = `
        <div class="scope-node ${levelClass}">
          <div class="scope-header">
            <span>
              <i class="bi bi-folder-fill text-warning me-2"></i>
              <strong>${scope.name} Scope</strong>
              <span class="badge bg-secondary font-monospace ms-2">Level ${scope.level}</span>
            </span>
            <span class="text-muted font-monospace small">ID: ${scope.id}</span>
          </div>
          <div class="scope-symbols mt-2">
      `;

      if (symbols.length === 0) {
        html += `<span class="text-muted small italic">No local symbols declared.</span>`;
      } else {
        symbols.forEach(sym => {
          const kindBadge = sym.kind === 'function' ? 'badge-function' :
                            sym.kind === 'procedure' ? 'badge-procedure' :
                            sym.kind === 'parameter' ? 'badge-parameter' : 'badge-variable';
          html += `
            <span class="symbol-tag" title="Type: ${sym.type}, Loc: ${sym.memoryLocation}">
              <span class="badge-kind ${kindBadge}">${sym.kind}</span>
              <strong class="text-light ms-1">${sym.name}</strong>
              <span class="text-muted font-monospace ms-1">(${sym.type})</span>
            </span>
          `;
        });
      }

      html += `</div>`;

      // Render children recursively
      if (scope.children && scope.children.length > 0) {
        html += `<div class="mt-2">`;
        scope.children.forEach(child => {
          html += buildScopeTreeHtml(child);
        });
        html += `</div>`;
      }

      html += `</div>`;
      return html;
    }

    scopeTreeContainer.innerHTML = buildScopeTreeHtml(rootScope);
  }

  function renderSymbolTable(scopeManager) {
    if (!symbolTableBody) return;
    symbolTableBody.innerHTML = '';

    const allSymbols = scopeManager.getAllSymbolsFlat();

    if (allSymbols.length === 0) {
      symbolTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No symbols registered.</td></tr>`;
      return;
    }

    allSymbols.forEach(sym => {
      const tr = document.createElement('tr');
      const kindBadge = sym.kind === 'function' ? 'badge-function' :
                        sym.kind === 'procedure' ? 'badge-procedure' :
                        sym.kind === 'parameter' ? 'badge-parameter' : 'badge-variable';

      const paramStr = sym.parameters && sym.parameters.length ?
        sym.parameters.map(p => p.name).join(', ') : '—';

      tr.innerHTML = `
        <td><strong class="text-cyan font-monospace">${sym.name}</strong></td>
        <td><span class="badge bg-dark border border-secondary text-light font-monospace">${sym.type}</span></td>
        <td><span class="badge-kind ${kindBadge}">${sym.kind}</span></td>
        <td><span class="text-light fw-medium">${sym.scopeName}</span></td>
        <td><span class="badge bg-secondary font-monospace">Level ${sym.scopeLevel}</span></td>
        <td><span class="badge-memory">${sym.memoryLocation}</span></td>
        <td><span class="text-muted font-monospace">${paramStr}</span></td>
      `;
      symbolTableBody.appendChild(tr);
    });
  }

  function renderResolutions(resolutions) {
    if (!resolutionTableBody) return;
    resolutionTableBody.innerHTML = '';

    if (!resolutions || resolutions.length === 0) {
      resolutionTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No identifier references to resolve.</td></tr>`;
      return;
    }

    resolutions.forEach(res => {
      const tr = document.createElement('tr');
      const targetClass = res.error ? 'text-danger font-monospace fw-bold' : 'text-success font-monospace fw-bold';
      const shadowInfo = res.isShadowing ? 
        `<span class="badge bg-warning text-dark"><i class="bi bi-layers-fill me-1"></i>Shadows ${res.shadowedSymbol}</span>` : 
        `<span class="text-muted">—</span>`;

      tr.innerHTML = `
        <td class="font-monospace text-muted">L${res.line}</td>
        <td><code class="code-inline">${res.identifier}</code></td>
        <td><span class="text-light">${res.scope}</span></td>
        <td class="${targetClass}">${res.resolvedTo}</td>
        <td>${shadowInfo}</td>
      `;
      resolutionTableBody.appendChild(tr);
    });
  }

  function renderQuickSummary(scopeManager, errors, resolutions) {
    if (!quickSummary) return;

    const totalScopes = scopeManager.allScopes.length;
    const totalSymbols = scopeManager.getAllSymbolsFlat().length;
    const totalErrors = errors.length;

    let statusBadge = totalErrors === 0 ? 
      '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Clean</span>' :
      `<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>${totalErrors} Error(s)</span>`;

    quickSummary.innerHTML = `
      <div class="d-flex flex-column gap-2 font-monospace small">
        <div class="d-flex justify-content-between">
          <span class="text-muted">Status:</span>
          <span>${statusBadge}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="text-muted">Active Scopes:</span>
          <span class="text-cyan fw-bold">${totalScopes}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="text-muted">Symbols Created:</span>
          <span class="text-purple fw-bold">${totalSymbols}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="text-muted">Ident References:</span>
          <span class="text-amber fw-bold">${resolutions.length}</span>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
