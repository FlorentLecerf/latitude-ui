# Signature e-mail Latitude — v2.1 (redesign 11/07/2026 soir, après retours Florent)

> Retours Florent sur la v2 : logo **nu** (la tuile crème refusée : « le logo est simple, c'est juste
> Latitude »), signature **compacte** (v2 trop haute), liens = **mots cliquables** sans URL brute.
> v2.1 = layout « 4 lignes, logo-sceau » (recommandé, variante A) : identité → poste + certif (même
> ligne) → devise → logo + « Diagnostic gratuit · Le guide du dirigeant · LinkedIn ». ~90px de haut.
> Conséquence assumée du logo nu : quasi invisible en dark mode inversé (seul le point survit).

Fabriquée depuis le brief QG : `~/Agents/latitude-marque/editorial/signature-email-brief.md`
(contenu de vérité : `~/Agents/latitude-marque/editorial/bios-canal.md` § Signature e-mail).

| Fichier | Rôle |
|---|---|
| `signature-complete.html` | snippet à coller dans Gmail « Pour les nouveaux e-mails » (+ séquences CRM) |
| `signature-courte.html` | snippet à coller dans Gmail « En cas de réponse/transfert » (+ réponses CRM) |
| `logo-latitude-email.png` | logo 216×40 (@2x, affiché 108×20) — wordmark anthracite + point terracotta, **fond transparent, nu** (tuile refusée par Florent) |
| `render-logo.html` | template de rendu déterministe du logo (Chrome headless, fond transparent) |
| `preview.html` | preview de validation : variante A clair + simulation dark + variante B (carte de visite) + courte |

**Hébergement du logo** : copié dans `latitude-web` → `https://latitude.coach/assets/email/logo-latitude-email.png`
(les snippets référencent cette URL absolue ; toute régénération du logo doit rafraîchir la copie latitude-web).

**Installation Gmail** : ouvrir un snippet dans un navigateur → Cmd+A, Cmd+C → coller dans
Paramètres Gmail → Signature. Deux signatures à créer (« Complète », « Courte ») puis régler les
deux menus par défaut (nouveaux e-mails = Complète ; réponse/transfert = Courte).

**Régénérer le logo** :
```
cd brand/signature-email && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --window-size=216,40 --screenshot=logo-latitude-email.png "file://$PWD/render-logo.html"
```
