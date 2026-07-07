import { define } from "@/utils.ts";
import { CHAMPION_LIST, CHAMPIONS } from "@/data/champions.ts";
import ChampLab from "@/islands/ChampLab.tsx";

export default define.page(function LabPage(ctx) {
  const id = ctx.params.champion;
  const champion = CHAMPIONS[id];

  // Champion inconnu : message + retour au roster (pas de 500).
  if (!champion) {
    return (
      <main>
        <div class="divider">
          &gt;<b>INCONNU</b>&lt;
        </div>
        <div class="panel" style="max-width:520px;margin:0 auto">
          <div class="phead">
            <span class="tag">404</span>
          </div>
          <div class="pbody">
            <p>Aucun champion « {id} » n'est câblé pour l'instant.</p>
            <p style="margin-top:10px">
              <a href="/champions" class="cta small">← Retour au roster</a>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div class="divider">
        &gt;<b>LABO&nbsp;·&nbsp;{champion.name.toUpperCase()}</b>&lt;
      </div>

      {
        /* Sélecteur de champion = liens serveur (aucun JS). Bande défilable ;
          le picker principal reste /champions. Chaque champion est sa propre route. */
      }
      <nav class="chswitch" aria-label="Changer de champion">
        <a href="/champions" class="chswitch-all">◄ ROSTER</a>
        {CHAMPION_LIST.map((c) => (
          <a href={`/lab/${c.id}`} class={`chswitch-btn${c.id === champion.id ? " on" : ""}`}>
            {c.name.toUpperCase()}
          </a>
        ))}
      </nav>

      {/* Tout l'interactif est dans cet unique îlot : c'est le seul JS hydraté de la page. */}
      <ChampLab champion={champion} />
    </main>
  );
});
