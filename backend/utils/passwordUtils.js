const crypto = require('crypto');

/**
 * Hashes password in Werkzeug's canonical scrypt format:
 * scrypt:<n>:<r>:<p>$<salt>$<hex_hash>
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const n = 32768;
  const r = 8;
  const p = 1;
  const maxmem = 132 * n * r * p;
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    cost: n,
    blockSize: r,
    parallelization: p,
    maxmem
  });
  return `scrypt:${n}:${r}:${p}$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies plaintext password against Werkzeug scrypt (or legacy pbkdf2) hash.
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;

  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;

    const [methodPart, salt, expectedHash] = parts;
    const [method, ...args] = methodPart.split(':');

    if (method === 'scrypt') {
      const n = args[0] ? parseInt(args[0], 10) : 32768;
      const r = args[1] ? parseInt(args[1], 10) : 8;
      const p = args[2] ? parseInt(args[2], 10) : 1;
      const maxmem = 132 * n * r * p;
      const derivedKey = crypto.scryptSync(password, salt, 64, {
        cost: n,
        blockSize: r,
        parallelization: p,
        maxmem
      });
      return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), derivedKey);
    } else if (method === 'pbkdf2') {
      const digest = args[0] || 'sha256';
      const iterations = args[1] ? parseInt(args[1], 10) : 260000;
      const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, expectedHash.length / 2, digest);
      return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), derivedKey);
    }
    return false;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
