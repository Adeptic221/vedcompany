import type { Car } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { getTotalPrice } from "@/data/cars";

export const DELIVERY_DEFAULTS = {
  vladivostokBase: 180_000,
  moscowTransport: 350_000,
  insurancePercent: 0.008,
  moscowExtraDays: 14,
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
    vladivostokBase: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_VLADIVOSTOK_BASE,
      process.env.DELIVERY_VLADIVOSTOK_BASE,
      DELIVERY_DEFAULTS.vladivostokBase
    ),
    moscowTransport: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_MOSCOW_TRANSPORT,
      process.env.DELIVERY_MOSCOW_TRANSPORT,
      DELIVERY_DEFAULTS.moscowTransport
    ),
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
  };
}

/** Insurance is included in the delivery total (not shown separately). */
export function getDeliveryCost(
  destination: DeliveryDestination,
  carPriceRub: number
): number {
  if (destination === "none") return 0;

  const { vladivostokBase, moscowTransport, insurancePercent } = getDeliveryConfig();
  const insurance = Math.round(carPriceRub * insurancePercent);

  if (destination === "vladivostok") {
    return vladivostokBase + insurance;
  }
  if (destination === "moscow") {
    return vladivostokBase + moscowTransport + insurance;
  }
  return 0;
}

export function getGrandTotal(
  car: Car,
  destination: DeliveryDestination
): number {
  return getTotalPrice(car) + getDeliveryCost(destination, car.price);
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
      hint: `Растаможка и передача на стоянку · ~${daysLabel}`,
    };
  }
  return {
    label: "Доставка до Москвы",
    hint: `Автовоз Владивосток → Москва · ~${daysLabel}`,
  };
}

export const DELIVERY_DESTINATIONS: Exclude<DeliveryDestination, "none">[] = [
  "vladivostok",
  "moscow",
];
