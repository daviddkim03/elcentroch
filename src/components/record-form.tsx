"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { churchTimeToIso, isoToChurchTime } from "@/lib/church-time";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type Field = {
  name: string;
  ko: string;
  en: string;
  type?: "text" | "textarea" | "date" | "datetime" | "number" | "money" | "select" | "checkbox" | "email" | "tel" | "youtube" | "file";
  required?: boolean;
  max?: number;
  options?: { value: string; label: string }[];
  hint?: string;
  half?: boolean;
  default?: unknown;
};
export type Values = Record<string, unknown>;

const youtubeId = (v: string) =>
  v.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(v) ? v : null);


/** A form described by its fields. Blank optional fields are submitted as null. */
export function RecordForm({
  fields,
  values,
  onSubmit,
  submitLabel,
  children,
}: {
  fields: Field[];
  values?: object | null;
  onSubmit: (v: Values) => Promise<unknown>;
  submitLabel?: string;
  children?: React.ReactNode;
}) {
  const { t } = useLang();
  const base = useId();
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodType> = {};
    const need = t("필수 항목입니다.", "This is required.");
    for (const f of fields) {
      if (f.type === "checkbox") shape[f.name] = z.boolean();
      else if (f.type === "file") shape[f.name] = z.any();
      else {
        let s = z.string().trim().max(f.max ?? (f.type === "textarea" ? 4000 : 200), t("너무 깁니다.", "Too long."));
        if (f.required) s = s.min(1, need);
        shape[f.name] =
          f.type === "youtube"
            ? s.refine((v) => !v || youtubeId(v), t("유튜브 주소를 확인해 주세요.", "Check the YouTube link."))
            : f.type === "email"
              ? s.refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), t("이메일을 확인해 주세요.", "Check the email."))
              : f.type === "number" || f.type === "money"
                ? s.refine((v) => !v || Number(v) > 0, t("0보다 큰 수를 입력해 주세요.", "Enter a number above 0."))
                : s;
      }
    }
    return z.object(shape);
  }, [fields, t]);

  const defaults = useMemo(() => {
    const out: Values = {};
    for (const f of fields) {
      const v = (values as Values | null | undefined)?.[f.name] ?? f.default;
      out[f.name] =
        f.type === "checkbox" ? !!v : f.type === "file" ? undefined : v == null ? "" : f.type === "datetime" ? isoToChurchTime(String(v)) : String(v);
    }
    return out;
  }, [fields, values]);

  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (raw) => {
    const out: Values = {};
    for (const f of fields) {
      const v = raw[f.name];
      if (f.type === "checkbox") out[f.name] = v;
      else if (f.type === "file") out[f.name] = (v as FileList | undefined)?.[0] ?? null;
      else if (v === "") out[f.name] = null;
      else if (f.type === "number" || f.type === "money") out[f.name] = Number(v);
      else if (f.type === "datetime") out[f.name] = churchTimeToIso(v as string);
      else if (f.type === "youtube") out[f.name] = youtubeId(v as string);
      else out[f.name] = v;
    }
    await onSubmit(out);
  });

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((f) => {
        const id = base + f.name;
        const err = formState.errors[f.name]?.message as string | undefined;
        const shared = { id, "aria-invalid": !!err, "aria-describedby": err ? id + "e" : undefined, ...register(f.name) };
        if (f.type === "checkbox")
          return (
            <label key={f.name} className="col-span-2 flex min-h-6 cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" {...shared} className="size-4 shrink-0 accent-primary" />
              <span>{t(f.ko, f.en)}</span>
            </label>
          );
        return (
          <div key={f.name} className={cn("min-w-0 space-y-2", f.half ? "col-span-2 sm:col-span-1" : "col-span-2")}>
            <Label htmlFor={id}>
              {t(f.ko, f.en)}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            {f.type === "textarea" ? (
              <Textarea {...shared} />
            ) : f.type === "select" ? (
              <NativeSelect {...shared} className="h-11 md:h-9">
                {!f.required && <option value="">-</option>}
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <Input
                {...shared}
                className="h-11 md:h-9"
                type={
                  f.type === "datetime"
                    ? "datetime-local"
                    : f.type === "number" || f.type === "money"
                      ? "number"
                      : f.type === "youtube"
                        ? "text"
                        : (f.type ?? "text")
                }
                step={f.type === "money" ? "0.01" : undefined}
                accept={f.type === "file" ? "application/pdf,image/*" : undefined}
              />
            )}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            {err && (
              <p id={id + "e"} className="text-xs text-destructive">
                {err}
              </p>
            )}
          </div>
        );
      })}
      <div className="col-span-2 flex flex-wrap items-center gap-3 pt-2">
        <Button className="h-11 md:h-9" disabled={formState.isSubmitting}>{submitLabel ?? t("저장", "Save")}</Button>
        {children}
      </div>
    </form>
  );
}
