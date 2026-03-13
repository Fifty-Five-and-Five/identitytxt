# identity.txt specification

An identity.txt file is a markdown file that tells AI tools how to represent you. It follows the same philosophy as [llms.txt](https://llmstxt.org): convention over specification, structured enough for AI tools to parse, flexible enough that anyone can write one.

## What's required

1. An **H1 heading** with your name
2. **At least one H2 section**

Everything else is optional but recognised. Include what matters to you.

## Format

The H1 heading is your name. An optional blockquote after it provides a one-line summary. The rest of the file is H2 sections in any order.

```markdown
# Your Name

> A short summary of who you are and what you do.

## Voice

How you write. Tone, patterns, phrases you use, things you never say.

## Expertise

What you know. Topics, domains, depth.

## Background

Your story. Career arc, key moments, what shaped you.

## Preferences

Hard rules. Formatting conventions. Things to always or never do.

## References

Links to representative writing. Blog posts, articles, talks.

## Terms

How AI tools may use this file.

## Verification

Links to verified profiles that reference this file.
```

## Recognised sections

| Section | Purpose |
|---|---|
| `## Voice` | How you write. Tone, patterns, characteristic phrases, anti-patterns. The section that makes identity.txt worth having. |
| `## Expertise` | What you know. Topics you can speak to with authority, domains you work in, depth of knowledge. |
| `## Background` | Your story. Career arc, key moments, what shaped how you think. |
| `## Preferences` | Hard rules for AI interactions. Spelling conventions, formatting rules, things to always or never do. |
| `## References` | Links to representative work. Blog posts, articles, talks, code. Shows rather than tells. |
| `## Terms` | How AI tools may use this file. A machine-readable consent signal. |
| `## Verification` | Links to verified profiles that reference this file. Bidirectional trust. |

Custom H2 sections are fine. The spec recognises certain headings so AI tools can parse them consistently, but it doesn't reject others. A developer might add `## Stack`. A designer might add `## Process`. Both are valid.

## Terms values

The Terms section is a machine-readable consent signal, like `robots.txt`. It's a social contract, not a legal one. The first line of the section should be one of these values:

| Value | Meaning |
|---|---|
| `open` | Any AI tool, any purpose. The most permissive option. |
| `attribution` | Use permitted with attribution to the author. |
| `prompt-only` | Context in prompts and conversations. Not for training or fine-tuning. |
| `restricted` | Specific permissions listed below the value. Read them. |
| `none` | Opt-out signal. Do not use this file. Respect it. |
