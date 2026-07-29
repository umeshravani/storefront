import fs from "node:fs";
import path from "node:path";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";
import { getStoreEmailFrom, isStoreEmailFromFallback } from "@/lib/store";

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  from?: string;
}

const isDev = process.env.NODE_ENV === "development";

// 1. Singleton Transporter: Initialize ONCE to keep the connection pool warm.
// This prevents "Connection closed" errors caused by opening/closing SMTP sockets constantly.
const transporter = process.env.SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // Use TLS for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // MUST be a Google App Password
      },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  react,
  from,
}: SendEmailOptions) {
  // Use the local file generator if not configured for production
  if (isDev || !transporter) {
    await sendEmailDev({ to, subject, react, from });
    return;
  }

  await sendEmailNodemailer({ to, subject, react, from });
}

async function sendEmailDev({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);
  const dir = path.join(process.cwd(), ".next", "emails");
  fs.mkdirSync(dir, { recursive: true });

  const slug = subject.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const filepath = path.join(dir, `${slug}-${Date.now()}.html`);

  fs.writeFileSync(filepath, html);
  console.log(`[email] Preview logged to: ${filepath}`);
}

async function sendEmailNodemailer({
  to,
  subject,
  react,
  from,
}: SendEmailOptions) {
  if (!transporter) throw new Error("SMTP transporter not initialized.");

  // Convert React to HTML
  const html = await render(react);

  // Use EMAIL_FROM env var, or fallback to store setting
  const fromAddress = from || process.env.EMAIL_FROM || getStoreEmailFrom();

  if (!from && isStoreEmailFromFallback()) {
    console.warn(
      "[email] EMAIL_FROM is using fallback — verify this is authorized by your SMTP provider.",
    );
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    console.log("[email] Sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("[email] Failed to send:", error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
