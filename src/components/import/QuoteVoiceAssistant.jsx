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
        builder_name: { type: 'STRING' },
        builder_email: { type: 'STRING' },
        retention_percent: { type: 'NUMBER' },
        dlp_end_date: { type: 'STRING', description: 'YYYY-MM-DD' },
        next_claim_date: { type: 'STRING', description: 'YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'add_scope_lines',
    description:
      'Add quoted scope lines to the quote. Send every line you have understood in a single call, however many there are.',
    parameters: {
      type: 'OBJECT',
      properties: {
        lines: {
          type: 'ARRAY',
          description: 'Each quoted wording as its own scope line',
          items: {
            type: 'OBJECT',
            properties: {
              area: { type: 'STRING', description: 'Level or area, for example L1 Apartments' },
              description: { type: 'STRING', description: 'The wording of the work, without area or money' },
              quantity: { type: 'NUMBER' },
              unit: { type: 'STRING', description: 'm2, lm, no or item' },
              rate: { type: 'NUMBER', description: 'Dollars per unit excluding GST' },
            },
            required: ['description'],
          },
        },
      },
      required: ['lines'],
    },
  },
  {
    name: 'save_quote_draft',
    description:
      'Save everything recorded so far as a draft quote so nothing is lost. Call this yourself as the conversation goes, without asking the user to press anything.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'save_quote_final',
    description:
      'Save the quote as the final quote for this job once the user confirms the quote is complete.',
    parameters: { type: 'OBJECT', properties: {} },
  },
];

function buildInstruction(job, lineCount) {
  return [
    'You are the voice assistant inside TradeClaim, a payment claim tool for finishing trade subcontractors in Victoria, Australia, including painting, plastering and linings, tiling, carpentry and joinery, rendering and external finishes. You are helping the user import a subcontract quote so every line becomes a tracked scope line.',
    '',
    'Speak in Australian English, plainly, like a helpful estimator. Keep every reply to one or two short sentences. Never use em dashes.',
    '',
    'You run the conversation. You speak first: greet the user in one short sentence, then invite them to give you the quote however they like, either the whole quote in one go or a piece at a time. After each thing they say, record it with a tool and say in one short sentence what was recorded. Keep the flow moving and never stay silent waiting for them to lead. If they are giving the job details first, ask only for the next detail they have not given.',
    '',
    'Record answers with the tools as you go. Never invent a number, a date, an email address or a scope line. If an answer sounds ambiguous or incomplete, ask a clarifying question before recording it. Repeat money amounts and email addresses back to the user for confirmation.',
    '',
    'How to work:',
    '- Take the whole quote in one go. When the user reads out or pastes many wordings, level after level or trade after trade, split them yourself into one scope line per wording and record them all in a single add_scope_lines call. Never ask them to slow down, repeat themselves or go one line at a time.',
    '- Work out the area, description, quantity, unit and rate yourself from what they said. Only ask about something genuinely missing or unclear, for example a quantity with no unit, a rate that is clearly a total, or a line with no area when the others have one. Ask one question at a time, and only when the answer is needed to record what they just said.',
    '- Never invent a quantity, a rate, a date or an email address. Read money amounts and email addresses back for confirmation before saving.',
    '',
    'What to collect, asking only for what they have not already given:',
    '1. The job name and job number, the site address, the builder name, and the builder email used when serving claims.',
    '2. Every quoted scope line, with its area, description, quantity, unit and rate in dollars per unit excluding GST.',
    '3. Retention percent, only if it is not the usual five percent.',
    '4. Whether the quote is complete, and anything still missing from it.',
    '',
    'Every job is in Victoria and counted under the Victorian security of payment Act. Never ask for a state or territory.',
    '',
    'Saving:',
    '- Saving is your job, not theirs. As soon as you have the job name, the builder name and the builder email, call save_quote_draft yourself.',
    '- Call save_quote_draft again after you add or correct scope lines, so the saved draft always matches what has been said.',
    '- When the user says the quote is complete or asks you to finish, read back the job name, the number of lines and the total in one sentence, then call save_quote_final.',
    '- If a save tool replies that something is still needed, ask for exactly that, then save again.',
    '- Once save_quote_final has succeeded, do not call it again.',
    '',
    `Already recorded: ${JSON.stringify(job)}. ${lineCount} scope lines have been read so far.`,
  ].join('\n');
}

export default function QuoteVoiceAssistant({ job, onPatch, onAddLines, onSaveDraft, onSaveFinal }) {
  const scrollerRef = useRef(null);
  const lineCount = Number(job.line_count || 0);

  const handleToolCall = async (name, args) => {
    if (name === 'update_job_details') {
      onPatch(args);
      return { result: 'Saved' };
    }
    if (name === 'add_scope_lines') {
      const added = onAddLines((args && args.lines) || []);
      return { result: added ? `${added} scope lines added to the quote` : 'No lines were added, send each line with a description' };
    }
    if (name === 'save_quote_draft') {
      const outcome = await onSaveDraft();
      return { result: outcome.message };
    }
    if (name === 'save_quote_final') {
      const outcome = await onSaveFinal();
      return { result: outcome.message };
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
            Start talking and it greets you. Read the whole quote out in one go and it splits every wording into its own scope line, or give it a piece at a time and it will ask for just what is missing. It also takes the job name, site address, builder and email, and saves the quote as a draft itself as you go. Allow microphone access when asked.
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