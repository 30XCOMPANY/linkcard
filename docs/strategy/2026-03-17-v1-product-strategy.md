# LinkCard v1 Product Strategy Report

> Senior PM Analysis: Competitive Positioning, Scope Definition, Success Criteria
> Date: 2026-03-17

---

## 1. Unique Value Proposition

### The Insight

Bonjour! and LinkCard sit on opposite ends of a spectrum:

```
Bonjour!                                          LinkCard
├── Community-first                               ├── Utility-first
├── Card = entry ticket to social graph           ├── Card = the product itself
├── Chinese founder/builder niche                 ├── Global professionals
├── Retention via content feed + messaging        ├── Retention via card usage (shares)
└── Build identity FROM SCRATCH                   └── Build identity FROM LINKEDIN
```

Bonjour! asks: "Who are you in this community?"
LinkCard asks: "How do you present your LinkedIn identity when it matters?"

### LinkCard's Unique Position

**"Your LinkedIn, distilled into a card you actually want to share."**

The moat is the LinkedIn import pipeline. Nobody else does:
1. Paste a LinkedIn URL
2. AI scrapes and structures the profile
3. Generate a beautiful, context-aware card in seconds
4. Share via QR, link, AirDrop, or Apple Wallet

The competitive advantage is **zero creative effort** — LinkedIn data is the fuel, the app is the engine. Bonjour! requires manual profile building. LinkCard eliminates that friction entirely.

### Why Users Should Care

| Bonjour! User | LinkCard User |
|---|---|
| Spends 20 min building profile | Spends 30 seconds importing |
| Needs to learn a new social platform | Uses the LinkedIn they already maintain |
| Value comes from community participation | Value comes from the first share |
| Locked into Chinese founder ecosystem | Works anywhere, any industry |

**One-line pitch:** LinkedIn took 10 years to build your profile. LinkCard turns it into a shareable card in 30 seconds.

---

## 2. Feature-by-Feature Bonjour! Analysis

### System 1: Discover (Content Feed)

**Recommendation: SKIP for v1. Revisit post-PMF.**

Rationale:
- A content feed is a retention mechanism for community platforms. LinkCard is a utility.
- Building a feed requires content moderation, recommendation algorithms, spam control, and creator tools — each one a company-level effort.
- The cold-start problem is brutal. With zero users, a feed is an empty room.
- LinkCard's retention should come from **share frequency**, not scroll time.

Risk of adopting: Turns LinkCard into a mediocre social network instead of an excellent card tool. Feature creep kills utility apps.

### System 2: Recommend (Profile Card Browser)

**Recommendation: ADAPT as "Discover Nearby" — v1.1 or v2.**

This is the one Bonjour! feature that maps to LinkCard's core use case. But the execution should be radically different:

- Bonjour! does manual browsing ("swipe through cards")
- LinkCard should do **proximity-based discovery** — "Who's at this event?" using Bluetooth/NFC tap or shared QR scan

**Skip for v1** because it requires a critical mass of users in the same physical space. The feature is useless until LinkCard has density at events.

**v2 concept:** Event mode — scan an event QR code, see all LinkCard holders at the same event. No swiping, no algorithmic matching. Just "here are the people near you."

### System 3: Messages (Chat/Inbox)

**Recommendation: SKIP entirely. Never build this.**

Rationale:
- Messaging is already solved (iMessage, WhatsApp, LinkedIn DMs, email).
- Building messaging means building notification infrastructure, message storage, real-time sync, abuse prevention, and end-to-end encryption.
- LinkCard's job is to get users INTO their existing communication channels faster, not replace them.
- Every minute spent on messaging is a minute not spent on the card experience.

**Alternative:** When someone views your shared card, they see your email/phone/LinkedIn — one tap to connect through existing channels. The card IS the message.

### System 4: Me (Profile/Settings)

**Recommendation: ADOPT the profile quality, skip the social features.**

What to take from Bonjour!'s "Me" page:
- Rich profile display with tags, status, and product showcase
- The "edit profile" + "share" floating bar (LinkCard already has this pattern)

What to skip:
- Friends count (social graph feature, not a utility feature)
- Posts section (feed feature)
- Status input ("what's on your mind" — social feature)

**For LinkCard v1:** The Home tab IS the profile. The card display is the identity. Settings is where you manage the account. No separate "profile" screen needed — the card is a more elegant version of a profile page.

---

## 3. North Star Metric

### Primary: Cards Shared Per Week (per user)

**Definition:** Number of times a user shares their card (via QR scan, link copy, native share sheet, AirDrop, or Wallet tap) in a 7-day window.

