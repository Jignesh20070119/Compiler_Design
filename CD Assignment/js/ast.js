/**
 * Intelligent Compiler - AST Node Definitions
 */

class ASTNode {
  constructor(type) {
    this.type = type;
  }
}

class ProgramNode extends ASTNode {
  constructor(declarations = []) {
    super('Program');
    this.declarations = declarations;
  }
}

class GlobalDeclNode extends ASTNode {
  constructor(name, expression, line, column) {
    super('GlobalDecl');
    this.name = name;
    this.expression = expression;
    this.line = line;
    this.column = column;
  }
}

class FunctionDeclNode extends ASTNode {
  constructor(name, parameters, body, line, column) {
    super('FunctionDecl');
    this.name = name;
    this.parameters = parameters; // Array of param names
    this.body = body; // BlockNode
    this.line = line;
    this.column = column;
  }
}

class ProcedureDeclNode extends ASTNode {
  constructor(name, parameters, body, line, column) {
    super('ProcedureDecl');
    this.name = name;
    this.parameters = parameters;
    this.body = body;
    this.line = line;
    this.column = column;
  }
}

class BlockNode extends ASTNode {
  constructor(statements = [], line = 1, column = 1) {
    super('Block');
    this.statements = statements;
    this.line = line;
    this.column = column;
  }
}

class VarDeclNode extends ASTNode {
  constructor(dataType, name, expression, line, column) {
    super('VarDecl');
    this.dataType = dataType; // 'int', 'float', 'string'
    this.name = name;
    this.expression = expression;
    this.line = line;
    this.column = column;
  }
}

class ReturnStmtNode extends ASTNode {
  constructor(expression, line, column) {
    super('ReturnStmt');
    this.expression = expression;
    this.line = line;
    this.column = column;
  }
}

class PrintStmtNode extends ASTNode {
  constructor(expression, line, column) {
    super('PrintStmt');
    this.expression = expression;
    this.line = line;
    this.column = column;
  }
}

class BinaryExprNode extends ASTNode {
  constructor(operator, left, right, line, column) {
    super('BinaryExpr');
    this.operator = operator;
    this.left = left;
    this.right = right;
    this.line = line;
    this.column = column;
  }
}

class LiteralNode extends ASTNode {
  constructor(dataType, value, line, column) {
    super('Literal');
    this.dataType = dataType; // 'int', 'float', 'string'
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

class IdentifierNode extends ASTNode {
  constructor(name, line, column) {
    super('Identifier');
    this.name = name;
    this.line = line;
    this.column = column;
  }
}
