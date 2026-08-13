import type { OrderStatus } from "@/types/cart";

/** Document kinds for client cabinet workflow. */
export type CabinetDocKind =
  | "passport_main"
  | "passport_registration"
  | "passport_pages"
  | "passport_notarized"
  | "inn"
  | "snils"
  | "signed_services_contract"
  | "signed_agency_contract"
  | "broker_poa"
  | "pdn_consent"
  | "client_requisites"
  | "driver_license"
  | "other";

export type CabinetDocStatus = "required" | "uploaded" | "signed_by_client";

export interface DocSlotDef {
  kind: CabinetDocKind;
  title: string;
  /** Short line under the title */
  hint: string;
  /** Full explanation shown in hover tip */
  why: string;
  /** blank template from VED (optional) */
  templateHref?: string;
  accept: string;
  optional?: boolean;
  /** Tracking stage where this doc is most relevant */
  trackingStage?: OrderStatus;
}

/** Client uploads these; VED templates are downloaded where templateHref is set. */
export const CLIENT_DOC_SLOTS: DocSlotDef[] = [
  {
    kind: "passport_main",
    title: "Паспорт — разворот с фото",
    hint: "Первая страница (фото + Ф.И.О.)",
    why: "Нужен, чтобы подтвердить личность владельца автомобиля и корректно заполнить договор, поручение и таможенные документы.",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "passport_registration",
    title: "Паспорт — прописка",
    hint: "Страница с регистрацией",
    why: "Адрес регистрации указывают в договорах и передают брокеру для декларации и идентификации владельца.",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "passport_pages",
    title: "Паспорт — полные страницы",
    hint: "Скан остальных заполненных страниц одним файлом или архивом страниц",
    why: "Полный комплект страниц снимает дозапросы: брокеру видны все отметки и данные паспорта без повторных просьб прислать «ещё одну страницу».",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "passport_notarized",
    title: "Нотариально заверенный паспорт",
    hint: "Скан сюда; бумажный экземпляр — брокеру",
    why: "Бумажная нотариальная копия хранится у таможенного брокера и нужна для оформления без вашего личного присутствия. В кабинет загрузите скан — так менеджер видит, что документ готов; оригинал отправьте брокеру (СДЭК и т.п.).",
    accept: "image/*,.pdf",
    trackingStage: "customs",
  },
  {
    kind: "inn",
    title: "ИНН",
    hint: "Свидетельство или скрин из ФНС / Госуслуг",
    why: "ИНН физлица используют при уплате таможенных платежей и идентификации владельца в системах таможни и брокера.",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "snils",
    title: "СНИЛС",
    hint: "Карточка или скрин из Госуслуг",
    why: "СНИЛС часто требуется в пакете документов владельца для сопоставления данных и заполнения анкет брокера.",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "signed_services_contract",
    title: "Подписанный договор на услуги VED",
    hint: "Скачайте шаблон, подпишите и загрузите скан",
    why: "Фиксирует, какие услуги оказывает VED и на каких условиях (в том числе вознаграждение). Без подписанного договора мы не запускаем оплату и логистику.",
    templateHref: "/docs/ved-services-contract.html",
    accept: "image/*,.pdf",
    trackingStage: "manager",
  },
  {
    kind: "signed_agency_contract",
    title: "Подписанный агентский договор",
    hint: "Даёт VED право действовать от вашего имени",
    why: "Это не «второй договор услуг», а поручение: заказывать и оплачивать авто, передавать документы брокеру, принимать авто на СВХ и сопровождать импорт без вашего присутствия на каждом шаге.",
    templateHref: "/docs/ved-agency-contract.html",
    accept: "image/*,.pdf",
    trackingStage: "manager",
  },
  {
    kind: "broker_poa",
    title: "Доверенность на брокера",
    hint: "Скачайте шаблон, подпишите и загрузите скан",
    why: "Отдельная доверенность таможенному брокеру: подача декларации, представление интересов на таможне, получение документов. Агентский договор VED её не заменяет.",
    templateHref: "/docs/broker-poa.html",
    accept: "image/*,.pdf",
    trackingStage: "customs",
  },
  {
    kind: "pdn_consent",
    title: "Согласие на обработку персональных данных",
    hint: "Скачайте, подпишите и загрузите скан",
    why: "Юридическое основание обрабатывать паспорт, ИНН, СНИЛС и связанные данные в рамках сделки, передачи брокеру и таможенного оформления.",
    templateHref: "/docs/pdn-consent.html",
    accept: "image/*,.pdf",
    trackingStage: "documents",
  },
  {
    kind: "client_requisites",
    title: "Реквизиты (ИП / ООО)",
    hint: "Карточка предприятия, счёт или PDF с реквизитами — если покупатель не физлицо",
    why: "Нужны, если автомобиль оформляется на ИП или компанию: для договора, счёта и передачи данных брокеру. Физлицу этот пункт обычно не обязателен — можно пропустить.",
    accept: "image/*,.pdf,.doc,.docx",
    optional: true,
    trackingStage: "documents",
  },
  {
    kind: "driver_license",
    title: "Водительское удостоверение",
    hint: "По запросу менеджера",
    why: "Не всегда обязательно. Может понадобиться при выдаче автомобиля или отдельных процедурах регистрации — менеджер скажет, если потребуется.",
    accept: "image/*,.pdf",
    optional: true,
    trackingStage: "shipping",
  },
  {
    kind: "other",
    title: "Прочие документы",
    hint: "Доп. сканы по запросу менеджера",
    why: "Сюда можно прикрепить любые дополнительные файлы, которые попросил менеджер и для которых нет отдельного пункта в списке.",
    accept: "image/*,.pdf,.doc,.docx",
    optional: true,
  },
];

export const REQUIRED_DOC_SLOTS = CLIENT_DOC_SLOTS.filter(
  (s) => !s.optional && s.kind !== "other"
);

export function countUploadedRequiredDocs(
  uploadedKinds: Iterable<CabinetDocKind | undefined>
): { done: number; total: number } {
  const set = new Set(
    [...uploadedKinds].filter((k): k is CabinetDocKind => Boolean(k) && k !== "other")
  );
  const done = REQUIRED_DOC_SLOTS.filter((s) => set.has(s.kind)).length;
  return { done, total: REQUIRED_DOC_SLOTS.length };
}