---
name: LEDGER
description: A private graphite ledger for one person's whole financial position.
colors:
  graphite-black: "#000000"
  graphite-sheet: "#0e0e10"
  graphite-surface: "#1c1c1e"
  graphite-raised: "#2c2c2e"
  graphite-ink: "#f5f5f7"
  graphite-ink-soft: "#98989d"
  graphite-ink-faint: "#8e8e93"
  paper-white: "#ffffff"
  paper-surface: "#f2f2f7"
  paper-raised: "#e5e5ea"
  paper-ink: "#1d1d1f"
  paper-ink-soft: "#4f4f54"
  paper-ink-faint: "#6a6a6f"
  income-green-dark: "#30d158"
  expense-red-dark: "#ff453a"
  caution-amber-dark: "#ffd60a"
  transfer-blue-dark: "#0a84ff"
  income-green-light: "#1a7f37"
  expense-red-light: "#d70015"
  caution-amber-light: "#a05a00"
  transfer-blue-light: "#0060df"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Sarabun', sans-serif"
    fontSize: "38px"
    fontWeight: 600
    letterSpacing: "-1.5px"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Sarabun', sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.8px"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Sarabun', sans-serif"
    fontSize: "18px"
    fontWeight: 700
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Sarabun', sans-serif"
    fontSize: "15px"
    fontWeight: 400
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Sarabun', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.2px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "20px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "16px"
  page-x: "18px"
components:
  button-primary:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.graphite-black}"
    rounded: "{rounded.md}"
    padding: "14px"
  button-secondary:
    backgroundColor: "{colors.graphite-surface}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.md}"
    padding: "13px"
  button-destructive:
    textColor: "{colors.expense-red-dark}"
    rounded: "{rounded.md}"
    padding: "13px"
  input:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  chip:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.graphite-ink-soft}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  chip-active:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.graphite-black}"
  card:
    backgroundColor: "{colors.graphite-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  sheet:
    backgroundColor: "{colors.graphite-sheet}"
    rounded: "{rounded.lg}"
    padding: "24px 20px"
---

# Design System: LEDGER

## Overview

**Creative North Star: "The Graphite Ledger"**

LEDGER is a pencil-and-paper account book in graphite. The page is quiet, grey on grey, so the figures can be trusted. Every surface is one of a few neutral steps. Weight, size and tabular numerals build the hierarchy, not hue. Colour appears only when a number means something: money coming in, money going out, a limit getting close, money moving between the owner's own accounts.

The interface is restrained and dense in an iOS way. Controls are soft rectangles with settled weight, lists use hairline dividers, and bottom sheets slide up for editing. There are exactly two themes, Graphite (dark, the default) and Paper (light). In both, the accent is the ink colour itself. Earlier Aesop, Nord and blue themes, and blue primary buttons, were retired on 2026-09-26 and must not return.

**Key Characteristics:**
- Monochrome chrome. Colour is reserved for financial meaning.
- Tabular numerals on every amount.
- Flat tonal layers instead of shadows.
- Bilingual Thai/English on a system sans with Sarabun for Thai.
- Soft-cornered, compact controls (8 / 12 / 16px radius scale).

## Colors

A neutral graphite ramp in each theme, plus four meaning colours that are tuned separately for dark and light.

### Primary
- **Graphite Ink** (dark) / **Paper Ink** (light): the accent. It fills primary buttons, active chips, active segments, the centre Add button and focus rings, with the page background as the text on top.

### Neutral
- **Graphite Black / Paper White**: the page background.
- **Graphite Sheet**: bottom sheets, popovers and error toasts.
- **Graphite Surface / Paper Surface**: cards, stat blocks, secondary buttons.
- **Graphite Raised / Paper Raised**: inputs, chips, bar tracks, dividers (`--border`).
- **Ink Soft**: secondary labels and supporting figures.
- **Ink Faint**: meta lines, placeholders, captions. In both themes it must stay at 4.5:1 or better against Surface.

### Meaning colours
- **Income Green**: income amounts, "within budget" status, success toasts.
- **Expense Red**: over-budget figures, destructive actions, failed sync, error toasts.
- **Caution Amber**: 80–100% of a budget used.
- **Transfer Blue**: the Transfer transaction type only. It is never used for buttons, links, focus or selection.

### Named Rules
**The Ink-Is-Accent Rule.** The only accent is the text colour. If a control needs to stand out, it becomes ink-filled, not coloured.

**The Meaning-Only Rule.** Green, red, amber and blue each mean one financial thing. Using them for decoration or emphasis breaks the ledger's trust.

**The Tuned-Pair Rule.** Every meaning colour has a separate light-theme value, darkened to pass AA on paper. Never reuse the dark-theme neon on white.

## Typography

**Display Font:** SF Pro Display (with -apple-system, Sarabun, sans-serif)
**Body Font:** SF Pro Text (with Sarabun for Thai)
**Label/Mono Font:** SF Mono / IBM Plex Mono. This is only used for the optional "Mono" font mode and technical detail.

**Character:** The platform grotesque, set tight and confident for figures and neutral for prose. Sarabun carries Thai at matching weights so bilingual rows keep one rhythm.

### Hierarchy
- **Display** (600, 38px, -1.5px, tnum): the balance figure on account and summary cards.
- **Headline** (700, 28px, -0.8px, tnum): the headline figure on the Analytics budget-standing block.
- **Title** (700, 18–19px): the topbar wordmark "LEDGER" and sheet titles.
- **Body** (400, 15px): list rows, form values, settings. Inputs are 16px so iOS does not zoom.
- **Label** (400, 12px, uppercase, +0.2px): section labels such as "EXPENSE BY CATEGORY".
- **Meta** (11–13px): dates, badges, secondary figures. **11px is the floor.**

