# Multi-Jurisdiction PII Anonymizer

Desarrollado por [Zythos Media](https://zythos.media) — Especialistas en SEO & IA Search


**Use AI  on client data without the data ever touchin g the AI.**

Anonymize CSV, Excel, Word and M arkdown files locally — names, national IDs ,
emails, phones, addresses — replacing the m with neutral tokens before anything
leaves  your machine. Hand the tokenized file to Chat GPT or Claude, work as usual,
then restore th e real values with one command. Nothing is se nt to the cloud.

Three steps:

```
1. anonym ize        →  informe.docx        →  info rme_anon.docx (+ key map)
2. process with AI   →  informe_anon.docx   →  result.docx         (AI sees only tokens)
3. restore           →  result.docx         →  result_restau rado.docx (real data back)
```

Zero config:  by default it protects under GDPR and 7 other  frameworks at once.
It restores the file eve n if the AI hands it back under a different n ame. And it
ships with a safety net — optio nal map encryption, coverage reports after ev ery
run (what was detected, what could not be  restored), and a regression test suite
so ea ch update keeps protecting your data.

You ge t the full power of AI. Your sensitive data n ever sees it.

- **Jurisdictions**: RGPD/GDPR  (EU), Ley 21.719 (Chile), LGPD (Brazil), LFP DPPP (Mexico), Ley 1581 (Colombia), Ley 25.32 6 (Argentina), UK GDPR, CCPA/CPRA (California )
- **Formats**: `.csv`, `.xlsx`, `.md`, `.do cx`
- **NLP engine**: [spaCy](https://spacy.i o/) + [Microsoft Presidio](https://microsoft. github.io/presidio/), multilingual, runs enti rely local — no data leaves the machine
- * *Reversible**: every run produces a `.key.jso n` map for full restoration; optional AES enc ryption
- **Screaming Frog aware**: auto-dete cts SF exports and only processes free-text c olumns

Built for SEO agencies, data analysts , and consultants who share client data with
 AI tools and need a clean, auditable anonymiz ation step before exporting files.

---

## H ow it works

### Anonymization

```
original. csv
     │
     ▼
python anonimizar.py or iginal.csv --ley rgpd
     │
     ├──  spaCy + Presidio scan every cell / paragraph  / line
     │   and detect names, emails,  IDs, phones, IBANs...
     │
     ├──  Each unique value gets a numbered token
      │   "Juan García"       →  <PERSONA-1>
      │   "juan@mail.com"     →  <EMAIL-1> 
     │   "12345678Z"         →  <DNI-ES- 1>
     │   "Juan García" (2nd) →  <PERS ONA-1>   ← same token reused
     │
      ├── original_anon.csv          ← file  with tokens, no PII
     └── original_ anon.csv.key.json ← map {token → original  value}
```

### The full round-trip: anonymi ze → process with AI → restore

The inten ded workflow is to anonymize a file, hand the  tokenized version to an
AI tool (which never  sees the real data), and restore the tokens  in whatever the
AI returns:

```
1. ANONYMIZE 
   informe.docx  →  informe_anon.docx  +   informe_anon.docx.key.json

2. PROCESS WITH A I
   informe_anon.docx  →  [ChatGPT / Claud e / ...]  →  result.docx
                          (the AI only ever sees tokens, never r eal PII)

3. RESTORE
   result.docx  →  res ult_restaurado.docx
                   (token s replaced back with real values)
```

```bas h
# Restore a single file (auto-locates the . key.json next to it)
python anonimizar.py inf orme_anon.docx --restaurar

# Restore an enti re folder (first level; skips .key.json and * _restaurado files)
python anonimizar.py C:/an on/ --restaurar

# Restore an AI-returned fil e that was renamed — point to the original  map
python anonimizar.py result.docx --restau rar --mapa informe_anon.docx.key.json
```

No  NLP models are loaded during restoration —  it starts in under a second.

**Map resoluti on order** for restoration:

1. `--mapa` expl icit → applied to every input.
2. `[file].k ey.json` exact name match next to the file (d irect anonymization case).
3. A single `.key. json` in the folder → used for any token-be aring file. This
   covers an AI-returned fil e with a different name placed next to its or iginal map.
4. Multiple `.key.json` with no n ame match → error asking for `--mapa`, to a void
   mixing tokens across files (`<PERSONA -1>` is not the same value in two maps).

> R estoration works on any file that still conta ins the tokens. If the AI deleted
> or altere d a token, that value cannot be recovered. Th e result is the processed
> file with real va lues reinserted — not necessarily byte-iden tical to the source.

### The .key.json map

 ```json
{
  "version": "2.2",
  "ley": ["rgpd "],
  "fecha": "2026-06-21T10:00:00+00:00",
   "archivo_origen": "original.csv",
  "adverte ncia": "Este archivo contiene datos personale s originales...",
  "mapa": {
    "<PERSONA-1 >": "Juan García",
    "<EMAIL-1>": "juan@ma il.com",
    "<DNI-ES-1>": "12345678Z"
  }
}
 ```

**The `.key.json` file contains the orig inal PII in plaintext. Protect it with
the sa me access controls as the source file. If it  is lost, restoration is
not possible.**

---
 
## Jurisdictions

### EU — RGPD / GDPR (Re gulation 2016/679)

**Key:** `rgpd`

- **DNI* * (8 digits + check letter): `12345678Z` →  `<DNI-ES-N>`
- **NIE** (X/Y/Z + 7 digits + le tter): `X1234567Z` → `<DNI-ES-N>`
- Spanish  landlines and mobiles, including `+34` prefi x
- Universal: names, emails, IBAN codes, cre dit cards, dates, IPs, locations near names

 ---

### Chile — Ley 21.719 / Ley 19.628

* *Key:** `chile`

Ley 21.719 was published on  13 December 2024 and enters into full force o n
1 December 2026, replacing Ley 19.628 entir ely. Creates the APDP (Agencia de
Protección  de Datos Personales) as an autonomous enforc ement authority with powers
to investigate, f ine (up to 20,000 UTM), and suspend processin g. Expands sensitive
data categories (biometr ic, continuous geolocation, data of minors un der 14) and
introduces a Data Protection Dele gate requirement. Applies extraterritorially  to
processing that affects people in Chile.

 - **RUT/RUN** with dots: `12.345.678-9` → ` <RUT-CL-N>`
- **RUT/RUN** without dots: `1234 5678-K` → `<RUT-CL-N>`
- Chilean mobiles (` 9XXXXXXXX`) and landlines with `+56` prefix

 ---

### Brazil — LGPD (Lei 13.709/2018)

* *Key:** `brasil`

In force since August 2020.  Requires an explicit legal basis for each pr ocessing
activity. Applies to any organizatio n processing data of people in Brazil,
regard less of where the organization is located. Su pervisory authority: ANPD.

- **CPF** (indivi dual taxpayer): `123.456.789-09` → `<CPF-BR -N>`
- **CNPJ** (legal entity): `12.345.678/0 001-95` → `<CNPJ-BR-N>`
- Brazilian mobiles  (9-digit with DDD) and landlines with `+55`  prefix

---

### Mexico — LFPDPPP (2010)

* *Key:** `mexico`

Original law enacted in 201 0. A November 2024 constitutional reform elim inated
the INAI (the former data protection a uthority). A reformed LFPDPPP entered into
fo rce on 21 March 2025, designating the SABG (S ecretaría Anticorrupción y Buen
Gobierno) a s the new supervisory authority. The 2025 ref orm adds obligations
around automated decisio n-making and AI — one of the first in Latin  America to
do so directly in statute. Implem enting regulations were under stakeholder
con sultation as of early 2026. The public sector  is governed by the separate
Ley General de P rotección de Datos en Posesión de Sujetos O bligados (2017).

- **CURP** (18-char alphanu meric): `PELJ800101HDFRRN09` → `<CURP-MX-N> `
- **RFC** persona física (13 chars): `PELJ 800101XX9` → `<RFC-MX-N>`
- **RFC** persona  moral (12 chars): `ABC123456XX9` → `<RFC-M X-N>`
- Mexican phones with area code and `+5 2` prefix

---

### Colombia — Ley 1581/201 2 + Decreto 1377/2013

**Key:** `colombia`

S upervisory authority: Superintendencia de Ind ustria y Comercio (SIC).
The CC (cédula de c iudadanía) is only detected when preceded by  `C.C.`,
`cédula`, or `documento` to avoid f alse positives from bare number sequences.

-  **NIT** (9 digits + check digit): `123456789 -1` → `<NIT-CO-N>`
- **CC** with context pr efix: `C.C. 1234567890` → `<DNI-ES-N>`
- Co lombian mobiles (3XX) and landlines with `+57 ` prefix

---

### Argentina — Ley 25.326 ( 2000)

**Key:** `argentina`

Supervisory auth ority: AAIP (Agencia de Acceso a la Informaci ón Pública).
Reform bill PIDIA was under pa rliamentary consideration as of June 2026 and 
had not yet been enacted. DNI without dots h as a lower confidence score (0.55)
due to hig h false-positive risk from bare number sequen ces.

- **DNI** with dots: `12.345.678` → ` <DNI-AR-N>`
- **CUIT / CUIL**: `20-12345678-9 ` → `<CUIT-AR-N>`
- Argentine phones with a rea code and `+54` prefix

---

### UK — UK  GDPR / DPA 2018 / DUAA 2025

**Key:** `uk`

 The UK framework now comprises three instrume nts: UK GDPR (in force 1 January
2021), Data  Protection Act 2018, and the Data (Use and Ac cess) Act 2025 (DUAA),
which received Royal A ssent on 19 June 2025 with its main provision s in force
from 5 February 2026. The DUAA int roduced the first material divergences from
E U GDPR: analytics cookies exempt from consent , a recognised-legitimate-interests
schedule  (no balancing test required), and a stop-the- clock mechanism for subject
access requests.  Supervisory authority: ICO. The EU renewed th e UK adequacy
decision until December 2031.

 - **NINO** (National Insurance Number): `AB 1 2 34 56 C` → `<NINO-UK-N>`
- UK phones: `+4 4`, `0044`, or leading `0` formats

---

###  California — CCPA / CPRA

**Key:** `ccpa`

 CCPA (2018) extended by CPRA (in force Januar y 2023). Applies to for-profit
businesses mee ting any of: >$25M annual revenue; ≥100,000  consumers' data
processed; ≥50% revenue fr om selling data. Supervisory authority: CPPA. 
New CPPA regulations approved September 2025  and in force since 1 January 2026:
neural da ta added as sensitive personal information; d ata of consumers under 16
automatically class ified as sensitive; Global Privacy Control (G PC) signals must
be honoured as a valid opt-o ut from sale/sharing. California DL pattern
( `[A-Z]\d{7}`) has score 0.70 — review outpu t manually if documents contain
unrelated alp hanumeric codes.

- **SSN**: `123-45-6789` � � `<SSN-US-N>`
- **California Driver's Licens e**: `A1234567` → `<DL-US-N>`
- US phones w ith `+1` or local format

---

## Replacement  labels

Tokens are numbered per entity type  (`N` = sequential integer starting at 1).
The  same original value always maps to the same  token within a file.

| Label          | Repl aced entity                    | Jurisdiction         |
|----------------|----------------- -------------------|---------------------|
|  `<PERSONA-N>`  | Person name (NER)                   | All                 |
| `<EMAIL-N>`     | Email address                      | All                  |
| `<TELEFONO-N>` | Phone n umber                       | All                  |
| `<IBAN-N>`     | IBAN bank code                      | All                 |
| `<T ARJETA-N>`  | Credit card number                  | All                 |
| `<FECHA-N>`     | Date                               | All                  |
| `<IP-N>`       | IP address                          | All                  |
| `<UBICACION-N>`| Location near a person  name        | All                 |
| `<DNI- ES-N>`   | Spanish DNI or NIE                  | RGPD                |
| `<RUT-CL-N>`   | C hilean RUT / RUN                  | Chile                |
| `<CPF-BR-N>`   | Brazilian CPF                       | Brasil              | 
| `<CNPJ-BR-N>`  | Brazilian CNPJ                      | Brasil              |
| `<CURP-MX -N>`  | Mexican CURP                       |  Mexico              |
| `<RFC-MX-N>`   | Mexi can RFC                        | Mexico               |
| `<NIT-CO-N>`   | Colombian NIT                       | Colombia            |
|  `<CUIT-AR-N>`  | Argentine CUIT / CUIL               | Argentina           |
| `<DNI-AR-N>`    | Argentine DNI                      | Arg entina           |
| `<NINO-UK-N>`  | UK Nati onal Insurance Number       | UK                   |
| `<SSN-US-N>`   | US Social Security  Number          | CCPA                |
| `<D L-US-N>`    | California Driver's License         | CCPA                |

---

## Installa tion

### 1. Clone the repository

```bash
gi t clone --depth 1 https://github.com/carlosuh art/anonimizador-datos.git
cd anonimizador-da tos
```

### 2. Install Python dependencies

 ```bash
pip install -r requirements.txt
```

 ### 3. Install spaCy language models

Minimum  required (Spanish):

```bash
python -m spacy  download es_core_news_lg
```

Additional mod els by jurisdiction:

```bash
# English — r equired for UK GDPR and CCPA
python -m spacy  download en_core_web_lg

# Portuguese — req uired for LGPD (Brazil)
python -m spacy downl oad pt_core_news_lg

# Other EU languages (op tional)
python -m spacy download fr_core_news _lg
python -m spacy download de_core_news_lg
 python -m spacy download it_core_news_lg
pyth on -m spacy download nl_core_news_lg
```

The  script loads whichever models are installed  and skips the rest with a notice.
It works wi th any combination, as long as at least one m odel is available.

> Restoration mode (`--re staurar`) does not load any NLP models and ha s no model requirement.

---

## Using it as  a Claude Code skill

Once `SKILL.md` is insta lled (see [Claude Code skill](#claude-code-sk ill) below),
you drive the whole round-trip i n natural language — no flags to remember.  The
skill reads your phrasing, picks the mode  and jurisdiction, and runs the script
for yo u.

| You type | The skill runs |
|---------- |----------------|
| `/anonimizar contactos.c sv` | `anonimizar.py contactos.csv --ley todo ` |
| `/anonimizar C:/exports/` | anonymizes  every supported file in the folder |
| `/anon imizar informe.docx para rgpd` | `--ley rgpd`  (jurisdiction parsed from "para rgpd") |
| ` /anonimizar datos.xlsx solo para Chile` | `-- ley chile` |
| `/anonimizar restaurar contact os_anon.csv` | `anonimizar.py contactos_anon. csv --restaurar` |
| `/anonimizar restaurar C :/anon/` | restores every token-bearing file  in the folder |

Defaults that make it zero-c onfig:

- **No jurisdiction needed.** Without  one, it runs `--ley todo` (all frameworks at 
  once) so the output is safe under every su pported regulation. Naming a jurisdiction
  i n plain language (`para rgpd`, `solo Chile`,  `LGPD`) just narrows it.
- **Mode is inferred .** Any phrasing with "restaurar" / "desanoni mizar" / "revertir"
  triggers restoration; a nything else anonymizes.
- **The map is found  automatically** on restore — exact `[file] .key.json`, or the
  single `.key.json` in th e folder (which is how an AI-returned file wi th a
  different name still gets restored).

 The end-to-end skill flow is exactly the roun d-trip above: `/anonimizar file` →
hand the  `_anon` output to an AI → `/anonimizar res taurar result`.

---

## Usage

The commands  below are the raw CLI the skill wraps — use  them directly if you are
not running inside  Claude Code.

### Anonymization

Pass files o r folders directly as arguments. Output is wr itten to the same
location as the input with  `_anon` appended to the filename. The origina l
is never modified.

```bash
# Single file � �� produces informe_anon.docx + informe_anon. docx.key.json
python anonimizar.py informe.do cx

# Single file with explicit jurisdiction
 python anonimizar.py informe.docx --ley rgpd
 
# Multiple files
python anonimizar.py datos. csv clientes.xlsx notas.md --ley chile

# Ent ire folder
python anonimizar.py C:/exports/ - -ley rgpd

# Explicit output file (single inp ut only)
python anonimizar.py datos.csv --sal ida datos_limpio.csv --ley rgpd

# Explicit o utput folder (multiple files or folder input) 
python anonimizar.py C:/exports/ --carpeta-s alida C:/anon/ --ley todo

# Multiple jurisdi ctions at once
python anonimizar.py datos.csv  --ley rgpd chile brasil

# All jurisdictions 
python anonimizar.py datos.csv --ley todo

#  List available jurisdictions
python anonimiz ar.py --lista-leyes
```

### Restoration

``` bash
# Auto-locate map (exact [input].key.jso n, or the single .key.json in the folder)
pyt hon anonimizar.py datos_anon.csv --restaurar
 
# Entire folder (first level; skips .key.jso n and *_restaurado files)
python anonimizar.p y C:/anon/ --restaurar

# Explicit map file ( required if the folder holds several .key.jso n maps)
python anonimizar.py datos_anon.csv - -restaurar --mapa /secure/datos_anon.csv.key. json

# AI-returned file renamed — restore  it with the original map
python anonimizar.py  result.docx --restaurar --mapa informe_anon. docx.key.json

# Restore to a specific folder 
python anonimizar.py datos_anon.csv --restau rar --carpeta-salida C:/restored/
```

See [M ap resolution order](#the-full-round-trip-ano nymize--process-with-ai--restore)
above for h ow the `.key.json` is located when not passed  explicitly.

### Output naming

| Operation  | Input | Output |
|-----------|-------|----- ---|
| Anonymize | `datos.csv` | `datos_anon. csv` + `datos_anon.csv.key.json` |
| Anonymiz e | `informe.docx` | `informe_anon.docx` + `i nforme_anon.docx.key.json` |
| Anonymize | `d atos.csv --salida limpio.csv` | `limpio.csv`  + `limpio.csv.key.json` |
| Restore   | `dato s_anon.csv` | `datos_anon_restaurado.csv` |

 ### Supported file formats

| Extension | Beh avior                                                                |
|-----------|------- --------------------------------------------- --------------------|
| `.csv`    | All cells . Auto-detects Screaming Frog exports: only f ree-text columns.|
| `.xlsx`   | All sheets,  cell by cell.                                               |
| `.md`     | Line by line. M arkdown formatting preserved.                            |
| `.docx`   | Run by run. Bold,  italic, and other styles preserved.                   |

---

## Claude Code skill

The `SK ILL.md` file is a [Claude Code](https://claud e.ai/code) skill definition.
Install it to in voke the anonymizer directly from Claude Code  with `/anonimizar`.

```bash
# Unix / macOS  / Linux
mkdir -p ~/.claude/skills/anonimizar
 cp SKILL.md ~/.claude/skills/anonimizar/SKILL .md

# Windows (PowerShell)
New-Item -ItemTyp e Directory -Force "$env:USERPROFILE\.claude\ skills\anonimizar"
Copy-Item SKILL.md "$env:U SERPROFILE\.claude\skills\anonimizar\SKILL.md "
```

The skill is invocation-only — it do es not auto-trigger.

---

## Known limitatio ns

- **NER false positives**: spaCy may tag  common Spanish words (greetings, titles) as p erson names. The script filters the most freq uent ones; the rest appear in output.
- **Loc ation detection is context-aware**: a locatio n is only anonymized when a person is present  nearby. In free text (`.md`, `.docx`) "nearb y" means within ~120 characters in the same l ine/paragraph. In tables (`.csv`, `.xlsx`) th e **row** is the context: if any cell in the  row holds a person name, locations in the oth er columns are anonymized too; a table with n o person names leaves bare locations untouche d (avoids flagging cities in a product/invent ory list). Screaming Frog exports are treated  as free text per cell.
- **Colombian CC (cé dula)**: bare 6–10 digit sequences produce  too many false positives. Detection is activa ted only when preceded by `C.C.`, `cédula`,  or `documento`.
- **Argentine DNI without dot s**: confidence score 0.55. Any 7–8 digit s equence qualifies. Manually review output whe n documents contain numeric codes (order IDs,  product SKUs).
- **Brazilian CPF without for matting**: confidence 0.60 for bare 11-digit  sequences. Formatted input (`123.456.789-09`)  scores 0.95.
- **Short texts (<4 words)**: l anguage detection is unreliable. The script f alls back to the first available model.
- **J avaScript-rendered content**: the tool proces ses static file content only. It does not fet ch or render URLs.
- **Restoration fidelity** : if the same original value appears with dif ferent casing across the file, each variant i s stored as a separate token and restored ind ependently.
- **Street addresses**: a pattern  recognizer covers common Spanish street type s (`Calle`, `Avenida`, `Plaza`, `Paseo`, etc. ) followed by a number. Non-standard or non-S panish address formats may not be caught.
- * *.docx coverage**: body, tables, headers, foo ters and text boxes are processed; the paragr aph (not the run) is the unit, so split-run n ames are caught. **Footnotes, endnotes and co mments are not yet processed.** Paragraph-lev el processing flattens partial intra-paragrap h formatting (e.g. one bold word) only in par agraphs that contain PII.
- **`--ley todo` fa lse positives**: running all jurisdictions at  once enables low-confidence numeric recogniz ers (bare CPF/DNI/NIT), which can tag non-per sonal codes (SKUs, order IDs). The tool warns  when four or more jurisdictions are active.  Narrow with `--ley <jurisdiction>` for number -heavy data.

---

## Encrypting the key map
 
By default the `.key.json` holds the PII in  plaintext. To protect it, encrypt it
with a p assphrase (AES via Fernet, key derived with P BKDF2-SHA256). Supply the
passphrase in order  of preference:

```bash
# Preferred — envi ronment variable, leaves no trace in shell hi story/argv
export ANON_CLAVE="mi-clave-secret a"
python anonimizar.py datos.csv --ley rgpd  --cifrar-mapa
python anonimizar.py datos_anon .csv --restaurar

# Interactive prompt (no tr ace either), for terminal use only
python ano nimizar.py datos.csv --ley rgpd --cifrar-mapa  --pedir-clave

# Convenient but less secure  — visible in shell history and process list 
python anonimizar.py datos.csv --ley rgpd -- cifrar-mapa --clave "mi-clave-secreta"
```

` --pedir-clave` is opt-in by design: it is nev er triggered automatically, so the
tool never  blocks waiting for input in non-interactive  runs (scripts, agents).
Inside the encrypted  map only the salt and KDF parameters are in c lear; the map
and the source filename are enc rypted. Lose the passphrase and the map is
un recoverable.

---

## Coverage reports

After  every run the tool prints what it did, turni ng silent failures into visible ones:

- **Af ter anonymizing**: a breakdown of detected PI I types and counts, plus a warning if the sou rce text already contained token-like strings  (`<TYPE-N>`).
- **After restoring**: a warni ng listing tokens from the map that did not a ppear in the file (not restored — e.g. an A I altered them) and token-shaped strings with  no map entry (residuals).

---

## Tests

A  regression suite (`test_anonimizar.py`, stdli b `unittest`) runs the real script
against fi xtures with known PII from every jurisdiction  and checks that each
identifier is tokenized , that the anonymize → restore round-trip i s lossless, and
that map encryption protects  the PII and requires the key.

```bash
python  -m unittest test_anonimizar
```

Requires th e spaCy models installed (each anonymization  loads them). The suite
sets `ANON_IDIOMAS=es`  so each subprocess loads only the Spanish mo del, running
in ~30 s instead of minutes.

-- -

## Performance

Each invocation loads the  spaCy models once (not per file), so anonymiz ing a
whole folder in a single call pays the  startup cost only once; restoration loads
no  models and is near-instant. To cut startup ti me, restrict the languages
loaded with `ANON_ IDIOMAS` (comma-separated):

```bash
ANON_IDI OMAS=es python anonimizar.py datos.csv      #  Spanish only — fastest
ANON_IDIOMAS=es,en  python anonimizar.py datos.csv   # Spanish +  English
```

Without the variable, all instal led models load (broadest coverage, slower st art).

---

## License

MIT — see [LICENSE] (LICENSE).

Free to use, modify, and distribu te. Attribution appreciated but not required. 

---

## Privacy

This repository contains n o client data, no domain names, and no identi fying
information. All patterns are anonymize d. The tool is designed precisely to
help oth ers achieve the same standard.

The `.key.jso n` files generated during anonymization are n ever committed to
this repository. The tool * *writes a `.gitignore` with `*.key.json` auto matically**
in the output folder, and warns i f the map lands in a cloud-synced folder
(One Drive, Dropbox, Google Drive, iCloud). For st ronger protection, encrypt the
map with `--ci frar-mapa` (see below).

---

## Contributing 

Add real-world patterns as new edge cases a ppear.
Rule: knowledge is contributed anonymi zed — the pattern matters, not the source.
 
Useful contributions:
- New jurisdiction rec ognizers (PDPA Thailand, PIPL China, LGPD ada ptations)
- Additional false-positive filters  per language
- New file format processors (J SON, TXT, HTML)
- Edge cases for existing ID  patterns (formatting variants, regional excep tions)
 