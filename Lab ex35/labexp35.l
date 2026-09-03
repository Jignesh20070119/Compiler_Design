%{
#include <stdio.h>
%}

%%

[0-9] {
    printf("It is a digit\n");
}

. {
    printf("It is not a digit\n");
}

%%

int main()
{
    printf("Enter character: ");
    yylex();
    return 0;
}

int yywrap()
{
    return 1;
}
