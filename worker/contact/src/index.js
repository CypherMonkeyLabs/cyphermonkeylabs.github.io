import { EmailMessage } from 'cloudflare:email';
import { handleContact } from './handler.js';
import { buildPlainMessage } from './mime.js';

export default {
  async fetch(request, env) {
    return handleContact(request, env, {
      async sendEmail(payload) {
        const raw = buildPlainMessage(payload);
        await env.SEND_EMAIL.send(new EmailMessage(payload.fromAddr, payload.toAddr, raw));
      },
    });
  },
};
