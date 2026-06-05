---
colors:
  surface: '#fff9ec'
  surface-dim: '#e0dac9'
  surface-bright: '#fff9ec'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3e2'
  surface-container: '#f4eddd'
  surface-container-high: '#eee8d7'
  surface-container-highest: '#e9e2d2'
  on-surface: '#1e1c12'
  on-surface-variant: '#41493e'
  inverse-surface: '#333025'
  inverse-on-surface: '#f7f0df'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#77574d'
  on-secondary: '#ffffff'
  secondary-container: '#fed3c7'
  on-secondary-container: '#795950'
  tertiary: '#004516'
  on-tertiary: '#ffffff'
  tertiary-container: '#185e27'
  on-tertiary-container: '#8fd691'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e7bdb1'
  on-secondary-fixed: '#2c160e'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#abf4ac'
  tertiary-fixed-dim: '#90d792'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#07521d'
  background: '#fff9ec'
  on-background: '#1e1c12'
  surface-variant: '#e9e2d2'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

This design system is built to bridge the gap between traditional village commerce and digital efficiency. The brand personality is rooted in the "Agrarian Modernist" aesthetic—fusing the reliability of agricultural heritage with the clarity of modern technology.

The UI avoids the "cold tech" aesthetic by prioritizing organic tones and tactile elements. It draws from **Tactile / Modern** influences, using soft depth and physical metaphors (like paper-like cards) to create a digital environment that feels as welcoming as a local village square. The goal is to evoke a sense of digital "homegrown" quality, ensuring users feel a high level of trust and familiarity from the first interaction.

## Colors

The color palette is inspired by natural landscapes. **Deep Forest Green** serves as the anchor, representing growth and stability. The **Warm Cream** background replaces traditional stark whites to reduce eye strain and provide a cozy, sun-drenched atmosphere.

**Earthy Brown** is used exclusively for secondary text and iconography to maintain a soft contrast that is more legible and less aggressive than pure black. **Soft Green** acts as a gentle accent for success states, active indicators, and secondary call-to-actions, while **Pure White** is reserved for elevated surfaces like product cards to make them pop against the cream backdrop.

## Typography

The typographic hierarchy uses a dual-font strategy to balance character with utility. 

**Plus Jakarta Sans** is used for all headings. Its rounded terminals and open apertures provide a modern yet friendly voice that feels approachable to a wide demographic. 

**Inter** is utilized for body copy and UI labels. Its high x-height and neutral character ensure maximum readability for product descriptions and price points, even on smaller mobile screens. Generous line-heights are applied across the board to ensure the layout feels "breathable" and easy to navigate.

## Layout & Spacing

This design system employs a **fixed grid** model for desktop and a **fluid grid** for mobile devices. The rhythm is based on an 8px square baseline to ensure mathematical harmony between elements.

Spacing is intentionally generous to avoid the cluttered feel of typical e-commerce platforms. Margins are wide to draw the eye toward the center content, and gutters are large enough to let individual product cards stand out. Padding within containers should always favor more space over less to maintain the "approachable" brand promise.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. Instead of harsh drop shadows, this design system uses long, diffused shadows with a slight Earthy Brown (#5D4037) tint at very low opacity (5-8%). This makes cards appear as though they are resting softly on the cream background rather than floating in a void.

Interactive elements use a "pressed" effect (reducing shadow and slightly scaling down) to mimic physical buttons. Secondary information is housed in flat containers with subtle 1px Earthy Brown borders at 10% opacity to provide structure without adding visual weight.

## Shapes

The shape language is defined by a consistent **12px radius** for all primary containers and buttons. This specific curvature strikes a balance between professional geometry and organic softness.

- **Cards and Modals:** Use the 12px default radius.
- **Outer Wrappers:** Large sections or featured hero cards may use the 24px radius to emphasize "softness."
- **Tags and Badges:** Use pill-shaped (fully rounded) corners to distinguish them from interactive buttons.
- **Selection Controls:** Checkboxes maintain a slight 4px radius to stay consistent with the system's rounded theme.

## Components

### Buttons
Primary buttons use a Deep Forest Green background with White text. They feature ample horizontal padding (24px). Secondary buttons use a transparent background with a 1px Earthy Brown border.

### Cards
Product cards are White (#FFFFFF) with a 12px corner radius and a soft ambient shadow. Content within cards should have at least 16px of internal padding.

### Input Fields
Inputs use the Warm Cream background but are 5% darker to create an "inset" look. The focus state uses a 2px Deep Forest Green border.

### Chips & Tags
Used for categories like "Organic," "Local," or "Fresh." These use the Soft Green accent with Deep Forest Green text for high contrast and a "natural" feel.

### Lists
List items are separated by subtle Earthy Brown dividers at 10% opacity. Each item should have a minimum height of 56px to ensure a comfortable touch target for mobile users.

### Village-Specific Components
- **Trust Badges:** Small circular icons indicating verified local farmers.
- **Community Progress Bars:** Soft Green bars showing collective purchase goals for the village.