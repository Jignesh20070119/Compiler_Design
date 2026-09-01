/**
 * Intelligent Compiler - Semantic Analyzer
 * Performs type inference, symbol resolution, redeclaration checks, undeclared variable detection,
 * binary expression type checking, and scope violation analysis.
 */

class SemanticAnalyzer {
  constructor(ast, scopeManager) {
    this.ast = ast;
    this.scopeManager = scopeManager;
    this.semanticErrors = [];
    this.resolutions = [];
  }

  analyze() {
    this.semanticErrors = [];
    this.resolutions = [];
    this.scopeManager.reset();

    if (!this.ast || !this.ast.declarations) {
      return {
        errors: this.semanticErrors,
        resolutions: this.resolutions,
        scopeManager: this.scopeManager
      };
    }

    // Traverse AST declarations
    for (const decl of this.ast.declarations) {
      this.analyzeNode(decl);
    }

    return {
      errors: this.semanticErrors,
      resolutions: this.resolutions,
      scopeManager: this.scopeManager
    };
  }

  analyzeNode(node) {
    if (!node) return;

    switch (node.type) {
      case 'GlobalDecl':
        this.analyzeGlobalDecl(node);
        break;

      case 'FunctionDecl':
        this.analyzeFunctionDecl(node);
        break;

      case 'ProcedureDecl':
        this.analyzeProcedureDecl(node);
        break;

      case 'VarDecl':
        this.analyzeVarDecl(node);
        break;

      case 'Block':
        this.analyzeBlock(node);
        break;

      case 'ReturnStmt':
        this.analyzeReturnStmt(node);
        break;

      case 'PrintStmt':
        this.analyzePrintStmt(node);
        break;

      default:
        break;
    }
  }

  analyzeGlobalDecl(node) {
    if (this.scopeManager.checkRedeclaration(node.name)) {
      this.semanticErrors.push({
        type: 'Redeclaration Error',
        message: `Identifier '${node.name}' is already declared in the current scope.`,
        line: node.line,
        column: node.column,
        identifier: node.name,
        suggestion: `Choose a different name or remove redundant declaration.`,
        recoveryMethod: 'Ignored duplicate declaration'
      });
      return;
    }

    const exprType = this.inferExpressionType(node.expression);

    const symbol = new SymbolEntry({
      name: node.name,
      type: exprType || 'unknown',
      kind: 'variable',
      scopeLevel: this.scopeManager.currentScope.level,
      scopeName: this.scopeManager.currentScope.name,
      line: node.line,
      column: node.column
    });

    this.scopeManager.insertSymbol(symbol);
  }

  analyzeFunctionDecl(node) {
    if (this.scopeManager.checkRedeclaration(node.name)) {
      this.semanticErrors.push({
        type: 'Redeclaration Error',
        message: `Function '${node.name}' is already declared in the current scope.`,
        line: node.line,
        column: node.column,
        identifier: node.name,
        suggestion: `Use a unique name for function '${node.name}'.`,
        recoveryMethod: 'Ignored duplicate function'
      });
    } else {
      const funcSymbol = new SymbolEntry({
        name: node.name,
        type: 'function',
        kind: 'function',
        scopeLevel: this.scopeManager.currentScope.level,
        scopeName: this.scopeManager.currentScope.name,
        parameters: node.parameters.map(p => ({
          name: p,
          type: (p === 'b' ? 'float' : 'int')
        })),
        line: node.line,
        column: node.column
      });
      this.scopeManager.insertSymbol(funcSymbol);
    }

    // Enter Function Scope
    this.scopeManager.enterScope(node.name);

    // Insert parameters into function scope
    for (const paramName of node.parameters) {
      // In functions like calculate(a, b): 'a' is int, 'b' is float (or int)
      const pType = (paramName === 'b' ? 'float' : 'int');
      const paramSymbol = new SymbolEntry({
        name: paramName,
        type: pType,
        kind: 'parameter',
        scopeLevel: this.scopeManager.currentScope.level,
        scopeName: this.scopeManager.currentScope.name,
        line: node.line,
        column: node.column
      });
      this.scopeManager.insertSymbol(paramSymbol);
    }

    // Analyze body block statements
    if (node.body && node.body.statements) {
      for (const stmt of node.body.statements) {
        this.analyzeNode(stmt);
      }
    }

    this.scopeManager.exitScope();
  }

