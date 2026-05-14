"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BodyType,
  CarCondition,
  CarStatus,
  FuelType,
  TransmissionType,
} from "@prisma/client";

type TrimRow = { name: string; price: string; options: string };

const bodyLabels: Record<BodyType, string> = {
  SEDAN: "Седан",
  SUV: "SUV",
  HATCHBACK: "Хэтчбек",
  CROSSOVER: "Кроссовер",
  MINIVAN: "Минивэн",
};
const fuelLabels: Record<FuelType, string> = {
  PETROL: "Бензин",
  DIESEL: "Дизель",
  HYBRID: "Гибрид",
  ELECTRIC: "Электро",
};
const transLabels: Record<TransmissionType, string> = {
  AUTO: "Автомат",
  MANUAL: "Механика",
  VARIATOR: "Вариатор",
};

function slugify(brand: string, model: string, year: string) {
  const raw = `${brand}-${model}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw || "auto";
}

export function NewCarForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [slugManual, setSlugManual] = useState("");
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.CROSSOVER);
  const [fuel, setFuel] = useState<FuelType>(FuelType.PETROL);
  const [transmission, setTransmission] = useState<TransmissionType>(TransmissionType.AUTO);
  const [condition, setCondition] = useState<CarCondition>(CarCondition.NEW);
  const [status, setStatus] = useState<CarStatus>(CarStatus.IN_STOCK);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [mileage, setMileage] = useState("0");
  const [engine, setEngine] = useState("");
  const [drive, setDrive] = useState("");
  const [acceleration, setAcceleration] = useState("");
  const [maxSpeed, setMaxSpeed] = useState("");
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [trunkVolume, setTrunkVolume] = useState("");
  const [color, setColor] = useState("");
  const [vin, setVin] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [titleSeo, setTitleSeo] = useState("");
  const [descSeo, setDescSeo] = useState("");
  const [imagesText, setImagesText] = useState("https://picsum.photos/seed/newcar/1200/675");
  const [trims, setTrims] = useState<TrimRow[]>([{ name: "Базовая", price: "", options: "" }]);

  const autoSlug = useMemo(() => slugify(brand, model, year), [brand, model, year]);

  function addTrim() {
    setTrims((t) => [...t, { name: "", price: "", options: "" }]);
  }
  function removeTrim(i: number) {
    setTrims((t) => t.filter((_, idx) => idx !== i));
  }
  function setTrim(i: number, patch: Partial<TrimRow>) {
    setTrims((t) => t.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("upload failed");
    const j = (await res.json()) as { url: string };
    return j.url;
  }

  async function onUploadClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        const url = await uploadFile(f);
        setImagesText((prev) => (prev.trim() ? `${prev.trim()}\n${url}` : url));
      } catch {
        setError("Не удалось загрузить файл");
      }
    };
    input.click();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const images = imagesText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!images.length) {
      setError("Добавьте хотя бы одно изображение (URL или загрузка)");
      setSaving(false);
      return;
    }

    const trimPayload = trims
      .map((tr) => ({
        name: tr.name.trim(),
        price: parseInt(tr.price.replace(/\s/g, ""), 10),
        options: tr.options
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((t) => t.name && Number.isFinite(t.price));

    if (!trimPayload.length) {
      setError("Укажите хотя бы одну комплектацию с названием и ценой");
      setSaving(false);
      return;
    }

    const tagsArr = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const y = parseInt(year, 10);
    const priceNum = priceFrom ? parseInt(priceFrom.replace(/\s/g, ""), 10) : null;
    const mileageNum = parseInt(mileage.replace(/\s/g, ""), 10) || 0;

    const payload = {
      brand: brand.trim(),
      model: model.trim(),
      year: y,
      slug: slugManual.trim() || undefined,
      bodyType,
      fuel,
      transmission,
      condition,
      priceFrom: priceOnRequest ? null : priceNum,
      priceOnRequest,
      mileage: mileageNum,
      engine: engine.trim(),
      drive: drive.trim(),
      acceleration: acceleration.trim(),
      maxSpeed: maxSpeed.trim(),
      fuelConsumption: fuelConsumption.trim(),
      trunkVolume: trunkVolume.trim(),
      color: color.trim(),
      vin: vin.trim() || null,
      description: description.trim(),
      status,
      tags: tagsArr,
      featured,
      titleSeo: titleSeo.trim() || null,
      descSeo: descSeo.trim() || null,
      images,
      trims: trimPayload,
    };

    const res = await fetch("/api/admin/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(JSON.stringify(j, null, 2));
      return;
    }
    const data = (await res.json()) as { car: { id: string } };
    router.replace(`/admin/cars/${data.car.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-card bg-white p-6 shadow-card">
      <div>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Новый автомобиль</h1>
        <p className="mt-2 text-sm text-neutral-600">Заполните поля и сохраните. Slug по умолчанию: {autoSlug || "—"}</p>
      </div>

      {error && <pre className="max-h-48 overflow-auto rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">{error}</pre>}

      <fieldset className="grid gap-4 md:grid-cols-3">
        <legend className="col-span-full font-heading text-sm font-bold text-neutral-900">Основное</legend>
        <label className="text-sm">
          Марка *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={brand} onChange={(e) => setBrand(e.target.value)} required />
        </label>
        <label className="text-sm">
          Модель *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={model} onChange={(e) => setModel(e.target.value)} required />
        </label>
        <label className="text-sm">
          Год *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
        </label>
        <label className="text-sm md:col-span-3">
          Slug (необязательно, латиница)
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={slugManual} onChange={(e) => setSlugManual(e.target.value)} placeholder={autoSlug} />
        </label>
        <label className="text-sm">
          Кузов *
          <select className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={bodyType} onChange={(e) => setBodyType(e.target.value as BodyType)}>
            {(Object.keys(bodyLabels) as BodyType[]).map((k) => (
              <option key={k} value={k}>
                {bodyLabels[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Топливо *
          <select className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={fuel} onChange={(e) => setFuel(e.target.value as FuelType)}>
            {(Object.keys(fuelLabels) as FuelType[]).map((k) => (
              <option key={k} value={k}>
                {fuelLabels[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          КПП *
          <select className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={transmission} onChange={(e) => setTransmission(e.target.value as TransmissionType)}>
            {(Object.keys(transLabels) as TransmissionType[]).map((k) => (
              <option key={k} value={k}>
                {transLabels[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Состояние *
          <select className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={condition} onChange={(e) => setCondition(e.target.value as CarCondition)}>
            <option value="NEW">Новый</option>
            <option value="USED">С пробегом</option>
          </select>
        </label>
        <label className="text-sm">
          Статус витрины *
          <select className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as CarStatus)}>
            <option value="IN_STOCK">В наличии</option>
            <option value="ON_ORDER">Под заказ</option>
            <option value="SOLD">Продано</option>
            <option value="ARCHIVE">Архив</option>
          </select>
        </label>
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          В блоке «популярные» на главной
        </label>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-3">
        <legend className="col-span-full font-heading text-sm font-bold text-neutral-900">Цена и пробег</legend>
        <label className="flex items-end gap-2 text-sm md:col-span-3">
          <input type="checkbox" checked={priceOnRequest} onChange={(e) => setPriceOnRequest(e.target.checked)} />
          Цена по запросу
        </label>
        <label className="text-sm">
          Цена «от», ₸
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} disabled={priceOnRequest} />
        </label>
        <label className="text-sm">
          Пробег, км
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={mileage} onChange={(e) => setMileage(e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="col-span-full font-heading text-sm font-bold text-neutral-900">Техника</legend>
        <label className="text-sm md:col-span-2">
          Двигатель *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={engine} onChange={(e) => setEngine(e.target.value)} required placeholder="2.0 л, 150 л.с., бензин" />
        </label>
        <label className="text-sm">
          Привод *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={drive} onChange={(e) => setDrive(e.target.value)} required />
        </label>
        <label className="text-sm">
          Разгон 0–100 *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={acceleration} onChange={(e) => setAcceleration(e.target.value)} required />
        </label>
        <label className="text-sm">
          Vmax *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={maxSpeed} onChange={(e) => setMaxSpeed(e.target.value)} required />
        </label>
        <label className="text-sm">
          Расход *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={fuelConsumption} onChange={(e) => setFuelConsumption(e.target.value)} required />
        </label>
        <label className="text-sm">
          Багажник *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={trunkVolume} onChange={(e) => setTrunkVolume(e.target.value)} required />
        </label>
        <label className="text-sm">
          Цвет *
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={color} onChange={(e) => setColor(e.target.value)} required />
        </label>
        <label className="text-sm">
          VIN
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={vin} onChange={(e) => setVin(e.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-heading text-sm font-bold text-neutral-900">Описание *</legend>
        <textarea className="mt-2 w-full rounded border border-neutral-300 px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </fieldset>

      <fieldset>
        <legend className="font-heading text-sm font-bold text-neutral-900">Теги (через запятую)</legend>
        <input className="mt-2 w-full rounded border border-neutral-300 px-3 py-2 text-sm" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Новинка, Акция" />
      </fieldset>

      <fieldset>
        <legend className="font-heading text-sm font-bold text-neutral-900">SEO</legend>
        <label className="mt-2 block text-sm">
          Title
          <input className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" value={titleSeo} onChange={(e) => setTitleSeo(e.target.value)} />
        </label>
        <label className="mt-2 block text-sm">
          Description
          <textarea className="mt-1 w-full rounded border border-neutral-300 px-3 py-2" rows={2} value={descSeo} onChange={(e) => setDescSeo(e.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-heading text-sm font-bold text-neutral-900">Фото (URL, по одному в строке) *</legend>
        <textarea className="mt-2 w-full rounded border border-neutral-300 px-3 py-2 font-mono text-xs" rows={4} value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
        <button type="button" className="mt-2 rounded border border-neutral-900 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-100" onClick={onUploadClick}>
          Загрузить файл на сервер
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-sm font-bold text-neutral-900">Комплектации *</legend>
        {trims.map((tr, i) => (
          <div key={i} className="grid gap-2 rounded border border-neutral-200 p-3 md:grid-cols-12">
            <input className="md:col-span-3 rounded border border-neutral-300 px-2 py-1 text-sm" placeholder="Название" value={tr.name} onChange={(e) => setTrim(i, { name: e.target.value })} />
            <input className="md:col-span-3 rounded border border-neutral-300 px-2 py-1 text-sm" placeholder="Цена ₸" value={tr.price} onChange={(e) => setTrim(i, { price: e.target.value })} />
            <input className="md:col-span-5 rounded border border-neutral-300 px-2 py-1 text-sm" placeholder="Опции через запятую" value={tr.options} onChange={(e) => setTrim(i, { options: e.target.value })} />
            <button type="button" className="md:col-span-1 text-sm text-red-700" onClick={() => removeTrim(i)} disabled={trims.length === 1}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="text-sm font-semibold underline" onClick={addTrim}>
          + комплектация
        </button>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-neutral-900 px-6 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Сохранение…" : "Создать автомобиль"}
        </button>
      </div>
    </form>
  );
}
