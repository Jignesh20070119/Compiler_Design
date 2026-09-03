%{
#include <stdio.h>
#include <string.h>

char word[50];
int count = 0;
%}

%%

[a-zA-Z]+ {
    if (strcmp(yytext, word) == 0)
        count++;
}

\n {
    printf("Frequency = %d\n", count);
    return 0;
}

. ;

%%

int main()
{
    printf("Enter word: ");
    scanf("%s", word);
    getchar();

    printf("Enter sentence: ");
    yylex();

    return 0;
}

int yywrap()
{
    return 1;
}
