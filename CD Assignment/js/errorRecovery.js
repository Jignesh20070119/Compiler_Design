/**
 * Intelligent Compiler - Error Recovery Demonstration Module
 * Manages Panic Mode & Phrase-Level Recovery demonstration presets.
 */

const DEMO_PRESETS = {
  panicMode: `function test() {\n    int x = 10\n    int y = 20;\n}`,
  phraseLevel: `function test(a, b {\n    int x = 10;\n}`,
  primaryExample: `global x = 10;

function calculate(a, b) {
    int x = 5;

    {
        int y = x + a;
        float z = y * b;
    }

    return x + y;
}

procedure display(msg) {
    string x = "Result:";
    print x + msg;
}`
};

const TEST_CASES = {
  test1: {
    title: 'Test 1 – Valid Nested Scope',
    code: `global x = 10;

function test(a) {
    int x = 5;
    {
        int y = x + a;
        print y;
    }
}`
  },
  test2: {
    title: 'Test 2 – Scope Violation',
    code: `function test(a) {
    {
        int y = a;
    }
    return y;
}`
  },
  test3: {
    title: 'Test 3 – Redeclaration',
    code: `function test() {
    int x = 5;
    int x = 10;
}`
  },
  test4: {
    title: 'Test 4 – Valid Shadowing',
    code: `global x = 10;

function test() {
    int x = 5;
    print x;
}`
  },
  test5: {
    title: 'Test 5 – Undeclared Variable',
    code: `function test() {
    return q;
}`
  },
  test6: {
    title: 'Test 6 – Type Mismatch',
    code: `function test() {
    int x = "hello";
}`
  },
  test7: {
    title: 'Test 7 – Panic Mode Recovery',
    code: `function test() {
    int x = 10
    int y = 20;
}`
  },
  test8: {
    title: 'Test 8 – Phrase-Level Recovery',
    code: `function test(a, b {
    int x = 10;
}`
  }
};
