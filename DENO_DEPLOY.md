# 🚀 Déployer CHAMP LAB sur Deno Deploy

CHAMP LAB est maintenant configuré pour se déployer automatiquement sur **Deno Deploy** (le hébergeur officiel
Deno, optimisé pour Fresh 2.x).

## ✅ Étapes de configuration

### 1. Créer un compte Deno Deploy

1. Va sur https://dash.deno.com
2. Clique "Sign in with GitHub"
3. Suis les instructions OAuth pour connecter ton compte GitHub
4. Une fois connecté, tu verras le tableau de bord Deno Deploy

### 2. Créer un projet

1. Sur https://dash.deno.com, clique "Create Project"
2. Nomme le projet : **`champ-lab`** (doit correspondre au nom dans le workflow)
3. Relie le repository GitHub : `Simon256px/champ-lab`
4. Sélectionne la branche : `main`
5. Laisse les paramètres par défaut (auto-deploy depuis `main.ts`)
6. Clique "Create"

### 3. Générer un token d'authentification

1. Sur le tableau de bord Deno Deploy, va dans les **Settings** du projet
2. Scroll jusqu'à **Access Tokens**
3. Clique "Generate Token"
4. Copy le token (commence par `dd_...`)

### 4. Ajouter le token comme secret GitHub

1. Va sur https://github.com/Simon256px/champ-lab
2. Settings → Secrets and variables → Actions
3. Clique "New repository secret"
4. Nomme-le : `DENO_DEPLOY_TOKEN`
5. Colle le token que tu viens de générer
6. Clique "Add secret"

### 5. Déclencher le déploiement

1. Fais un commit/push sur la branche `main` (ou re-run l'action GitHub)
2. Va sur https://github.com/Simon256px/champ-lab/actions
3. Regarde le workflow s'exécuter
4. Une fois terminé (✅), ton site sera live à : **`https://champ-lab.deno.dev`**

---

## 📝 Notes

- Le déploiement est **automatique** à chaque push sur `main`
- Deno Deploy te donne un URL : `https://champ-lab.deno.dev`
- Tu peux configurer un **domaine personnalisé** dans les settings Deno Deploy
- Les logs en direct sont disponibles dans le tableau de bord Deno Deploy

## 🔗 Liens utiles

- **Dashboard Deno Deploy** : https://dash.deno.com
- **Docs Fresh 2.x** : https://fresh.deno.dev
- **GitHub Repository** : https://github.com/Simon256px/champ-lab

---

Une fois configuré, ton site CHAMP LAB sera en live ! 🎉
