#include <stdio.h>

int longueur (char *s) {
  int i = 0;
  while (s[i] != '\0') {
    i++;
}
  return i;
}

int main() {
  char *s = "Youpi";
  int l = longueur(s); // l = 5
  char nom[4];
  nom[0] = 'B';
  nom[1] = 'o';
  nom[2] = 'b';
  nom[3] = '\0';
  printf("%s\n", nom);
}