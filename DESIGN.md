---
name: Le fils de Venise
description: Un salon de quartier à Brest : miroirs en arche, traits de rasoir parallèles, murs kaki et béton gris, laiton pour la lumière.
colors:
  kaki: "#5b6537"
  kaki-clair: "#8b9760"
  kaki-profond: "#3e4727"
  nuit: "#23271d"
  ardoise: "#3c403a"
  brume: "#a9aca2"
  beton: "#dcdcd3"
  craie: "#f3f1e8"
  laiton: "#d8a64a"
  laiton-vif: "#edbe66"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 8.2vw, 8rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
    fontVariation: "wdth 75"
  hero-name:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "min(35.5vw, 58svh)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.03em"
    fontVariation: "wdth 75"
  headline:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 4.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "wdth 75"
  price:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
    fontVariation: "wdth 75"
  quote:
    fontFamily: "Bricolage Grotesque, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.015em"
    fontVariation: "wdth 82"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  sm: "8px"
  md: "14px"
  lg: "16px"
  pill: "999px"
spacing:
  gutter: "clamp(1.25rem, 4.4vw, 4.5rem)"
  section: "clamp(5rem, 10vw, 9rem)"
  nav: "4.5rem"
components:
  button-primary:
    backgroundColor: "{colors.laiton}"
    textColor: "{colors.nuit}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.95em 1.6em"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.nuit}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.craie}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.95em 1.6em"
  button-dark:
    backgroundColor: "{colors.nuit}"
    textColor: "{colors.craie}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.95em 1.6em"
  panel-prix-kaki:
    backgroundColor: "{colors.kaki}"
    textColor: "{colors.craie}"
    rounded: "{rounded.lg}"
    padding: "clamp(1.4rem, 2.4vw, 2.2rem)"
  panel-prix-craie:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.nuit}"
    rounded: "{rounded.lg}"
    padding: "clamp(1.4rem, 2.4vw, 2.2rem)"
  panel-offert:
    backgroundColor: "{colors.laiton}"
    textColor: "{colors.nuit}"
    rounded: "{rounded.lg}"
    padding: "clamp(1.4rem, 2.4vw, 2.2rem)"
  miroir-arche:
    backgroundColor: "{colors.ardoise}"
    textColor: "{colors.nuit}"
    rounded: "{rounded.pill}"
---

# Design System: Le fils de Venise

## Overview

**Creative North Star: "Le mur du salon"**

La page est le mur d'un salon de quartier à la tombée du jour. Des miroirs en arche portent les photos, des traits de rasoir parallèles balaient les murs kaki, des dégradés se dessinent en lignes de poids croissant, comme une coupe qui part de la peau et monte vers la longueur. Le geste signature est le **trait** : il est offert au salon, et il est offert sur la page, partout.

La palette est celle imposée par le salon, gris et vert kaki, travaillée à grande échelle : de larges champs kaki, du béton gris chaud, une ardoise nuit. Le laiton n'apparaît que comme lumière, sur les actions et quelques accents. Les titres sont géants, condensés et gras ; le texte reste calme et lisible. La chaleur vient de la matière (grain de barbe rasée, photos réelles, cadres crème) et du ton, pas d'un dégradé d'ambiance.

Le système refuse le gabarit barbier (noir et or, poteau rayé, ciseaux en icône) et le duo crème + serif.

**Key Characteristics:**
- Miroirs en arche pour toutes les photos ; jamais de rectangle à coins arrondis pour une photo.
- Trois traits parallèles courbes comme motif récurrent (hero, chargement, galerie).
- Titres condensés très gros, en casse normale ; majuscules réservées au nom « VENISE ».
- Larges champs de couleur : chaque section est un champ kaki, béton, craie, nuit ou ardoise.
- Mouvement scénarisé, une mise en scène par section, toujours optionnel.

## Colors

Kaki et gris comme ossature, laiton comme lumière.

