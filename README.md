# Le fils de Venise

Site vitrine du salon de coiffure **Le fils de Venise**, 49 rue de la Porte, 29200 Brest.
Une seule page statique : HTML, CSS et JavaScript, sans étape de compilation.

Action principale : **prendre rendez-vous** (Planity) ou **appeler** le 06 60 71 96 83.

## Lancer en local

```bash
python3 -m http.server 8765
```

Puis ouvrir <http://localhost:8765/index.html>. N'importe quel serveur statique convient (le site ne fonctionne pas bien en `file://` à cause du chargement des polices).

## Mettre en ligne

Publier **uniquement** `index.html` et le dossier `assets/` sur un hébergement statique (Netlify, Vercel, GitHub Pages, OVH…). Les autres fichiers (`PRODUCT.md`, `DESIGN.md`, `.impeccable/`, `.claude/`) sont des notes de travail et n'ont pas à être publiés.

Une fois le nom de domaine connu :
- dans `index.html`, remplacer `assets/img/og.jpg` (balise `og:image`) par l'URL absolue de l'image ;
- ajouter `<link rel="canonical">` et le champ `url` dans les données structurées (bloc JSON-LD).

## Structure

```
index.html            page, contenu, données structurées LocalBusiness (HairSalon)
assets/css/style.css  styles (jetons de couleur, composants, mises en page)
assets/js/main.js     animations (GSAP + ScrollTrigger + Lenis)
assets/vendor/        gsap, ScrollTrigger, Lenis (copies locales)
assets/fonts/         Bricolage Grotesque et Figtree (auto-hébergées)
assets/img/           photos en WebP, texture, favicon, image de partage
```

## Ce qu'il faut modifier quand le salon change

| Sujet | Où |
| --- | --- |
| Horaires affichés | `index.html`, liste `.hours` dans la section « Nous trouver » |
| Horaires pour la pastille « Ouvert / Fermé » | `assets/js/main.js`, constante `SCHEDULE` (minutes depuis minuit, 0 = dimanche) |
| Horaires pour Google | `index.html`, bloc JSON-LD `openingHoursSpecification` |
| Tarifs | `index.html`, section `#tarifs` (un `<article class="panel">` par forfait) |
| Avis | `index.html`, section `#avis` (une `<li class="review">` par avis) |
| Lien de réservation | rechercher `planity.com` dans `index.html` |
| Téléphone | rechercher `tel:+33660719683` dans `index.html` |

## Accessibilité, mouvement, performance

- Le contenu est lisible sans JavaScript ; si le script principal ne démarre pas, le préchargeur disparaît au bout de 6 s.
- `prefers-reduced-motion` : pas de défilement lissé, pas de préchargeur, pas de section épinglée, compteurs directement à leur valeur finale, carrousel sans lecture automatique.
- Sous 900 px : sections empilées, pas de parallax souris, ni de curseur personnalisé.
- Le carrousel d'avis a un bouton pause et ne défile pas quand la souris ou le focus est dessus.
- Audit axe-core (WCAG 2.x AA) : aucune violation sur desktop et mobile.
- Seuls `transform`, `opacity` et `clip-path` sont animés, plus le tracé des traits (`stroke-dashoffset`) sur de petits SVG.

## À fournir par le salon

- **Photos en haute définition** (au moins 1600 px de large). Les cinq photos actuelles font 202×360 et 224×298 px : le site les affiche en petit format pour limiter le flou, mais elles ne supportent pas un affichage plein écran.
- **Une photo de façade** qui ne soit pas une capture de rue : l'actuelle (`photo-5`) y ressemble.
- Le **nom de domaine**.

## Photos et ressources : provenance

| Fichier | Origine |
| --- | --- |
| `assets/img/photo-1…5.webp` | Photos fournies par le salon (JPEG d'origine converties en WebP, qualité 90). `photo-5` est la façade. |
| `assets/img/photo-1…5-2x.webp` | Mêmes photos agrandies ×2 (Lanczos + léger renforcement) pour les écrans à haute densité. Ce n'est pas de la vraie définition en plus. |
| `assets/img/og.jpg` | Capture du hero, générée avec Playwright. |
| `assets/img/stubble.png` | Texture de grain générée par script (bruit aléatoire), sans source externe. |
| `assets/img/favicon.svg` | Dessiné pour ce site. |

## Licences des composants tiers

- **GSAP** et **ScrollTrigger** : licence GSAP « no charge » (<https://gsap.com/standard-license>).
- **Lenis** : MIT.
- **Bricolage Grotesque**, **Figtree** : SIL Open Font License 1.1 (copies des licences dans `assets/fonts/`).
- **Icônes** : Lucide (ISC), sauf l'icône Instagram, dessinée dans le même style.

## Notes de conception

`PRODUCT.md` (contexte produit), `DESIGN.md` (système visuel) et `.impeccable/` (brief de la page, fichier compagnon du système visuel) décrivent les choix de direction artistique.
