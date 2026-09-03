%{
#include <stdio.h>
%}

%%

"+" {
    printf("Addition\n");
}

"-" {
    printf("Subtraction\n");
}

"*" {
    printf("Multiplication\n");
}

"/" {
    printf("Division\n");
}

[0-9]+ {
    /* Ignore numbers */
}

[ \t\n]+ {
    /* Ignore spaces */
}

. {
    /* Ignore other characters */
}

%%

int main()
{
    printf("Enter operator: ");
    yylex();
    return 0;
}

int yywrap()
{
    return 1;
}
