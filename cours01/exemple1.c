int main() {
    int tab[5];
    // le programme réserve 20 octets
    char s[5];
    // le programme réserve 5 octets

    /* utilisation */
    tab[0] = 0;
    tab[1] = 1;
    for (int i = 2; i < 5; i++) {
        tab[i] = tab[i - 1] + tab[i - 2];
    }
    s[0] = 'Y';
    s[1] = 'o';
    s[2] = 'u';
    s[3] = 'p';
    s[4] = 'i';

    // initialisation à la création
    int t[4] = {1, 2, 3, 4};
}