### Primary
- **Mur kaki** (#5b6537) : le champ principal. Hero, chiffres, appel à l'action, panneau « Hommes & kids ». Texte crème dessus (contraste ≈ 5,4:1).
- **Kaki de trait** (#8b9760) : traits décorés sur le kaki, nom en pied de page sur nuit, ligne de marquee.
- **Kaki profond** (#3e4727) : texte kaki sur fonds clairs (signatures d'avis, icônes d'adresse).

### Secondary
- **Laiton** (#d8a64a) : boutons d'action, barre de progression, pastilles d'étape, panneau « Offert ». Jamais en texte courant sur kaki.
- **Laiton vif** (#edbe66) : chiffres animés sur kaki (très grand corps, ≈ 3,4:1).

### Neutral
- **Nuit** (#23271d) : fond sombre, texte sur clair, bouton sombre.
- **Ardoise** (#3c403a) : galerie, panneau « Suppléments », vitre des miroirs avant chargement.
- **Brume** (#a9aca2) : panneau « Femmes », base de la règle de progression.
- **Béton** (#dcdcd3) : fond clair des tarifs et de l'accès.
- **Craie** (#f3f1e8) : texte sur sombre, cadres des miroirs, section des avis.

### Named Rules
**The Light-Only Rule.** Le laiton éclaire : actions, accents, pastilles. Il ne remplit pas de grande surface hors du panneau « Offert » et du lien Instagram.
**The Tint Rule.** Les textes secondaires se teintent de la couleur du fond (mélange craie ou nuit), jamais d'un gris neutre.

## Typography

**Display Font:** Bricolage Grotesque (axe de largeur 75 %, graisse 800), auto-hébergée, avec Arial Narrow en repli.
**Body Font:** Figtree (300–900), auto-hébergée.

**Character:** un grotesque condensé à l'encrage vivant, qui porte la chaleur d'une enseigne de quartier, contre un texte rond et ouvert qui se lit sans effort sur téléphone.

### Hierarchy
- **Hero name** (800, min(35.5vw, 58svh), 0.8) : « VENISE », seul mot en capitales, qui occupe presque toute la largeur.
- **Display** (800, clamp(2.9rem, 8.2vw, 8rem), 0.92) : titres de section et d'appel à l'action.
- **Headline** (800, clamp(2.3rem, 5vw, 4.4rem), 0.95) : titres d'étape et de panneau.
- **Quote** (700, largeur 82 %, clamp(1.8rem, 4vw, 4rem), 1.08) : avis, trois paliers de taille selon la longueur.
- **Body** (400, clamp(1rem … 1.125rem), 1.6) : 65 caractères de mesure maximum.
- **Label / Price** : étiquettes de boutons en Figtree 700 ; prix en Bricolage 800 à chasse tabulaire.

### Named Rules
**The Giant Rule.** Un titre soit domine la section, soit n'est pas un titre. Pas de demi-mesure entre le corps courant et le titre géant.
**The Sentence Rule.** Les titres sont en casse normale ; la capitale est réservée au nom du salon.

## Layout

Une seule page, des sections pleine largeur sur une gouttière fluide (clamp(1.25rem, 4.4vw, 4.5rem)). La mise en page par défaut est **empilée** ; la mise en scène (section épinglée, défilement horizontal des tarifs, parallax souris) s'ajoute par la classe `fx-pin` au-dessus de 900 px quand le mouvement est autorisé. Sous 900 px : arches réduites, étapes empilées, tarifs en colonne, bouton d'appel flottant. Les séparateurs sont des objets du métier : bande de marquee inclinée de −2,4°, dégradé en lignes, peigne, arcade.

## Elevation & Depth

Presque plat : la profondeur vient de la superposition (miroirs derrière les lettres, bandes inclinées sur les champs) et du parallax. Les panneaux de prix portent une ombre unique, décalée et floue, et rien d'autre (pas de bordure en plus).

### Shadow Vocabulary
- **Panneau** (`box-shadow: 0 34px 46px -34px rgba(35,39,29,.6)`) : panneaux de prix.
- **Bouton flottant** (`box-shadow: 0 12px 26px -10px rgba(0,0,0,.55)`) : appel flottant mobile.

### Named Rules
**The One Elevation Rule.** Une surface déclare une ombre ou une bordure, jamais les deux.

## Shapes

La forme-clé est l'**arche** : `border-radius: 999px 999px 14px 14px`, cadre crème de 5 à 6 px. Elle porte les photos, la carte et l'arcade du bas des avis. L'ovale (`border-radius: 50%`) est la variante. Les panneaux et cartes ont 16 px de rayon, les boutons et pastilles sont des capsules (999 px). Aucune forme organique simulée.

## Components

### Buttons
- **Shape:** capsule (999px), hauteur 3 rem, 2,6 rem en petit, 4,2 rem en très grand.
- **Primary:** laiton (#d8a64a), texte nuit, remplissage crème qui monte du bas au survol et au focus clavier.
- **Ghost:** transparent, filet crème de 1,5 px.
- **Dark:** nuit, remplissage kaki.
- **States:** pression à `scale(0.97)` en 140 ms ; effet magnétique et survol seulement sur pointeur précis.

### Miroir en arche
Cadre crème, vitre ardoise, photo en `object-fit: cover`. Le reflet suit le pointeur, uniquement au survol d'un élément incliné.

### Panneau de prix
Un panneau par forfait, chacun dans sa couleur de la palette, titre condensé, lignes `nom / durée / prix` séparées par un filet de 24 % d'opacité. Inclinaison 3D et reflet au survol sur pointeur précis.

### Navigation
Barre fixe qui se masque en descendant et revient en remontant ; fond nuit dès qu'on quitte le haut de page. Sous 1000 px : menu plein écran kaki, liens géants, bouton et téléphone en pied.

### Pastille d'ouverture
Point + texte, calculés à l'heure de Paris : « Ouvert · ferme à 21 h » ou « Fermé · rouvre mercredi à 10 h ».

## Do's and Don'ts

### Do:
- **Do** monter les photos dans des arches ou des ovales à cadre crème de 5–6 px.
- **Do** garder trois traits parallèles comme motif (jamais un seul trait isolé).
- **Do** réserver le laiton aux actions et aux points de lumière.
- **Do** donner à chaque section sa propre entrée en scène, et garder le contenu lisible sans elle.
- **Do** teinter le texte secondaire de la couleur du fond.

### Don't:
- **Don't** utiliser un gabarit barbier (noir et or, poteau rayé, ciseaux ou rasoir en icône).
- **Don't** mettre du texte courant en laiton sur kaki.
- **Don't** étirer les photos au-delà de 1,7× leur définition native : la taille d'un miroir suit la photo, pas l'inverse.
- **Don't** recourir à un texte en contour sur la police variable : les contours se chevauchent ; utiliser une couleur pleine.
- **Don't** inventer de chiffres (clientèle, ancienneté, note) : seuls les faits fournis par le salon figurent sur la page.
