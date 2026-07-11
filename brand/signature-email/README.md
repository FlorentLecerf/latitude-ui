# Signature e-mail Latitude — v2 (figée 11/07/2026)

Fabriquée depuis le brief QG : `~/Agents/latitude-marque/editorial/signature-email-brief.md`
(contenu de vérité : `~/Agents/latitude-marque/editorial/bios-canal.md` § Signature e-mail).

| Fichier | Rôle |
|---|---|
| `signature-complete.html` | snippet à coller dans Gmail « Pour les nouveaux e-mails » (+ séquences CRM) |
| `signature-courte.html` | snippet à coller dans Gmail « En cas de réponse/transfert » (+ réponses CRM) |
| `logo-latitude-email.png` | logo 356×96 (@2x, affiché 178×48) — wordmark anthracite + point terracotta sur **tuile crème arrondie** (`#FAFAF8`, rayon 20px @2x) : la tuile garde le logo lisible en dark mode (les clients mail inversent le fond mais pas les images) |
| `render-logo.html` | template de rendu déterministe du logo (Chrome headless, fond transparent) |
| `preview.html` | preview de validation : complète clair + simulation dark Gmail + courte |

**Hébergement du logo** : copié dans `latitude-web` → `https://latitude.coach/assets/email/logo-latitude-email.png`
(les snippets référencent cette URL absolue ; toute régénération du logo doit rafraîchir la copie latitude-web).

**Installation Gmail** : ouvrir un snippet dans un navigateur → Cmd+A, Cmd+C → coller dans
Paramètres Gmail → Signature. Deux signatures à créer (« Complète », « Courte ») puis régler les
deux menus par défaut (nouveaux e-mails = Complète ; réponse/transfert = Courte).

**Régénérer le logo** :
```
cd brand/signature-email && "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --window-size=356,96 --screenshot=logo-latitude-email.png "file://$PWD/render-logo.html"
```
