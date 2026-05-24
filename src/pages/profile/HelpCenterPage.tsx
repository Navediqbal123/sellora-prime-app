import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { SubPageShell } from './_shared';

const faqs = [
  {
    section: 'Shipping & Pickup',
    items: [
      { q: 'How does local pickup work?', a: 'Place an order and you will receive a 4-digit pickup code. Show this code at the seller\'s shop to collect your item.' },
      { q: 'How long do orders stay reserved?', a: 'Orders remain in pending status until the seller marks them ready, then you have 7 days to collect them.' },
    ],
  },
  {
    section: 'Returns & Refunds',
    items: [
      { q: 'Can I return an item?', a: 'Returns are handled directly with the seller. Inspect the item at pickup before completing the order.' },
      { q: 'How do I get a refund?', a: 'Refunds depend on the seller\'s policy. Reach out via in-app chat to coordinate.' },
    ],
  },
  {
    section: 'Payments',
    items: [
      { q: 'Which payment methods are supported?', a: 'You can save UPI IDs and cards in Payment Methods. Final payment happens at the shop on pickup.' },
      { q: 'Is my payment data secure?', a: 'Only the last 4 digits of cards are stored. UPI IDs are encrypted at rest.' },
    ],
  },
  {
    section: 'Account',
    items: [
      { q: 'How do I edit my profile?', a: 'Go to Account > Edit Profile to update your name, phone number and photo.' },
              { q: 'How do I delete my account?', a: 'Contact navedahmad9012@gmail.com and we\'ll process the request within 48 hours.' },
    ],
  },
];

const HelpCenterPage: React.FC = () => {
  return (
    <SubPageShell title="Help Center">
      <div className="space-y-4">
        {faqs.map((group) => (
          <div key={group.section} className="card-premium p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 px-1">{group.section}</h3>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((item, idx) => (
                <AccordionItem key={idx} value={`${group.section}-${idx}`} className="border-border/40 last:border-0">
                  <AccordionTrigger className="text-sm text-left hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        <div className="card-premium p-5">
          <h3 className="text-base font-semibold text-foreground mb-1">Still need help?</h3>
          <p className="text-xs text-muted-foreground mb-4">Our team typically replies within a few hours.</p>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:navedahmad9012@gmail.com"
              className="inline-flex items-center w-full h-11 px-4 rounded-md bg-zinc-900 text-white text-sm font-medium"
            >
              <Mail className="w-4 h-4 mr-2 text-white" />
              navedahmad9012@gmail.com
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbBZO1FGE56tUHcbAd3c"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center w-full px-4 py-3 rounded-md bg-zinc-900 text-white"
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 mr-3 shrink-0" aria-hidden="true">
                <path fill="#25D366" d="M16 .5C7.45.5.5 7.45.5 16c0 2.82.74 5.57 2.15 8L.5 31.5l7.7-2.02A15.46 15.46 0 0 0 16 31.5C24.55 31.5 31.5 24.55 31.5 16S24.55.5 16 .5z"/>
                <path fill="#fff" d="M23.4 19.5c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.27-.18.21-.37.24-.69.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.92-1.79-2.24-.18-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55l-.62-.01c-.21 0-.56.08-.85.4s-1.12 1.1-1.12 2.67 1.15 3.1 1.31 3.32c.16.21 2.26 3.45 5.48 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"/>
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">📢 Sellora Updates Channel</span>
                <span className="text-xs text-white/70 truncate">Get order updates & offers</span>
              </div>
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb88ymp6GcGIVrGOfu1r"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center w-full px-4 py-3 rounded-md bg-zinc-900 text-white"
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 mr-3 shrink-0" aria-hidden="true">
                <path fill="#25D366" d="M16 .5C7.45.5.5 7.45.5 16c0 2.82.74 5.57 2.15 8L.5 31.5l7.7-2.02A15.46 15.46 0 0 0 16 31.5C24.55 31.5 31.5 24.55 31.5 16S24.55.5 16 .5z"/>
                <path fill="#fff" d="M23.4 19.5c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.5-.16-.72.16-.21.32-.82 1.05-1 1.27-.18.21-.37.24-.69.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.92-1.79-2.24-.18-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55l-.62-.01c-.21 0-.56.08-.85.4s-1.12 1.1-1.12 2.67 1.15 3.1 1.31 3.32c.16.21 2.26 3.45 5.48 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37z"/>
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">🛍️ Sellora Support Channel</span>
                <span className="text-xs text-white/70 truncate">Help with orders, payments & queries</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </SubPageShell>
  );
};

export default HelpCenterPage;