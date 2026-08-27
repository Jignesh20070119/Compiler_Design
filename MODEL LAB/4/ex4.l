%{
#include <stdio.h>
#include <string.h>

char lhs[20];
char rhs1[50], rhs2[50];
char prefix[50];
int i;
%}

%%
.|\n ;
%%

int yywrap()
{
    return 1;
}

int main()
{
    int n, len1, len2, k;

    printf("Enter number of productions: ");
    scanf("%d", &n);

    printf("Enter productions:\n");

    for(i = 0; i < n; i++)
    {
        char production[100];

        scanf("%s", production);

        lhs[i] = production[0];

        if(i == 0)
        {
            char *p = strchr(production, '=');

            if(p != NULL)
            {
                strcpy(rhs1, p + 1);
                char *bar = strchr(rhs1, '|');

                if(bar != NULL)
                {
                    *bar = '\0';
                    strcpy(rhs2, bar + 1);
                }
            }
        }
    }

    len1 = strlen(rhs1);
    len2 = strlen(rhs2);

    k = 0;

    while(k < len1 && k < len2 && rhs1[k] == rhs2[k])
    {
        prefix[k] = rhs1[k];
        k++;
    }

    prefix[k] = '\0';

    printf("\nLeft Factored Grammar:\n");

    if(k > 0)
    {
        printf("%c=%s%c'\n", lhs[0], prefix, lhs[0]);
        printf("%c'=%s|%s\n", lhs[0], rhs1 + k, rhs2 + k);
    }
    else
    {
        printf("%c=%s|%s\n", lhs[0], rhs1, rhs2);
    }

    return 0;
}
