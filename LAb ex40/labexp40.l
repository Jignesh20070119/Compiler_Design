%{
#include <stdio.h>
%}

%%

"int"|"float"|"char"|"double"|"void"|"return" {
    printf("KEYWORD    : %s\n", yytext);
}

[a-zA-Z_][a-zA-Z0-9_]* {
    printf("IDENTIFIER : %s\n", yytext);
}

[0-9]+ {
    printf("NUMBER     : %s\n", yytext);
}

"+"|"-"|"*"|"/"|"=" {
    printf("OPERATOR   : %s\n", yytext);
}

[(){};,] {
    printf("SPECIAL    : %s\n", yytext);
}

[ \t\n]+ ;

. ;

%%

int main()
{
    yylex();
    return 0;
}

int yywrap()
{
    return 1;
}
