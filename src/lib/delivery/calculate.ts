import type { Car, CarType } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { getTotalPrice } from "@/data/cars";

/**
 * Delivery at cost (no VED margin).
 * Client sees one line; internals split China + RF Vlad + Moscow.
 *
 * China (no ships — auto only):
 * - Chinese auto transport to Ussuriysk customs (budgeted)
 * - export broker VED hires in China
 * RF broker (from SVH onward):
 * - clearance + SVH + SBKTS/EPTS + delivery from SVH to Vladivostok
 */
export const DELIVERY_DEFAULTS = {
  /** Chinese auto transport to Ussuriysk customs (RUB). No ships. */
  chinaAutoToUssuriyskRub: 50_000,
  /** Chinese export broker VED hires (RUB). */
  chinaExportBrokerRub: 30_000,
  /**
   * RF broker package (RUB, flat): clearance, SVH, SBKTS/EPTS,
   * and transfer from SVH to Vladivostok handoff.
   */
  russiaVladBrokerRub: 80_000,
  /** Auto transport Vladivostok area -> Moscow by body type. */
  moscowTransportByType: {
    hatchback: 175_000,
    sedan: 180_000,
    coupe: 185_000,
    crossover: 210_000,
    suv: 230_000,
  } as Record<CarType, number>,
  /** Cargo insurance - % of car cost. */
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
    chinaAutoToUssuriyskRub: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_CHINA_AUTO_TO_USSURIYSK_RUB,
      process.env.DELIVERY_CHINA_AUTO_TO_USSURIYSK_RUB,
      DELIVERY_DEFAULTS.chinaAutoToUssuriyskRub
    ),
    chinaExportBrokerRub: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_CHINA_BROKER_RUB,
      process.env.DELIVERY_CHINA_BROKER_RUB,
      DELIVERY_DEFAULTS.chinaExportBrokerRub
    ),
    russiaVladBrokerRub: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_RUSSIA_VLAD_BROKER_RUB,
      process.env.DELIVERY_RUSSIA_VLAD_BROKER_RUB,
      DELIVERY_DEFAULTS.russiaVladBrokerRub
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
    moscowTransportByType: DELIVERY_DEFAULTS.moscowTransportByType,
  };
}

/** China leg: auto to Ussuriysk + export broker. */
export function getChinaLogisticsCost(): number {
  const c = getDeliveryConfig();
  return c.chinaAutoToUssuriyskRub + c.chinaExportBrokerRub;
}

/** Full package to ready handoff (Ussuriysk/Vlad area; no Moscow, no insurance). */
export function getVladivostokPackageCost(): number {
  return getChinaLogisticsCost() + getDeliveryConfig().russiaVladBrokerRub;
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
 * Client-facing delivery total.
 * Self-pickup and Vladivostok share the same China+RF package;
 * Moscow adds auto-transport by body type.
 */
export function getDeliveryCost(
  destination: DeliveryDestination,
  car: DeliveryCar
): number {
  const base = getVladivostokPackageCost();
  const insurance = getDeliveryInsurance(car.price);

  if (destination === "none" || destination === "vladivostok") {
    return base + insurance;
  }

  if (destination === "moscow") {
    return base + getMoscowTransportCost(car.type) + insurance;
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
  if (destination === "none" || destination === "vladivostok") return baseDays;
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
  destination: DeliveryDestination,
  baseDays: number
) {
  const days = getDeliveryDays(destination, baseDays);
  const daysLabel = formatDeliveryDays(days);
  if (destination === "none") {
    return {
      label: "Самовывоз во Владивостоке",
      hint: `Готов к выдаче во Владивостоке · забираете сами · ~${daysLabel}`,
    };
  }
  if (destination === "vladivostok") {
    return {
      label: "Доставка во Владивосток",
      hint: `Под ключ до Владивостока · ~${daysLabel}`,
    };
  }
  return {
    label: "Доставка до Москвы",
    hint: `Владивосток + автовоз · ~${daysLabel}`,
  };
}

export const DELIVERY_DESTINATIONS: DeliveryDestination[] = [
  "none",
  "vladivostok",
  "moscow",
];
