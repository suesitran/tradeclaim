import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FaqAccordion({ items, groupIndex }) {
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, index) => (
        <AccordionItem key={item.q} value={`${groupIndex}-${index}`} className="border-b border-border">
          <AccordionTrigger className="py-4 text-left text-[13.5px] font-medium hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-4 pr-2 text-[13px] leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}