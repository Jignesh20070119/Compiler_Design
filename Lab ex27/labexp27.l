%{
#include <stdio.h>
%}

%%
^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ {
    printf("Valid Email Address\n");
}

.* {
    printf("Invalid Email Address\n");
}
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
