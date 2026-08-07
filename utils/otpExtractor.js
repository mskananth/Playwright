function extractOTP(emailBody) {
  const match = emailBody.match(/\b\d{6}\b/);

  if (!match) {
    throw new Error("OTP Not Found");
  }

  return match[0];
}

module.exports = { extractOTP };
