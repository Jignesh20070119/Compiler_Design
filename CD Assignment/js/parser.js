/**
 * Intelligent Compiler - Parser with Panic Mode & Phrase-Level Recovery
 * Builds Abstract Syntax Tree (AST) while robustly recovering from syntax errors.
 */

class Parser {
  constructor(tokens) {
    this.tokens = tokens || [];
    this.cursor = 0;
    this.syntaxErrors = [];
    this.recoveryLogs = [];
  }

  currentToken() {
    if (this.cursor >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // Return EOF token
    }
    return this.tokens[this.cursor];
  }

  peekToken(offset = 1) {
    const idx = this.cursor + offset;
    if (idx >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1];
    }
    return this.tokens[idx];
  }

  advance() {
    const tok = this.currentToken();
    if (this.cursor < this.tokens.length - 1) {
      this.cursor++;
    }
    return tok;
  }

  match(type, value = null) {
    const tok = this.currentToken();
    if (tok.type === type && (value === null || tok.value === value)) {
      this.advance();
      return true;
    }
    return false;
  }

  expect(type, value = null, contextDescription = '') {
    const tok = this.currentToken();

    if (tok.type === type && (value === null || tok.value === value)) {
      return this.advance();
    }

    // Phrase-Level Recovery checks
    if (value === ';') {
      this.logSyntaxError({
        type: 'Syntax Error',
        message: `Missing ';' ${contextDescription}`.trim(),
        line: tok.line,
        column: tok.column,
        identifier: tok.value,
        suggestion: `Add ';' at the end of the statement.`,
        recoveryMethod: 'Phrase-Level Recovery'
      });
      this.recoveryLogs.push({
        type: 'Phrase-Level Recovery',
        line: tok.line,
        column: tok.column,
        description: `Inserted missing ';' automatically after ${contextDescription || 'statement'}.`
      });
      // Auto-inserted synthetic semicolon token (do not advance cursor)
      return { type: 'DELIMITER', value: ';', line: tok.line, column: tok.column, synthetic: true };
    }

    if (value === ')') {
      this.logSyntaxError({
        type: 'Syntax Error',
        message: `Expected ')' before '${tok.value}' ${contextDescription}`.trim(),
        line: tok.line,
        column: tok.column,
        identifier: tok.value,
        suggestion: `Add closing parenthesis ')'.`,
        recoveryMethod: 'Phrase-Level Recovery'
      });
      this.recoveryLogs.push({
        type: 'Phrase-Level Recovery',
        line: tok.line,
        column: tok.column,
        description: `Inserted missing ')' automatically before '${tok.value}'.`
      });
      return { type: 'DELIMITER', value: ')', line: tok.line, column: tok.column, synthetic: true };
    }

    // Panic Mode Recovery for other mismatches
    this.logSyntaxError({
      type: 'Syntax Error',
      message: `Expected ${value ? `'${value}'` : type} but found '${tok.value}' ${contextDescription}`.trim(),
      line: tok.line,
      column: tok.column,
      identifier: tok.value,
      suggestion: `Check syntax near token '${tok.value}'.`,
      recoveryMethod: 'Panic Mode Recovery'
    });

    this.panicModeRecover([';', '}', ')']);
    return null;
  }

  panicModeRecover(syncTokens = [';', '}', ')']) {
    const startTok = this.currentToken();
    const skipped = [];

    while (this.currentToken().type !== 'EOF') {
      const tok = this.currentToken();
      if (tok.type === 'DELIMITER' && syncTokens.includes(tok.value)) {
        // Advance past sync token unless it's a block end brace
        if (tok.value === ';') {
          this.advance();
        }
        break;
      }
      skipped.push(tok.value);
      this.advance();
    }

    this.recoveryLogs.push({
      type: 'Panic Mode Recovery',
      line: startTok.line,
      column: startTok.column,
      description: `Panic mode activated. Skipped tokens [${skipped.join(', ')}] until synchronization token reached.`
    });
  }

  logSyntaxError(err) {
    this.syntaxErrors.push(err);
  }

  // --- Grammar Parser ---

  parseProgram() {
    const declarations = [];

    while (this.currentToken().type !== 'EOF') {
      try {
        const decl = this.parseDeclaration();
        if (decl) declarations.push(decl);
      } catch (err) {
        this.panicModeRecover([';', '}']);
      }
    }

    return {
      ast: new ProgramNode(declarations),
      errors: this.syntaxErrors,
      recoveryLogs: this.recoveryLogs
    };
  }

  parseDeclaration() {
    const tok = this.currentToken();

    if (tok.type === 'KEYWORD' && tok.value === 'global') {
      return this.parseGlobalDecl();
    }
    if (tok.type === 'KEYWORD' && tok.value === 'function') {
      return this.parseFunctionDecl();
    }
    if (tok.type === 'KEYWORD' && tok.value === 'procedure') {
      return this.parseProcedureDecl();
    }

    // Top-level statement or fallback
    this.logSyntaxError({
      type: 'Syntax Error',
      message: `Unexpected top-level construct '${tok.value}'`,
      line: tok.line,
      column: tok.column,
      identifier: tok.value,
      suggestion: `Top-level definitions must be 'global', 'function', or 'procedure'.`,
      recoveryMethod: 'Panic Mode Recovery'
    });
    this.panicModeRecover([';', '}']);
    return null;
  }

  parseGlobalDecl() {
    const startTok = this.advance(); // consume 'global'
    const nameTok = this.currentToken();

    if (nameTok.type !== 'IDENTIFIER') {
      this.expect('IDENTIFIER', null, 'in global declaration');
      return null;
    }
    this.advance();

    this.expect('OPERATOR', '=', 'after global variable name');
    const expr = this.parseExpression();
    this.expect('DELIMITER', ';', 'after global declaration');

    return new GlobalDeclNode(nameTok.value, expr, startTok.line, startTok.column);
  }

  parseFunctionDecl() {
    const startTok = this.advance(); // consume 'function'
    const nameTok = this.currentToken();

    if (nameTok.type !== 'IDENTIFIER') {
      this.expect('IDENTIFIER', null, 'in function declaration');
      return null;
    }
    this.advance();

    this.expect('DELIMITER', '(', 'after function name');
    const params = this.parseParameters();
    this.expect('DELIMITER', ')', 'after parameters');

    const body = this.parseBlock();
    return new FunctionDeclNode(nameTok.value, params, body, startTok.line, startTok.column);
  }

  parseProcedureDecl() {
    const startTok = this.advance(); // consume 'procedure'
    const nameTok = this.currentToken();

    if (nameTok.type !== 'IDENTIFIER') {
      this.expect('IDENTIFIER', null, 'in procedure declaration');
      return null;
    }
    this.advance();

    this.expect('DELIMITER', '(', 'after procedure name');
    const params = this.parseParameters();
    this.expect('DELIMITER', ')', 'after parameters');

    const body = this.parseBlock();
    return new ProcedureDeclNode(nameTok.value, params, body, startTok.line, startTok.column);
  }

  parseParameters() {
    const params = [];
    if (this.currentToken().type === 'IDENTIFIER') {
      params.push(this.advance().value);
      while (this.currentToken().type === 'DELIMITER' && this.currentToken().value === ',') {
        this.advance();
        if (this.currentToken().type === 'IDENTIFIER') {
          params.push(this.advance().value);
        } else {
          this.logSyntaxError({
            type: 'Syntax Error',
            message: `Expected parameter identifier after ','`,
            line: this.currentToken().line,
            column: this.currentToken().column,
            identifier: this.currentToken().value,
            suggestion: `Add parameter name.`,
            recoveryMethod: 'Panic Mode Recovery'
          });
          break;
        }
      }
    }
    return params;
  }

  parseBlock() {
    const startTok = this.currentToken();
    if (startTok.type === 'DELIMITER' && startTok.value === '{') {
      this.advance();
    } else {
      this.logSyntaxError({
        type: 'Syntax Error',
        message: `Expected '{' to start block`,
        line: startTok.line,
        column: startTok.column,
        suggestion: `Add '{' to enclose function/procedure or block body.`,
        recoveryMethod: 'Phrase-Level Recovery'
      });
    }

    const statements = [];
    while (this.currentToken().type !== 'EOF' && !(this.currentToken().type === 'DELIMITER' && this.currentToken().value === '}')) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }

    if (this.currentToken().type === 'DELIMITER' && this.currentToken().value === '}') {
      this.advance();
    } else {
      this.logSyntaxError({
        type: 'Syntax Error',
        message: `Missing '}' to close block`,
        line: startTok.line,
        column: startTok.column,
        suggestion: `Add '}' at the end of the block.`,
        recoveryMethod: 'Phrase-Level Recovery'
      });
    }

    return new BlockNode(statements, startTok.line, startTok.column);
  }

  parseStatement() {
    const tok = this.currentToken();

    // Nested Block
    if (tok.type === 'DELIMITER' && tok.value === '{') {
      return this.parseBlock();
    }

    // Variable Declaration (int, float, string)
    if (tok.type === 'KEYWORD' && ['int', 'float', 'string'].includes(tok.value)) {
      return this.parseVariableDecl();
    }

    // Return Statement
    if (tok.type === 'KEYWORD' && tok.value === 'return') {
      return this.parseReturnStmt();
    }

    // Print Statement
    if (tok.type === 'KEYWORD' && tok.value === 'print') {
      return this.parsePrintStmt();
    }

    // Unknown statement / syntax error
    this.logSyntaxError({
      type: 'Syntax Error',
      message: `Invalid statement starting with '${tok.value}'`,
      line: tok.line,
      column: tok.column,
      identifier: tok.value,
      suggestion: `Expected variable declaration, return, print, or nested block.`,
      recoveryMethod: 'Panic Mode Recovery'
    });
    this.panicModeRecover([';', '}']);
    return null;
  }

  parseVariableDecl() {
    const typeTok = this.advance(); // consume 'int' / 'float' / 'string'
    const nameTok = this.currentToken();

    if (nameTok.type !== 'IDENTIFIER') {
      this.logSyntaxError({
        type: 'Syntax Error',
        message: `Expected variable identifier after type '${typeTok.value}'`,
        line: nameTok.line,
        column: nameTok.column,
        identifier: nameTok.value,
        suggestion: `Provide variable name.`,
        recoveryMethod: 'Panic Mode Recovery'
      });
      this.panicModeRecover([';', '}']);
      return null;
    }
    this.advance();

    this.expect('OPERATOR', '=', 'in variable declaration');
    const expr = this.parseExpression();
    this.expect('DELIMITER', ';', 'after variable declaration');

    return new VarDeclNode(typeTok.value, nameTok.value, expr, typeTok.line, typeTok.column);
  }

  parseReturnStmt() {
    const startTok = this.advance(); // consume 'return'
    const expr = this.parseExpression();
    this.expect('DELIMITER', ';', 'after return statement');
    return new ReturnStmtNode(expr, startTok.line, startTok.column);
  }

  parsePrintStmt() {
    const startTok = this.advance(); // consume 'print'
    const expr = this.parseExpression();
    this.expect('DELIMITER', ';', 'after print statement');
    return new PrintStmtNode(expr, startTok.line, startTok.column);
  }

  // --- Expressions ---

  parseExpression() {
    let left = this.parseTerm();

    while (this.currentToken().type === 'OPERATOR' && ['+', '-'].includes(this.currentToken().value)) {
      const opTok = this.advance();
      const right = this.parseTerm();
      left = new BinaryExprNode(opTok.value, left, right, opTok.line, opTok.column);
    }

    return left;
  }

  parseTerm() {
    let left = this.parseFactor();

    while (this.currentToken().type === 'OPERATOR' && ['*', '/'].includes(this.currentToken().value)) {
      const opTok = this.advance();
      const right = this.parseFactor();
      left = new BinaryExprNode(opTok.value, left, right, opTok.line, opTok.column);
    }

    return left;
  }

  parseFactor() {
    const tok = this.currentToken();

    if (tok.type === 'IDENTIFIER') {
      this.advance();
      return new IdentifierNode(tok.value, tok.line, tok.column);
    }

    if (tok.type === 'INT_LITERAL') {
      this.advance();
      return new LiteralNode('int', parseInt(tok.value, 10), tok.line, tok.column);
    }

    if (tok.type === 'FLOAT_LITERAL') {
      this.advance();
      return new LiteralNode('float', parseFloat(tok.value), tok.line, tok.column);
    }

    if (tok.type === 'STRING_LITERAL') {
      this.advance();
      return new LiteralNode('string', tok.value, tok.line, tok.column);
    }

    if (tok.type === 'DELIMITER' && tok.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.expect('DELIMITER', ')', 'to close expression');
      return expr;
    }

    this.logSyntaxError({
      type: 'Syntax Error',
      message: `Unexpected token '${tok.value}' in expression`,
      line: tok.line,
      column: tok.column,
      identifier: tok.value,
      suggestion: `Expected variable, literal, or '('`,
      recoveryMethod: 'Panic Mode Recovery'
    });
    this.advance();
    return new LiteralNode('int', 0, tok.line, tok.column);
  }
}
