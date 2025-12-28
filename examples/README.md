# Examples

This directory contains sample files for md2cv.

## Sample Files

- `example-cv-en.md` - English CV sample
- `example-cv-ja.md` - Japanese CV sample
- `sample-photo.png` - Sample photo for rirekisho

## Build Commands

### English CV (HTML)

```bash
node dist/bin.js -i examples/example-cv-en.md -o examples/output-en -f cv -t html -p a4
```

### English CV (PDF)

```bash
node dist/bin.js -i examples/example-cv-en.md -o examples/output-en -f cv -t pdf -p a4
```

### Japanese CV (HTML)

```bash
node dist/bin.js -i examples/example-cv-ja.md -o examples/output-ja -f cv -t html -p a4
```

### Japanese CV (PDF)

```bash
node dist/bin.js -i examples/example-cv-ja.md -o examples/output-ja -f cv -t pdf -p a4
```

### Rirekisho (HTML)

```bash
node dist/bin.js -i examples/example-cv-ja.md -o examples/output-rirekisho -f rirekisho -t html -p a3
```

### Rirekisho (PDF with photo)

```bash
node dist/bin.js -i examples/example-cv-ja.md -o examples/output-rirekisho -f rirekisho -t pdf --photo examples/sample-photo.png -p a3
```

### Generate both CV and Rirekisho

```bash
node dist/bin.js -i examples/example-cv-ja.md -o examples/output-both -f both -t both -p a3
```

### Apply custom stylesheet

```bash
node dist/bin.js -i examples/example-cv-en.md -o examples/output-styled -f cv -t html --stylesheet path/to/custom.css -p a4
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --input` | Input Markdown file |
| `-o, --output` | Output file path (without extension) |
| `-f, --format` | Output format: `cv`, `rirekisho`, `both` |
| `-t, --output-type` | Output type: `html`, `pdf`, `both` |
| `-p, --paper-size` | Paper size: `a3`, `a4`, `b4`, `b5`, `letter` |
| `--order` | Chronological order: `asc` (oldest first), `desc` (newest first) |
| `--photo` | Photo file for rirekisho |
| `--stylesheet` | Custom CSS file |
| `--section-order` | Section display order (comma-separated) |
| `--hide-motivation` | Hide motivation section in rirekisho |
