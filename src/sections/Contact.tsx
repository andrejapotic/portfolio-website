'use client'

import Script from "next/script";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import ArrowUpRightIcon from "@/assets/icons/arrow-up-right.svg"
import grainImage from "@/assets/images/grain.jpg"

type FieldName = "name" | "email" | "message";

type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName | "turnstile", string>>;
type SubmitState = "idle" | "success" | "error";

interface TurnstileRenderOptions {
  sitekey: string;
  size?: "normal" | "compact" | "flexible";
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
};

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID?.trim() ?? "";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

const getFormspreeEndpoint = (value: string) => {
  if (!value) {
    return "";
  }

  return value.startsWith("https://formspree.io/f/")
    ? value
    : `https://formspree.io/f/${value}`;
};

const validateForm = (values: FormValues) => {
  const errors: FormErrors = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedMessage = values.message.trim();

  if (!trimmedName) {
    errors.name = "Please enter your name.";
  }

  if (!trimmedEmail) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!trimmedMessage) {
    errors.message = "Please share a brief message.";
  }

  return errors;
};

export const ContactSection = () => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const formspreeEndpoint = getFormspreeEndpoint(FORMSPREE_FORM_ID);
  const isFormConfigured = formspreeEndpoint.length > 0;
  const isTurnstileConfigured = TURNSTILE_SITE_KEY.length > 0;
  const fieldErrors = validateForm(values);
  const turnstileError = isTurnstileConfigured && showValidation && !turnstileToken
    ? "Please complete the verification check."
    : "";

  const clearFeedback = () => {
    if (submitState !== "idle") {
      setSubmitState("idle");
      setSubmitMessage("");
    }
  };

  const resetTurnstile = () => {
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
    setTurnstileToken("");
  };

  useEffect(() => {
    if (
      !isTurnstileReady ||
      !isTurnstileConfigured ||
      !turnstileContainerRef.current ||
      !window.turnstile ||
      turnstileWidgetIdRef.current
    ) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      size: "flexible",
      theme: "light",
      callback: (token) => {
        setTurnstileToken(token);
        setSubmitState("idle");
        setSubmitMessage("");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setSubmitState("error");
        setSubmitMessage("Verification could not be loaded. Please refresh and try again.");
      },
      "expired-callback": () => {
        setTurnstileToken("");
      },
    });

    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [isTurnstileConfigured, isTurnstileReady]);

  const handleFieldChange = (field: FieldName, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    clearFeedback();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowValidation(true);
    clearFeedback();

    if (honeypot) {
      setSubmitState("success");
      setSubmitMessage("Thanks for reaching out. Your message has been received.");
      return;
    }

    if (!isFormConfigured || !isTurnstileConfigured) {
      setSubmitState("error");
      setSubmitMessage("Add your Formspree form ID and Turnstile site key to enable this form.");
      return;
    }

    if (Object.keys(fieldErrors).length > 0 || !turnstileToken) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("email", values.email.trim());
    formData.append("message", values.message.trim());
    formData.append("_gotcha", honeypot);
    formData.append("cf-turnstile-response", turnstileToken);

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.errors?.[0]?.message ?? "Something went wrong. Please try again in a moment.";

        setSubmitState("error");
        setSubmitMessage(errorMessage);
        resetTurnstile();
        return;
      }

      setValues(initialValues);
      setTouched({
        name: false,
        email: false,
        message: false,
      });
      setShowValidation(false);
      setSubmitState("success");
      setSubmitMessage("Thanks for reaching out. Your message has been sent.");
      resetTurnstile();
    } catch {
      setSubmitState("error");
      setSubmitMessage("Unable to send your message right now. Please try again shortly.");
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: FieldName) => {
    if (!showValidation && !touched[field]) {
      return "";
    }

    return fieldErrors[field] ?? "";
  };

  return (
    <div id="contact" className="py-16 pt-12 lg:py-24 lg:pt-20 scroll-mt-24">
      {isTurnstileConfigured ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setIsTurnstileReady(true)}
          onError={() => {
            setSubmitState("error");
            setSubmitMessage("Verification could not be loaded. Please refresh and try again.");
          }}
        />
      ) : null}
      <div className="container">
        <div className="bg-gradient-to-r from-emerald-300 to-sky-400 text-gray-900 rounded-3xl relative overflow-hidden z-0 px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
          <div
            className="absolute inset-0 opacity-5 -z-10"
            style={{
              backgroundImage: `url(${grainImage.src})`
            }}
          ></div>

          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 lg:items-start">
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl">Let&apos;s talk about your next opportunity</h2>
              <p className="mt-3 text-sm md:text-base text-gray-900/80 max-w-lg">
                If you&apos;re hiring, recruiting, or exploring a project, send a quick note here.
                I&apos;ll review it and get back to you as soon as I can.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-5 shadow-lg shadow-gray-900/10 backdrop-blur sm:p-6">
              <form className="space-y-4" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    name="_gotcha"
                    autoComplete="off"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor={nameId} className="block text-sm font-semibold text-gray-900">
                    Name
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                    aria-invalid={Boolean(getError("name"))}
                    aria-describedby={getError("name") ? `${nameId}-error` : undefined}
                    className="mt-2 w-full rounded-xl border border-gray-900/15 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-500 focus:border-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Andreja Potic"
                  />
                  <p id={`${nameId}-error`} className="mt-1 min-h-[1.25rem] text-sm text-red-700">
                    {getError("name")}
                  </p>
                </div>

                <div>
                  <label htmlFor={emailId} className="block text-sm font-semibold text-gray-900">
                    Email
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => handleFieldChange("email", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    aria-invalid={Boolean(getError("email"))}
                    aria-describedby={getError("email") ? `${emailId}-error` : undefined}
                    className="mt-2 w-full rounded-xl border border-gray-900/15 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-500 focus:border-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="you@company.com"
                  />
                  <p id={`${emailId}-error`} className="mt-1 min-h-[1.25rem] text-sm text-red-700">
                    {getError("email")}
                  </p>
                </div>

                <div>
                  <label htmlFor={messageId} className="block text-sm font-semibold text-gray-900">
                    Message
                  </label>
                  <textarea
                    id={messageId}
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={(event) => handleFieldChange("message", event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, message: true }))}
                    aria-invalid={Boolean(getError("message"))}
                    aria-describedby={getError("message") ? `${messageId}-error` : undefined}
                    className="mt-2 w-full rounded-xl border border-gray-900/15 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-500 focus:border-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    placeholder="Tell me a little about the role, timeline, or what you need help with."
                  />
                  <p id={`${messageId}-error`} className="mt-1 min-h-[1.25rem] text-sm text-red-700">
                    {getError("message")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900" htmlFor="turnstile-widget">
                    Verification
                  </label>
                  <div className="mt-2 rounded-xl border border-gray-900/15 bg-white px-3 py-3">
                    {isTurnstileConfigured ? (
                      <div id="turnstile-widget" ref={turnstileContainerRef} />
                    ) : (
                      <p className="text-sm text-gray-700">
                        Add your Turnstile site key to enable verification.
                      </p>
                    )}
                  </div>
                  <p className="mt-1 min-h-[1.25rem] text-sm text-red-700">
                    {turnstileError}
                  </p>
                </div>

                {!isFormConfigured || !isTurnstileConfigured ? (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-100/80 px-4 py-3 text-sm text-amber-900">
                    Add `NEXT_PUBLIC_FORMSPREE_FORM_ID` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` before going live.
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormConfigured || !isTurnstileConfigured}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 font-semibold text-white transition hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send message"}</span>
                    <ArrowUpRightIcon className="size-4" />
                  </button>

                  <div aria-live="polite" className="min-h-[3rem] text-sm sm:max-w-[14rem] sm:text-right">
                    {submitMessage ? (
                      <p className={submitState === "error" ? "text-red-700" : "text-green-800"}>
                        {submitMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
