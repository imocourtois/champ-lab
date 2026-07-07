import { define } from "@/utils.ts";
import { DATA_META } from "@/data/generated/meta.gen.ts";

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
              Le pipeline est <b>branché</b> : <code>deno task data</code>{" "}
              récupère tout le roster depuis Meraki + Data Dragon et génère{" "}
              <code>data/generated/</code>. Roster actuel : <b>{DATA_META.champions} champions</b> et{" "}
              <b>{DATA_META.items} objets</b>, patch <b>{DATA_META.patch}</b> (généré le{" "}
              {DATA_META.generatedAt}).
            </p>
            <p>
              ⚠ Le pipeline n'extrait que ce que le moteur sait modéliser : stats de base, ratios AP / AD / AD
              bonus, stats plates d'objets. Les mécaniques vraiment complexes (dégâts en % des PV, passifs
              conditionnels, cumuls spécifiques) ne sont <b>pas inventées</b>{" "}
              — elles restent à modéliser à la main dans <code>lib/engine.ts</code> et via{" "}
              <code>data/overrides.ts</code>, champion par champion.
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
              Les données brutes sont générées (<code>data/generated/</code>) ; on ne les édite pas à la main.
              Affiner un champion = ajuster <code>data/overrides.ts</code>{" "}
              (étagère d'objets, rune, ordre de compétences, correction de ratio) puis relancer{" "}
              <code>deno task data</code>. Les interactions vraiment complexes (passifs d'objets, effets de
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
