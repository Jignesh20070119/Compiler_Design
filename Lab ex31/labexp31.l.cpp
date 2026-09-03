%{
#include <stdio.h>
%}

%%

"int"|"float"|"char"|"double"|"void"|"if"|"else"|"for"|"while"|"return" {
    printf("KEYWORD    : %s\n", yytext);
}

[a-zA-Z_][a-zA-Z0-9_]* {
    printf("IDENTIFIER : %s\n", yytext);
}

[ \t\n]+ {
    /* Ignore whitespace */
}

. {
    /* Ignore other characters */
}

%%

int main()
{
    printf("Enter input:\n");
    yylex();
    return 0;
}

int yywrap()
{
    return 1;
}
