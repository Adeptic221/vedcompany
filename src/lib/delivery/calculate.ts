import type { Car, CarType } from "@/types/car";
import type { DeliveryDestination } from "@/types/cart";
import { getTotalPrice } from "@/data/cars";

/**
 * Client-facing delivery is simple:
 * - self-pickup in Vladivostok: no extra line (0)
 * - Moscow: auto transport only (Vlad→Moscow by body type)
 *
 * China + RF broker to Vlad are internal (not shown / not billed as a line).
 */
export const DELIVERY_DEFAULTS = {
  /** Chinese auto transport to Ussuriysk customs (RUB). Internal. */
  chinaAutoToUssuriyskRub: 50_000,
  /** Chinese export broker VED hires (RUB). Internal. */
  chinaExportBrokerRub: 30_000,
  /**
   * RF broker package (RUB, flat): clearance, SVH, SBKTS/EPTS,
   * and transfer from SVH to Vladivostok. Internal.
   */
  russiaVladBrokerRub: 80_000,
  /** Client-facing: auto transport Vladivostok area -> Moscow by body type. */
  moscowTransportByType: {
    hatchback: 175_000,
    sedan: 180_000,
    coupe: 185_000,
    crossover: 210_000,
    suv: 230_000,
  } as Record<CarType, number>,
  /** Fixed client-facing lead times. */
  vladivostokDays: 12,
  moscowDays: 28,
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
    vladivostokDays: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_VLAD_DAYS,
      process.env.DELIVERY_VLAD_DAYS,
      DELIVERY_DEFAULTS.vladivostokDays
    ),
    moscowDays: readNumber(
      process.env.NEXT_PUBLIC_DELIVERY_MOSCOW_DAYS,
      process.env.DELIVERY_MOSCOW_DAYS,
      DELIVERY_DEFAULTS.moscowDays
    ),
    moscowTransportByType: DELIVERY_DEFAULTS.moscowTransportByType,
  };
}

/** China leg: auto to Ussuriysk + export broker (internal). */
export function getChinaLogisticsCost(): number {
  const c = getDeliveryConfig();
  return c.chinaAutoToUssuriyskRub + c.chinaExportBrokerRub;
}

/** Full internal package to Vlad handoff (not billed to client as a line). */
export function getVladivostokPackageCost(): number {
  return getChinaLogisticsCost() + getDeliveryConfig().russiaVladBrokerRub;
}

export function getMoscowTransportCost(type: CarType): number {
  return (
    getDeliveryConfig().moscowTransportByType[type] ??
    DELIVERY_DEFAULTS.moscowTransportByType.sedan
  );
}

type DeliveryCar = Pick<Car, "type" | "price">;

/**
 * Client-facing delivery total.
 * Pickup / legacy Vlad option: 0.
 * Moscow: auto transport only (not China+RF package).
 */
export function getDeliveryCost(
  destination: DeliveryDestination,
  car: DeliveryCar
): number {
  if (destination === "moscow") {
    return getMoscowTransportCost(car.type);
  }
  return 0;
}

export function getGrandTotal(car: Car, destination: DeliveryDestination): number {
  return getTotalPrice(car) + getDeliveryCost(destination, car);
}

/** Fixed days for client; baseDays ignored. */
export function getDeliveryDays(
  destination: DeliveryDestination,
  _baseDays?: number
): number {
  const c = getDeliveryConfig();
  if (destination === "moscow") return c.moscowDays;
  return c.vladivostokDays;
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
  baseDays?: number
) {
  const days = getDeliveryDays(destination, baseDays);
  const daysLabel = formatDeliveryDays(days);
  if (destination === "none" || destination === "vladivostok") {
    return {
      label: "Самовывоз во Владивостоке",
      hint: `Забираете сами · до ${daysLabel}`,
    };
  }
  return {
    label: "Доставка до Москвы",
    hint: `Автовоз · до ${daysLabel}`,
  };
}

/** Client options only: pickup or Moscow. */
export const DELIVERY_DESTINATIONS: DeliveryDestination[] = [
  "none",
  "moscow",
];
