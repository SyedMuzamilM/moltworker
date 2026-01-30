# How to Write Distinctive Design Prompts

## The Framework: AIDA-SPEC

When creating detailed design prompts, use this framework:

### **A** - Aesthetic Direction
Define the visual style with extreme specificity:
- **Era/Period**: 50s, Art Deco, Victorian, Cyberpunk, etc.
- **Cultural References**: American barbershop, French bistro, Japanese minimalism
- **Mood/Tone**: Bold, elegant, playful, brutalist, refined

### **I** - Identity & Branding
Who is this for? What's the personality?
- Business name and tagline
- Target audience
- Brand personality traits

### **D** - Design Elements (Visual Details)
Get extremely specific about every visual aspect:

#### Color Palette
```
Don't say: "Use red, white, and blue"
Do say: "Barber pole-inspired tri-color: Deep Crimson (#C41E3A), 
         Vintage Cream (#F5F5DC), and Navy Blue (#1E3A8A)"
```

#### Typography
```
Don't say: "Use nice fonts"
Do say: "Western Slab Serif (Rye) for headers at 3.5rem with 4px 
         letter-spacing, Typewriter font (Courier Prime) for body 
         text at 1.2rem line-height"
```

#### Textures & Effects
```
Don't say: "Make it look old"
Do say: "Newsprint noise texture overlay at 3% opacity, 
         mimicking aged paper with subtle grain"
```

### **A** - Architecture (Layout & Structure)
How should content be organized?
- Grid systems, asymmetry, overlapping elements
- Section hierarchy and flow
- Responsive behavior

### **S** - Specific Components
Break down each UI element:

```
Button: "Styled as vintage ticket with gold gradient, 
        serrated edges using pseudo-elements, 
        2deg rotation for authenticity"

Price List: "Vintage menu design with dotted leader lines 
             connecting items to prices, double-rule borders,
             'EST. 1952' banner stamp"
```

### **P** - Patterns & Motifs
Repeating visual elements that create cohesion:
- Geometric blocks, stripes, decorative dividers
- Iconography style
- Border treatments

### **E** - Effects & Animation
Simple but purposeful interactions:
```
Don't say: "Add animations"
Do say: "CSS transitions only: 0.3s ease on hover states, 
         subtle box-shadow depth changes, no complex 3D"
```

### **C** - Constraints & Technical
Set boundaries to focus creativity:
- "No complex 3D animations"
- "CSS-only effects"
- "Single-page layout"

---

## Example Breakdown: Gentleman's Blade

### Aesthetic Direction
- **Era**: 1950s American barbershop
- **Style**: Vintage poster art meets mid-century modern
- **Mood**: Nostalgic, masculine, premium craftsmanship

### Identity
- **Name**: Gentleman's Blade
- **Tagline**: "Classic Cuts & Straight Razor Shaves Since 1952"
- **Audience**: Men seeking traditional grooming experience

