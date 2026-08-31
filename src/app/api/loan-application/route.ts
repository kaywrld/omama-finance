import { NextRequest, NextResponse } from "next/server";
import {
  loanApplicationSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES,
  ACCEPTED_FILE_TYPES,
} from "@/lib/validations/loanApplication";
import { generateLoanApplicationPdf } from "@/lib/generateLoanApplicationPdf";
import { isMailerConfigured, sendLoanApplicationEmail, type LoanApplicationAttachment } from "@/lib/mailer";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

// Needs Node (fs for the logo, nodemailer, prisma) — not the Edge runtime.
export const runtime = "nodejs";

// This API now lives on a different domain from the static site, so the
// browser will send a CORS preflight (OPTIONS) before the real POST.
// Only the real site origins are allowed — set ALLOWED_ORIGIN in the
// Node app's env vars (comma-separated if you need more than one, e.g.
// "https://omamafinance.co.zw,https://www.omamafinance.co.zw").
const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  const allow = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9_.\- ]/g, "").slice(0, 100) || "document";
}

// Every response below must carry the CORS header, not just the OPTIONS
// preflight — otherwise the browser fetches successfully but blocks the
// site's JS from reading the response.
function json(request: NextRequest, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...corsHeaders(request.headers.get("origin")) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rl = rateLimit(`loan-application:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.success) {
      return json(request, 
        { error: "Too many submissions from this device. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return json(request, { error: "Could not read the submitted form." }, { status: 400 });
    }

    // Split text fields from uploaded files. Empty-string fields are
    // dropped so zod's `.optional()` sees "not provided" rather than "".
    const payload: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "documents" || value instanceof File) continue;
      if (typeof value === "string" && value !== "") payload[key] = value;
    }
    if (typeof payload.agree === "string") {
      payload.agree = payload.agree === "true";
    }

    // Honeypot — real applicants never fill this in. Pretend success so
    // bots don't learn their submission was rejected.
    if (payload.website) {
      return json(request, { ok: true });
    }

    const files = formData.getAll("documents").filter((v): v is File => v instanceof File);
    if (files.length > MAX_FILES) {
      return json(request, { error: `You can attach at most ${MAX_FILES} files.` }, { status: 400 });
    }
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return json(request, 
          { error: `"${file.name}" is larger than 5MB. Please choose a smaller file.` },
          { status: 400 }
        );
      }
      if (file.type && !ACCEPTED_FILE_TYPES.includes(file.type)) {
        return json(request, 
          { error: `"${file.name}" isn't a supported file type. Use PDF, JPG, PNG, or Word.` },
          { status: 400 }
        );
      }
    }

    const parsed = loanApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      return json(request, 
        { error: "Some details need fixing.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!isMailerConfigured()) {
      console.error("Loan application received but SMTP is not configured — email not sent.");
      return json(request, 
        {
          error:
            "We couldn't submit your application online right now. Please call or WhatsApp us directly and we'll take it from there.",
        },
        { status: 503 }
      );
    }

    const { website: _website, ...data } = parsed.data;
    void _website;

    // Build the attachment list: the full application as a PDF (mirrors the
    // paper form), plus whatever supporting documents the applicant attached.
    const attachments: LoanApplicationAttachment[] = [];
    try {
      const pdfBuffer = await generateLoanApplicationPdf(data, { submittedAt: new Date() });
      attachments.push({
        filename: `Loan-Application-${data.fullName.replace(/\s+/g, "-")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    } catch (err) {
      console.error("Failed to generate loan application PDF:", err);
      return json(request, 
        { error: "Something went wrong preparing your application. Please try again." },
        { status: 500 }
      );
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({
        filename: safeFileName(file.name),
        content: buffer,
        contentType: file.type || undefined,
      });
    }

    try {
      await sendLoanApplicationEmail(data, attachments);
    } catch (err) {
      console.error("Failed to send loan application email:", err);
      return json(request, 
        {
          error:
            "We couldn't send your application right now. Please call or WhatsApp us directly and we'll take it from there.",
        },
        { status: 502 }
      );
    }

    // Best-effort record for the future admin view — never blocks the
    // applicant's success response if the database isn't reachable.
    try {
      await prisma.loanApplication.create({
        data: {
          applicationType: data.applicationType,
          loanType: data.loanType,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          idNumber: data.idNumber,
          loanAmount: data.loanAmountRequested,
          loanPurpose: data.loanPurpose,
          guarantorName: data.guarantorName,
          guarantorPhone: data.guarantorPhone,
          formData: data,
          emailSent: true,
          ipAddress: ip,
        },
      });
    } catch (err) {
      console.error("Loan application emailed successfully but DB save failed:", err);
    }

    return json(request, { ok: true });
  } catch (err) {
    console.error("Unexpected error handling loan application:", err);
    return json(request, { error: "Something went wrong. Please try again." }, { status: 500 });
  }
}