**Why this metric:**
- Directly measures the product's core value (making professional sharing effortless)
- Leading indicator of retention (if you share, you come back)
- Leading indicator of growth (every share is a potential new user who receives a card)
- Immune to vanity inflation (you can't fake real shares)

**Target:**
- Week 1 after card creation: 3+ shares
- Steady state (month 2+): 2+ shares/week
- Power users: 5+ shares/week

### Supporting Metrics

| Metric | Why It Matters | Target |
|---|---|---|
| Time to First Card | Onboarding quality | < 60 seconds |
| Card Completion Rate | Onboarding funnel | > 80% (start → card created) |
| Share-to-View Ratio | Card quality/appeal | > 60% of shared links get opened |
| Version Count per User | Engagement depth | Average 2+ versions after 30 days |
| Weekly Active Users (WAU) | Baseline health | Standard growth curve |
| Day 7 Retention | Stickiness | > 40% |

### Anti-Metrics (Do NOT Optimize For)

- **Session duration** — longer sessions mean the app is hard to use, not engaging. Card sharing should take 5 seconds.
- **Daily Active Users** — a card app doesn't need daily use. Weekly is the natural rhythm.
- **Number of features** — quality over quantity.

---

## 4. Information Architecture — v1

### Tab Structure: 3 Tabs (Keep Current)

```
┌─────────────────────────────────────────────┐
│                  LinkCard                    │
├─────────┬────────────────┬──────────────────┤
│  Card   │     Share      │    Settings      │
│ (Home)  │                │                  │
└─────────┴────────────────┴──────────────────┘
```

**3 tabs is correct.** Bonjour! has 4 because it's a social platform. LinkCard is a utility. Apple's own apps (Wallet, Health, Compass) prove that fewer tabs = better for utility apps.

### Screen Map

```
Root Layout
├── Onboarding/ (shown when card === null)
│   ├── Auth (index.tsx)          — Sign in / create account
│   ├── LinkedIn (linkedin.tsx)   — Paste URL, import profile
│   └── Preview (preview.tsx)     — Confirm extracted data → create card
│
└── (tabs)/ (shown when card exists)
    ├── (home)/
    │   ├── index.tsx             — Card hero + version chips + quick actions
    │   └── editor.tsx            — Push screen: field toggles, accent, background
    │
    ├── (share)/
    │   └── index.tsx             — Card preview + field toggles + share actions
    │
    └── (settings)/
        └── index.tsx             — Account card, sync, theme, reset
```

**Total: 7 screens.** This is the right number. Each screen has exactly one job.

### What Each Tab Does

**Tab 1: Card (Home)**
- Hero: Full card display with selected version
- Version selector: Horizontal chips (Professional, Networking, Personal)
- Quick actions: Edit, Share, QR Code
- Push to Editor: Field toggles, accent color, name weight, background

**Tab 2: Share**
- Card preview (compact, with current version)
- Field toggles: Choose what to include in this share
- Primary CTA: Share button (native share sheet)
- Secondary actions: Copy Link, Add to Wallet
- Future: AirDrop, NFC tap

**Tab 3: Settings**
- Account card: Avatar, name, role, version count
- Sync controls: Auto-sync toggle, manual sync
- Data: Reset card (destructive)
- App info: Version number

### What's Missing (Intentionally)

No Discover tab. No Messages tab. No profile editing beyond field visibility and styling. LinkedIn is the source of truth — if you want to change your headline, update it on LinkedIn and re-sync.

---

## 5. Success Criteria — "Done" for v1

### Launch Criteria (Must-Have)

| # | Criterion | Measured By |
|---|---|---|
| 1 | User can create an account and sign in | Auth flow completes without error |
| 2 | User can import LinkedIn profile in < 60 seconds | Time from URL paste to card display |
| 3 | All 3 card versions render correctly | Visual QA on iPhone 14+, Safari desktop |
| 4 | User can toggle field visibility and see changes live | Editor screen works, changes persist |
| 5 | User can share card via native share sheet | Share.share() succeeds, link is valid |
| 6 | User can copy card link to clipboard | Clipboard.setString() works |
| 7 | QR code displays and encodes correct URL | QR scan resolves to linkcard.app/c/{id} |
| 8 | Card data persists across app restarts | AsyncStorage + Supabase round-trip |
| 9 | Web version works on Safari and Chrome | Expo web export renders all 7 screens |
| 10 | Shared link renders a web preview of the card | linkcard.app/c/{id} shows card data |

### Quality Bar (Apple Standard)

| # | Quality Criterion |
|---|---|
| 1 | Large title collapse works on all tabs (iOS) |
| 2 | Liquid Glass renders on iOS 26+ with non-glass fallback |
| 3 | All animations use springs for user-initiated, easing for system-initiated |
| 4 | All interactive elements have minimum 44pt touch targets |
| 5 | Haptic feedback on every user interaction (selection, success, error) |
| 6 | No layout shift on card display (content height stable) |
| 7 | Dark mode works end-to-end (semantic colors via PlatformColor) |
| 8 | Pull-to-refresh on home tab triggers LinkedIn re-sync |
| 9 | Keyboard avoidance works on all input screens |
| 10 | Error states are helpful, not technical (no raw error messages) |

### NOT Done For v1

- Apple Wallet pass generation (API exists but needs signing certificate)
- AirDrop sharing (requires native module)
- Background sync (registered but not active)
- NFC tap to share (requires NFC hardware integration)
- Multiple user accounts
- Analytics dashboard ("who viewed my card")
- Card templates beyond the 3 defaults
- Custom fonts on cards

---

## 6. Risk Analysis

### Risk 1: LinkedIn Scraping Reliability

**Severity: Critical**
**Probability: High**

The entire product depends on successfully scraping LinkedIn profiles via RapidAPI. LinkedIn actively fights scrapers. If the API goes down or gets rate-limited, the app's core flow breaks.

**Mitigation:**
- Multiple scraping provider fallback (already using RapidAPI, add a second provider)
- Graceful degradation: allow manual profile entry as fallback
- Cache aggressively: once imported, the profile data lives locally
- Monitor API uptime with alerts

### Risk 2: Zero-User Cold Start on Sharing

**Severity: Medium**
**Probability: Certain**

When a user shares their card link, the recipient sees a web page. If that page looks cheap or broken, the user loses trust in the product. The web preview IS the product's first impression to non-users.

**Mitigation:**
- Invest disproportionately in the shared card web page (linkcard.app/c/{id})
- The web preview must be as beautiful as the in-app card
- Include clear CTA: "Get your own LinkCard" (viral loop)
- OG meta tags for rich link previews in iMessage, WhatsApp, Slack

### Risk 3: "Why Not Just Use LinkedIn?"

**Severity: High**
**Probability: High**

The hardest question: why should someone share a LinkCard instead of their LinkedIn profile URL?

**Answer (must be obvious in the product):**
- Speed: QR code is faster than "search my name on LinkedIn"
- Context: Different versions for different situations (the sales meeting version vs. the conference version)
- Design: A beautiful card makes a better first impression than a LinkedIn profile page
- Control: Choose exactly what to share (hide email from strangers, show it to prospects)

If the product doesn't make these advantages obvious within 10 seconds of first use, it will fail.

### Risk 4: Platform Dependency on Expo/Apple

**Severity: Low**
**Probability: Low**

Using NativeTabs (iOS 26+), Liquid Glass, and SF Symbols creates tight coupling to Apple's latest APIs. If Expo SDK 55 has bugs in these new APIs, the entire UI layer is affected.

**Mitigation:**
- Every native feature has a non-glass fallback (already implemented via `isGlassEffectAPIAvailable()`)
- Web layout uses standard `Tabs` component (already implemented via `_layout.web.tsx`)
- Pin Expo SDK version, don't chase betas

### Risk 5: Scope Creep Toward Social Features

**Severity: High**
**Probability: High**

The Bonjour! comparison will tempt the team to add a feed, messaging, or discovery features. Each one is a 6-month project that dilutes the utility value proposition.

**Mitigation:**
- This document. Print it on the wall.
- The North Star is Cards Shared Per Week. If a feature doesn't increase shares, it doesn't ship.
- v1 is 7 screens. Any screen added must justify removing another.
- The team should ask: "Does this make the card better or the sharing faster?" If neither, skip it.

### Risk 6: Web vs. Native Quality Gap

**Severity: Medium**
**Probability: Medium**

The app targets both iOS and web. Maintaining quality parity across both platforms doubles QA effort. NativeWind v5 and react-native-web bridge most gaps, but glass effects, haptics, and SF Symbols don't exist on web.

**Mitigation:**
- iOS is the primary platform. Web is the share destination + secondary creation tool.
- Accept that web will look "good" while iOS looks "great"
- Never block iOS features to maintain web parity
- The shared card web page (linkcard.app/c/{id}) is the web product's most important surface — optimize that over the web editor

---

## 7. Roadmap: What Comes After v1

```
v1 (Now)          — Core card utility: import, customize, share
v1.1 (Month 2)    — Apple Wallet pass, AirDrop, analytics ("X people viewed your card")
v1.2 (Month 3)    — Card templates marketplace (more than 3 defaults)
v2.0 (Month 6)    — Event mode ("who's here?"), proximity discovery, NFC tap
v3.0 (Year 2)     — Team cards (companies issue branded cards to employees)
```

The team card feature (v3) is the monetization play. Companies will pay for branded, managed digital business cards for their sales teams. But that's a Year 2 problem. Year 1 is about making the individual card experience world-class.

---

## 8. Summary: The PM Manifesto for v1

1. **LinkCard is a utility, not a social network.** Every feature decision flows from this.

2. **The card IS the product.** Not the feed, not the messages, not the community. The card.

3. **LinkedIn is the data source.** We don't ask users to build a profile from scratch. We extract one they already maintain.

4. **Sharing is the metric.** Cards Shared Per Week tells us if the product works. Everything else is noise.

5. **7 screens, 3 tabs, 1 job.** Import, customize, share. That's it.

6. **Apple-quality UX is non-negotiable.** Liquid Glass, springs, haptics, 44pt touch targets. If it doesn't feel native, it doesn't ship.

7. **The shared card web page is the viral loop.** Every share is a marketing impression. That page must be beautiful and include "Get your own LinkCard."

8. **Don't build Bonjour!** They are building a community. We are building a tool. Both are valid. Only one is LinkCard.

---

*"People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas."* — Steve Jobs
