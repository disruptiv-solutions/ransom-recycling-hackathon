import nodemailer from "nodemailer";

const getEmailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "BridgePath <info@disruptiv.solutions>";

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration missing");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}) => {
  const transporter = getEmailTransporter();
  const from = process.env.SMTP_FROM || "BridgePath <info@disruptiv.solutions>";

  const recipients = Array.isArray(to) ? to : [to];

  await transporter.sendMail({
    from,
    to: recipients.join(", "),
    subject,
    html,
    text: text || html?.replace(/<[^>]*>/g, ""),
  });
};
