%{
#include <stdio.h>
int positive = 0, negative = 0;
%}

%%
\+[0-9]+ { positive++; }
-[0-9]+  { negative++; }
[0-9]+   { positive++; }
[ \t\n]+ ;
. ;
%%

int main()
{
    printf("Enter numbers: ");
    yylex();

    printf("Positive numbers = %d\n", positive);
    printf("Negative numbers = %d\n", negative);

    return 0;
}

int yywrap()
{
    return 1;
}
