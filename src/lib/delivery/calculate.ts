import type { Car, CarType } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { getTotalPrice } from "@/data/cars";

/** Local Vladivostok logistics + Moscow auto transport — no VED margin. */
export const DELIVERY_DEFAULTS = {
  /** Vladivostok handoff / parking / local logistics by body type. */
  vladivostokByType: {
    hatchback: 90_000,
    sedan: 100_000,
    coupe: 105_000,
    crossover: 115_000,
    suv: 125_000,
  } as Record<CarType, number>,
  /** Auto transport Vladivostok → Moscow by body type (market 2026). */
  moscowTransportByType: {
    hatchback: 175_000,
    sedan: 180_000,
    coupe: 185_000,
    crossover: 210_000,
    suv: 230_000,
  } as Record<CarType, number>,
  /** Cargo insurance — % of car cost (Vladivostok and Moscow). */
  insurancePercent: 0.008,
  moscowExtraDays: 20,
} as const;

function readNumber(
  publicKey: string | undefined,
  serverKey: string | undefined,
  fallback: number
): number {
  const raw = publicKey ?? serverKey;
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function getDeliveryConfig() {
  return {
    insurancePercent: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_INSURANCE_PERCENT,
      process.env.DELIVERY_INSURANCE_PERCENT,
      DELIVERY_DEFAULTS.insurancePercent
    ),
    moscowExtraDays: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_MOSCOW_EXTRA_DAYS,
      process.env.DELIVERY_MOSCOW_EXTRA_DAYS,
      DELIVERY_DEFAULTS.moscowExtraDays
    ),
    vladivostokByType: DELIVERY_DEFAULTS.vladivostokByType,
    moscowTransportByType: DELIVERY_DEFAULTS.moscowTransportByType,
  };
}

export function getVladivostokLogisticsCost(type: CarType): number {
  return (
    getDeliveryConfig().vladivostokByType[type] ??
    DELIVERY_DEFAULTS.vladivostokByType.sedan
  );
}

export function getMoscowTransportCost(type: CarType): number {
  return (
    getDeliveryConfig().moscowTransportByType[type] ??
    DELIVERY_DEFAULTS.moscowTransportByType.sedan
  );
}

export function getDeliveryInsurance(carPriceRub: number): number {
  const { insurancePercent } = getDeliveryConfig();
  return Math.round(carPriceRub * insurancePercent);
}

type DeliveryCar = Pick<Car, "type" | "price">;

/**
 * Delivery at cost (no VED profit).
 * Both destinations: body-type rate + insurance from car value.
 * Moscow adds auto-transport by body type on top of Vladivostok logistics.
 */
export function getDeliveryCost(
  destination: DeliveryDestination,
  car: DeliveryCar
): number {
  if (destination === "none") return 0;

  const local = getVladivostokLogisticsCost(car.type);
  const insurance = getDeliveryInsurance(car.price);

  if (destination === "vladivostok") {
    return local + insurance;
  }

  if (destination === "moscow") {
    const transport = getMoscowTransportCost(car.type);
    return local + transport + insurance;
  }

  return 0;
}

export function getGrandTotal(car: Car, destination: DeliveryDestination): number {
  return getTotalPrice(car) + getDeliveryCost(destination, car);
}

export function getDeliveryDays(
  destination: DeliveryDestination,
  baseDays: number
): number {
  if (destination === "none") return baseDays;
  if (destination === "vladivostok") return baseDays;
  if (destination === "moscow") {
    return baseDays + getDeliveryConfig().moscowExtraDays;
  }
  return baseDays;
}

export function formatDeliveryDays(days: number): string {
  const mod10 = days % 10;
  const mod100 = days % 100;
  if (mod10 === 1 && mod100 !== 11) return `${days} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${days} дня`;
  }
  return `${days} дней`;
}

export function getDeliveryOptionMeta(
  destination: Exclude<DeliveryDestination, "none">,
  baseDays: number
) {
  const days = getDeliveryDays(destination, baseDays);
  const daysLabel = formatDeliveryDays(days);
  if (destination === "vladivostok") {
    return {
      label: "Доставка во Владивосток",
      hint: `По типу кузова + страховка · ~${daysLabel}`,
    };
  }
  return {
    label: "Доставка до Москвы",
    hint: `Владивосток + автовоз по типу + страховка · ~${daysLabel}`,
  };
}

export const DELIVERY_DESTINATIONS: Exclude<DeliveryDestination, "none">[] = [
  "vladivostok",
  "moscow",
];
