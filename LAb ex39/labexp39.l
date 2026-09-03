%{
#include <stdio.h>
#include <string.h>

char oldword[50], newword[50];
%}

%%
[a-zA-Z]+ {
    if(strcmp(yytext, oldword) == 0)
        printf("%s", newword);
    else
        printf("%s", yytext);
}

[ \t\n]+ { printf("%s", yytext); }
.        { printf("%s", yytext); }
%%

int main()
{
    printf("Enter old word: ");
    scanf("%s", oldword);

    printf("Enter new word: ");
    scanf("%s", newword);

    getchar();

    printf("Enter sentence:\n");
    yylex();

    return 0;
}

int yywrap()
{
    return 1;
}
