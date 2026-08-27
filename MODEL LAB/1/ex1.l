%{
#include <stdio.h>
%}

%%
"+="    { printf("Assignment Operator: +=\n"); }
"-="    { printf("Assignment Operator: -=\n"); }
"*="    { printf("Assignment Operator: *=\n"); }
"/="    { printf("Assignment Operator: /=\n"); }
"="     { printf("Assignment Operator: =\n"); }
[ \t\n]+ ;
.       ;
%%

int yywrap()
{
    return 1;
}

int main()
{
    printf("Enter the C program:\n");
    yylex();
    return 0;
}
