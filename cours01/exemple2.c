int main() {
    float a = 3.14;
    float *p;
    p = &a;
    int tab[5];
    int *t = tab;
    tab[2] = 10;
    *(t + 3) = 20;
    t = p;
    *p = 2.72;
}