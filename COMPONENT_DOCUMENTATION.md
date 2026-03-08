# TUP Frontend - Component Documentation

## Component Hierarchy

```
HomePage
  ├─ Header
  │   ├─ Logo
  │   └─ Navigation
  ├─ HeroSection
  │   ├─ Background Image
  │   ├─ Title & Subtitle
  │   └─ CTA Buttons
  ├─ MainContent
  │   ├─ OurPrograms (Left Column)
  │   │   ├─ Section Header
  │   │   └─ ProgramCardsGrid
  │   │       └─ ProgramCard (x6)
  │   └─ Announcement (Right Column)
  │       ├─ Section Header
  │       ├─ AnnouncementsList
  │       └─ Bottom Image
  └─ Footer
      ├─ Left Section (Logo + Mission)
      ├─ Right Section (Contact Info)
      └─ Copyright
```

## Components Created

### 1. Header (`src/components/Header.tsx`)
- **Props Interface**: `HeaderProps` (currently empty, extensible)
- **Description**: Dark red header bar with TUP logo and navigation links
- **Tailwind Classes Used**:
  - `bg-red-900` - Dark red background
  - `text-white` - White text
  - `px-4 md:px-8 lg:px-16` - Responsive horizontal padding
  - `py-4` - Vertical padding
  - `flex items-center justify-between` - Flexbox layout
  - `gap-3`, `gap-6` - Spacing between elements
  - `hover:text-red-200` - Hover state for links
  - `transition-colors` - Smooth color transitions

### 2. HeroSection (`src/components/HeroSection.tsx`)
- **Props Interface**: 
  ```typescript
  interface HeroSectionProps {
    backgroundImage?: string;
  }
  ```
- **Description**: Full-width hero section with background image, overlay, centered text, and CTA buttons
- **Tailwind Classes Used**:
  - `relative`, `absolute`, `inset-0` - Positioning
  - `w-full h-[500px] md:h-[600px] lg:h-[700px]` - Responsive heights
  - `bg-cover bg-center` - Background image styling
  - `bg-black/50` - Dark overlay
  - `text-center` - Centered text alignment
  - `text-4xl md:text-5xl lg:text-6xl` - Responsive text sizes
  - `font-serif` - Serif font for headings
  - `bg-red-900 hover:bg-red-800` - Button styling
  - `border-2 border-white` - Outlined button
  - `rounded-lg` - Rounded corners
  - `flex flex-col sm:flex-row` - Responsive button layout

### 3. ProgramCard (`src/components/ProgramCard.tsx`)
- **Props Interface**:
  ```typescript
  interface ProgramCardProps {
    image: string;
    icon: string;
    title: string;
    description: string;
    degrees: string[];
    programCount: number;
  }
  ```
- **Description**: Individual program card component with image, icon, title, description, and program details
- **Tailwind Classes Used**:
  - `bg-white` - White card background
  - `rounded-lg` - Rounded corners
  - `shadow-md hover:shadow-lg` - Shadow effects
  - `overflow-hidden` - Image clipping
  - `h-48` - Fixed image height
  - `object-cover` - Image object fit
  - `p-4 md:p-6` - Responsive padding
  - `line-clamp-2` - Text truncation
  - `text-gray-800`, `text-gray-600`, `text-gray-500` - Text colors
  - `hover:text-red-900` - Hover state

### 4. OurPrograms (`src/components/OurPrograms.tsx`)
- **Props Interface**: None (uses internal data)
- **Description**: Left column section displaying "Our Programs" with a grid of 6 program cards
- **Tailwind Classes Used**:
  - `w-full lg:w-2/3` - Column width (2/3 on large screens)
  - `px-4 md:px-6 lg:px-8` - Responsive padding
  - `text-3xl md:text-4xl lg:text-5xl` - Responsive heading sizes
  - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grid layout
  - `gap-4 md:gap-6` - Grid gaps

### 5. Announcement (`src/components/Announcement.tsx`)
- **Props Interface**:
  ```typescript
  interface AnnouncementProps {
    announcements?: AnnouncementItem[];
  }
  ```
- **Description**: Right column section with announcement header, list, and bottom image
- **Tailwind Classes Used**:
  - `w-full lg:w-1/3` - Column width (1/3 on large screens)
  - `bg-red-900` - Red header background
  - `rounded-t-lg`, `rounded-b-lg` - Rounded corners
  - `border-2 border-red-900` - Border styling
  - `space-y-4` - Vertical spacing between items
  - `shadow-md` - Image shadow

