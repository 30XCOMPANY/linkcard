/**
 * [INPUT]: @/src/types DiscoverProfile
 * [OUTPUT]: MOCK_PROFILES, getRandomBatch — mock data pool for discover feed development
 * [POS]: Dev-only data source — will be replaced by API when backend is ready
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import type { DiscoverProfile } from "@/src/types";

const p = (
  id: string, username: string, name: string,
  headline: string, jobTitle: string, company: string,
  location: string, character: string,
  template: DiscoverProfile["template"],
  accentColor: string,
  background: DiscoverProfile["background"],
  actionType: "email" | "linkedin" | "wechat" | "url",
  actionLabel: string,
  actionValue: string,
): DiscoverProfile => ({
  id,
  profile: {
    url: `https://linkedin.com/in/${username}`,
    username, name, headline, jobTitle, company, location,
    photoUrl: null, character,
    lastSynced: new Date(), checksum: `mock-${id}`,
  },
  template, accentColor, background,
  visibleFields: ["photoUrl", "name", "headline", "company", "location", "character", "qrCode"],
  contactAction: { type: actionType, label: actionLabel, value: actionValue },
  qrCodeData: `https://linkcard.app/c/${username}`,
});

const MOCK_PROFILES: DiscoverProfile[] = [
  p("001", "sarahchen", "Sarah Chen", "VP of Engineering at Stripe", "VP of Engineering", "Stripe", "San Francisco, CA", "Infrastructure Architect", "modern", "#635BFF", "lightGlass", "linkedin", "Connect on LinkedIn", "https://linkedin.com/in/sarahchen"),
  p("002", "marcusj", "Marcus Johnson", "Founder & CEO at NovaTech", "Founder & CEO", "NovaTech", "Austin, TX", "Serial Entrepreneur", "bento", "#F59E0B", "sunsetGlow", "email", "Email Me", "marcus@novatech.io"),
  p("003", "emilywang", "Emily Wang", "Product Designer at Figma", "Product Designer", "Figma", "New York, NY", "Design Systems Evangelist", "minimal", "#A259FF", "freshBlue", "url", "Visit Portfolio", "https://emilywang.design"),
  p("004", "jameskim", "James Kim", "ML Engineer at OpenAI", "ML Engineer", "OpenAI", "San Francisco, CA", "AI Researcher", "modern", "#10B981", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/jameskim"),
  p("005", "priyapatel", "Priya Patel", "Growth Lead at Notion", "Growth Lead", "Notion", "Seattle, WA", "Growth Hacker", "modern", "#0EA5E9", "lightGlass", "email", "Say Hello", "priya@notion.so"),
  p("006", "alexmorales", "Alex Morales", "DevRel at Vercel", "Developer Advocate", "Vercel", "Portland, OR", "Community Builder", "bento", "#EF4444", "paper", "url", "Follow on X", "https://x.com/alexmorales"),
  p("007", "linazhang", "Lina Zhang", "Partner at Sequoia Capital", "Partner", "Sequoia Capital", "Menlo Park, CA", "Deep Tech Investor", "modern", "#6366F1", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/linazhang"),
  p("008", "tomhansen", "Tom Hansen", "CTO at Plaid", "CTO", "Plaid", "San Francisco, CA", "Fintech Pioneer", "minimal", "#14B8A6", "freshBlue", "email", "Email Me", "tom@plaid.com"),
  p("009", "sofiarivera", "Sofia Rivera", "Head of Design at Linear", "Head of Design", "Linear", "Remote", "Craft Obsessed", "modern", "#8B5CF6", "lightGlass", "url", "Visit Website", "https://sofiarivera.design"),
  p("010", "davidnguyen", "David Nguyen", "iOS Engineer at Apple", "iOS Engineer", "Apple", "Cupertino, CA", "Platform Native Purist", "modern", "#000000", "paper", "wechat", "Add WeChat", "david_ng_ios"),
  p("011", "rachelgreen", "Rachel Green", "Head of Product at Shopify", "Head of Product", "Shopify", "Toronto, Canada", "Commerce Visionary", "bento", "#96BF48", "lightGlass", "linkedin", "Connect", "https://linkedin.com/in/rachelgreen"),
  p("012", "omarhassan", "Omar Hassan", "Principal Engineer at Databricks", "Principal Engineer", "Databricks", "San Francisco, CA", "Data Lake Whisperer", "modern", "#FF3621", "midnightInk", "email", "Email", "omar@databricks.com"),
  p("013", "miayamamoto", "Mia Yamamoto", "Staff Designer at Airbnb", "Staff Designer", "Airbnb", "Los Angeles, CA", "Experience Crafter", "minimal", "#FF385C", "sunsetGlow", "url", "Portfolio", "https://miayamamoto.com"),
  p("014", "bencooper", "Ben Cooper", "Founding Engineer at Resend", "Founding Engineer", "Resend", "San Francisco, CA", "DX Maximalist", "modern", "#000000", "lightGlass", "email", "Email Me", "ben@resend.com"),
  p("015", "natalieross", "Natalie Ross", "VP Marketing at Anthropic", "VP Marketing", "Anthropic", "San Francisco, CA", "AI Safety Advocate", "modern", "#D97706", "paper", "linkedin", "Connect", "https://linkedin.com/in/natalieross"),
  p("016", "kevinlee", "Kevin Lee", "Staff Engineer at Netflix", "Staff Engineer", "Netflix", "Los Gatos, CA", "Streaming Architect", "modern", "#E50914", "midnightInk", "linkedin", "Connect", "https://linkedin.com/in/kevinlee"),
  p("017", "anagarcia", "Ana Garcia", "CPO at Canva", "CPO", "Canva", "Sydney, Australia", "Visual Storyteller", "bento", "#00C4CC", "freshBlue", "email", "Email Me", "ana@canva.com"),
  p("018", "ryanpatel", "Ryan Patel", "Founding Partner at a16z", "Founding Partner", "a16z", "San Francisco, CA", "Builder Backer", "modern", "#FF6600", "paper", "url", "Website", "https://ryanpatel.vc"),
  p("019", "juliawu", "Julia Wu", "Design Director at Spotify", "Design Director", "Spotify", "Stockholm, Sweden", "Sound & Color", "minimal", "#1DB954", "lightGlass", "linkedin", "Connect", "https://linkedin.com/in/juliawu"),
  p("020", "danielkim", "Daniel Kim", "Co-founder at Replit", "Co-founder", "Replit", "San Francisco, CA", "Code Democratizer", "modern", "#F26207", "sunsetGlow", "url", "Replit Profile", "https://replit.com/@danielkim"),
];

export function getRandomBatch(
  count: number,
  excludeIds: string[]
): DiscoverProfile[] {
  let available = MOCK_PROFILES.filter((p) => !excludeIds.includes(p.id));
  if (available.length < count) available = MOCK_PROFILES;
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
