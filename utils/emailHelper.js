const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");

async function getOTP() {
  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT),
      tls: true,
      authTimeout: 10000,
      tlsOptions: {
        rejectUnauthorized: false, // Development only
      },
    },
  };

  const connection = await imaps.connect(config);

  await connection.openBox("INBOX");

  const delay = 5000;

  await new Promise((resolve) => setTimeout(resolve, delay));

  const searchCriteria = ["UNSEEN"];

  const fetchOptions = {
    bodies: [""],
    markSeen: true,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);

  const latest = messages[messages.length - 1];

  const parsed = await simpleParser(latest.parts[0].body);

  connection.end();

  return parsed.text;
}

module.exports = { getOTP };
