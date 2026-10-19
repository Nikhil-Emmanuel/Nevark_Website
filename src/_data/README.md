# Site content data

Edit these JSON files to update content across the whole site. Empty values are hidden automatically.

| File | What it controls |
| --- | --- |
| `site.json` | Company name, contact details, address, office Google Maps link (`maps`), legal identifiers (LLPIN, GSTIN, DPIIT no.), Grievance Officer, form endpoints, social links, navigation |
| `clients.json` | Logo strip on the home page ("Trusted by"). Add `{ "name", "logo", "kind", "url" }`; put logo files in `src/assets/img/` |
| `metrics.json` | Impact numbers on the home page |
| `testimonials.json` | Client quotes. Section appears only when this list is not empty. Shape: `{ "quote", "name", "role", "company", "photo" }` (get written consent first) |
| `inspiration.json` | "Voices of Inspiration" quotes |
| `team.json` | Leadership grid on About. Section appears only when not empty. Shape: `{ "name", "role", "bio", "photo", "linkedin" }` |
| `services.json` | "What we do" cards |
| `industries.json` | Industries page sections |
| `milestones.json` | Timeline on About |

Projects live in `src/projects/*.md` (one file per case study) and open roles in `src/careers/*.md`.
