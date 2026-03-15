# Bring Your Own Docs

Context Hub ships with a public registry of community-maintained docs and skills. But your team has internal APIs, proprietary SDKs, and company-specific patterns that will never be in a public registry. Today you paste those docs into chat manually, every session.

You don't have to. Build your own docs and skills locally, point your config at them, and they work exactly like the public ones.

## Add your own docs

Create a content directory with your docs:

```
my-content/
  mycompany/
    docs/
      internal-api/
        DOC.md           # frontmatter + LLM-optimized content
        references/
          auth.md
          endpoints.md
```

The DOC.md has standard frontmatter:

```yaml
---
name: internal-api
description: Our internal REST API
metadata:
  languages: "python"
  versions: "2.0.0"
  tags: "internal,rest,api"
---
# Internal API
...
```

Build it into a registry:

```bash
chub build my-content/ -o .chub-local/
```

## Add your own skills

Same idea. Write a SKILL.md with any companion files:

```
my-content/
  mycompany/
    skills/
      deploy-staging/
        SKILL.md
        deploy.sh
        config.template.yaml
```

The build picks up skills automatically — no language or version fields needed.

## Point your config at it

Add your local build output as a source in `~/.chub/config.yaml`:

```yaml
sources:
  - name: community
    url: https://cdn.aichub.org/v1
  - name: internal
    path: /path/to/.chub-local
```

Now everything works across both sources:

```bash
chub search "api"                          # searches public + private
chub get mycompany/internal-api --lang py   # fetches your private doc
chub get mycompany/deploy-staging           # fetches your private skill
```

## Enterprise use

Put your content directory in a shared git repo or internal CDN. Everyone on the team points their config at it. Company docs and skills are available to every agent on every machine — without publishing anything publicly.

If a private id collides with a public one, use the `source:` prefix:

```bash
chub get internal:openai/chat --lang py   # your internal version
chub get community:openai/chat --lang py  # the public version
```

One CLI, one search, public and private content layered together.
