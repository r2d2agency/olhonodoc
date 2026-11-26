'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

export default function FeaturesAccordion({ features, compact = false }: { features: string[]; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const list = features || [];
  const visible = expanded ? list : list.slice(0, 3);
  return <>
    <ul className={expanded ? 'expanded' : ''}>{visible.map((feature, i) => <li key={`${feature}-${i}`}><Check size={compact ? 14 : 15}/>{feature}</li>)}</ul>
    {list.length > 3 && <button type="button" className="features-accordion-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
      {expanded ? <Minus size={14}/> : <Plus size={14}/>} {expanded ? 'Menos detalhes' : 'Ver todas as características'}
    </button>}
  </>;
}