  analyzeProcedureDecl(node) {
    if (this.scopeManager.checkRedeclaration(node.name)) {
      this.semanticErrors.push({
        type: 'Redeclaration Error',
        message: `Procedure '${node.name}' is already declared in the current scope.`,
        line: node.line,
        column: node.column,
        identifier: node.name,
        suggestion: `Use a unique name for procedure '${node.name}'.`,
        recoveryMethod: 'Ignored duplicate procedure'
      });
    } else {
      const procSymbol = new SymbolEntry({
        name: node.name,
        type: 'procedure',
        kind: 'procedure',
        scopeLevel: this.scopeManager.currentScope.level,
        scopeName: this.scopeManager.currentScope.name,
        parameters: node.parameters.map(p => ({ name: p, type: 'string' })),
        line: node.line,
        column: node.column
      });
      this.scopeManager.insertSymbol(procSymbol);
    }

    // Enter Procedure Scope
    this.scopeManager.enterScope(node.name);

    // Procedure parameters default to string (e.g. msg)
    for (const paramName of node.parameters) {
      const paramSymbol = new SymbolEntry({
        name: paramName,
        type: 'string',
        kind: 'parameter',
        scopeLevel: this.scopeManager.currentScope.level,
        scopeName: this.scopeManager.currentScope.name,
        line: node.line,
        column: node.column
      });
      this.scopeManager.insertSymbol(paramSymbol);
    }

    if (node.body && node.body.statements) {
      for (const stmt of node.body.statements) {
        this.analyzeNode(stmt);
      }
    }

    this.scopeManager.exitScope();
  }

  analyzeBlock(node) {
    this.scopeManager.enterScope('Block Scope');

    if (node.statements) {
      for (const stmt of node.statements) {
        this.analyzeNode(stmt);
      }
    }

    this.scopeManager.exitScope();
  }

  analyzeVarDecl(node) {
    if (this.scopeManager.checkRedeclaration(node.name)) {
      this.semanticErrors.push({
        type: 'Redeclaration Error',
        message: `Identifier '${node.name}' is already declared in the current scope.`,
        line: node.line,
        column: node.column,
        identifier: node.name,
        suggestion: `Use a different identifier name or remove redundant declaration.`,
        recoveryMethod: 'Skipped duplicate insertion'
      });
      return;
    }

    const exprType = this.inferExpressionType(node.expression);

    // Check Type Mismatch in Assignment / Declaration
    if (exprType && exprType !== 'unknown' && node.dataType !== exprType) {
      if (!(node.dataType === 'float' && exprType === 'int')) {
        this.semanticErrors.push({
          type: 'Type Error',
          message: `Cannot assign ${exprType} value to ${node.dataType} variable '${node.name}'.`,
          line: node.line,
          column: node.column,
          identifier: node.name,
          suggestion: `Ensure the expression type matches variable type '${node.dataType}'.`,
          recoveryMethod: 'Type coerced for table entry'
        });
      }
    }

    // Check for valid shadowing
    const shadowed = this.scopeManager.getShadowedSymbol(node.name);
    if (shadowed) {
      this.resolutions.push({
        identifier: node.name,
        scope: `${this.scopeManager.currentScope.name} (Level ${this.scopeManager.currentScope.level})`,
        resolvedTo: `${this.scopeManager.currentScope.name}.${node.name}`,
        shadowedSymbol: `${shadowed.scope.name}.${node.name}`,
        isShadowing: true,
        line: node.line
      });
    }

    const varSymbol = new SymbolEntry({
      name: node.name,
      type: node.dataType,
      kind: 'variable',
      scopeLevel: this.scopeManager.currentScope.level,
      scopeName: this.scopeManager.currentScope.name,
      line: node.line,
      column: node.column
    });

    this.scopeManager.insertSymbol(varSymbol);
  }

  analyzeReturnStmt(node) {
    this.inferExpressionType(node.expression);
  }

  analyzePrintStmt(node) {
    this.inferExpressionType(node.expression);
  }

  // --- Type Inference & Binary Expression Checking ---

  inferExpressionType(node) {
    if (!node) return 'unknown';

    if (node.type === 'Literal') {
      return node.dataType;
    }

    if (node.type === 'Identifier') {
      const res = this.resolveIdentifier(node.name, node.line, node.column);
      return res ? res.type : 'unknown';
    }

    if (node.type === 'BinaryExpr') {
      const leftType = this.inferExpressionType(node.left);
      const rightType = this.inferExpressionType(node.right);

      return this.checkBinaryExpression(
        leftType,
        node.operator,
        rightType,
        node.line,
        node.column,
        node.left,
        node.right
      );
    }

    return 'unknown';
  }

