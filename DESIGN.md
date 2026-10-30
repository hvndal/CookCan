# CookCan Design System

## Brand Identity
**Name:** CookCan
**Tagline:** Scan. Select. Savor.
**Mark:** `assets/cookcan-logo.jpg` — dusty-rose field, botanical drawing, script wordmark, tomato as the “o”.
**Feel:** A quiet kitchen atelier. Photography does the selling. Rose is a field. Cream is the paper. Sage is the herb ink.

## Philosophy
CookCan is a Gemini kitchen, not a recipe feed.

1. **Scan** the fridge, or scan a written list.
2. **Select** by typing what you have, and by choosing a cuisine and a goal.
3. **Savor** recipes curated from that inventory.

## Competitor research (October 2026)

There is no single official “top 10 recipes” chart. The list below is the overlap of iOS quality ratings, Google Play Food & Drink grossing, and pantry-first cousins.

| App | Why it matters | What CookCan takes |
| --- | --- | --- |
| NYT Cooking | Editorial photography, serif titles, cream paper, Recipe Box | Full-bleed cover, serif dish names, cream sheet |
| Tasty | Video-first food, cooking mode, “what can I make with 3 ingredients” | Capture tiles, step cooking mode already in detail |
| ReciMe | Camera / screenshot import, confetti, pantry filter, step cards | Fridge vs list capture, success confetti |
| Kitchen Stories | Large food photos, technique, horizontal collections | Magazine recipe cards, cuisine story rings |
| SuperCook | Pantry is the source; menu is what you can cook now | Curate from pantry, chips as inventory |
| Paprika | Personal cookbook, no social feed | Private kitchen, no video wall |
| Samsung Food | Meal plan and grocery from the same box | Grocery and meal planner tabs stay one pantry |
| America’s Test Kitchen | Trust, tested, calm | Quiet type, one primary action |
| TapCook / SideChef | Diet and cuisine next to generate | Goal and cuisine chips on Home |
| Cookpad / Epicurious | Community discovery | Chip filters, not a social feed |

Photography is generated to match the rose linen of the mark (`assets/food/`). Icons stay Lucide.

## Color
- Rose field `#E18194`
- Primary press `#A43758`
- Deep rose `#69042D`
- Sage `#53634D`
- Cream `#FBF9F5`
- Ink `#1B1C1A`
- Wash: blush `#F6C6D2` → cream `#FBF6F1` → sage `#E4F0E2` → lilac `#E6E1F4`

Rose is the mark and the one filled action. The page is a soft wash, the way Pagebound and Widgy sit type on a blush field. Photos float as rounded cards (tweek), they do not paint the whole phone.

## Atmosphere
`SoftWash` is the kitchen paper. Cards lift with a rose-tinted shadow. One script line, then a short sentence. Stickers stay rare: the logo, the avatar, the cuisine rings.

## Type
Serif for dish names and the cover title. Sans for chips, tabs, and SCAN · SELECT · SAVOR. Four sizes: 11, 13, 16, 28.

## Auth
The kitchen door is a phone, not a form. Google is the one-tap path. A magic link is the email path. There is no password and no phone OTP — those belong on a laptop, not a fridge-width screen. Guest stays a quiet text link for a local cook.

## Layout
8-point grid. Floating cards use a 28 radius. Capture tiles sit in the thumb zone. The wash bleeds; photos and controls float inside 20.

## Motion
Press scale `0.96`. Existing springs. Confetti on a finished scan. No second animation library.

## Audio
The kitchen is visual. Shutter haptics already fire from `BouncePressable`. No extra soundtrack until a device build needs a scan chime.
