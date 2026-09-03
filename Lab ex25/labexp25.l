%{
#include <stdio.h>
FILE *out;
int comments = 0;
%}

%%
"//".* {
    comments++;
}

"/*"([^*]|\*+[^*/])*\*+"/" {
    comments++;
}

\n      { fputc('\n', out); }
.       { fputc(yytext[0], out); }
%%

int main()
{
    yyin = fopen("input.c", "r");
    out = fopen("output.c", "w");

    if (yyin == NULL || out == NULL)
    {
        printf("File error\n");
        return 1;
    }

    yylex();

    fclose(yyin);
    fclose(out);

    printf("Comments removed = %d\n", comments);

    return 0;
}

int yywrap()
{
    return 1;
}
