import React from 'react';
import { useT } from '@/lib/i18n';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FaqAccordion({ items, groupIndex }) {
  const t = useT();
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, index) => (
        <AccordionItem key={t(item.q)} value={`${groupIndex}-${index}`} className="border-b border-border">
          <AccordionTrigger className="py-4 text-start text-[13.5px] font-medium hover:no-underline">
            {t(item.q)}
          </AccordionTrigger>
          <AccordionContent className="pb-4 pe-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(item.a)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}