import dns from 'dns/promises';
import net from 'net';

class EmailVerifier {
  constructor() {
    this.emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.roleEmails = ['admin', 'support', 'info', 'sales', 'help', 'contact'];
    this.spamTraps = ['spamtrap@example.com', 'testtrap@example.com'];
  }

  getDomainFromEmail(email) {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : 'unknown';
  }

  async isDomainValid(email) {
    const domain = this.getDomainFromEmail(email);
    try {
      const records = await dns.resolve(domain);
      return records && records.length > 0;
    } catch {
      return false; 
    }
  }

  async hasMXRecords(email) {
    const domain = this.getDomainFromEmail(email);
    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords && mxRecords.length > 0; 
    } catch {
      return false; 
    }
  }

  async verifySMTP(email) {
    const domain = this.getDomainFromEmail(email);
  
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) return { valid: false };
  
      const mxRecord = mxRecords.sort((a, b) => a.priority - b.priority)[0];
      const smtpHost = mxRecord.exchange;
  
      return await new Promise((resolve) => {
        const smtpSocket = net.createConnection(25, smtpHost);

        let response = '';
        let recipientAccepted = false;
        let currentCommand = 'HELO';
  
        smtpSocket.on('connect', () => {
          smtpSocket.write('HELO localhost\r\n');
        });
  
        smtpSocket.on('data', (data) => {
          response += data.toString();
  
          if (response.includes('220') && currentCommand === 'HELO') {
            smtpSocket.write('MAIL FROM:<test@example.com>\r\n');
            currentCommand = 'MAIL FROM';
          } else if (response.includes('250') && currentCommand === 'MAIL FROM') {
            smtpSocket.write(`RCPT TO:<${email}>\r\n`);
            currentCommand = 'RCPT TO';
          } else if (response.includes('550') && currentCommand === 'RCPT TO') {
            smtpSocket.write('QUIT\r\n');
            resolve({ valid: false });
          } else if (response.includes('250') && currentCommand === 'RCPT TO') {
            recipientAccepted = true;
            smtpSocket.write('QUIT\r\n');
          }
        });
  
        smtpSocket.on('end', () => {
          resolve(recipientAccepted ? { valid: true } : { valid: false });
        });
  
        smtpSocket.on('error', () => {
          resolve({ valid: false });
        });
  
        smtpSocket.setTimeout(500, () => {
          smtpSocket.destroy();
          resolve({ valid: false });
        });
      });
    } catch {
      return { valid: false };
    }
  }

  async isCatchAllDomain(email) {
    const testEmail = `random.${Date.now()}@${this.getDomainFromEmail(email)}`;
    const result = await this.verifySMTP(testEmail);
    return result.valid;
  }

  isRoleBasedEmail(email) {
    const localPart = email.split('@')[0].toLowerCase();
    return this.roleEmails.includes(localPart);
  }

  isSpamTrap(email) {
    return this.spamTraps.includes(email);
  }

  async verifyEmail(email) {
    if (!this.emailRegex.test(email)) {
      return { 
        email,
        status: 'invalid',
        message: 'Invalid email format',
        account: email.split('@')[0],
        domain: this.getDomainFromEmail(email)
      };
    }

    const domainValid = await this.isDomainValid(email);
    const mxValid = domainValid ? await this.hasMXRecords(email) : false;

    if (!domainValid) {
      return { 
        email,
        status: 'invalid',
        message: 'Invalid domain',
        account: email.split('@')[0],
        domain: this.getDomainFromEmail(email)
      };
    }

    if (!mxValid) {
      return { 
        email,
        status: 'invalid',
        message: 'No MX records found',
        account: email.split('@')[0],
        domain: this.getDomainFromEmail(email)
      };
    }

    const smtpResult = await this.verifySMTP(email);
    const smtpValid = smtpResult.valid;

    const catchAll = await this.isCatchAllDomain(email);
    const roleBased = this.isRoleBasedEmail(email);
    const spamTrap = this.isSpamTrap(email);

    return {
      email,
      status: smtpValid ? 'valid' : 'potentially_valid',
      message: smtpValid ? 'Email address is valid.' : 'Email address is potentially valid, but SMTP verification failed.',
      account: email.split('@')[0],
      domain: this.getDomainFromEmail(email),
      isCatchAll: catchAll,
      isRoleBased: roleBased,
      isSpamTrap: spamTrap
    };
  }
}

export default EmailVerifier;
