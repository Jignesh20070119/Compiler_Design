%{
#include <stdio.h>
#include <string.h>
#include <ctype.h>

char prod[20][20];
char nt[20];
char follow[20][20];
int n, count = 0;

int getIndex(char c)
{
    int i;

    for(i = 0; i < count; i++)
        if(nt[i] == c)
            return i;

    nt[count] = c;
    return count++;
}

void addFollow(int index, char c)
{
    int i;

    if(c == '\0')
        return;

    for(i = 0; follow[index][i] != '\0'; i++)
        if(follow[index][i] == c)
            return;

    follow[index][i] = c;
    follow[index][i + 1] = '\0';
}
%}

%%
.|\n {
}
%%

int yywrap()
{
    return 1;
}

int main()
{
    int i, j, k, changed;
    int lhsIndex, symIndex;
    char lhs, symbol, next;

    printf("Enter number of productions: ");
    scanf("%d", &n);

    printf("Enter productions without spaces:\n");

    for(i = 0; i < n; i++)
    {
        scanf("%s", prod[i]);
        lhs = prod[i][0];
        getIndex(lhs);
    }

    addFollow(0, '$');

    do
    {
        changed = 0;

        for(i = 0; i < n; i++)
        {
            lhs = prod[i][0];
            lhsIndex = getIndex(lhs);

            for(j = 2; prod[i][j] != '\0'; j++)
            {
                symbol = prod[i][j];

                if(isupper(symbol))
                {
                    symIndex = getIndex(symbol);

                    if(prod[i][j + 1] != '\0')
                    {
                        next = prod[i][j + 1];

                        if(!isupper(next) && next != 'e')
                        {
                            int old = strlen(follow[symIndex]);

                            addFollow(symIndex, next);

                            if(strlen(follow[symIndex]) > old)
                                changed = 1;
                        }
                    }
                    else
                    {
                        int old = strlen(follow[symIndex]);

                        for(k = 0; follow[lhsIndex][k] != '\0'; k++)
                            addFollow(symIndex, follow[lhsIndex][k]);

                        if(strlen(follow[symIndex]) > old)
                            changed = 1;
                    }
                }
            }
        }

    } while(changed);

    printf("\nFOLLOW Sets:\n");

    for(i = 0; i < count; i++)
    {
        printf("FOLLOW(%c) = { ", nt[i]);

        for(j = 0; follow[i][j] != '\0'; j++)
        {
            printf("%c", follow[i][j]);

            if(follow[i][j + 1] != '\0')
                printf(", ");
        }

        printf(" }\n");
    }

    return 0;
}
