# CookCan Design System

## Brand Identity
**Name:** CookCan
**Tagline:** Scan. Select. Savor.
**Mark:** The supplied lockup — dusty-rose field, botanical line drawing, script wordmark with a tomato for the “o”, and a small camera. That image is `assets/cookcan-logo.jpg` and is the source of the color and the product story.
**Theme:** A kitchen atelier. Warm, editorial, and quiet. The rose field carries the brand. Cream holds the work. Sage is the herb ink from the bouquet.

## Philosophy
CookCan is a Gemini kitchen, not a recipe feed.

1. **Scan** the fridge, or scan a written ingredient list.
2. **Select** by typing what you have, and by choosing a cuisine and a goal.
3. **Savor** recipes curated from that inventory.

Cuisines include Mediterranean, Asian, and Indian. Goals are the dietary aims already stored with the profile (calorie deficit, vegetarian, keto, and the rest). Offline demo recipes still run when no Gemini key is set.

## Color Palette
Sampled from the logo field (`#E18194`).

- Rose field: `#E18194` (`colors.rose`, `colors.primaryContainer`)
- Pressed rose, used for text and buttons on cream: `#A43758` (`colors.primary`)
- Deep rose: `#69042D` (`colors.primaryDark`)
- Sage, from the herb drawing: `#53634D` with wash `#D7E8CC`
- Cream paper: `#FBF9F5`
- Wordmark white: `#FFFFFF`
- Ink: `#1B1C1A`

Rose is a surface and a field. Body text on cream stays charcoal or deep rose so it stays readable.

## Typography
Serif for the question on Home (“What is in the kitchen”) and for recipe titles. Sans for labels, chips, and the tracked tagline SCAN · SELECT · SAVOR.

## Shapes
Cards sit on cream with a 18–28 radius, pulled up over the rose field. Chips are pills. The scan control is a rose circle, matching the camera in the mark.

## Iconography
Lucide only. Stroke weights stay consistent. Do not add a second icon set.

## What we borrowed
Patterns, not artwork, from the recipe apps people actually open:

- Pantry as the source of truth, then recipes from that list (SuperCook, Cooklist).
- One capture step for a photo of food or a list (ReciMe, Samsung Food).
- Cuisine and diet as visible chips beside the generate action (SideChef, Tasty, Yummly’s old flow).
- Editorial type and calm cards (NYT Cooking, Kitchen Stories).
- A personal cookbook, not a social video feed (Paprika). Meal plan and grocery stay one tap away from the same pantry (Samsung Food, Mealime’s old plan).

## Motion
Existing spring presses and the scan pulse stay. No extra animation libraries.
