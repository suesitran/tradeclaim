import { useEffect, useRef } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useGeminiLive from '@/hooks/useGeminiLive';

const TOOLS = [
  {
    name: 'update_job_details',
    description: 'Save the job details the user has spoken. Send only the fields they actually gave.',
    parameters: {
      type: 'OBJECT',
      properties: {
        job_number: { type: 'STRING', description: 'The builder job number, for example 0447' },
        name: { type: 'STRING', description: 'The job name, for example L1 and L2 apartments repaint' },
        site_address: { type: 'STRING' },
        state: { type: 'STRING', description: 'The Australian state or territory the site is in, as a code: NSW, VIC, QLD, WA, SA, TAS, ACT or NT' },
        builder_name: { type: 'STRING' },
        builder_email: { type: 'STRING' },
        retention_percent: { type: 'NUMBER' },
        dlp_end_date: { type: 'STRING', description: 'YYYY-MM-DD' },
        next_claim_date: { type: 'STRING', description: 'YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'add_scope_line',
    description: 'Add one quoted scope line to the quote being imported.',
    parameters: {
      type: 'OBJECT',
      properties: {
        area: { type: 'STRING', description: 'Level or area, for example L1 Apartments' },
        description: { type: 'STRING' },
        quantity: { type: 'NUMBER' },
        unit: { type: 'STRING', description: 'm2, lm, no or item' },
        rate: { type: 'NUMBER', description: 'Dollars per unit excluding GST' },
      },
      required: ['description', 'quantity', 'unit', 'rate'],
    },
  },
];

function buildInstruction(job, lineCount) {
  return [
    'You are the voice assistant inside TradeClaim, a payment claim tool for finishing trade subcontractors across Australia, including painting, plastering and linings, tiling, carpentry and joinery, rendering and external finishes. You are helping the user import a subcontract quote so every line becomes a tracked scope line.',
    '',
    'Speak in Australian English, plainly, like a helpful estimator. Keep every reply to one or two short sentences. Never use em dashes.',
    '',
    'You run the conversation. You speak first: greet the user in one short sentence, then ask your first question, so they never have to work out what to say. After that, ask one question at a time, wait for the answer, record it with a tool, say in one short sentence what you saved, then ask the next question. Never read out the whole list of questions at once, and never stay silent waiting for them to lead.',
    '',
    'Record answers with the tools as you go. Never invent a number, a date, an email address or a scope line. If an answer sounds ambiguous or incomplete, ask a clarifying question before recording it. Repeat money amounts and email addresses back to the user for confirmation.',
    '',
    'What to collect, in this order:',
    '1. The job name, and the job number if they have one.',
    '2. The site address.',
    '3. The state or territory, if the address does not make it clear. This decides which security of payment Act governs the job.',
    '4. The builder name and the builder email address used when serving claims.',
    '5. Each quoted scope line: area or level, description, quantity, unit and rate. Rate is dollars per unit excluding GST. If they only give a total, ask for the quantity and the rate.',
    '6. Retention percent, only if it is not the usual five percent.',
    '',
    'Rules:',
    '- Call add_scope_line as soon as you understand one line. Do not wait for the whole quote.',
    '- After recording a line, read the quantity, unit and rate back in one sentence, then ask for the next line.',
    '- Ask again for anything you are unsure of rather than guessing.',
    '- If the user does not name the level or area, ask which area the line belongs to.',
    '- Use unit as m2, lm, no or item, whichever the user says.',
    '- Dates are recorded as YYYY-MM-DD.',
    '- When the quote and the job details are recorded, tell them the job is ready and to press Create the job.',
    '',
    `Already recorded: ${JSON.stringify(job)}. ${lineCount} scope lines have been read so far.`,
  ].join('\n');
}

export default function QuoteVoiceAssistant({ job, onPatch, onAddLine }) {
  const scrollerRef = useRef(null);
  const lineCount = Number(job.line_count || 0);

  const handleToolCall = (name, args) => {
    if (name === 'update_job_details') {
      onPatch(args);
      return { result: 'Saved' };
    }
    if (name === 'add_scope_line') {
      onAddLine(args);
      return { result: 'Line added to the quote' };
    }
    return { result: 'That tool is not available' };
  };

  const { status, error, messages, micActive, micLevel, start, stop } = useGeminiLive({
    instruction: buildInstruction(job, lineCount),
    tools: TOOLS,
    onToolCall: handleToolCall,
    opening: 'The microphone is open and the user is ready. Greet them in one short sentence, then ask your first question: the job name and job number.',
  });

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages]);

  const live = status === 'live';
  const connecting = status === 'connecting';

  return (
    <section className="overflow-hidden rounded-[4px] border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Voice intake</p>
          <h2 className="font-heading text-sm font-semibold">Talk it through</h2>
        </div>
        <div className="flex items-center gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', micActive ? 'animate-pulse bg-accent' : 'bg-destructive')} />
              {micActive ? 'Listening' : 'Microphone not sending audio'}
            </span>
          ) : null}
          {live || connecting ? (
            <Button variant="outline" onClick={stop}>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button className="bg-accent text-accent-foreground" onClick={start}>
              <Mic className="mr-2 h-4 w-4" />
              Start talking
            </Button>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        {connecting ? (
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening the microphone and the voice session
          </p>
        ) : null}

        {live ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Mic input</span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-100"
                style={{ width: `${Math.round(micLevel * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {micLevel > 0.03 ? 'Hearing you' : 'Waiting for your voice'}
            </span>
          </div>
        ) : null}

        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

        {!connecting && !error && !messages.length ? (
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Start talking and it greets you, then asks one question at a time as it fills this form, asking again whenever something is unclear. It collects the job name, site address, builder and email, then each quoted line with its area, quantity, unit and rate. Allow microphone access when asked.
          </p>
        ) : null}

        {messages.length ? (
          <div ref={scrollerRef} className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={cn(
                  'rounded-[3px] px-2.5 py-1.5 text-[12px] leading-relaxed',
                  message.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'text-foreground',
                )}
              >
                <span className="mr-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                {message.text}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}