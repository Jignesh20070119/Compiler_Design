/**
 * Intelligent Compiler - Symbol Table & Symbol Entries
 */

let memoryCounter = 0x1000;

function resetMemoryCounter() {
  memoryCounter = 0x1000;
}

function generateMemoryLocation() {
  const hex = '0x' + memoryCounter.toString(16).toUpperCase();
  memoryCounter += 4;
  return hex;
}

class SymbolEntry {
  constructor({ name, type, kind, scopeLevel, scopeName, memoryLocation = null, parameters = [], line = 0, column = 0 }) {
    this.name = name;
    this.type = type; // 'int', 'float', 'string', 'function', 'procedure', 'unknown'
    this.kind = kind; // 'variable', 'function', 'procedure', 'parameter'
    this.scopeLevel = scopeLevel;
    this.scopeName = scopeName;
    this.memoryLocation = memoryLocation || generateMemoryLocation();
    this.parameters = parameters; // Array of { name, type }
    this.line = line;
    this.column = column;
  }
}
