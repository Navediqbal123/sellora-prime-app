import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';
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
            <Button asChild variant="outline" className="w-full h-11 justify-start">
              <a href="mailto:navedahmad9012@gmail.com">
                <Mail className="w-4 h-4 mr-2" />
                navedahmad9012@gmail.com
              </a>
            </Button>
            <Button asChild className="btn-glow w-full h-11 justify-start bg-emerald-600 hover:bg-emerald-700">
              <a
                href="https://wa.me/918191971463?text=Hi%20Sellora%20Support"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SubPageShell>
  );
};

export default HelpCenterPage;