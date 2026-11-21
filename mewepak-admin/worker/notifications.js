const mailEndpoint = 'https://api.resend.com/emails';

function notification(job) {
  const { kind, lead } = job;
  if (!lead || lead.status === 'cancelled' || (kind === 'booking_confirmed' && lead.status !== 'confirmed')) return null;
  const greeting = `Hello ${lead.name},`;
  const appointment = `${lead.date} at ${lead.time} (${lead.timezone})`;
  switch (kind) {
    case 'booking_staff':
      return ['New packaging consultation', `${lead.name} from ${lead.company || 'an unnamed company'} requested a consultation for ${appointment}. Open the Mewepak admin to review it.`];
    case 'booking_customer':
      return ['We received your consultation request', `${greeting}\n\nWe received your Mewepak consultation request for ${appointment}. Our team will follow up about your request.`];
    case 'booking_confirmed':
      return ['Your Mewepak consultation is confirmed', `${greeting}\n\nYour Mewepak consultation is confirmed for ${appointment}.`];
    case 'quote_staff':
      return ['New packaging quote inquiry', `${lead.name} from ${lead.company} submitted a quote inquiry for ${lead.type}. Open the Mewepak admin to review it.`];
    case 'quote_customer':
      return ['We received your packaging inquiry', `${greeting}\n\nThank you for contacting Mewepak about ${lead.type}. Our packaging team will review your request and follow up.`];
    default:
      return null;
  }
}

export async function dispatchLeadNotifications(env, database) {
  const from = String(env.NOTIFICATIONS_FROM || '').trim();
  const key = String(env.RESEND_API_KEY || '').trim();
  const secret = env.BOOKING_API_SECRET;
  if (!from || !key || !secret) return;
  const rpc = (name, body) => database('rpc/' + name, { method: 'POST', body: JSON.stringify({ ...body, p_secret: secret }) });
  const response = await rpc('claim_lead_notifications', {});
  if (!response.ok) throw new Error('Could not claim lead notifications');
  const jobs = await response.json();
  for (const job of jobs) {
    const message = notification(job);
    let result = 'skipped';
    if (message && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.email || '')) {
      try {
        const sent = await fetch(mailEndpoint, {
          method: 'POST',
          headers: {
            authorization: 'Bearer ' + key,
            'content-type': 'application/json',
            'idempotency-key': 'mewepak/lead/' + job.id,
          },
          body: JSON.stringify({ from, to: [job.email], subject: message[0], text: message[1] }),
          signal: AbortSignal.timeout(5000),
        });
        result = sent.ok ? 'sent' : 'provider_http_' + sent.status;
        await sent.body?.cancel();
      } catch {
        result = 'provider_request_failed';
      }
    }
    const finished = await rpc('finish_lead_notification', { p_id: job.id, p_claim: job.claim_token, p_result: result });
    if (!finished.ok) console.error('Could not record lead notification outcome', finished.status);
  }
}
