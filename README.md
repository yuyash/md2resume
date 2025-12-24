# md2cv

md2cv is a command-line tool that transforms Markdown documents into formatted PDF and HTML resumes. Simply write your CV in Markdown, and let md2cv handle the formatting and layout. The tool supports both western-style CVs and Japanese-style documents including rirekisho (履歴書) and shokumu-keirekisho (職務経歴書), making it ideal for international job seekers.

## Key Features

- Write your CV in Markdown
- Generate PDF and HTML outputs
- Multiple format support: western-style CV and Japanese rirekisho (履歴書)

## Installation

Install md2cv globally to use it from anywhere:

```bash
npm install -g md2cv
```

Or run it directly without installation using npx:

```bash
npx md2cv -i your-cv.md
```

## Usage

Here are some common examples to get you started:

```bash
# Basic usage - generate PDF CV
md2cv -i examples/example-cv-en.md

# Specify output path
md2cv -i examples/example-cv-en.md -o ./output/my-cv

# Generate HTML instead of PDF
md2cv -i examples/example-cv-en.md -t html

# Generate both PDF and HTML
md2cv -i examples/example-cv-en.md -t both

# Generate Japanese rirekisho format (A3 paper)
md2cv -i examples/example-cv-ja.md -f rirekisho -p a3

# Generate both CV and rirekisho formats
md2cv -i examples/example-cv-ja.md -f both -p a3
```

## CLI Options

The following options are available to customize the output:

| Option                     | Description                                  | Default         |
| -------------------------- | -------------------------------------------- | --------------- |
| `-i, --input <file>`       | Input markdown file (required)               | -               |
| `-o, --output <path>`      | Output file path (without extension)         | Input directory |
| `-f, --format <format>`    | Output format: `cv`, `rirekisho`, `both`     | `cv`            |
| `-t, --output-type <type>` | Output type: `pdf`, `html`, `both`           | `pdf`           |
| `-p, --paper-size <size>`  | Paper size: `a3`, `a4`, `b4`, `b5`, `letter` | `a4`            |
| `-c, --config <file>`      | Configuration file (JSON or YAML)            | -               |
| `--log-format <format>`    | Log format: `json`, `text`                   | `text`          |
| `--debug`                  | Enable debug logging                         | `false`         |
| `--version`                | Show version                                 | -               |
| `--help`                   | Show help                                    | -               |

## Markdown Format

### Frontmatter and Environment Variables

```yaml
---
name: John Doe
email_address: john@example.com
phone_number: +1-234-567-8900
home_address: San Francisco, CA
---
```

Frontmatter fields can also be set via environment variables. This is useful for keeping personal information out of version control.

| Field                    | Environment Variable(s)                            | Required |
| ------------------------ | -------------------------------------------------- | -------- |
| `name`                   | `NAME`                                             | Yes      |
| `name_ja`                | `NAME_JA`                                          | No       |
| `name_furigana`          | `NAME_FURIGANA`, `NAME_HURIGANA`                   | No       |
| `email_address`          | `EMAIL_ADDRESS`, `EMAIL_ADDRESS1`                  | Yes      |
| `email_address2`         | `EMAIL_ADDRESS2`                                   | No       |
| `phone_number`           | `PHONE_NUMBER`, `PHONE_NUMBER1`                    | Yes      |
| `phone_number2`          | `PHONE_NUMBER2`                                    | No       |
| `post_code`              | `POST_CODE`, `POST_CODE1`                          | No       |
| `home_address`           | `HOME_ADDRESS`, `HOME_ADDRESS1`                    | No       |
| `home_address_furigana`  | `HOME_ADDRESS_FURIGANA`, `HOME_ADDRESS_HURIGANA`   | No       |
| `post_code2`             | `POST_CODE2`                                       | No       |
| `home_address2`          | `HOME_ADDRESS2`                                    | No       |
| `home_address2_furigana` | `HOME_ADDRESS2_FURIGANA`, `HOME_ADDRESS2_HURIGANA` | No       |
| `gender`                 | `GENDER`                                           | No       |
| `dob`                    | `DOB`, `DATE_OF_BIRTH`                             | No       |

Priority: Frontmatter values override environment variables.

```bash
# Example: Set personal info via environment
export NAME="John Doe"
export EMAIL_ADDRESS="john@example.com"
export PHONE_NUMBER="+1-234-567-8900"

md2cv -i cv.md
```

### Sections

Use standard markdown headings for sections:

```markdown
# Summary

Experienced software engineer with 10+ years...

# Experience

## Senior Software Engineer | TechCorp

**2020 - Present** | San Francisco, CA

- Led development of microservices architecture
- Mentored junior developers

# Education

## Bachelor of Science in Computer Science

**University of California** | 2010 - 2014

# Skills

- Programming: TypeScript, Python, Go
- Frameworks: React, Node.js, Django
```

### Structured Blocks

For more control, use structured code blocks:

````markdown
```resume:experience
- company: TechCorp
  roles:
    - title: Senior Software Engineer
      start: 2020-01
      end: present
      highlights:
        - Led development of microservices architecture
        - Mentored junior developers
```

```resume:education
- school: University of California
  degree: Bachelor of Science in Computer Science
  start: 2010-09
  end: 2014-06
```

```resume:skills
- category: Programming
  items: [TypeScript, Python, Go]
- category: Frameworks
  items: [React, Node.js, Django]
```

```resume:certifications
- name: AWS Solutions Architect
  issuer: Amazon Web Services
  date: 2023-01
```
````

## Configuration File

Configuration files are completely optional. All parameters can be specified via CLI arguments. However, you can use a JSON or YAML config file for convenience when you want to reuse the same settings across multiple runs.

Create a `config.json` or `config.yaml`:

```json
{
  "format": "both",
  "outputType": "pdf",
  "paperSize": "a4",
  "logFormat": "text"
}
```

```yaml
format: both
outputType: pdf
paperSize: a4
logFormat: text
```

## Programmatic Usage

If you want to use md2cv as a library in your own project, refer to the following code snippet:

```typescript
import { parseMarkdown, generateOutput, validateCV } from 'md2cv';

const markdown = fs.readFileSync('cv.md', 'utf-8');
const result = parseMarkdown(markdown);

if (result.ok) {
  const validated = validateCV(result.value, 'cv');
  if (validated.ok) {
    await generateOutput(validated.value, config);
  }
}
```

## License

GPL-3.0
