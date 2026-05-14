"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LeadType } from "@prisma/client";

function schemaFor(type: LeadType) {
  const base = z.object({
    name: z.string().min(2, "Укажите имя"),
    phone: z.string().min(10, "Укажите телефон"),
    email: z.string().optional(),
    message: z.string().optional(),
    carSlug: z.string().optional(),
    preferredDate: z.string().optional(),
    deposit: z.coerce.number().optional(),
    termMonths: z.coerce.number().optional(),
    tradeBrand: z.string().optional(),
    tradeModel: z.string().optional(),
    tradeYear: z.coerce.number().optional(),
    tradeMileage: z.coerce.number().optional(),
    vinOrPlate: z.string().optional(),
    serviceType: z.string().optional(),
    serviceDate: z.string().optional(),
    callbackTime: z.string().optional(),
    consent: z.boolean().refine((v) => v === true, { message: "Нужно согласие" }),
  });

  return base.superRefine((data, ctx) => {
    if (type === LeadType.TEST_DRIVE && !data.preferredDate) {
      ctx.addIssue({ code: "custom", path: ["preferredDate"], message: "Укажите дату" });
    }
    if (type === LeadType.TRADE_IN) {
      if (!data.tradeBrand) ctx.addIssue({ code: "custom", path: ["tradeBrand"], message: "Укажите марку" });
      if (!data.tradeModel) ctx.addIssue({ code: "custom", path: ["tradeModel"], message: "Укажите модель" });
    }
    if (type === LeadType.SERVICE) {
      if (!data.vinOrPlate) ctx.addIssue({ code: "custom", path: ["vinOrPlate"], message: "Укажите VIN или номер" });
      if (!data.serviceType) ctx.addIssue({ code: "custom", path: ["serviceType"], message: "Укажите тип услуги" });
    }
    if (type === LeadType.QUESTION && !data.message) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Введите сообщение" });
    }
    if (type === LeadType.CONSULTATION && !data.message) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Опишите запрос или вопрос" });
    }
  });
}

export type LeadFormValues = z.infer<ReturnType<typeof schemaFor>>;

export function LeadForm({
  type,
  carSlug,
  submitLabel,
}: {
  type: LeadType;
  carSlug?: string;
  submitLabel?: string;
}) {
  const schema = useMemo(() => schemaFor(type), [type]);
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      carSlug: carSlug ?? "",
      preferredDate: "",
      deposit: undefined,
      termMonths: undefined,
      tradeBrand: "",
      tradeModel: "",
      tradeYear: undefined,
      tradeMileage: undefined,
      vinOrPlate: "",
      serviceType: "",
      serviceDate: "",
      callbackTime: "",
      consent: false,
    },
  });

  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const onSubmit = form.handleSubmit(async (values) => {
    setStatus("idle");
    const meta: Record<string, unknown> = {};
    if (values.preferredDate) meta.preferredDate = values.preferredDate;
    if (values.deposit != null) meta.deposit = values.deposit;
    if (values.termMonths != null) meta.termMonths = values.termMonths;
    if (values.tradeBrand) {
      meta.trade = {
        brand: values.tradeBrand,
        model: values.tradeModel,
        year: values.tradeYear,
        mileage: values.tradeMileage,
      };
    }
    if (values.callbackTime) meta.callbackTime = values.callbackTime;
    if (values.vinOrPlate) meta.vinOrPlate = values.vinOrPlate;
    if (values.serviceType) meta.serviceType = values.serviceType;
    if (values.serviceDate) meta.serviceDate = values.serviceDate;
    if (type === LeadType.CONSULTATION) {
      meta.source = "Форма «Консультация» на главной";
    }

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        message: values.message || undefined,
        carSlug: values.carSlug || carSlug || undefined,
        meta,
        consent: true,
      }),
    });
    if (!res.ok) {
      setStatus("err");
      return;
    }
    setStatus("ok");
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-sub">Имя</label>
          <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("name")} />
          {form.formState.errors.name && <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm text-sub">Телефон</label>
          <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("phone")} />
          {form.formState.errors.phone && <p className="mt-1 text-xs text-red-600">{form.formState.errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="text-sm text-sub">Email (необязательно)</label>
        <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("email")} />
      </div>

      {type === LeadType.TEST_DRIVE && (
        <div>
          <label className="text-sm text-sub">Желаемая дата</label>
          <input type="date" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("preferredDate")} />
          {form.formState.errors.preferredDate && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.preferredDate.message}</p>
          )}
        </div>
      )}

      {type === LeadType.CREDIT && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-sub">Первый взнос, ₸</label>
            <input type="number" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("deposit")} />
          </div>
          <div>
            <label className="text-sm text-sub">Срок, мес.</label>
            <input type="number" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("termMonths")} />
          </div>
        </div>
      )}

      {type === LeadType.TRADE_IN && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-sub">Марка</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("tradeBrand")} />
          </div>
          <div>
            <label className="text-sm text-sub">Модель</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("tradeModel")} />
          </div>
          <div>
            <label className="text-sm text-sub">Год</label>
            <input type="number" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("tradeYear")} />
          </div>
          <div>
            <label className="text-sm text-sub">Пробег, км</label>
            <input type="number" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("tradeMileage")} />
          </div>
        </div>
      )}

      {type === LeadType.CALLBACK && (
        <div>
          <label className="text-sm text-sub">Удобное время звонка</label>
          <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("callbackTime")} />
        </div>
      )}

      {type === LeadType.SERVICE && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-sub">VIN / гос. номер</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("vinOrPlate")} />
          </div>
          <div>
            <label className="text-sm text-sub">Тип услуги</label>
            <input className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("serviceType")} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-sub">Дата</label>
            <input type="date" className="mt-1 w-full rounded-btn border border-black/10 px-3 py-2" {...form.register("serviceDate")} />
          </div>
        </div>
      )}

      {(type === LeadType.QUESTION ||
        type === LeadType.CONSULTATION ||
        type === LeadType.PURCHASE ||
        type === LeadType.QUICK) && (
        <div>
          <label className="text-sm text-sub">Сообщение</label>
          <textarea rows={4} className="mt-1 w-full rounded-card border border-black/10 px-3 py-2" {...form.register("message")} />
          {form.formState.errors.message && <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>}
        </div>
      )}

      {carSlug ? <input type="hidden" {...form.register("carSlug")} /> : null}

      <Controller
        name="consent"
        control={form.control}
        render={({ field }) => (
          <label className="flex items-start gap-2 text-sm text-sub">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            <span>Согласен с обработкой персональных данных</span>
          </label>
        )}
      />
      {form.formState.errors.consent && <p className="text-xs text-red-600">{form.formState.errors.consent.message}</p>}

      <button type="submit" className="w-full rounded-btn bg-primary py-3 text-sm font-semibold text-white hover:bg-neutral-800">
        {submitLabel ?? "Отправить"}
      </button>

      {status === "ok" && <p className="text-sm text-green-700">Заявка отправлена. Мы свяжемся с вами.</p>}
      {status === "err" && <p className="text-sm text-red-600">Не удалось отправить. Попробуйте позже.</p>}
    </form>
  );
}
