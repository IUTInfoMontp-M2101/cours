// définition du type
struct Voiture {
    int nb_portes;
    char *marque;
};

int main() {
    // initialisation
    struct Voiture v1;
    v1.marque = "Peugeot";
    v1.nb_portes = 5;

    struct Voiture v2 = {
        .nb_portes = 3,
        .marque = "Volvo",
    };

    struct Voiture v3 = {2, "Fiat"};
}