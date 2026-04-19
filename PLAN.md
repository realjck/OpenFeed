# OpenFeed

## Lecteur de flux RSS 100% côté client PWA

### Description fonctionnelle

L'application devra présenter des listes d'articles issus de flux RSS paramétrés par l'utilisateur.

Toute l'UI de l'application doit être en ANGLAIS.

L'utilisateur pourra rentrer plusieurs flux RSS d'actualités (exemple : https://freshrss.devjck.fr/i/?a=rss&user=jck&token=&hours=168&sort=date&order=DESC&get=c_3 )

Chaque flux aura en plus de l'url un nom et une couleur (choix proposé parmi une palette préétablie de 12 couleurs)

Il retrouvera la liste des articles en page principale, avec la possibilité d'afficher TOUS les articles, ou bien ceux du flux sélectionné.

Tout se passera sur une seule page, pensée "mobile first" :

- **En vue principale :** La liste des articles. Chaque ligne est un article, où l'on peut voir de gauche à droite : la couleur du flux d'où vient l'article, le favicon de la source de l'article, le titre complet (avec retours à la ligne si nécessaire).

Lorsque la liste est vide, mettre un message : soit pour dire de mettre des flux RSS (si il y en a pas), soit pour dire que les flux rss n'ont rien renvoyé.

- **En cliquant sur un article :** Lorsque l'on clique sur une article dans la liste celui ci se déplie pour laisser voir plus d'informations : description de l'article, image, et surtout un bouton avec le lien vers l'article original (celui ci doit s'ouvrir dans une nouvelle fenetre).

- **Navbar :** En haut on doit avoir une navbar sticky, avec les possibilités suivantes de gauche à droite : bouton burger pour déplier la sidebar, bouton avec choix du flux affiché (ALL par défaut, sinon le nom du flux dans un bouton, tronqué. la couleur du bouton devient alors la couleur du flux), bouton pour rafraichir le flux, bouton pour grossir ou diminuer la taille du texte, bouton pour switcher en light mode / dark mode.

- **Sidebar :** C'est ici que l'on renseigne les flux RSS. Voir la liste des flux, avec possibilité de les éditer, de les supprimer, et d'en ajouter de nouveaux (bouton large "+" en bas de la liste). La sidebar doit se déplier depuis la gauche et venir en superposition de la page principale.

- **Ajout d'un flux RSS :** Le formulaire doit retrouver automatiquement le nom à partir de l'url, avec possibilité ensuite de le modifier. On choisit ensuite sa couleur parmi 12. On peut imaginer que ce formulaire soit dans une modale qui vient au premier plan en cliquant sur "+" dans la sidebar.

### Côté technique

Toute les données (flux rss et leurs couleurs) doivent être sauvegardées pour une durée indéterminée (utiliser indexedDb par exemple), ceci afin d'éviter que l'utilisateur perde sa configuration.

L'application doit tourner donc uniquement côté front, utiliser NextJS / React par exemple.

Elle doit être en PWA.

L'application sera ensuite déployé et hebergée sur GitHub Pages.