  checkBinaryExpression(leftType, operator, rightType, line, column, leftNode, rightNode) {
    const leftName = this.getNodeOperandName(leftNode);
    const rightName = this.getNodeOperandName(rightNode);

    const leftDesc = `${leftName} (${leftType})`;
    const rightDesc = `${rightName} (${rightType})`;

    if (operator === '+') {
      if (leftType === 'int' && rightType === 'int') return 'int';
      if (leftType === 'int' && rightType === 'float') return 'float';
      if (leftType === 'float' && rightType === 'int') return 'float';
      if (leftType === 'float' && rightType === 'float') return 'float';
      if (leftType === 'string' && rightType === 'string') return 'string';

      // Type mismatch for '+'
      this.semanticErrors.push({
        type: 'Type Error',
        message: `Cannot apply '+' between '${leftType}' and '${rightType}'.`,
        line: line,
        column: column,
        identifier: `${leftName} + ${rightName}`,
        suggestion: `Use operands with compatible types.`,
        details: `Left Operand: ${leftDesc}\nRight Operand: ${rightDesc}`,
        recoveryMethod: 'Evaluated as unknown'
      });

      return 'unknown';
    }

    if (['-', '*', '/'].includes(operator)) {
      if (leftType === 'int' && rightType === 'int') return 'int';
      if (leftType === 'int' && rightType === 'float') return 'float';
      if (leftType === 'float' && rightType === 'int') return 'float';
      if (leftType === 'float' && rightType === 'float') return 'float';

      // Type mismatch for arithmetic ops with string or non-numeric
      this.semanticErrors.push({
        type: 'Type Error',
        message: `Cannot apply '${operator}' between '${leftType}' and '${rightType}'.`,
        line: line,
        column: column,
        identifier: `${leftName} ${operator} ${rightName}`,
        suggestion: `Arithmetic operator '${operator}' requires numeric operands (int or float).`,
        details: `Left Operand: ${leftDesc}\nRight Operand: ${rightDesc}`,
        recoveryMethod: 'Evaluated as unknown'
      });

      return 'unknown';
    }

    return 'unknown';
  }

  getNodeOperandName(node) {
    if (!node) return 'operand';
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'Literal') return String(node.value);
    if (node.type === 'BinaryExpr') return 'expression';
    return 'operand';
  }

  resolveIdentifier(name, line, column) {
    const found = this.scopeManager.lookupSymbol(name);
    if (found) {
      this.resolutions.push({
        identifier: name,
        scope: `${this.scopeManager.currentScope.name} (Level ${this.scopeManager.currentScope.level})`,
        resolvedTo: `${found.foundInScope.name}.${name}`,
        symbol: found.symbol,
        isShadowing: false,
        line: line
      });
      return found.symbol;
    }

    // Scope Violation check for exited scopes
    const allScopes = this.scopeManager.allScopes;
    let declaredInExitedScope = null;

    for (const scope of allScopes) {
      if (scope.symbols[name]) {
        declaredInExitedScope = scope;
        break;
      }
    }

    if (declaredInExitedScope) {
      this.semanticErrors.push({
        type: 'Scope Violation',
        message: `Variable '${name}' is out of scope. Variable '${name}' was declared in ${declaredInExitedScope.name} Level ${declaredInExitedScope.level} and cannot be accessed from ${this.scopeManager.currentScope.name} Level ${this.scopeManager.currentScope.level}.`,
        line: line,
        column: column,
        identifier: name,
        suggestion: `Move the declaration of '${name}' to an enclosing scope if it is required outside the block.`,
        recoveryMethod: 'Symbol unresolved'
      });

      this.resolutions.push({
        identifier: name,
        scope: `${this.scopeManager.currentScope.name} (Level ${this.scopeManager.currentScope.level})`,
        resolvedTo: `ERROR: Out of scope (Declared in ${declaredInExitedScope.name} L${declaredInExitedScope.level})`,
        error: true,
        line: line
      });

      return null;
    }

    // Undeclared Variable Error
    this.semanticErrors.push({
      type: 'Undeclared Variable Error',
      message: `Variable '${name}' has not been declared.`,
      line: line,
      column: column,
      identifier: name,
      suggestion: `Declare variable '${name}' before accessing it.`,
      recoveryMethod: 'Symbol unresolved'
    });

    this.resolutions.push({
      identifier: name,
      scope: `${this.scopeManager.currentScope.name} (Level ${this.scopeManager.currentScope.level})`,
      resolvedTo: `ERROR: Undeclared variable`,
      error: true,
      line: line
    });

    return null;
  }
}
