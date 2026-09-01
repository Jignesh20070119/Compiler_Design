/**
 * Intelligent Compiler - Lexical Analyzer (Lexer)
 * Converts input source code string into a stream of tokens with accurate line & column metadata.
 */

const KEYWORDS = new Set([
  'global',
  'function',
  'procedure',
  'int',
  'float',
  'string',
  'return',
  'print'
]);

class Lexer {
  constructor(sourceCode) {
    this.source = sourceCode || '';
    this.cursor = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  tokenize() {
    this.tokens = [];
    this.errors = [];
    this.cursor = 0;
    this.line = 1;
    this.column = 1;

    while (this.cursor < this.source.length) {
      const char = this.source[this.cursor];

      // Handle newline
      if (char === '\n') {
        this.line++;
        this.column = 1;
        this.cursor++;
        continue;
      }

      // Skip whitespace
      if (/\s/.test(char)) {
        this.column++;
        this.cursor++;
        continue;
      }

      // Skip single-line comments (if any starts with //)
      if (char === '/' && this.source[this.cursor + 1] === '/') {
        while (this.cursor < this.source.length && this.source[this.cursor] !== '\n') {
          this.cursor++;
        }
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifierOrKeyword();
        continue;
      }

      // Numeric Literals (Integers & Floats)
      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }

      // String Literals
      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      // Operators
      if (['=', '+', '-', '*', '/'].includes(char)) {
        this.tokens.push({
          type: 'OPERATOR',
          value: char,
          line: this.line,
          column: this.column
        });
        this.cursor++;
        this.column++;
        continue;
      }

      // Delimiters
      if (['(', ')', '{', '}', ';', ','].includes(char)) {
        this.tokens.push({
          type: 'DELIMITER',
          value: char,
          line: this.line,
          column: this.column
        });
        this.cursor++;
        this.column++;
        continue;
      }

      // Invalid character error
      this.errors.push({
        type: 'Lexical Error',
        message: `Unexpected invalid character '${char}'`,
        line: this.line,
        column: this.column,
        identifier: char,
        suggestion: `Remove or correct character '${char}'.`,
        recoveryMethod: 'Token Skipped'
      });

      this.cursor++;
      this.column++;
    }

    // Add End Of File (EOF) token
    this.tokens.push({
      type: 'EOF',
      value: 'EOF',
      line: this.line,
      column: this.column
    });

    return {
      tokens: this.tokens,
      errors: this.errors
    };
  }

  readIdentifierOrKeyword() {
    const startCol = this.column;
    let value = '';

    while (this.cursor < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.cursor])) {
      value += this.source[this.cursor];
      this.cursor++;
      this.column++;
    }

    const type = KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER';
    this.tokens.push({
      type: type,
      value: value,
      line: this.line,
      column: startCol
    });
  }

  readNumber() {
    const startCol = this.column;
    let value = '';
    let isFloat = false;

    while (this.cursor < this.source.length) {
      const c = this.source[this.cursor];
      if (/[0-9]/.test(c)) {
        value += c;
        this.cursor++;
        this.column++;
      } else if (c === '.' && !isFloat && /[0-9]/.test(this.source[this.cursor + 1])) {
        isFloat = true;
        value += c;
        this.cursor++;
        this.column++;
      } else {
        break;
      }
    }

    this.tokens.push({
      type: isFloat ? 'FLOAT_LITERAL' : 'INT_LITERAL',
      value: value,
      line: this.line,
      column: startCol
    });
  }

  readString(quoteChar) {
    const startCol = this.column;
    let value = '';
    this.cursor++; // Skip opening quote
    this.column++;

    while (this.cursor < this.source.length && this.source[this.cursor] !== quoteChar) {
      if (this.source[this.cursor] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      value += this.source[this.cursor];
      this.cursor++;
    }

    if (this.cursor < this.source.length && this.source[this.cursor] === quoteChar) {
      this.cursor++; // Skip closing quote
      this.column++;
    } else {
      this.errors.push({
        type: 'Lexical Error',
        message: `Unterminated string literal starting at line ${this.line}`,
        line: this.line,
        column: startCol,
        suggestion: `Add a closing quote (${quoteChar}) at the end of string.`,
        recoveryMethod: 'Auto-closed String'
      });
    }

    this.tokens.push({
      type: 'STRING_LITERAL',
      value: value,
      line: this.line,
      column: startCol
    });
  }
}
