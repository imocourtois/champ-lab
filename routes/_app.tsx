import { define } from "@/utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CHAMP // LAB — vois ce que tes runes &amp; objets font vraiment</title>
        <meta
          name="description"
          content="Simulateur de dégâts par champion League of Legends : vois concrètement ce qu'une rune ou un objet change sur un champion précis. Open source, sobre, propulsé par Deno/Fresh."
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
