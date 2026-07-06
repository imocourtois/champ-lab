# Contribuer à CHAMP LAB

Merci d'y jeter un œil. Le projet est pensé pour que **la donnée soit la surface de contribution** : pas besoin de toucher au moteur pour ajouter un champion.

## Prérequis

- [Deno](https://deno.com) 2.x
- Avant toute PR, `deno task check` doit passer :

```bash
deno task check   # fmt --check + lint + check
deno task test    # tests du moteur
```

Le format est géré par `deno fmt` (config dans `deno.json`). Lance `deno fmt` avant de committer.

## Où va quoi

| Tu veux…                              | Fichier                          |
| ------------------------------------- | -------------------------------- |
| Ajouter / corriger un champion        | `data/champions.ts`              |
| Ajouter / corriger un objet           | `data/items.ts`                  |
| Ajouter / corriger une rune           | `data/runes.ts`                  |
| Modéliser une interaction complexe    | `lib/engine.ts` (+ un test)      |
| Changer l'UI du labo                  | `islands/ChampLab.tsx`           |
| Changer l'apparence                   | `static/styles.css`              |

## Ajouter un champion

Voir **[docs/adding-a-champion.md](docs/adding-a-champion.md)**. L'idée : copier un objet existant, remplir les valeurs depuis Meraki, vérifier avec les tests.

## Principes

- **Data-driven.** La logique générique vit dans le moteur ; les chiffres vivent dans `data/`. Si tu te retrouves à coder un cas très spécifique, isole-le clairement et ajoute un test.
- **Honnêteté des données.** Tant que le pipeline Meraki n'est pas branché, indique la source d'une valeur en commentaire si elle n'est pas évidente. Ne présente jamais une valeur inventée comme exacte.
- **Sobriété.** Pas d'image lourde, pas de dépendance superflue, pas de JS hydraté hors de l'îlot du labo sans raison.
- **Un sujet par PR.** Un champion, un objet, un fix : plus facile à relire.

## Tests

Les tests (`lib/engine_test.ts`) vérifient des **invariants** (monotonie, mitigation, exécution), pas des chiffres exacts — ceux-ci bougent à chaque patch. Si tu ajoutes une mécanique dans le moteur, ajoute l'invariant correspondant.

## Légal

En contribuant, tu acceptes que ton apport soit distribué sous licence MIT. N'ajoute pas d'assets sous copyright Riot (icônes, splash arts) au repo.
