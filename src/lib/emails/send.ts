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

export async function sendEmail({
  to,
  subject,
  react,
  from,
}: SendEmailOptions) {
  // Use the mock email generator in development or if SMTP isn't configured yet
  if (isDev || !process.env.SMTP_USER) {
    await sendEmailDev({ to, subject, react, from });
    return;
  }

  await sendEmailNodemailer({ to, subject, react, from });
}

/**
 * Dev mode: render email to HTML, log summary to console,
 * and write the HTML file to .next/emails/ for browser preview.
 */
async function sendEmailDev({ to, subject, react }: SendEmailOptions) {
  const html = await render(react);

  const dir = path.join(process.cwd(), ".next", "emails");
  fs.mkdirSync(dir, { recursive: true });

  const slug = subject.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const timestamp = Date.now();
  const filename = `${slug}-${timestamp}.html`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, html);

  console.log("\n╭──────────────────────────────────────────────");
  console.log(`│ 📧 Email Preview (dev mode — not sent)`);
  console.log("├──────────────────────────────────────────────");
  console.log(`│ To:      ${to}`);
  console.log(`│ Subject: ${subject}`);
  console.log(`│ Preview: file://${filepath}`);
  console.log("╰──────────────────────────────────────────────\n");
}

/**
 * Production: send via Google Workspace / Nodemailer.
 */
async function sendEmailNodemailer({
  to,
  subject,
  react,
  from,
}: SendEmailOptions) {
  // 1. Convert the React Component into a raw HTML string
  const html = await render(react);

  const fromAddress = from || process.env.EMAIL_FROM || getStoreEmailFrom();

  if (!from && isStoreEmailFromFallback()) {
    console.warn(
      "[email] EMAIL_FROM is not set — using fallback 'orders@example.com' which will likely bounce.",
    );
  }

  // 2. Configure the Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // 3. Send the email
  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html, // Provide the rendered React HTML here
    });

    console.log("[email] Sent successfully:", info.messageId);
  } catch (error) {
    console.error("[email] Failed to send:", error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
