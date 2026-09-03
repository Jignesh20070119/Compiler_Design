%{
#include <stdio.h>
%}

%%

(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9][0-9][0-9][0-9] {
    printf("Valid DOB\n");
}

.* {
    printf("Invalid DOB\n");
}

%%

int main()
{
    printf("Enter DOB: ");
    yylex();
    return 0;
}

int yywrap()
{
    return 1;
}
