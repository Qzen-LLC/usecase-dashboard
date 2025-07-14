import * as React from 'react';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  children: React.ReactNode;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
}

interface AccordionContentProps {
  children: React.ReactNode;
}

const AccordionContext = React.createContext<{
  open: string | null;
  setOpen: (value: string | null) => void;
} | null>(null);

export function Accordion({ children }: AccordionProps) {
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ open, setOpen }}>
      <div className="space-y-4">{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  return <div data-accordion-item={value}>{children}</div>;
}

export function AccordionTrigger({ children }: AccordionTriggerProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion');
  const { open, setOpen } = ctx;
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    // No-op, just to trigger re-render on open change
  }, [open]);
  return (
    <button
      className="w-full flex items-center justify-between px-4 py-3 bg-white border rounded shadow-sm hover:bg-gray-50 transition text-left font-medium text-lg"
      aria-expanded={open === buttonRef.current?.parentElement?.getAttribute('data-accordion-item')}
      onClick={() => {
        const value = buttonRef.current?.parentElement?.getAttribute('data-accordion-item') || '';
        setOpen(open === value ? null : value);
      }}
      ref={buttonRef}
      type="button"
    >
      {children}
      <span className={`ml-2 transition-transform ${open === buttonRef.current?.parentElement?.getAttribute('data-accordion-item') ? 'rotate-90' : ''}`}>▶</span>
    </button>
  );
}

export function AccordionContent({ children }: AccordionContentProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionContent must be used within Accordion');
  const { open } = ctx;
  const divRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    // No-op, just to trigger re-render on open change
  }, [open]);
  const value = divRef.current?.parentElement?.getAttribute('data-accordion-item');
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${open === value ? 'max-h-[1000px] py-4' : 'max-h-0 py-0'}`}
      aria-hidden={open !== value}
      ref={divRef}
    >
      {open === value ? children : null}
    </div>
  );
} 