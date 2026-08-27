%{
#include <stdio.h>
int line_no = 1;
%}

%%
.*\n {
    printf("%d: %s", line_no++, yytext);
}
.* {
    printf("%d: %s\n", line_no++, yytext);
}
%%

int yywrap()
{
    return 1;
}

int main()
{
    printf("Enter the text:\n");
    yylex();
    return 0;
}
