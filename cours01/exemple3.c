#include <stdio.h>

int main() {
    int a, b;
    int *p1 = &a;
    int *p2 = &b;

    printf("%d\n", sizeof(int));
    p2 = p2 + 2;
    p1 = p1 - 1;
    a = p2 - p1;

    void *p3 = (void *) p1;
    char *p4 = (char *) p1;
    p3 = p3 + 3;
    p4 = p4 + 2;
}