import { define } from "@/utils.ts";
import { CHAMPION_LIST } from "@/data/champions.ts";

export default define.page(function Home() {
  return (
    <main>
      <div class="strip">
        <div class="labels">
          Problème&nbsp;: <b>tu vois QUOI build, jamais CE QUE ça fait.</b>
          <br />
          Réponse&nbsp;: <b>le calcul, par champion, en clair.</b>
        </div>
        <div class="loadbar">
          <span></span>
          <span></span>
        </div>
      </div>

      <section class="hero">
        <h1 class="hero-title">
          VOIS CE QUE TES<br />RUNES &amp; OBJETS<br />
          <span class="accent">FONT VRAIMENT.</span>
        </h1>
        <p class="hero-lede">
          Les sites de stats te disent quoi acheter parce que la masse le fait. Aucun ne te montre ce qu'un
          objet ou une rune change <em>mécaniquement</em> sur un champion précis. CHAMP LAB, si.
        </p>
        <a href="/champions" class="cta">OUVRIR LE LABO →</a>
      </section>

      <div class="divider">
        &gt;<b>POURQUOI</b>&lt;
      </div>

      <section class="features">
        <article class="panel feat">
          <div class="phead">
            <span class="tag">01 · IMPACT</span>
          </div>
          <div class="pbody">
            <h3>Le Δ de chaque objet</h3>
            <p>
              Active le mode impact : chaque objet affiche en direct combien de dégâts il ajoute à
              <em>ton</em> combo, sur <em>ta</em> cible. La réponse exacte à « ça fait quoi ? ».
            </p>
          </div>
        </article>
        <article class="panel feat">
          <div class="phead">
            <span class="tag">02 · BREAKPOINTS</span>
          </div>
          <div class="pbody">
            <h3>Les seuils qui tuent</h3>
            <p>
              « Ton combo tue en dessous de X PV. » « L'ultime exécute à ≤ Y. » Les chiffres qui décident
              réellement d'un kill, pas une tier list.
            </p>
          </div>
        </article>
        <article class="panel feat">
          <div class="phead">
            <span class="tag">03 · SOBRE</span>
          </div>
          <div class="pbody">
            <h3>Léger par conception</h3>
            <p>
              Calcul côté client sur données statiques versionnées par patch, îlots Fresh, esthétique 100%
              CSS. Zéro backend qui broie des millions de parties.
            </p>
          </div>
        </article>
      </section>

      <div class="divider">
        &gt;<b>CHAMPIONS DISPONIBLES</b>&lt;
      </div>

      <section class="champstrip">
        {CHAMPION_LIST.map((c) => (
          <a href={`/lab/${c.id}`} class="champtile">
            <div class="pface small">
              <span class="init">{c.initial}</span>
            </div>
            <div class="ct-meta">
              <div class="ct-name">{c.name}</div>
              <div class="ct-sub">{c.adaptive} · {c.title}</div>
            </div>
          </a>
        ))}
        <a href="/champions" class="champtile more">
          <div class="ct-meta">
            <div class="ct-name">+ TOUT LE ROSTER</div>
            <div class="ct-sub">le reste arrive via la communauté</div>
          </div>
        </a>
      </section>
    </main>
  );
});
