import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – Influencer Marketplace",
  description:
    "Learn how brands and influencers collaborate, earn money, and run campaigns on our platform.",
};

const faqs: {
  category: string;
  items: { q: string; a: string }[];
}[] = [
  {
    category: "Marketplace Basics",
    items: [
      {
        q: "What is this platform?",
        a: "This is a marketplace where brands and influencers collaborate on paid content. Brands post campaigns, and influencers can participate to earn money or receive direct offers.",
      },
      {
        q: "How does it work?",
        a: "Brands create campaigns with requirements and budgets. Influencers can apply, complete tasks, or receive direct collaboration requests from brands.",
      },
      {
        q: "Who can join?",
        a: "Anyone can join — brands and influencers.",
      },
    ],
  },
  {
    category: "For Influencers",
    items: [
      {
        q: "How do I earn money?",
        a: "You can earn by completing campaigns or accepting brand deals.",
      },
      {
        q: "Do I need a large following?",
        a: "No. Micro-influencers can also earn.",
      },
      {
        q: "How do brands find me?",
        a: "Through your public profile.",
      },
      {
        q: "Can I set my own price?",
        a: "Yes, you can set or negotiate pricing.",
      },
    ],
  },
  {
    category: "For Brands",
    items: [
      {
        q: "How do I create a campaign?",
        a: "Define requirements, budget, and publish.",
      },
      {
        q: "Can I choose influencers?",
        a: "Yes, you can directly invite them.",
      },
      {
        q: "How do I ensure quality?",
        a: "Approve content before publishing.",
      },
    ],
  },
  {
    category: "Payments & Trust",
    items: [
      {
        q: "How are payments handled?",
        a: "Funds are held securely and released after approval.",
      },
      {
        q: "Is there a platform fee?",
        a: "Yes, a small commission per transaction.",
      },
      {
        q: "When do influencers get paid?",
        a: "After approval, within a few days.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold mb-10">FAQ</h1>

      {faqs.map((section, i) => (
        <div key={i} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            {section.category}
          </h2>

          {section.items.map((item, j) => (
            <details key={j} className="mb-3 border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">
                {item.q}
              </summary>
              <p className="mt-2 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}