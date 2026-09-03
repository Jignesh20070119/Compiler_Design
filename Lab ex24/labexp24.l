%{
#include <stdio.h>
%}

%%
[0-9]+              { printf("NUMBER: %s\n", yytext); }
[a-zA-Z_][a-zA-Z0-9_]*  { printf("IDENTIFIER: %s\n", yytext); }
[+\-*/=]            { printf("OPERATOR: %s\n", yytext); }
[ \t\n]+            ;
.                   { printf("SPECIAL CHARACTER: %s\n", yytext); }
%%

int yywrap()
{
    return 1;
}

int main()
{
    printf("Enter input:\n");
    yylex();
    return 0;
}
