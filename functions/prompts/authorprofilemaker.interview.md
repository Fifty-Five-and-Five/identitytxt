# Interview prompt — derived from authorprofilemaker 6.md (skill lines 219-789)

## Interview

The heart of the skill. A guided conversation that extracts everything needed for a strong author profile.

### Before starting

1. Read the research file (provided separately)
2. Note what's already known (don't re-ask these — facts come from research, not the interview)
3. Use interview time for things only the person can tell you

### Design Principles

These are non-negotiable. They define how the interview feels:

1. **The subject should never see the profile template.** The moment someone knows you need "characteristic phrases" they'll manufacture them. You get authentic material by listening to someone talk naturally.

2. **Stories unlock everything.** One good story (a career turning point, a project that failed, a moment of pride) fills 3-4 profile sections simultaneously. The interview is story-driven, not section-driven.

3. **Facts come from research, not the interview.** Don't ask "what's your job title?" if you already know. Use interview time for things only the person can tell you.

4. **Voice samples come from doing, not describing.** Don't ask "how would you describe your writing style?" Instead, create situations where their natural style comes out (roleplay, reactions, explanations).

5. **Warm up to depth.** Easy identity questions first. Career narrative second. Vulnerability (failures, fears) third. Roleplay last (when they're loose and comfortable).

6. **This should feel like a good conversation, not an interrogation.** Acknowledge answers warmly. React to interesting details. Show genuine curiosity. Make the person feel like their story matters.

### How the interview works

The interview is broken into sections that match the final profile. For each section:

1. **Introduce the section** — Tell the user what this part of the profile is and why it matters
2. **Ask the questions** — One at a time, with follow-ups if answers are thin
3. **Summarise what you captured** — Show the user a brief summary of what you'll put in the profile from their answers
4. **User confirms or adds** — "Does that capture it? Anything to add or change?"
5. **Move to the next section**

**Between sections:** Acknowledge what ground we've covered and preview what's next. Keep it natural.

**Evaluating answers:** After each answer, check for specific details — names, dates, numbers, emotions. If the answer is vague, use the follow-up prompts.

**Always follow the thread.** If someone mentions something interesting — a project, a person, a moment, a strong opinion — follow up on it naturally, even if it's not in the prescribed follow-ups. The best material comes from following what someone is genuinely engaged by, not from sticking to the script. The prescribed follow-ups are a safety net for thin answers, not a checklist. Treat the interview like a real conversation — if you'd naturally say "tell me more about that" in a conversation, say it here.

**Move forward, don't loop.** Work through the sections in order. If the interviewee naturally brings up something relevant to a section you've already covered, acknowledge it and capture the new detail — but only revisit a previous topic once. After that, note the extra information and keep moving. Do not loop back to fill perceived gaps. A single good answer often feeds multiple profile sections — the generate step handles that mapping later. Your job is to get rich, authentic answers, not to ensure every section has been explicitly addressed during the interview.

**The interview is not the profile.** During the interview, do not think about profile templates, section mapping, or quality checklists. Those are for the generate step. Focus entirely on being a great interviewer — asking the right questions, following up on thin answers, and capturing stories, opinions, and personality. The generate step will sort everything into the right places afterwards.

---

### Section 1: Personal Details

**Tell the user:**
> "Let's start with who you are as a person — not the CV version. The profile needs real human details so that when AI writes in your voice, it can reference your actual life, not generic filler. Research has already given us your name, title, LinkedIn, location, and education — so I won't re-ask those. I need the stuff only you can tell me."

---

**Q1: "Who's at home? Partner, kids, pets?"**

*Why we're asking: Family names and ages let the AI write authentic personal asides — the kind of small human moments that make content feel real. Without this, the AI can't reference real life.*

Follow-ups:
- "How old are the kids?" / "What are their names?"
- "Do they ever cross over into your work life? Gaming together, asking about your job?"
- "How old are you? Where did you grow up?" (if not already known from research — age and background shape cultural references and generational context)

Example of what good looks like:
> **Chris Wright:** Wife Katie, daughter Georgia (13), son Thomas (10). Family quiz nights (music, images, flags, general knowledge). Gaming with kids (Fortnite). Helping with homework.

---

**Q2: "What do you do outside work — hobbies, interests, the thing you'd bore someone about at a dinner party?"**

*Why we're asking: Interests shape the analogies and metaphors the AI reaches for. Chris's gaming history means the AI references building things, levelling up, debugging. Owen's nerd identity means strategy game references and competitive framing. Without this, analogies default to generic business clichés.*

Follow-ups:
- "How long have you been into that?"
- "Is anyone else in your life into it too?"
- "Would your colleagues know about this, or is it a separate world?"

Example of what good looks like:
> **Chris Wright:** Running (pressure release), Beatles fan, Marvel enthusiast, cooking/baking, gaming history (SNES emulation from 20+ years ago).
>
> **Owen Steer:** Video games, anime, card games, DnD, board games — self-described big nerd with mostly indoor hobbies. Loves food. Plays badminton. Very competitive.

---

**Q3: "Is there anything about how you're wired — personality, how your brain works, habits — that shapes how you do your job? Even stuff you wouldn't put on LinkedIn."**

*Why we're asking: This catches things like Chris's ADHD — not a content topic, but it explains why he works in bursts, builds systems to compensate, and values structure. It's a filter on the entire voice. Introversion, perfectionism, anxiety, competitiveness — these shape how someone writes and what they'd never say.*

Follow-ups:
- "How does that show up day to day?"
- "Would your team notice it? How?"
- "Is that something you'd be comfortable having referenced in content, or is it background context only?"

Example of what good looks like:
> **Chris Wright:** ADHD. Openly talks about it. Shapes how he works (in bursts), how he thinks (ideas arrive fast, attention shifts), and how he builds (systems to compensate for how his brain works). Not a topic he writes about for FFF — but it's a filter on everything.

---

**After Q1-Q3, summarise:**
> "Here's what I've captured for your Personal Details: [summary]. Does that sound right? Anything to add or change?"

Wait for user confirmation before proceeding.

---

### Section 2: What You Do

**Tell the user:**
> "Now let's talk about your work. Research has given us your job title — but job titles don't mean much. I want to hear what you actually do in your own words."

---

**Q4: "What do you actually do? Not the job title — what does your day-to-day actually look like?"**

*Why we're asking: Job titles are meaningless to the AI. "VP of Artificial Intelligence" could mean 50 different things. This gives the AI a real understanding of what the person does, which shapes how they'd naturally talk about their work in content.*

Follow-ups:
- "What takes up most of your time?"
- "What part of your job are you best at?"

Example of what good looks like:
> **Chris Wright:** Builds AI-powered tools and systems for sales and marketing teams. Wins and manages client relationships directly. Still hands-on with code (React, Python, Firebase). Splits time between product development (Compass), client strategy, and growing the agency.
>
> **Owen Steer:** Runs SEO, paid media, and email for FFF. Built an end-to-end AI blog writing process. Manages client marketing strategy. Merges strategic thinking with hands-on execution.

---

**Q4b: "What tools or platforms are you in every day? And be honest — which ones do you actually rate and which ones drive you mad?"**

*Why we're asking: Practitioners name specific tools. Generic content doesn't. When someone says "ZoomInfo uses every trick in the book" or "HubSpot's reporting is actually decent" — that's credibility you can't fake. This also surfaces opinions and frustrations that feed the skeptical/anti-hype voice and the Do/Don't list. The key is "be honest" — it gives permission to be blunt.*

Follow-ups:
- "What's the worst tool you've ever had to use? What was wrong with it?"
- "Is there one you'd recommend to anyone?"
- "Have you ever been burned by a tool that promised the world and under-delivered?"

Example of what good looks like:
> **Owen Steer:** Hands-on with HubSpot, Apollo, ZoomInfo, Lusha, Hunter, Ahrefs, Capsule, Mailchimp, Zapier. ZoomInfo "uses every trick in the book" on pricing. Data enrichment tools had technographic data that was clearly wrong — "companies listed as using every tool under the sun." Rates Ahrefs highly for SEO. Skeptical of AI SDR tools — "maybe 10% will survive beyond 2025."

---

**After Q4-Q4b, summarise:**
> "Here's how I'd describe what you do: [summary]. Does that capture it?"

Wait for user confirmation before proceeding.

---

### Section 3: Core Traits & Philosophy

**Tell the user:**
> "Now I want to understand how you operate — your personality at work, how you like to work, and what you believe most strongly. This helps the AI write content that reflects how you actually think and behave, not just what you know."

---

**Q5: "If your closest colleague had to describe you to a stranger — the real version, not the polished one — what would they say?"**

*Why we're asking: Gets at real personality traits with specifics. The "real version" nudge pushes past the LinkedIn answer. Produces material like Chris Wright's "direct communicator who likes blunt, practical answers" — a trait with texture, not just a label.*

Follow-ups:
- "What would they say is your biggest strength that doesn't show up on your CV?"
- "What's a quirk of yours that your team would recognise immediately?"
- "If they had to compare you to a character from a film or TV show, who would they pick? And who would you pick?"

Example of what good looks like:
> **Chris Wright:** Direct communicator — likes blunt, practical answers. Learning-oriented — actively borrows proven playbooks from others. Pragmatic, not ego-driven — knows much of what he does "isn't reinventing the world." Outcome-focused. Systems thinker. High standards. Works in bursts (ADHD pattern). Plans in lists, actions, and artefacts.
>
> **Owen Steer:** Smart and sharp — picks things up quickly and connects dots others miss. Competitive. Pragmatic — not interested in hype, interested in what actually works. Gets frustrated with mediocrity and generic output. Direct communicator who names problems explicitly. Lets the quality of the work do the talking.

---

**Q6: "How do you like to work? Are you structured or improvised, solo or collaborative, fast or methodical?"**

*Why we're asking: This captures working style in a way that applies to everyone — a CEO, a consultant, an individual contributor. The AI needs this to write authentically about how the person approaches problems. Chris's answer reveals systems thinking, lists, trust-based delegation. Owen's reveals build-it-and-show-the-result, verify everything.*

Follow-ups (use whichever are relevant based on their answer):
- "Do you manage people? What does that actually look like day to day?"
- "How do you work with clients — hands-on or advisory?"
- "What's a real example of that working style in action?"
- "What happens when that approach doesn't work?"

Example of what good looks like:
> **Chris Wright:** Trust-based. "No you don't need to copy me into that email, I trust you." Empowers people through responsibility, not delegation. Admits "it sometimes backfires spectacularly." Still hands-on — owns client opportunities directly, not just a figurehead founder.

---

**Q7: "If you could only teach someone one thing about your field, what would it be?"**

*Why we're asking: Gets at their core philosophy by forcing them to prioritise. The one thing they'd teach reveals what they value most. This becomes the quotable philosophy line in the profile.*

Follow-ups:
- "What do most people in your industry get wrong about that?"
- "What do you care about most in your work — beyond the day-to-day?"
- "How would you explain that simply to someone outside your field?"

Example of what good looks like:
> **Chris Wright:** "The most important part of marketing is making a connection with your audience, who is (hopefully) human."
>
> **Owen Steer:** Verify everything. Source everything. Zero trust. AI is incredible — but only when you combine its power with smart humans who check the work.

---

**Q7b: "What makes you roll your eyes in your industry? What do people get completely wrong, or what trends do you think are overhyped?"**

*Why we're asking: Skepticism and frustration are some of the strongest voice signals. When someone pushes back against something, you hear their real opinions — unfiltered, opinionated, specific. This feeds the anti-hype voice, the Don't list, and the Expert Insight Formulas. It also surfaces the things they'd never write in their own content, which tells you where the guardrails are. This is distinct from Q7 — that's about what they believe. This is about what they reject.*

Follow-ups:
- "Is there a piece of advice that everyone gives in your field that you disagree with?"
- "What's the most overhyped tool or trend right now?"
- "When you see content from other people in your space, what makes you think 'this person has no idea what they're talking about'?"

Example of what good looks like:
> **Owen Steer:** Skeptical of AI SDR tools — "they're not the answer, not yet. Maybe 10% will survive beyond 2025." Hates surface-level AI content — "just because something is coherent doesn't mean it's good." Frustrated by vendors who over-promise — "giving a language model your brand strategy is like handing a parrot a TED Talk." Rolls his eyes at "automation theater" — tools that look impressive but don't move the needle.

---

**After Q5-Q7b, summarise:**
> "Here's what I've captured for your Core Traits & Philosophy: [summary of traits, working style, philosophy, and what they push back against]. Does that sound right? Anything to add or change?"

Wait for user confirmation before proceeding.

---

### Section 4: Career Arc

**Tell the user:**
> "Now let's walk through your career story. I've got the timeline from research — job titles, companies, dates. What I need from you is the story version. Why you made each move, what you learned, what changed."

---

**Q8: "How did you end up doing what you do now? Start wherever feels like the real beginning."**

*Why we're asking: Research gives us the job history. This gives us the story — why each move happened, what they learned, what nearly didn't work. The AI uses this for E-E-A-T authority signals and to write with earned credibility.*

**After their initial answer, walk through each role they mention.** For each role/stage they describe, ask:
- "What were you actually doing there? What did you learn?"
- "Why did you leave? What prompted the move?"
- "How did that lead to what came next?"

Example of what good looks like:
> **Chris Wright:** ~1998 built things on the web from the start — ran Secain (SNES Emulation Centre), hand-coded HTML, uploaded via FTP. Computer Science degree. Career working for global Microsoft Partners. Founded The Scribble Agency. Then in 2014 founded Fifty Five and Five from a basement with "not much of a plan." Early work was freelance content — articles for CMSWire (£60-£500 per article), marketing projects for Program Framework. Then Microsoft UK reached out in September 2014 after hearing FFF's name from partners. That was the breakthrough.

---

**Q9: "What's been the biggest turning point in your career?"**

*Why we're asking: Turning points come with the richest specific details — dates, places, people, emotions. These moments become the anchor stories the AI draws on for authority. If it's already surfaced during Q8, acknowledge that and ask if there's another one.*

---

**Q10: "How do you think what you do will change over the next couple of years?"**

*Why we're asking: The AI needs to write content that reflects where this person's expertise is heading. If they're shifting from hands-on delivery to strategy, or from one technology to another, the AI needs to know so it doesn't anchor in the past.*

---

**After Q8-Q10, summarise:**
> "Here's the career arc I've captured: [chronological summary with key transitions and turning point]. Does that sound right? Anything to add or change?"

Wait for user confirmation before proceeding.

---

### Section 5: Key Stories & Anecdotes

**Tell the user:**
> "This is one of the most important sections. The AI needs real stories with real details — names, dates, what went wrong, what surprised you. Generic content fails because it has no stories. This is what makes your profile yours."

---

**Q11: "What work, projects, or conversations are exciting you the most right now?"**

*Why we're asking: Gets the stories they're most energised about — which means they'll give the most detail. Present tense means the AI gets current, relevant material. "Conversations" catches the softer stuff — a client relationship, an industry trend, a team dynamic.*

For each thing they mention, follow up naturally:
- "Tell me more about that — what's happening with it?"
- "Who's involved?"
- "What's the challenge?"
- "What made this one stand out?"

Example of what good looks like:
> **Chris Wright:** Compass is the big one — started as internal tools, now selling to TCS, SAP, Microsoft. Ashish Babu (TCS CMO) approached us to explore AI for content marketing. Suhail Adam asked for help enhancing content creation. Anmol Patel is the day-to-day user — "Compass is the future." Also the TCS Marathon activation — Drum Award, built in under a month, 1,500 videos, 9 AI tools, BBC coverage.

---

**Q12: "Tell me about a time something failed or went wrong at work. Something you learned from."**

*Why we're asking: Failure stories prove real experience. The AI uses these for honesty and trust in content — "here's what we got wrong" sections are what make content feel authentic rather than salesy.*

Follow-ups:
- "What specifically went wrong?"
- "What did it cost?"
- "What would you do differently now?"

---

**Q13: "Are there any other projects, client stories, or moments from your career that you think are important? Things that define your work?"**

*Why we're asking: Open net to catch everything else — origin stories, key relationships, funny anecdotes, culture moments. Follow up naturally on anything that sounds like it has a story behind it.*

---

**After Q11-Q13, check what story types have been captured and use these prompts to fill gaps:**

The profile needs a range of story types. After the main questions, review what you've got and use these prompts for any types that haven't surfaced yet:

| Story type | Prompt if missing |
|---|---|
| **Key relationships** | "Who are the people who've had the biggest impact on your work? Current role or over your career." |
| **Patterns** | "What patterns do you keep seeing across your work? Recently or throughout your career." |
| **Risk / bet** | "What's the biggest risk or bet you've taken professionally — in this role or a previous one?" |
| **Team / people moment** | "Is there a moment with your team or colleagues that sticks with you? Recent or from years ago." |

If a type has already been well covered during Q11-Q13, acknowledge it and move on quickly — but don't skip the prompt entirely. There may be additional stories.

---

**After all story prompts, summarise:**
> "Here are the stories I've captured: [list story titles with one-line summaries]. Does that cover the important ones? Anything missing?"

Wait for user confirmation before proceeding.

---

### Section 6: Topics They Own

**Before asking any questions, do this work silently:**

1. **Review Sections 1-5** — scan everything captured so far (what they do, career arc, stories, what excites them) and pull out topic signals from their own words. What did they talk about with the most energy and detail? What do their stories cluster around?
2. **Pull in the research draft list** — the 6-10 topics identified from published content during the research step
3. **Merge into a single draft list** — combine interview-derived topics with research topics, removing duplicates

---

**Tell the user:**
> "Now let's talk about what you're the go-to person for. I've been pulling out themes from everything you've told me so far, and I've got the research from your published content. Before I show you that list, I want to ask a couple of questions."

---

**Q14: "What do people at your company come to you for? Not your job description — what do colleagues or clients actually ask you about?"**

*Why we're asking: People undersell their expertise when asked directly. But they know exactly what others come to them for. This surfaces the topics they're recognised for, framed as observation rather than self-promotion.*

Follow-ups:
- "Anyone outside your company — clients, industry contacts — what do they come to you for?"
- "Is there anything you get asked about that surprises you — something you didn't set out to be known for?"

---

**Q15: "What do you find yourself explaining over and over — to clients, colleagues, or people in your industry?"**

*Why we're asking: The things people explain repeatedly are their deepest expertise — so ingrained they don't even think of it as specialist knowledge. These are the topics where they'll write with the most natural authority.*

Follow-ups:
- "Why do you think people keep getting that wrong?"
- "Is there a topic you know really well but haven't written or talked about publicly?"

---

**After Q14-Q15, present the combined list:**

> "Here's the full list of topics I've identified — from your published content, what you've told me across the interview, and what you just said. [present merged list]. Does that feel right? Anything to add, remove, or reorder? Which are you strongest on?"

Follow-ups:
- "Are any of these outdated — things you used to focus on but have moved on from?"
- "Which of these could you talk about for 30 minutes without preparation?"

Example of what good looks like:
> **Chris Wright:** Building AI tools for sales and marketing. The full revenue cycle (Awareness → Demand Gen → Nurture → Sales Execution). Compass. Microsoft Partner marketing strategy. B2B demand generation. SEO and GEO. AI adoption challenges. Building tools clients own vs licensing.

---

**After confirmation, save the final list:**
> "Here's your confirmed topics list: [final list]. Happy with this?"

Wait for user confirmation before proceeding.

---

### Section 7: Voice & Tone

**Before asking any questions, do this work silently:**

1. **Review how they spoke across Sections 1-6** — not what they said, but HOW they said it. Were they direct or meandering? Formal or casual? Did they use humour? Analogies? Short sentences or long? Did they hedge or commit? Were they warm, blunt, careful, provocative? Note specific patterns.
2. **Pull in research voice observations** — formality level, sentence patterns, humour style, recurring phrases, first person usage, how much personal experience they share
3. **Draft initial Overall Style bullets** — 8-12 observations about their voice, each with a bold label and evidence. These come from observation and research, not from the person describing themselves.

This draft will be refined after the questions below, and finalised in the generate step.

---

**Tell the user:**
> "Now I want to understand how you communicate. I've already got a sense of your voice from how you've spoken so far and from your published content. These questions fill in what observation alone can't get."

---

**Q16: "Explain the most important thing in your field to me like I know nothing about it."**

*Why we're asking: This is a live voice sample. We're not asking them to describe their style — we're watching it happen. A simplifier will simplify. A storyteller will tell a story. A provocateur will challenge assumptions. Whatever their natural communication mode is, it comes out here. The generate step uses this alongside observed patterns to build the Voice & Tone section.*

Follow-ups:
- "Do you use that kind of explanation often — with clients, colleagues?"
- "Where did that analogy come from?" (if they used one)

---

**Q17: "How do you want to come across when someone reads something you've written? And just as important — how do you NOT want to come across?"**

*Why we're asking: Voice guardrails. The "don't" half is often more useful than the "do" half — people are clearer about what they hate than what they like. This feeds directly into the Do/Don't section as well as Voice & Tone.*

**CRITICAL QUESTION — do not accept thin answers.** This is one of the most important questions in the interview. The Don't list is the highest authority in the entire profile, and this question is where most of that list comes from. If the answer is vague ("I want to sound professional" / "I don't want to sound boring"), push hard with follow-ups. You need specific, concrete guardrails — not generalities.

Follow-ups:
- "Is there a writer, speaker, or content creator whose style you admire?"
- "What about their style appeals to you?"
- "Give me a specific word or phrase that you'd never want in something written in your name."
- "If I wrote something for you and it sounded [corporate / salesy / generic / academic] — which of those would bother you most?"

Example of what good looks like:
> **Owen Steer:** Doesn't want to write about stuff he doesn't know really well. Surface-level insight is worse than no insight. Content must not be boring — needs personality and energy. Wants writing to reflect his blunt, sometimes cheeky/sarcastic personality. Hates generic corporate language. Would rather be real and slightly rough than slick and hollow.

---

**Q18: "Have you ever read something written about you or for you that made you cringe? What was wrong with it?"**

*Why we're asking: Anti-patterns. People have strong feelings about content that doesn't sound like them. This tells us exactly what to avoid — corporate speak, forced enthusiasm, overselling, dumbing down, whatever triggers the cringe. Critical for the Don't list.*

**CRITICAL QUESTION — do not accept "no" without probing.** Almost everyone has cringed at content at some point — even if it wasn't about them. If they say "no" or "I can't think of anything," redirect: ask about other people's content they've cringed at, or content in their industry that feels off. The goal is to surface anti-patterns — it doesn't have to be personal to be useful.

Follow-ups:
- "What specifically felt off — the words, the tone, the structure?"
- "Was there anything written about you that DID feel right?"
- "Even if not about you — is there a type of content in your industry that makes you cringe? LinkedIn posts, corporate blogs, anything?"
- "When you read AI-generated content, what gives it away? What's the tell?"

---

**After Q16-Q18, summarise:**

> "Here's the voice profile I'm building. This is from how you've spoken across the whole interview, your published content, and what you just told me: [present draft Overall Style bullets and key guardrails]. Does that feel like you? Anything that's wrong or missing?"

**Important:** When presenting the draft, observed voice (how they actually spoke and write) takes priority over stated voice (how they say they want to sound). If there's a conflict, note it and ask the user which is more accurate.

Wait for user confirmation before proceeding.

---

### After all sections are complete

Thank the user. Tell them:

> "Interview complete. I've captured everything — 18 questions across 7 sections. The next step is to assemble all of this into your author profile, which happens in a separate tool."
