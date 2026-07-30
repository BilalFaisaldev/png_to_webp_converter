// Disposable Email Domain Blacklist
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'yopmail.com',
  'trashmail.com', 'guerrillamail.com', 'sharklasers.com', 'dispostable.com',
  'getnada.com', 'fakeinbox.com', 'mymail.buzz', 'crazymailing.com',
  'temp-mail.org', 'tempmail.net', 'throwawaymail.com', 'mohmal.com',
  'generator.email', 'maildrop.cc', 'inboxkitten.com', 'temp-mail.com',
  'mailnesia.com', 'byom.de', 'zootmail.com', 'tmailor.com'
]);

// Standard Email Validation Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateRealEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, reason: 'Please enter a valid email address (e.g. name@gmail.com).' };
  }

  const domain = cleanEmail.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return { valid: false, reason: 'Email domain format is invalid.' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'Temporary/Disposable emails are not allowed. Please use a real email provider (e.g. Gmail, Outlook, Yahoo).' };
  }

  return { valid: true, cleanEmail };
}

module.exports = {
  validateRealEmail,
  DISPOSABLE_DOMAINS
};
