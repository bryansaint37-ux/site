const WHATSAPP_NUMBER = '+1(778)8250952';

export function buildWhatsAppLink({
  match,
  date,
  stadium,
  category = 'Standard',
  price = 'À déterminer',
  items,
}: {
  match?: string;
  date?: string;
  stadium?: string;
  category?: string;
  price?: string;
  items?: Array<{ match: string; date: string; stadium: string; category: string; price: string; quantity?: number }>;
}) {
  const lines = ['Bonjour,', '', 'Je souhaite réserver les billets suivants :', ''];

  if (items && items.length > 0) {
    items.forEach((item, index) => {
      lines.push(`${index + 1}. Match : ${item.match}`);
      lines.push(`   Date : ${item.date}`);
      lines.push(`   Stade : ${item.stadium}`);
      lines.push(`   Catégorie : ${item.category}`);
      if (item.quantity) lines.push(`   Quantité : ${item.quantity}`);
      lines.push(`   Prix : ${item.price}`);
      lines.push('');
    });
  } else {
    lines.push(`Match : ${match || 'À confirmer'}`);
    lines.push(`Date : ${date || 'À confirmer'}`);
    lines.push(`Stade : ${stadium || 'À confirmer'}`);
    lines.push(`Catégorie : ${category}`);
    lines.push(`Prix : ${price}`);
    lines.push('');
  }

  lines.push('Merci de me confirmer la disponibilité et les prochaines étapes.');

  const text = lines.join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppBooking(payload: Parameters<typeof buildWhatsAppLink>[0]) {
  if (typeof window === 'undefined') return;
  window.open(buildWhatsAppLink(payload), '_blank', 'noopener,noreferrer');
}