### Design Elements
**Colors:**
- Barber pole tri-color: Red (crimson #C41E3A), White (cream #F5F5DC), Blue (navy #1E3A8A)
- Background: Newsprint beige (#E8E4D9) with noise texture
- Accents: Gold ticket buttons, black ink borders

**Typography:**
- Headers: Rye (Western slab serif) - bold, uppercase, 3-4px letter-spacing
- Body: Courier Prime (typewriter) - monospace, 1.6 line-height
- Special: Special Elite for vintage feel

**Textures:**
- SVG noise filter overlay at 3% opacity
- Paper grain effect
- Subtle shadow depth

### Architecture
- Header: Tricolor gradient bar with centered content box
- Navigation: Bold horizontal with hover border effects
- Hero: Ticket-style CTA with decorative cutouts
- Services: Vintage menu with dotted leader lines
- Barbers: Grid cards with B&W portraits in thick frames

### Components
**Book Button:**
- Gold gradient background
- 4px black border
- Serrated edges (::before/::after circles)
- -2deg rotation
- Box-shadow for depth

**Price Menu:**
- Parchment background
- Double-rule header border
- Dotted leader lines between items
- "EST. 1952" stamp badge

**Barber Cards:**
- 6px black border
- Inner red border frame (::before)
- Grayscale portrait placeholder
- Hover lift with blue shadow

### Patterns
- Color block dividers (red/blue horizontal bars)
- Decorative flanking elements (✦ symbols)
- Dashed/dotted line separators
- Geometric color banding

### Effects
- Hover: 0.3s ease transitions
- Scale: 1.05 on interactive elements
- Rotation: Normalize ticket button on hover
- Shadows: Increase depth on interaction

### Constraints
- CSS-only (no JS animations)
- Responsive grid
- Single HTML file
- No external images (use emojis/gradients)

---

## Prompt Writing Tips

### 1. Be Sensory-Specific
Describe what the user will see, feel, and experience:
```
"Thick borders like vintage posters"
"Noise-textured beige like old newsprint"
"Bold, vintage poster look with geometric color blocks"
```

### 2. Use Reference Language
Compare to known aesthetics:
```
"Styled like an old-school ticket"
"Vintage menu rather than boring table"
"Black-and-white portraits with thick frames"
```

### 3. Specify the Negative
Say what you DON'T want:
```
"No complex 3D animation"
"No boring tables"
"No generic corporate look"
```

### 4. Layer the Details
Start broad, then add specifics:
1. Overall aesthetic (50s barbershop)
2. Color scheme (Red/White/Blue)
3. Typography (Western Slab + Typewriter)
4. Specific components (ticket button, menu prices)
5. Fine details (serrated edges, dotted lines)

### 5. Include Technical Specs
Help the implementer with constraints:
```
Font URLs: Google Fonts CDN
Technique: CSS pseudo-elements for decorative borders
Animation: Simple CSS transitions only
Structure: Semantic HTML5
```

---

## Template Formula

```markdown
Create a [AESTHETIC] website for [BUSINESS NAME], 
a [BUSINESS TYPE] with [UNIQUE QUALITY].

**Visual Identity**
- Colors: [SPECIFIC PALETTE WITH HEX CODES]
- Background: [TEXTURE/DESCRIPTION]
- Typography: [HEADER FONT] for [USE], [BODY FONT] for [USE]
- Style: [KEY VISUAL DESCRIPTORS]

**Content Presentation**
- Hero: [DESCRIPTION WITH CTA DETAILS]
- [SECTION 1]: [SPECIFIC STYLING]
- [SECTION 2]: [SPECIFIC STYLING]

**Design Details**
- Borders: [THICKNESS/STYLE]
- Dividers: [GEOMETRIC PATTERNS]
- Effects: [SIMPLE CSS TRANSITIONS]

**Requirements**
- No [WHAT TO AVOID]
- Use [TECHNICAL APPROACH]
```

---

## Practice Exercise

Try rewriting this basic prompt using the framework:

**Basic:**
"Make a coffee shop website with a warm, cozy feel. Use brown colors and nice fonts. Add a menu and contact info."

**Enhanced with AIDA-SPEC:**
"Create a 'Roasted & Ground' website for an artisanal third-wave coffee shop 
inspired by 1920s Parisian cafes and industrial coffee roasteries.

**Visual Identity**
- Colors: Burnt sienna (#8B4513), Steam white (#FAF9F6), Copper accent (#B87333), 
  Deep espresso (#3D2817)
- Background: Kraft paper texture with coffee stain watermarks at 5% opacity
- Typography: Playfair Display (elegant serif) for headers with swash capitals, 
  Cormorant Garamond for body text

**Content Presentation**
- Hero: Diagonal split layout with steaming coffee cup photograph on left, 
  gold-foil style logo on right, floating steam wisps (CSS animation)
- Menu: Horizontal scroll carousel with Polaroid-style cards for each drink,
  handwritten-style descriptions
- Origins: World map with coffee bean icons marking source regions,
  click reveals origin stories in vintage letterpress style

**Design Details**
- Borders: 2px copper borders with subtle inner glow
- Dividers: Coffee bean separator patterns
- Cards: Stacked paper effect with soft shadows
- Buttons: Stamped metal look with debossed text effect

**Requirements**
- No stock photography (use CSS gradients and icons)
- Subtle parallax on scroll (CSS transform3d)
- Mobile: Stack to single column with accordion menu"

---

## Key Takeaway

The more specific and sensory your description, the more distinctive the result. 
Don't just say what you want—describe exactly how it should look, feel, and behave.

**Bad**: "Make it look vintage"
**Good**: "Newsprint beige background with 3% noise texture overlay, 
Western Slab Serif headers at 3.5rem with 4px letter-spacing, 
thick 6px black borders with inner red frames on cards"
