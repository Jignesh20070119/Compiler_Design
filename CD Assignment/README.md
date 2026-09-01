# Intelligent Compiler – Symbol Table, Scope Management, Semantic Analysis & Error Recovery

A web-based educational compiler simulator built for teaching programming concepts, symbol table management, lexical scoping, type checking, panic mode recovery, and phrase-level recovery.

## Features

1. **Hierarchical Scope Manager**:
   - Manages `Global`, `Function`, `Procedure`, and `Block` scope levels.
   - Preserves parent-child links across scope levels (Level 0 up to Level 3+).
   - Simulates memory address allocation (`0x1000`, `0x1004`, `0x1008`, `0x100C`...).

2. **Semantic Error Detection**:
   - **Scope Violation**: Identifies out-of-scope variables (e.g. accessing `y` declared in inner Block Scope Level 2 from Function Scope Level 1 in `return x + y;`).
   - **Redeclaration**: Prevents duplicate identifier declarations within the exact same scope level.
   - **Undeclared Variables**: Reports uninitialized / non-existent variables.
   - **Type Mismatches & Type Inference**: Evaluates expression types and checks assignment compatibility (`int`, `float`, `string`).
   - **Shadowing**: Visualizes local variable shadowing over global declarations.

3. **Error Recovery System**:
   - **Panic Mode Recovery**: Skips tokens until a synchronization token (`;`, `}`, `)`) is encountered when unexpected tokens are encountered, continuing parse phase without halting.
   - **Phrase-Level Recovery**: Detects common syntax omissions (e.g., missing `;` or missing `)`) and auto-inserts synthetic tokens to complete parsing cleanly.

4. **Visual Dashboard**:
   - **Symbol Table Grid**: Comprehensive searchable table containing Name, Type, Kind, Scope, Level, Memory Location, and Parameters.
   - **Scope Hierarchy Tree**: Interactive tree diagram mapping nesting from Global down to Block scope levels.
   - **Symbol Resolution Explorer**: Traces every identifier reference to its declared target scope or error status.
   - **AST Tree Visualizer**: Visual representation of parsed Abstract Syntax Tree nodes.
   - **Token Stream Inspector**: Chips displaying token types, raw values, line numbers, and column offsets.
   - **Educational Explanation Panel**: Dedicated breakdown of *"Why is variable 'y' an Error?"*.
   - **One-Click Presets**: Pre-loaded buttons for 8 canonical compiler test cases.

## Usage

Open `index.html` in any modern web browser or run via local HTTP server (e.g., `npx serve .` or Live Server).

### Test Cases Included
- **Test 1**: Valid Nested Scope
- **Test 2**: Scope Violation
- **Test 3**: Redeclaration
- **Test 4**: Valid Shadowing
- **Test 5**: Undeclared Variable
- **Test 6**: Type Mismatch
- **Test 7**: Panic Mode Recovery Demonstration
- **Test 8**: Phrase-Level Recovery Demonstration