### 6. Footer (`src/components/Footer.tsx`)
- **Props Interface**: None
- **Description**: Footer with logo, mission statement, contact information, and copyright
- **Tailwind Classes Used**:
  - `bg-red-900` - Dark red background
  - `grid grid-cols-1 md:grid-cols-2` - Responsive grid layout
  - `gap-8 md:gap-12` - Grid gaps
  - `border-t border-red-800` - Top border
  - `text-gray-200`, `text-gray-300` - Text colors
  - `leading-relaxed` - Line height

### 7. HomePage (`src/pages/HomePage.tsx`)
- **Props Interface**: None
- **Description**: Main page component that combines all sections
- **Tailwind Classes Used**:
  - `min-h-screen` - Minimum full height
  - `flex flex-col` - Flexbox column layout
  - `flex-1` - Grow to fill space
  - `bg-gray-50` - Light gray background
  - `max-w-7xl mx-auto` - Centered container with max width
  - `flex flex-col lg:flex-row` - Responsive layout direction

## Assets Required

### Existing Assets (Already in `src/assets/`)
✅ **Logo**: `tup-logo.png` - Used in Header and Footer
✅ **Program Card Images**:
  - `cards_image/industrial_technology.png`
  - `cards_image/industrial_education.png`
  - `cards_image/engineering.png`
  - `cards_image/liberal_arts.png`
  - `cards_image/science&technology.png`
  - `cards_image/architecture&fine_arts.png`
✅ **Announcement Image**: `cards_image/side_right_image.png`

### Missing Assets (Need to be added)
⚠️ **Hero Background Image**: 
  - **Location**: `src/assets/hero-bg.jpg` or `src/assets/hero-bg.png`
  - **Description**: Image of an old, grand university building partially obscured by green trees
  - **Usage**: Pass as prop to `HeroSection` component
  - **Alternative**: The component will use a gradient fallback if no image is provided

### Optional Assets (Icons)
Currently using emoji icons (⚙️, 🏠, 📚, 📐, 💬, 📢, 📞, ✉️, 📍). If you want to use actual icon components:
- Consider using `react-icons` or `lucide-react` library
- Or add SVG icon files to `src/assets/icons/`

## File Structure

```
src/
  ├─ components/
  │   ├─ Header.tsx
  │   ├─ HeroSection.tsx
  │   ├─ ProgramCard.tsx
  │   ├─ OurPrograms.tsx
  │   ├─ Announcement.tsx
  │   └─ Footer.tsx
  ├─ pages/
  │   └─ HomePage.tsx
  ├─ assets/
  │   ├─ tup-logo.png
  │   ├─ cards_image/
  │   │   ├─ industrial_technology.png
  │   │   ├─ industrial_education.png
  │   │   ├─ engineering.png
  │   │   ├─ liberal_arts.png
  │   │   ├─ science&technology.png
  │   │   ├─ architecture&fine_arts.png
  │   │   └─ side_right_image.png
  │   └─ (hero-bg.jpg - to be added)
  └─ App.tsx
```

## Usage Instructions

### 1. Add Hero Background Image (Optional)
If you have a hero background image, add it to `src/assets/` and update `HomePage.tsx`:

```tsx
<HeroSection backgroundImage={heroBg} />
```

Or import it directly:
```tsx
import heroBg from '../assets/hero-bg.jpg';
<HeroSection backgroundImage={heroBg} />
```

### 2. Customize Announcements
Edit the `defaultAnnouncements` array in `src/components/Announcement.tsx` or pass custom announcements as props:

```tsx
<Announcement announcements={customAnnouncements} />
```

### 3. Customize Programs
Edit the `programs` array in `src/components/OurPrograms.tsx` to update program information.

### 4. Run the Application
```bash
npm run dev
```

## Responsive Breakpoints

The design uses Tailwind's default breakpoints:
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up

## Color Palette

- **Primary Red**: `red-900` (#7f1d1d) - Headers, buttons, accents
- **Hover Red**: `red-800` (#991b1b) - Button hover states
- **Text Dark**: `gray-800` - Main text
- **Text Medium**: `gray-600` - Secondary text
- **Text Light**: `gray-500`, `gray-200`, `gray-300` - Tertiary text
- **Background**: `gray-50` - Main content background
- **White**: `white` - Cards, buttons

## Notes

- All components are functional components using TypeScript
- No external CSS files are used (only Tailwind classes)
- All images are imported using ES6 import syntax
- The layout is fully responsive
- Components are production-ready and follow React best practices
- Icons are currently emoji-based but can be easily replaced with icon libraries

