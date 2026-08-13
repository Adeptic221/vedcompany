/** Document kinds for client cabinet workflow. */
export type CabinetDocKind =
  | "passport_main"
  | "passport_registration"
  | "passport_notarized"
  | "signed_services_contract"
  | "signed_agency_contract"
  | "other";

export type CabinetDocStatus = "required" | "uploaded" | "signed_by_client";

export interface DocSlotDef {
  kind: CabinetDocKind;
  title: string;
  hint: string;
  /** blank template from VED (optional) */
  templateHref?: string;
  accept: string;
}

/** Client uploads these; VED templates are downloaded where templateHref is set. */
export const CLIENT_DOC_SLOTS: DocSlotDef[] = [
  {
    kind: "passport_main",
    title: "\u041f\u0430\u0441\u043f\u043e\u0440\u0442 \u2014 \u0440\u0430\u0437\u0432\u043e\u0440\u043e\u0442 \u0441 \u0444\u043e\u0442\u043e",
    hint: "\u041f\u0435\u0440\u0432\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 (\u0444\u043e\u0442\u043e + \u0444.\u0438.\u043e.)",
    accept: "image/*,.pdf",
  },
  {
    kind: "passport_registration",
    title: "\u041f\u0430\u0441\u043f\u043e\u0440\u0442 \u2014 \u043f\u0440\u043e\u043f\u0438\u0441\u043a\u0430",
    hint: "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0435\u0439 (\u043f\u0440\u043e\u043f\u0438\u0441\u043a\u043e\u0439)",
    accept: "image/*,.pdf",
  },
  {
    kind: "passport_notarized",
    title: "\u041d\u043e\u0442\u0430\u0440\u0438\u0430\u043b\u044c\u043d\u043e \u0437\u0430\u0432\u0435\u0440\u0435\u043d\u043d\u044b\u0439 \u043f\u0430\u0441\u043f\u043e\u0440\u0442",
    hint: "\u0417\u0430\u0432\u0435\u0440\u0435\u043d\u043d\u0430\u044f \u043a\u043e\u043f\u0438\u044f \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430 \u0444\u0438\u0437\u043b\u0438\u0446\u0430 (\u0441\u043a\u0430\u043d/\u0444\u043e\u0442\u043e). \u041d\u0443\u0436\u043d\u0430 \u0431\u0440\u043e\u043a\u0435\u0440\u0443",
    accept: "image/*,.pdf",
  },
  {
    kind: "signed_services_contract",
    title: "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u043d\u044b\u0439 \u0434\u043e\u0433\u043e\u0432\u043e\u0440 \u043d\u0430 \u0443\u0441\u043b\u0443\u0433\u0438 VED",
    hint: "\u0421\u043a\u0430\u0447\u0430\u0439\u0442\u0435 \u0448\u0430\u0431\u043b\u043e\u043d, \u043f\u043e\u0434\u043f\u0438\u0448\u0438\u0442\u0435 \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0441\u043a\u0430\u043d/\u0444\u043e\u0442\u043e",
    templateHref: "/docs/ved-services-contract.html",
    accept: "image/*,.pdf",
  },
  {
    kind: "signed_agency_contract",
    title: "\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u043d\u044b\u0439 \u0430\u0433\u0435\u043d\u0442\u0441\u043a\u0438\u0439 \u0434\u043e\u0433\u043e\u0432\u043e\u0440",
    hint: "\u0414\u043e\u0433\u043e\u0432\u043e\u0440 \u043d\u0430 \u043f\u043e\u0434\u0431\u043e\u0440 \u0438 \u0441\u043e\u043f\u0440\u043e\u0432\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0438\u043c\u043f\u043e\u0440\u0442\u0430",
    templateHref: "/docs/ved-agency-contract.html",
    accept: "image/*,.pdf",
  },
  {
    kind: "other",
    title: "\u041f\u0440\u043e\u0447\u0438\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b",
    hint: "\u0412\u0423, \u0418\u041d\u041d, \u0434\u043e\u043f.\u0441\u043a\u0430\u043d\u044b \u2014 \u043f\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u0443 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430",
    accept: "image/*,.pdf,.doc,.docx",
  },
];
