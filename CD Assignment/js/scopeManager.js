/**
 * Intelligent Compiler - Scope Manager
 * Manages lexical scope hierarchy, symbol tables per scope, scope navigation, and lookup logic.
 */

class Scope {
  constructor(id, name, level, parent = null) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.parent = parent;
    this.symbols = {};
    this.children = [];
  }
}

class ScopeManager {
  constructor() {
    this.reset();
  }

  reset() {
    resetMemoryCounter();
    this.scopeIdCounter = 0;
    this.allScopes = [];
    
    // Create Root Global Scope
    this.globalScope = new Scope(this.scopeIdCounter++, 'Global', 0, null);
    this.currentScope = this.globalScope;
    this.allScopes.push(this.globalScope);
  }

  enterScope(name) {
    const nextLevel = this.currentScope.level + 1;
    const newScope = new Scope(this.scopeIdCounter++, name, nextLevel, this.currentScope);
    
    this.currentScope.children.push(newScope);
    this.currentScope = newScope;
    this.allScopes.push(newScope);

    return newScope;
  }

  exitScope() {
    if (this.currentScope.parent) {
      this.currentScope = this.currentScope.parent;
    }
  }

  insertSymbol(symbolEntry) {
    this.currentScope.symbols[symbolEntry.name] = symbolEntry;
  }

  lookupCurrentScope(name) {
    return this.currentScope.symbols[name] || null;
  }

  lookupSymbol(name) {
    let curr = this.currentScope;
    while (curr) {
      if (curr.symbols[name]) {
        return {
          symbol: curr.symbols[name],
          foundInScope: curr
        };
      }
      curr = curr.parent;
    }
    return null;
  }

  checkRedeclaration(name) {
    return !!this.currentScope.symbols[name];
  }

  getShadowedSymbol(name) {
    let curr = this.currentScope.parent;
    while (curr) {
      if (curr.symbols[name]) {
        return {
          symbol: curr.symbols[name],
          scope: curr
        };
      }
      curr = curr.parent;
    }
    return null;
  }

  getAllSymbolsFlat() {
    const list = [];
    for (const scope of this.allScopes) {
      for (const key in scope.symbols) {
        list.push(scope.symbols[key]);
      }
    }
    return list;
  }
}