### Named Rules
**The Tabular Rule.** Every amount, percentage and count uses `font-feature-settings:"tnum"`, so columns of money align.

**The 11px Floor.** No text below 11px. Badges sit at 11px; readable meta sits at 12–13px.

## Layout

The layout is a single column.
- **Pages:** 18px side padding on phones. From 900px the content column is centred at 720px wide.
- **Bars:** a fixed 52px frosted topbar and a fixed 56px bottom nav. The nav becomes a floating centred pill at 900px and wider.
- **Density:** there are three density modes (Compact / Regular / Spacious), set with `data-density`. They adjust padding and base size (13.5 / 15 / 16.5px).
- **Rhythm:** cards stack with a 14px gap. Rows inside cards use 10–12px vertical padding with hairline dividers.
- **Sheets:** they rise from the bottom on phones. From 640px they become centred dialogs with 16px corners.

## Elevation & Depth

The system is flat. Depth comes from tonal steps (page → surface → raised), not shadows.
- **Floating layers:** the topbar and nav use a translucent frosted background (`saturate(180%) blur(20px)`).
- **Overlays:** modal overlays dim the page to 70% black with a 4px blur.
- **Shadows:** only transient floating layers (popovers, toasts, the error banner) carry a small, tight shadow, and they also keep a hairline border.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 2px 6px rgba(0,0,0,.12–.14)`): popovers, tooltips, the error banner, error toasts.
- **Toast** (`box-shadow: 0 6px 16px rgba(0,0,0,.24)`): ink-filled success and info toasts, which have no border.

### Named Rules
**The Flat-By-Default Rule.** Cards never carry shadows. A surface shows a border or a shadow, never a hairline border with a wide diffuse shadow.

## Shapes

Soft rectangles on one radius scale:
- **8px:** small controls, segments, popover items.
- **12px:** cards, buttons, inputs.
- **16px:** sheets and dialogs.
- **Circles and pills:** round icon buttons, the Add button and nav tabs are circles; filter chips and the sync indicator are pills.
- **Small bars:** progress bars use 3px rounded ends.
- **Dividers:** list dividers are 0.5–1px hairlines in Raised.

## Components

### Buttons
- **Shape:** gently rounded (12px).
- **Primary:** ink-filled, background-coloured text, 16px/600, full width in sheets. Hover drops opacity to .88, active to .76, disabled to .4.
- **Secondary:** Surface fill, ink text, a hairline border, 14px/600.
- **Destructive:** red text and a red hairline on an 8% red tint.
- **Icon buttons:** 40px circles on Surface, Raised on hover.
- **Focus:** a 2px ink outline, offset 2px.

### Chips
- **Style:** Raised fill, soft-ink text, pill radius.
- **State:** the active chip is ink-filled with background-coloured text.

### Segmented control (Share filter)
A Surface track with a hairline border and 3px inset. Segments are at least 36px tall. The active segment is ink-filled and exposes `aria-pressed`.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Surface on the page background.
- **Shadow Strategy:** none (see Flat-By-Default).
- **Border:** none, except account cards, which are Sheet with a hairline.
- **Internal Padding:** 16px (10–12px compact, 18–20px spacious).

### Inputs / Fields
- **Style:** Raised fill, no border, 12px radius, 16px text.
- **Focus:** a 2px ink outline.
- **Error:** `aria-invalid` gives a 2px red outline. The first empty required field receives focus and the error is also shown as a toast.
- **Selects:** Surface fill with a hairline and a custom chevron.

### Navigation
- **Bottom nav:** five tabs with 19px icons and 11px labels, in Ink Faint when idle and Ink when active. The centre Add button is a 52px ink-filled circle.
- **Topbar:** the "LEDGER" wordmark, the sync indicator, then theme and settings icon buttons.

### Sync indicator (signature)
A quiet pill in the topbar that states whether the owner's data has reached the cloud:
- **Saved:** a faint check.
- **Pending:** a dotted ring.
- **Syncing:** a spinning ring.
- **Offline:** an ink warning, outlined.
- **Sync failed:** a red, tinted, tappable retry.

On narrow phones the idle states collapse to the icon only.

### Toasts
They sit bottom-centre above the nav and can be dismissed with a tap. The icon is drawn, never an emoji.
- **Success / info:** ink-filled.
- **Error:** Sheet with a red hairline and red icon. It stays longer (at least 4.5s) and uses `role="alert"`.

## Do's and Don'ts

### Do:
- **Do** make the ink colour the accent for every interactive emphasis.
- **Do** use tabular numerals for all money.
- **Do** give every meaning colour a dark value and a darker light-theme value that passes 4.5:1.
- **Do** separate surfaces by tonal step (page → surface → raised) before reaching for borders or shadows.
- **Do** draw status icons as SVG with a 1.6–2px stroke and round caps.

### Don't:
- **Don't** bring back extra themes (Aesop, Nord, Blue) or blue primary buttons.
- **Don't** use green, red, amber or blue for anything other than their financial meaning.
- **Don't** pair a hairline border with a wide, diffuse shadow.
- **Don't** set text below 11px.
- **Don't** use emoji or Unicode glyphs as icons in the interface.
- **Don't** use native `alert()`. Errors go through the themed toast or inline field state.
