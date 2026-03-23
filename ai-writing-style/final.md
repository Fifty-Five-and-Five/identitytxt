---
title: "How to build an AI writing style that follows you everywhere"
author: "Chris Wright"
question: "How do I make AI sound like me?"
keyword: "AI writing style"
image: /images/blog/ai-writing-style.png
draft: false
# layout: single-toc
---

I'll be honest: making AI sound like you is not a prompting trick. It's not about spending twenty minutes crafting the perfect custom instructions for ChatGPT. Building a consistent AI writing style means writing a single file, in markdown, that captures who you are, how you write, and on what terms AI can use that information. Then you share that file with every AI tool you use. Same file. Every tool. No more rewriting yourself for each platform.

That probably sounds too simple. It is simple. But the problem it solves is real, and I built [identity.txt](https://identitytxt.org) specifically to fix it.

I'm [Chris Wright](https://uk.linkedin.com/in/chrismwright). I run [Fifty Five and Five](https://www.fiftyfiveandfive.com), a B2B marketing agency. We've been writing content for clients for over 11 years. Thousands of pieces. Blog posts, social campaigns, thought leadership, case studies. For most of that time, we managed voice and tone the old-fashioned way: style guides, brand books, editorial guidelines pinned to a shared drive somewhere. It worked well enough when humans were doing all the writing.

Then AI changed everything. 92% of young leaders now want AI tools with personalisation built in ([Google Workspace / Harris Poll, Dec 2025](https://www.googlecloudpresscorner.com/2025-12-04-Google-Workspace-Study-Reveals-More-Than-90-of-Rising-Leaders-Want-AI-With-Personalization)). And when you start using AI to help write, those old style guides aren't enough. You can't paste a 30-page brand book into a ChatGPT system prompt. You need something portable, structured, and built for how AI actually works.

It gets even more interesting when you're ghost writing. We write as other people constantly. Their voice, their expertise, their personality. AI needs to know all of that, not just "use a professional tone."

## The problem with rewriting yourself for every AI tool

Custom instructions are where most people start, and they're better than nothing. But they're broken in ways that get worse the more you use AI.

78% of AI users are bringing their own tools to work ([Microsoft / LinkedIn Work Trend Index 2024](https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part)). Not one tool. Multiple. ChatGPT for brainstorming, Claude for long-form writing, Copilot for emails, Gemini for research. Each one has its own custom instructions box. Each one knows a different, incomplete version of you.

I saw this play out with a client at a large tech company. They came to us because their AI-generated content didn't sound like them. Reasonable problem. We helped them write detailed custom instructions for ChatGPT. Tone, vocabulary, things to avoid, example phrases. It worked well. For about three months.

Then the instructions went stale. Their messaging had evolved, they'd launched new products, their positioning had shifted. But the custom instructions were still telling ChatGPT to write like it was Q1. Nobody updated them because nobody remembered they existed. Then someone logged in with their work account instead of their personal one, and all the custom instructions were gone. They had to start from scratch. No consistency. No memory. Just a blank text box asking them to describe themselves again.

That's the pattern I keep seeing. People write custom instructions once, badly, and never update them. Or they write them well for one tool and then can't be bothered to replicate the work for the next one. Or they write something different each time, so Claude thinks they're formal and ChatGPT thinks they're casual, and nothing sounds like them.

The result: every tool gets a different, incomplete version of you. Your AI writing style isn't consistent because it can't be. The system won't let it be.

## What AI personalisation tools get right and wrong

I'm not the first person to notice this problem. A few people and companies have tried to solve it, and each one gets part of it right.

Tiago Forte, the productivity author, has a popular approach: feed ChatGPT samples of your writing and ask it to generate a style guide. It's a smart idea. You get something that captures your patterns, your word choices, your rhythm. But the output lives inside ChatGPT. You can't take it to Claude. You can't paste it into Copilot in a format that makes sense. It's a style guide for one tool.

[YourVoiceProfile.com](https://yourvoiceprofile.com) charges $20 to generate a markdown voice profile. Closer. Markdown is the right format. But it only covers writing style, not who you are, what you know, or what you care about. And frankly, this shouldn't be a paid commercial thing. Describing yourself to an AI tool is something you should own, not something you should pay someone else to do for you.

ContextFile.ai takes a different approach: a SaaS platform for portable AI context, with export to multiple formats. The portability idea is right. But your identity lives in their system. If they shut down or change their pricing, your identity goes with them.

Then there's me.txt, an open standard with the right philosophy. A plain text file that describes who you are. But it's too thin. No voice section. No consent framework. No way to tell AI tools what they can and can't do with your information.

The pattern across all of these: everyone is solving a piece of the problem. Style OR portability OR identity. Nobody is combining all three. And nobody is addressing consent at all.

{{< cta heading="Want to try identity.txt?" text="Write your own identity file and use it with every AI tool. It's free, it's markdown, and it takes five minutes." buttonText="Create yours" buttonLink="https://identitytxt.org" >}}

## What if your AI context was portable?

This is the question that started identity.txt. And it came from a very specific place.

At the agency, we started building what we called "author files." We write content as specific people, so we needed a way to capture each author's voice, background, and expertise in a format AI could parse. These files started as simple notes. A few bullet points about tone. A list of phrases they use.

Then they got really detailed. We added career backgrounds, example tones, characteristic phrases, things they'd never say, opening and closing patterns. We added E-E-A-T signals: experience markers, expertise depth, authority credentials. The files grew to 400 lines. And they worked brilliantly. When we gave one of these files to Claude along with a synopsis, the output actually sounded like the person.

Then we thought: why isn't this portable? Why does this file only work inside our workflow? If our authors could carry this file with them, every AI tool they touched would know them. Not just writing style. Who they are.

[llms.txt](https://llmstxt.org) had already shown that a simple markdown file could tell AI tools about websites. A file at `yourdomain.com/llms.txt` that describes what the site does, how it's structured, what matters. Convention over specification. Structured enough for AI to parse, flexible enough that anyone can write one.

What if there was an llms.txt for people?

A single file you write once. Markdown. Human-readable, machine-parseable. Not just your writing style, but who you are, what you know, how you think, what you care about, and on what terms AI can use that information. You own it. It lives on your domain or your hard drive. Not in someone's SaaS platform. You share it with whatever AI tools you use. Paste it into Claude, add it to a Copilot project, reference it from ChatGPT. Same file, every tool.

That's identity.txt.

## Grammarly took people's identities. AI consent is the fix

In August 2025, Grammarly launched a feature called "Expert Review." For $12 a month, users got AI editing feedback attributed to real people. Julia Angwin, the investigative journalist. Stephen King. Kara Swisher. Their names, their supposed expertise, used to sell a premium tier.

None of them consented.

In March 2026, [The Verge broke the story](https://www.theverge.com/ai-artificial-intelligence/893270/grammarly-ai-expert-review-disabled). Grammarly shut the feature down within days. Then Julia Angwin filed a $5M+ class action ([Gizmodo](https://gizmodo.com/grammarly-allegedly-misappropriated-names-of-journalists-says-class-action-suit-2000732687)).

The need was real. AI feedback is better when it comes through the lens of someone who knows what they're talking about. But the method was indefensible. You can't take someone's identity. They have to give it to you.

This is what pushed us to add a Terms section to identity.txt. A machine-readable consent signal, like robots.txt but for identity. Not a legal document. A social contract. Five values:

- **open:** any AI tool, any purpose
- **attribution:** use permitted with attribution to the author
- **prompt-only:** context in prompts and conversations, not for training or fine-tuning
- **restricted:** specific permissions listed below the value
- **none:** opt-out signal, do not use this file

This isn't a defensive move. It's the same approach as Creative Commons: not "all rights reserved" but "here are the specific rights I'm granting." Companies that ignore consent signals risk being the next Grammarly.

## identity.txt: an AI identity file you control

The spec is deliberately minimal. Two things are required:

1. An H1 heading with your name
2. At least one H2 section

That's it. Everything else is optional but recognised. The recognised sections are:

- **Voice:** how you write, your tone, patterns, phrases you use, things you never say
- **Expertise:** what you know, topics, domains, depth
- **Background:** your story, career arc, key moments
- **Preferences:** hard rules for AI, formatting conventions, things to always or never do
- **References:** links to representative writing
- **Terms:** how AI tools may use this file
- **Verification:** links to verified profiles that reference this file

Voice is the section that makes identity.txt worth having. Not just "I'm professional but friendly." Actual patterns. "I open with honesty, not authority. I'm self-deprecating about ambition. I use specific numbers, not vague qualifiers. I never use em dashes."

Custom sections are fine. A developer might add `## Stack`. A designer might add `## Process`. A marketer might add `## Campaigns`. The spec recognises certain headings so AI tools can parse them consistently, but it doesn't reject anything else.

A simple identity.txt looks like this:

```markdown
# Sarah Chen

> Product designer who thinks in systems and writes in plain English.

## Voice

Direct and clear. Short sentences. No jargon unless I define it first.
I explain complex things through everyday analogies.
I never say "leverage," "utilise," or "synergy."

## Expertise

Product design, design systems, accessibility, user research.
10 years in B2B SaaS. Strong opinions about form design.

## Terms

attribution
Use my identity for AI-assisted writing and research.
Credit me when reproducing my perspectives.
```

You can host the file yourself at `yourdomain.com/identity.txt`. Or you can host it at [identitytxt.org](https://identitytxt.org), sign in with Google, and get a permanent shareable URL. We built identitytxt.org to give people a simple option if they don't have their own domain or just want something quick.

The [spec is open](https://github.com/Fifty-Five-and-Five/identitytxt), published under CC-BY 4.0. Anyone can use it, extend it, build on it. It's a file, not a platform.

{{< newsletter-inline >}}

## How do you make AI sound like you?

You write a file. One file. Markdown. Your name, your voice, your terms. Share it with every AI tool you use.

Custom instructions are platform-locked and incomplete. Style guides capture how you write but not who you are. The various AI personalisation tools out there solve a piece of the problem but lock you into their platform or charge you for something you should own.

identity.txt combines voice, identity, context, and consent in one portable file. The spec is open. You can write one in five minutes.

I don't know if identity.txt takes off. It might stay small. It might get overtaken by something better. But the problem is real, and it's getting worse as people use more AI tools. Your AI writing style shouldn't be a text box that resets every time you switch platforms.

AI is better when it knows you. Give it something worth knowing.

[Write your own at identitytxt.org](https://identitytxt.org).
