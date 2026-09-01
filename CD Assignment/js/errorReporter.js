/**
 * Intelligent Compiler - Error Reporter & Diagnostic Formatter
 * Generates rich educational diagnostic reports for Lexical, Syntax, and Semantic errors.
 */

class ErrorReporter {
  static renderErrorList(errorsContainer, recoveryLogsContainer, errors, recoveryLogs) {
    if (!errorsContainer) return;

    if (!errors || errors.length === 0) {
      errorsContainer.innerHTML = `
        <div class="alert alert-success d-flex align-items-center mb-0" role="alert">
          <i class="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>
            <strong>Analysis Completed Successfully!</strong> No lexical, syntax, or semantic errors were detected.
          </div>
        </div>
      `;
    } else {
      let html = '';
      errors.forEach((err, index) => {
        const typeClass = err.type.includes('Scope Violation') ? 'border-danger' : 
                         err.type.includes('Redeclaration') ? 'border-warning' : 'border-danger';
        
        const badgeColor = err.type.includes('Syntax') ? 'bg-danger' :
                           err.type.includes('Scope') ? 'bg-danger' :
                           err.type.includes('Redeclaration') ? 'bg-warning text-dark' : 'bg-info text-dark';

        html += `
          <div class="error-card ${typeClass}">
            <div class="error-card-header">
              <span class="error-card-title">
                <span class="badge ${badgeColor} me-2">ERROR #${index + 1}</span>
                ${err.type}
              </span>
              <span class="text-muted font-monospace small">Line ${err.line}, Column ${err.column}</span>
            </div>
            <div class="mb-2">
              <strong>Identifier:</strong> <code class="code-inline">${err.identifier || 'N/A'}</code>
            </div>
            <div class="mb-2 text-light">
              ${err.message}
            </div>
            ${err.suggestion ? `
              <div class="error-suggestion">
                <i class="bi bi-lightbulb-fill text-warning me-1"></i>
                <strong>Suggestion:</strong> ${err.suggestion}
              </div>
            ` : ''}
            <div class="mt-2 text-muted small">
              <i class="bi bi-shield-check text-info me-1"></i>
              <strong>Recovery Action:</strong> ${err.recoveryMethod || 'None required'}
            </div>
          </div>
        `;
      });

      errorsContainer.innerHTML = html;
    }

    // Render Recovery Logs
    if (recoveryLogsContainer) {
      if (!recoveryLogs || recoveryLogs.length === 0) {
        recoveryLogsContainer.innerHTML = `
          <div class="text-muted p-2 font-monospace small">
            No syntax recovery was triggered for this analysis.
          </div>
        `;
      } else {
        let recHtml = '<ul class="list-group list-group-flush border-0 font-monospace small">';
        recoveryLogs.forEach(rec => {
          const isPanic = rec.type.includes('Panic');
          const badgeClass = isPanic ? 'bg-danger' : 'bg-warning text-dark';
          recHtml += `
            <li class="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-start">
              <div>
                <span class="badge ${badgeClass} me-2">${rec.type}</span>
                ${rec.description}
              </div>
              <span class="text-muted ms-3">Line ${rec.line}:${rec.column}</span>
            </li>
          `;
        });
        recHtml += '</ul>';
        recoveryLogsContainer.innerHTML = recHtml;
      }
    }
  }
}
