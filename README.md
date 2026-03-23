# identity.txt

[![CC BY 4.0](https://img.shields.io/badge/licence-CC--BY--4.0-orange.svg)](https://creativecommons.org/licenses/by/4.0/)

A plain text file that tells AI how to represent you.

identity.txt is a simple markdown format for capturing your voice, expertise, and terms for AI use. Drop it at `yourdomain.com/identity.txt` or host it at [identitytxt.org](https://identitytxt.org).

## The spec

See [SPEC.md](SPEC.md) for the full specification.

The short version: start with an H1 heading (your name), add H2 sections for things like Voice, Expertise, Background, and Terms. That's it.

## Licence

This specification is licenced under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

You're free to share and adapt the spec for any purpose, with attribution.

## author.md voice interview

This repo also contains the author.md voice interview tool, a real-time audio interview powered by OpenAI's Realtime API that generates identity.txt profiles. Hosted at [identitytxt.org/create/](https://identitytxt.org/create/) behind a password.

## Structure

- `site/` - identitytxt.org static site (Firebase Hosting)
- `site/create/` - author.md voice interview frontend
- `functions/` - Firebase Cloud Functions (registry, API, analytics, author.md backend)
- `public/` - original author.md standalone frontend (development)
- `ai-writing-style/` - profile generation logic
- `examples/` - sample outputs

## Links

- [identitytxt.org](https://identitytxt.org) - project site
- [Host your identity.txt](https://identitytxt.org/host/) - free hosted option
- [Create with voice interview](https://identitytxt.org/create/) - author.md tool

A [Fifty Five and Five](https://www.fiftyfiveandfive.com) project.
