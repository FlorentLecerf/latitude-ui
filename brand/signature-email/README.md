# Signature e-mail Latitude — v2.2 (validée en design le 11/07/2026 au soir)

> Historique express : v2 (tuile crème + URL visibles) rejetée par Florent → v2.1 (logo image nu,
> compact, mots cliquables) → **v2.2 = variante B « carte de visite » choisie, passée en 100 % TEXTE**
> sur exigence « ultra premium, nickel partout, clair ou dark, peu importe le support ».

## Le parti pris : zéro image

Le logo Latitude est **typographique par doctrine** (« le logo, c'est du code, pas un fichier »).
En email, on l'écrit donc en **texte HTML stylé** : `Latitude` en serif (`'DM Serif Display',
Georgia, 'Times New Roman', serif` — le destinataire verra Georgia) + point terracotta `#E07855`.
Conséquences :
- **Dark mode parfait** : les clients mail éclaircissent tous les textes, logo compris. Aucun cas dégradé.
- **Images bloquées = non-sujet** (Outlook bloque par défaut chez les expéditeurs inconnus = les prospects froids).
- Aucune dépendance d'hébergement (l'ancien `assets/email/logo-latitude-email.png` de latitude-web a été retiré).

## Layout (variante B, ~75px de haut)

Logo texte à gauche (26px) + filet vertical `#E5DFD6` + bloc droit : nom gras → poste + certif
(même ligne, certif en gris) → devise italique → portes. **CTA principal : « Prendre rendez-vous »**
(terracotta deep `#A8492E`, gras) → `https://crm.latitude.coach/rdv/cadrage` (page native entretien
de cadrage du CRM) ; puis « Diagnostic gratuit » et « LinkedIn » en gris `#6E6E6E`. Séparateurs « · »
terracotta (écho du point du logo). Aucune URL affichée, aucun soulignement.

| Fichier | Rôle |
|---|---|
| `signature-complete.html` | à coller dans Gmail « Pour les nouveaux e-mails » (+ 1er mail sortant / séquences CRM) |
| `signature-courte.html` | à coller dans Gmail « En cas de réponse/transfert » (2 lignes, « Latitude. » = le lien) |
| `preview.html` | preview de validation : complète clair + dark + courte |
| `render-logo.html` | template de rendu image du wordmark (Chrome headless) — plus utilisé par la signature, conservé comme premier exemplaire du pipeline d'export si un format image est un jour nécessaire |

Source de vérité du CONTENU : `~/Agents/latitude-marque/editorial/bios-canal.md` § Signature e-mail.
Brief : `~/Agents/latitude-marque/editorial/signature-email-brief.md`.

**Installation Gmail** : ouvrir un snippet dans un navigateur → Cmd+A, Cmd+C → coller dans
Paramètres Gmail → Signature. Deux signatures (« Complète », « Courte ») puis les deux menus par
défaut (nouveaux e-mails = Complète ; réponse/transfert = Courte) + cocher « Insérer cette signature
avant le texte des messages cités ». **Enregistrer les modifications** en bas de page.
