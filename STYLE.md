# Custom Stylesheet Guide

This guide explains how to create custom stylesheets for md2cv to customize the appearance of your CV and rirekisho output.

## Usage

Apply a custom stylesheet using the `--stylesheet` option:

```bash
node dist/bin.js -i input.md -o output -f cv -t html --stylesheet custom.css
```

## How It Works

Custom stylesheets are appended after the default styles, allowing you to override any default values. The default styles use CSS custom properties (variables), making customization straightforward.

## CSS Variables

### CV Format (English & Japanese)

```css
:root {
  /* Typography */
  --cv-font-family: "Noto Serif", "Times New Roman", Times, Georgia, serif;
  --cv-font-size-base: 11pt;
  --cv-font-size-title: 20pt;
  --cv-font-size-section: 12pt;
  --cv-font-size-small: 10pt;
  --cv-font-size-xs: 9pt;
  --cv-line-height: 1.4;

  /* Colors */
  --cv-color-text: #333;
  --cv-color-heading: #000;
  --cv-color-muted: #555;
  --cv-color-border: #333;
  --cv-color-background: #fff;

  /* Spacing */
  --cv-spacing-section: 14px;
  --cv-spacing-entry: 10px;
}
```

Note: Japanese CV uses different default fonts:
```css
:root {
  --cv-font-family: "Noto Serif JP", "Hiragino Mincho Pro", "Yu Mincho", "MS Mincho", serif;
}
```

### Rirekisho Format

```css
:root {
  /* Typography */
  --rirekisho-font-family: "Noto Serif JP", "Hiragino Mincho Pro", "Yu Mincho", "MS Mincho", serif;
  --rirekisho-font-size-base: 7.1pt;      /* Scaled by paper size */
  --rirekisho-font-size-title: 15.62pt;
  --rirekisho-font-size-name: 11.36pt;
  --rirekisho-font-size-address: 8.52pt;
  --rirekisho-font-size-normal: 7.1pt;
  --rirekisho-font-size-small: 5.68pt;
  --rirekisho-font-size-xs: 4.97pt;
  --rirekisho-font-size-xxs: 4.26pt;

  /* Colors */
  --rirekisho-color-text: #000;
  --rirekisho-color-background: #fff;
  --rirekisho-color-border: #000;

  /* Border */
  --rirekisho-border-width: 0.5pt;
}
```

## HTML Structure & Class Names

### CV Format

```html
<body class="cv cv--en">  <!-- or cv--ja for Japanese -->
  <header class="cv-header">
    <h1 class="cv-name">Name</h1>
    <div class="contact-info">...</div>
  </header>
  <main class="cv-content">
    <section class="cv-section cv-section--summary">...</section>
    <section class="cv-section cv-section--experience">...</section>
    <section class="cv-section cv-section--education">...</section>
    <section class="cv-section cv-section--skills">...</section>
    <section class="cv-section cv-section--certifications">...</section>
    <!-- etc. -->
  </main>
</body>
```

Key classes:
- `.cv` - Root body class
- `.cv--en` / `.cv--ja` - Language variant
- `.cv-header` - Header container
- `.cv-name` - Name heading
- `.cv-content` - Main content area
- `.cv-section` - Section container
- `.cv-section--{id}` - Section-specific class (e.g., `cv-section--experience`)
- `.entry` - Individual entry (job, education, etc.)
- `.entry-header` - Entry header with title and date
- `.entry-title` - Entry title
- `.entry-date` - Date range
- `.entry-subtitle` - Subtitle (location, degree, etc.)
- `.entry-summary` - Summary text
- `.skills-grid` - Skills grid container
- `.skill-item` - Individual skill item
- `.skill-category` - Categorized skill entry
- `.cert-item` - Certification item
- `.lang-item` - Language item
- `.competency-entry` - Competency entry

### Rirekisho Format

```html
<body class="rirekisho">
  <div class="spread">
    <div class="spread-content">
      <div class="page page--left">...</div>
      <div class="page page--right">...</div>
    </div>
    <div class="spread-footer">...</div>
  </div>
</body>
```

Key classes:
- `.rirekisho` - Root body class
- `.spread` - Full page spread container
- `.page` - Individual page
- `.page--left` / `.page--right` - Page position
- `.text--title` / `.text--name` / `.text--normal` / `.text--small` / `.text--xs` / `.text--xxs` - Typography sizes
- `.align--center` / `.align--left` / `.align--right` - Text alignment
- `.cell` - Form cell container
- `.cell__label` - Cell label
- `.cell__value` - Cell value
- `.photo-box` - Photo placeholder
- `.photo-box--with-image` - Photo box with image
- `.section-box` - Section container
- `.section-box__header` - Section header
- `.section-box__content` - Section content
- `.history-container` - Education/work history container
- `.motivation-container` - Motivation section container
- `.notes-container` - Notes section container
- `.table-wrapper` - Table container
- `.col--year` / `.col--month` - Table column widths

## Examples

### Change Font Family (CV)

```css
:root {
  --cv-font-family: "Helvetica Neue", Arial, sans-serif;
}
```

### Change Font Family (Rirekisho)

```css
:root {
  --rirekisho-font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
}
```

### Use Web Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');

:root {
  --rirekisho-font-family: "Noto Sans JP", sans-serif;
}
```

### Change Colors (CV)

```css
:root {
  --cv-color-text: #2c3e50;
  --cv-color-heading: #1a252f;
  --cv-color-border: #3498db;
}

h2 {
  border-bottom-color: var(--cv-color-border);
}
```

### Adjust Font Sizes (CV)

```css
:root {
  --cv-font-size-base: 10pt;
  --cv-font-size-title: 18pt;
  --cv-font-size-section: 11pt;
}
```

### Style Specific Sections

```css
/* Highlight experience section */
.cv-section--experience h2 {
  color: #2980b9;
}

/* Different background for skills */
.cv-section--skills {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}
```

### Language-Specific Styles

```css
/* English CV specific */
.cv--en {
  --cv-font-family: "Georgia", serif;
}

/* Japanese CV specific */
.cv--ja {
  --cv-font-family: "Hiragino Mincho Pro", serif;
}
```

### Rirekisho Border Style

```css
:root {
  --rirekisho-border-width: 1pt;
  --rirekisho-color-border: #333;
}
```

### Print-Specific Styles

```css
@media print {
  .cv-header {
    background-color: #f0f0f0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

### Hide Sections

```css
.cv-section--certifications {
  display: none;
}
```

## Tips

1. Use browser developer tools to inspect the generated HTML and identify elements to style.

2. CSS variables cascade, so you can override them at any level:
   ```css
   .cv-section--experience {
     --cv-color-heading: #2980b9;
   }
   ```

3. For print output (PDF), ensure colors are preserved:
   ```css
   * {
     -webkit-print-color-adjust: exact;
     print-color-adjust: exact;
   }
   ```

4. Test your stylesheet with HTML output first (`-t html`), then generate PDF.

5. Rirekisho font sizes are scaled based on paper size. Override with fixed values if needed.
