import { define } from "@/utils.ts";

export default define.page(function Methode() {
  return (
    <main>
      <div class="divider">
        &gt;<b>MÉTHODE</b>&lt;
      </div>

      <div class="prose">
        <section class="panel doc">
          <div class="phead">
            <span class="tag">DONNÉES</span>
          </div>
          <div class="pbody">
            <h3>D'où viennent les chiffres</h3>
            <p>
              Data Dragon (Riot) est fiable pour les stats plates, mais ses données de sorts sont souvent
              inexactes et difficilement exploitables. La source de référence pour les coefficients propres,
              c'est <b>Meraki (lolstaticdata)</b>, parsé depuis le wiki et rafraîchi par patch.
            </p>
            <p>
              ⚠ Dans cette version, les valeurs sont <b>illustratives</b>{" "}
              et écrites à la main pour deux champions. Le pipeline Meraki n'est pas encore branché : c'est le
              premier gros chantier communautaire.
            </p>
          </div>
        </section>

        <section class="panel doc">
          <div class="phead">
            <span class="tag">ARCHITECTURE</span>
          </div>
          <div class="pbody">
            <h3>Data-driven, donc contribuable</h3>
            <p>
              Le moteur (<code>lib/engine.ts</code>) ne contient aucune donnée : il reçoit un champion et un
              contexte, il renvoie des dégâts. Les champions, objets et runes vivent dans <code>data/</code>
              {" "}
              sous forme d'objets typés.
            </p>
            <p>
              Ajouter un champion = ajouter un objet dans{" "}
              <code>data/champions.ts</code>. Les interactions vraiment complexes (passifs d'objets, effets de
              runes) se modélisent au cas par cas dans le moteur. Guide&nbsp;:{" "}
              <code>docs/adding-a-champion.md</code>.
            </p>
          </div>
        </section>

        <section class="panel doc">
          <div class="phead">
            <span class="tag">SOBRIÉTÉ</span>
          </div>
          <div class="pbody">
            <h3>Pourquoi c'est léger</h3>
            <p>Choix alignés sur l'éco-conception (esprit RGESN / loi REEN) :</p>
            <ul>
              <li>
                <b>Îlots Fresh</b>{" "}
                — le serveur rend du HTML, seul le calculateur est hydraté. La plupart des pages n'envoient
                aucun JavaScript.
              </li>
              <li>
                <b>Données statiques par patch</b>{" "}
                — immuables entre deux patchs, donc cachables agressivement. Aucun backend qui agrège des
                millions de parties en direct.
              </li>
              <li>
                <b>Esthétique 100% CSS</b>{" "}
                — cadres, grille, dithering et scanlines sans une seule image lourde.
              </li>
              <li>
                <b>Calcul côté client</b>{" "}
                — quelques formules, pas de serveur sollicité à chaque réglage de slider.
              </li>
            </ul>
          </div>
        </section>

        <section class="panel doc">
          <div class="phead">
            <span class="tag">LÉGAL</span>
          </div>
          <div class="pbody">
            <p class="small">
              CHAMP LAB n'est ni approuvé par Riot Games ni affilié à Riot Games. League of Legends et Riot
              Games sont des marques ou marques déposées de Riot Games, Inc. Tout usage de l'API Riot est
              soumis aux Developer Policies de Riot.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
});
