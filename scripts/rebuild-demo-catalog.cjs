/**
 * Rebuild demo catalog with Wikipedia/Wikimedia model-accurate photos + expanded listings.
 * Writes UTF-8 files only (avoids Windows UTF-16 corruption).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CACHE_FILE = path.join(ROOT, "data", "model-photo-cache.json");
const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";

/** [slug, brand, model, year, type, priceCny, engine, power, fuel, consumption, days, wikiTitle] */
const LISTINGS = [
  // BYD
  ["byd", "BYD", "Han EV", 2024, "sedan", 189800, "Dual Motor", "517 hp", "Electric", "15.4 kWh/100km", 40, "BYD_Han"],
  ["byd", "BYD", "Seal", 2024, "sedan", 162800, "Rear Motor", "313 hp", "Electric", "14.6 kWh/100km", 39, "BYD_Seal"],
  ["byd", "BYD", "Song Plus", 2024, "crossover", 139800, "1.5 L", "197 hp", "Hybrid", "5.3 L/100km", 38, "BYD_Song_Plus"],
  ["byd", "BYD", "Tang", 2023, "suv", 219800, "1.5 L", "431 hp", "Hybrid", "6.5 L/100km", 41, "BYD_Tang"],
  ["byd", "BYD", "Qin Plus", 2024, "sedan", 99800, "1.5 L", "180 hp", "Hybrid", "3.8 L/100km", 36, "BYD_Qin_Plus"],
  ["byd", "BYD", "Yuan Plus", 2024, "crossover", 129800, "Single Motor", "204 hp", "Electric", "13.8 kWh/100km", 38, "BYD_Yuan_Plus"],
  ["byd", "BYD", "Dolphin", 2024, "hatchback", 99800, "Single Motor", "177 hp", "Electric", "12.2 kWh/100km", 36, "BYD_Dolphin"],
  ["byd", "BYD", "Seal 06", 2024, "sedan", 112800, "1.5 L", "212 hp", "Hybrid", "3.9 L/100km", 37, "BYD_Seal_06_DM-i"],
  // Geely
  ["geely", "Geely", "Coolray", 2024, "crossover", 95800, "1.5 L", "177 hp", "Petrol", "6.2 L/100km", 38, "Geely_Coolray"],
  ["geely", "Geely", "Monjaro", 2024, "crossover", 168800, "2.0 L", "238 hp", "Petrol", "7.8 L/100km", 40, "Geely_Monjaro"],
  ["geely", "Geely", "Galaxy L7", 2024, "crossover", 129800, "1.5 L", "390 hp", "Hybrid", "5.2 L/100km", 39, "Geely_Galaxy_L7"],
  ["geely", "Geely", "Preface", 2024, "sedan", 118800, "2.0 L", "218 hp", "Petrol", "7.0 L/100km", 38, "Geely_Preface"],
  ["geely", "Geely", "Xingyue L", 2024, "crossover", 148800, "2.0 L", "218 hp", "Petrol", "7.6 L/100km", 39, "Geely_Xingyue_L"],
  // Chery group
  ["chery", "Chery", "Tiggo 8 Pro", 2023, "suv", 129900, "2.0 L", "254 hp", "Petrol", "8.5 L/100km", 42, "Chery_Tiggo_8"],
  ["chery", "Chery", "Tiggo 7 Pro", 2024, "crossover", 109900, "1.6 L", "197 hp", "Petrol", "7.1 L/100km", 39, "Chery_Tiggo_7"],
  ["chery", "Chery", "Arrizo 8", 2024, "sedan", 99800, "1.6 L", "197 hp", "Petrol", "6.8 L/100km", 37, "Chery_Arrizo_8"],
  ["chery", "Chery", "Tiggo 4 Pro", 2024, "crossover", 89800, "1.5 L", "147 hp", "Petrol", "6.9 L/100km", 37, "Chery_Tiggo_4"],
  ["omoda", "Omoda", "C5", 2024, "crossover", 119800, "1.6 L", "197 hp", "Petrol", "7.0 L/100km", 38, "Omoda_C5"],
  ["jaecoo", "Jaecoo", "J7", 2024, "crossover", 149800, "1.6 L", "197 hp", "Petrol", "7.4 L/100km", 40, "Jaecoo_7"],
  ["exeed", "Exeed", "TXL", 2024, "crossover", 169800, "2.0 L", "249 hp", "Petrol", "8.1 L/100km", 41, "Exeed_TXL"],
  ["exeed", "Exeed", "LX", 2024, "crossover", 129800, "1.6 L", "197 hp", "Petrol", "7.2 L/100km", 39, "Exeed_LX"],
  // Haval / Tank / GWM
  ["haval", "Haval", "H6", 2024, "crossover", 112800, "2.0 L", "211 hp", "Petrol", "7.9 L/100km", 40, "Haval_H6"],
  ["haval", "Haval", "Jolion", 2024, "crossover", 89800, "1.5 L", "150 hp", "Petrol", "6.8 L/100km", 38, "Haval_Jolion"],
  ["haval", "Haval", "Dargo", 2023, "crossover", 149800, "2.0 L", "211 hp", "Petrol", "8.2 L/100km", 41, "Haval_Dargo"],
  ["haval", "Haval", "H9", 2024, "suv", 189800, "2.0 L", "224 hp", "Petrol", "10.2 L/100km", 42, "Haval_H9"],
  ["tank", "Tank", "300", 2024, "suv", 199800, "2.0 L", "227 hp", "Petrol", "9.5 L/100km", 41, "Tank_300"],
  ["tank", "Tank", "500", 2023, "suv", 339800, "3.0 L", "354 hp", "Petrol", "10.5 L/100km", 44, "Tank_500"],
  ["tank", "Tank", "400", 2024, "suv", 249800, "2.0 L", "252 hp", "Hybrid", "8.8 L/100km", 42, "Tank_400"],
  ["great-wall", "Great Wall", "Ora Good Cat", 2024, "hatchback", 109800, "Single Motor", "171 hp", "Electric", "12.8 kWh/100km", 38, "Ora_Good_Cat"],
  ["wey", "WEY", "Coffee 01", 2024, "crossover", 189800, "1.5 L", "245 hp", "Hybrid", "5.5 L/100km", 41, "WEY_Coffee_01"],
  // Changan / Deepal
  ["changan", "Changan", "UNI-V", 2024, "sedan", 108900, "1.5 L", "188 hp", "Petrol", "6.5 L/100km", 37, "Changan_UNI-V"],
  ["changan", "Changan", "CS75 Plus", 2024, "crossover", 119800, "1.5 L", "188 hp", "Petrol", "7.0 L/100km", 38, "Changan_CS75_Plus"],
  ["changan", "Changan", "UNI-K", 2024, "crossover", 139800, "2.0 L", "233 hp", "Petrol", "8.0 L/100km", 39, "Changan_UNI-K"],
  ["deepal", "Deepal", "SL03", 2024, "sedan", 149800, "Single Motor", "218 hp", "Electric", "13.9 kWh/100km", 40, "Deepal_SL03"],
  ["deepal", "Deepal", "S7", 2024, "crossover", 169800, "Single Motor", "258 hp", "Electric", "14.4 kWh/100km", 41, "Deepal_S7"],
  // Li / AITO / Voyah / Avatr
  ["li-auto", "Li Auto", "L7", 2024, "suv", 319800, "1.5 L", "449 hp", "Hybrid", "7.8 L/100km", 45, "Li_Auto_L7"],
  ["li-auto", "Li Auto", "L6", 2024, "suv", 249800, "1.5 L", "408 hp", "Hybrid", "7.2 L/100km", 44, "Li_Auto_L6"],
  ["li-auto", "Li Auto", "L9", 2023, "suv", 429800, "1.5 L", "449 hp", "Hybrid", "8.1 L/100km", 46, "Li_Auto_L9"],
  ["li-auto", "Li Auto", "L8", 2024, "suv", 359800, "1.5 L", "449 hp", "Hybrid", "7.9 L/100km", 45, "Li_Auto_L8"],
  ["aito", "AITO", "M7", 2024, "suv", 249800, "1.5 L", "449 hp", "Hybrid", "7.4 L/100km", 44, "AITO_M7"],
  ["aito", "AITO", "M9", 2024, "suv", 469800, "1.5 L", "496 hp", "Hybrid", "7.9 L/100km", 46, "AITO_M9"],
  ["aito", "AITO", "M5", 2024, "crossover", 249800, "1.5 L", "496 hp", "Hybrid", "6.4 L/100km", 43, "AITO_M5"],
  ["voyah", "Voyah", "Free", 2024, "suv", 269800, "1.5 L", "510 hp", "Hybrid", "7.5 L/100km", 44, "Voyah_Free"],
  ["voyah", "Voyah", "Dream", 2024, "suv", 369800, "1.5 L", "510 hp", "Hybrid", "8.0 L/100km", 45, "Voyah_Dreamer"],
  ["avatr", "Avatr", "11", 2024, "crossover", 299800, "Dual Motor", "578 hp", "Electric", "16.5 kWh/100km", 44, "Avatr_11"],
  ["avatr", "Avatr", "12", 2024, "sedan", 279800, "Dual Motor", "578 hp", "Electric", "15.8 kWh/100km", 44, "Avatr_12"],
  // Zeekr / Lynk / Volvo China
  ["zeekr", "Zeekr", "001", 2024, "crossover", 269000, "Dual Motor", "544 hp", "Electric", "16.8 kWh/100km", 43, "Zeekr_001"],
  ["zeekr", "Zeekr", "007", 2024, "sedan", 209800, "Dual Motor", "422 hp", "Electric", "14.2 kWh/100km", 42, "Zeekr_007"],
  ["zeekr", "Zeekr", "X", 2024, "crossover", 189800, "Dual Motor", "428 hp", "Electric", "15.5 kWh/100km", 41, "Zeekr_X"],
  ["zeekr", "Zeekr", "009", 2024, "suv", 499800, "Dual Motor", "544 hp", "Electric", "20.2 kWh/100km", 46, "Zeekr_009"],
  ["lynk-co", "Lynk & Co", "08", 2024, "crossover", 189800, "1.5 L", "245 hp", "Hybrid", "5.5 L/100km", 41, "Lynk_%26_Co_08"],
  ["lynk-co", "Lynk & Co", "09", 2024, "suv", 229800, "2.0 L", "254 hp", "Petrol", "8.6 L/100km", 42, "Lynk_%26_Co_09"],
  // Hongqi / FAW
  ["hongqi", "Hongqi", "H9", 2023, "sedan", 309800, "2.0 L", "252 hp", "Petrol", "8.0 L/100km", 44, "Hongqi_H9"],
  ["hongqi", "Hongqi", "HS5", 2024, "crossover", 189800, "2.0 L", "224 hp", "Petrol", "8.4 L/100km", 41, "Hongqi_HS5"],
  ["hongqi", "Hongqi", "E-HS9", 2024, "suv", 429800, "Dual Motor", "551 hp", "Electric", "20.5 kWh/100km", 46, "Hongqi_E-HS9"],
  ["hongqi", "Hongqi", "HS7", 2024, "suv", 249800, "2.0 L", "252 hp", "Petrol", "9.0 L/100km", 43, "Hongqi_HS7"],
  // GAC
  ["gac-aion", "GAC Aion", "Y Plus", 2024, "crossover", 119800, "Single Motor", "204 hp", "Electric", "13.1 kWh/100km", 38, "Aion_Y"],
  ["gac-aion", "GAC Aion", "S Plus", 2024, "sedan", 139800, "Single Motor", "245 hp", "Electric", "13.8 kWh/100km", 39, "Aion_S"],
  ["gac-aion", "GAC Aion", "V", 2024, "crossover", 149800, "Single Motor", "184 hp", "Electric", "14.5 kWh/100km", 39, "Aion_V"],
  ["trumpchi", "Trumpchi", "GS8", 2024, "suv", 169800, "2.0 L", "252 hp", "Petrol", "8.9 L/100km", 41, "Trumpchi_GS8"],
  // Wuling / Baojun
  ["wuling", "Wuling", "Bingo", 2024, "hatchback", 59800, "Single Motor", "68 hp", "Electric", "10.2 kWh/100km", 35, "Wuling_Bingo"],
  ["wuling", "Wuling", "Starlight", 2024, "sedan", 79800, "1.5 L", "143 hp", "Petrol", "5.9 L/100km", 36, "Wuling_Starlight"],
  ["wuling", "Wuling", "Hongguang Mini EV", 2024, "hatchback", 32800, "Single Motor", "41 hp", "Electric", "9.0 kWh/100km", 34, "Wuling_Hongguang_Mini_EV"],
  // NIO / XPeng / Xiaomi / IM
  ["nio", "NIO", "ET5", 2024, "sedan", 298000, "Dual Motor", "490 hp", "Electric", "15.1 kWh/100km", 43, "NIO_ET5"],
  ["nio", "NIO", "ES6", 2024, "crossover", 338000, "Dual Motor", "490 hp", "Electric", "16.2 kWh/100km", 44, "NIO_ES6"],
  ["nio", "NIO", "ET7", 2024, "sedan", 428000, "Dual Motor", "653 hp", "Electric", "16.0 kWh/100km", 45, "NIO_ET7"],
  ["nio", "NIO", "ES8", 2024, "suv", 468000, "Dual Motor", "653 hp", "Electric", "19.5 kWh/100km", 46, "NIO_ES8"],
  ["xpeng", "XPeng", "G6", 2024, "crossover", 209800, "Dual Motor", "487 hp", "Electric", "14.9 kWh/100km", 42, "XPeng_G6"],
  ["xpeng", "XPeng", "P7", 2023, "sedan", 229800, "Dual Motor", "473 hp", "Electric", "15.6 kWh/100km", 43, "XPeng_P7"],
  ["xpeng", "XPeng", "G9", 2024, "suv", 309800, "Dual Motor", "551 hp", "Electric", "18.2 kWh/100km", 44, "XPeng_G9"],
  ["xpeng", "XPeng", "X9", 2024, "suv", 359800, "Dual Motor", "551 hp", "Electric", "18.8 kWh/100km", 45, "XPeng_X9"],
  ["xiaomi", "Xiaomi", "SU7", 2024, "sedan", 245900, "Dual Motor", "673 hp", "Electric", "14.9 kWh/100km", 42, "Xiaomi_SU7"],
  ["im", "IM Motors", "LS6", 2024, "crossover", 229800, "Dual Motor", "579 hp", "Electric", "15.8 kWh/100km", 42, "IM_LS6"],
  ["im", "IM Motors", "L7", 2024, "sedan", 249800, "Dual Motor", "578 hp", "Electric", "15.2 kWh/100km", 43, "IM_L7"],
  // Leapmotor / Neta / others
  ["leapmotor", "Leapmotor", "C11", 2024, "crossover", 149800, "Dual Motor", "272 hp", "Electric", "14.8 kWh/100km", 40, "Leapmotor_C11"],
  ["leapmotor", "Leapmotor", "C10", 2024, "crossover", 128800, "Single Motor", "231 hp", "Electric", "14.2 kWh/100km", 39, "Leapmotor_C10"],
  ["leapmotor", "Leapmotor", "C01", 2024, "sedan", 139800, "Dual Motor", "544 hp", "Electric", "14.5 kWh/100km", 40, "Leapmotor_C01"],
  ["neta", "Neta", "S", 2024, "sedan", 159800, "Dual Motor", "340 hp", "Electric", "14.1 kWh/100km", 40, "Neta_S"],
  ["neta", "Neta", "X", 2024, "crossover", 119800, "Single Motor", "231 hp", "Electric", "13.8 kWh/100km", 38, "Neta_X"],
  ["jetour", "Jetour", "Dashing", 2024, "crossover", 109800, "1.6 L", "197 hp", "Petrol", "7.3 L/100km", 38, "Jetour_Dashing"],
  ["jetour", "Jetour", "T2", 2024, "suv", 169800, "2.0 L", "254 hp", "Petrol", "8.9 L/100km", 41, "Jetour_Traveller"],
  ["mg", "MG", "MG4", 2024, "hatchback", 139800, "Single Motor", "204 hp", "Electric", "13.5 kWh/100km", 39, "MG4_EV"],
  ["mg", "MG", "MG7", 2024, "sedan", 119800, "2.0 L", "231 hp", "Petrol", "7.6 L/100km", 38, "MG_7"],
  ["mg", "MG", "ZS", 2024, "crossover", 99800, "1.5 L", "162 hp", "Petrol", "6.9 L/100km", 37, "MG_ZS"],
  ["baic", "BAIC", "BJ40", 2024, "suv", 169800, "2.0 L", "224 hp", "Petrol", "9.8 L/100km", 41, "Beijing_BJ40"],
  ["roewe", "Roewe", "RX5", 2024, "crossover", 109800, "1.5 L", "181 hp", "Petrol", "6.9 L/100km", 38, "Roewe_RX5"],
  ["maxus", "Maxus", "Mifa 9", 2024, "crossover", 269800, "Single Motor", "245 hp", "Electric", "17.2 kWh/100km", 44, "Maxus_Mifa_9"],
  ["dongfeng", "Dongfeng", "Forthing T5 EVO", 2024, "crossover", 99800, "1.5 L", "197 hp", "Petrol", "7.2 L/100km", 37, "Forthing_T5_EVO"],
  ["denza", "Denza", "D9", 2024, "suv", 389800, "1.5 L", "376 hp", "Hybrid", "6.6 L/100km", 45, "Denza_D9"],
  ["denza", "Denza", "N7", 2024, "crossover", 239800, "Dual Motor", "313 hp", "Electric", "15.2 kWh/100km", 43, "Denza_N7"],
  ["fangchengbao", "Fangchengbao", "Bao 5", 2024, "suv", 289800, "1.5 L", "510 hp", "Hybrid", "8.5 L/100km", 44, "Fangchengbao_Bao_5"],
  // Japan
  ["toyota", "Toyota", "Camry", 2024, "sedan", 198000, "2.5 L", "181 hp", "Petrol", "7.1 L/100km", 45, "Toyota_Camry"],
  ["toyota", "Toyota", "RAV4", 2024, "crossover", 218000, "2.5 L", "199 hp", "Petrol", "7.8 L/100km", 44, "Toyota_RAV4"],
  ["toyota", "Toyota", "Highlander", 2024, "suv", 298000, "2.5 L", "244 hp", "Hybrid", "6.5 L/100km", 48, "Toyota_Highlander"],
  ["toyota", "Toyota", "Corolla", 2024, "sedan", 148000, "1.8 L", "140 hp", "Hybrid", "4.5 L/100km", 40, "Toyota_Corolla"],
  ["lexus", "Lexus", "RX", 2024, "crossover", 544000, "2.4 L", "279 hp", "Petrol", "9.0 L/100km", 52, "Lexus_RX"],
  ["lexus", "Lexus", "ES", 2024, "sedan", 398000, "2.5 L", "218 hp", "Hybrid", "5.5 L/100km", 48, "Lexus_ES"],
  ["lexus", "Lexus", "NX", 2024, "crossover", 428000, "2.5 L", "243 hp", "Hybrid", "5.8 L/100km", 49, "Lexus_NX"],
  ["honda", "Honda", "CR-V", 2024, "crossover", 248000, "1.5 L", "193 hp", "Petrol", "7.6 L/100km", 44, "Honda_CR-V"],
  ["honda", "Honda", "Accord", 2024, "sedan", 228000, "1.5 L", "192 hp", "Petrol", "7.0 L/100km", 43, "Honda_Accord"],
  ["nissan", "Nissan", "X-Trail", 2024, "crossover", 238000, "1.5 L", "163 hp", "Petrol", "7.4 L/100km", 43, "Nissan_X-Trail"],
  ["mazda", "Mazda", "CX-5", 2024, "crossover", 218000, "2.5 L", "194 hp", "Petrol", "7.9 L/100km", 42, "Mazda_CX-5"],
  ["subaru", "Subaru", "Forester", 2024, "crossover", 248000, "2.5 L", "182 hp", "Petrol", "8.2 L/100km", 44, "Subaru_Forester"],
  // Korea (volume Hyundai/Kia expanded below with EU/US mass-market block)
  ["genesis", "Genesis", "GV70", 2024, "crossover", 428000, "2.5 L", "304 hp", "Petrol", "9.1 L/100km", 49, "Genesis_GV70"],
  ["genesis", "Genesis", "G80", 2024, "sedan", 448000, "2.5 L", "304 hp", "Petrol", "8.8 L/100km", 50, "Genesis_G80"],
  // Germany / EU / UK / US
  ["bmw", "BMW", "X5", 2023, "suv", 578000, "3.0 L", "340 hp", "Petrol", "9.4 L/100km", 55, "BMW_X5"],
  ["bmw", "BMW", "3 Series", 2024, "sedan", 368000, "2.0 L", "184 hp", "Petrol", "7.2 L/100km", 48, "BMW_3_Series"],
  ["bmw", "BMW", "X3", 2024, "crossover", 448000, "2.0 L", "184 hp", "Petrol", "8.0 L/100km", 50, "BMW_X3"],
  ["mercedes", "Mercedes-Benz", "E-Class", 2024, "sedan", 489000, "2.0 L", "258 hp", "Petrol", "8.2 L/100km", 50, "Mercedes-Benz_E-Class"],
  ["mercedes", "Mercedes-Benz", "GLE", 2024, "suv", 628000, "2.0 L", "258 hp", "Petrol", "9.2 L/100km", 52, "Mercedes-Benz_GLE"],
  ["mercedes", "Mercedes-Benz", "C-Class", 2024, "sedan", 398000, "1.5 L", "204 hp", "Petrol", "7.0 L/100km", 48, "Mercedes-Benz_C-Class"],
  ["audi", "Audi", "Q5", 2023, "crossover", 432000, "2.0 L", "249 hp", "Petrol", "8.8 L/100km", 48, "Audi_Q5"],
  ["audi", "Audi", "A6", 2024, "sedan", 448000, "2.0 L", "245 hp", "Petrol", "7.8 L/100km", 49, "Audi_A6"],
  ["audi", "Audi", "Q7", 2024, "suv", 598000, "3.0 L", "340 hp", "Petrol", "9.8 L/100km", 52, "Audi_Q7"],
  ["porsche", "Porsche", "Macan", 2023, "crossover", 712000, "2.0 L", "265 hp", "Petrol", "9.6 L/100km", 60, "Porsche_Macan"],
  ["porsche", "Porsche", "Cayenne", 2024, "suv", 898000, "3.0 L", "353 hp", "Petrol", "11.0 L/100km", 58, "Porsche_Cayenne"],
  ["volkswagen", "Volkswagen", "Tiguan", 2024, "crossover", 298000, "2.0 L", "220 hp", "Petrol", "8.0 L/100km", 46, "Volkswagen_Tiguan"],
  ["volkswagen", "Volkswagen", "Passat", 2024, "sedan", 248000, "2.0 L", "190 hp", "Petrol", "7.2 L/100km", 44, "Volkswagen_Passat"],
  // Mass-market / affordable (~1M+ RUB after FX) — non-China only
  ["volkswagen", "Volkswagen", "Polo", 2024, "hatchback", 98000, "1.6 L", "110 hp", "Petrol", "6.5 L/100km", 38, "Volkswagen_Polo"],
  ["volkswagen", "Volkswagen", "Golf", 2024, "hatchback", 138000, "1.5 L", "150 hp", "Petrol", "6.2 L/100km", 40, "Volkswagen_Golf"],
  ["skoda", "Skoda", "Octavia", 2024, "sedan", 124000, "1.4 L", "150 hp", "Petrol", "6.4 L/100km", 40, "Skoda_Octavia"],
  ["skoda", "Skoda", "Karoq", 2024, "crossover", 158000, "1.4 L", "150 hp", "Petrol", "6.9 L/100km", 42, "Skoda_Karoq"],
  ["skoda", "Skoda", "Kodiaq", 2024, "suv", 278000, "2.0 L", "190 hp", "Petrol", "8.1 L/100km", 45, "Skoda_Kodiaq"],
  ["hyundai", "Hyundai", "Solaris", 2024, "sedan", 102000, "1.6 L", "123 hp", "Petrol", "6.6 L/100km", 38, "Hyundai_Solaris"],
  ["hyundai", "Hyundai", "Creta", 2024, "crossover", 128000, "1.6 L", "123 hp", "Petrol", "7.1 L/100km", 40, "Hyundai_Creta"],
  ["hyundai", "Hyundai", "Elantra", 2024, "sedan", 142000, "2.0 L", "149 hp", "Petrol", "7.0 L/100km", 41, "Hyundai_Elantra"],
  ["hyundai", "Hyundai", "Tucson", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.5 L/100km", 44, "Hyundai_Tucson"],
  ["hyundai", "Hyundai", "Santa Fe", 2024, "suv", 298000, "2.5 L", "281 hp", "Petrol", "9.0 L/100km", 46, "Hyundai_Santa_Fe"],
  ["kia", "Kia", "Rio", 2024, "sedan", 96000, "1.6 L", "123 hp", "Petrol", "6.4 L/100km", 37, "Kia_Rio"],
  ["kia", "Kia", "Cerato", 2024, "hatchback", 132000, "2.0 L", "150 hp", "Petrol", "7.2 L/100km", 40, "Kia_Cerato"],
  ["kia", "Kia", "Sportage", 2024, "crossover", 238000, "1.6 L", "180 hp", "Petrol", "7.4 L/100km", 43, "Kia_Sportage"],
  ["kia", "Kia", "Sorento", 2024, "suv", 278000, "2.5 L", "191 hp", "Petrol", "8.6 L/100km", 45, "Kia_Sorento"],
  ["ford", "Ford", "Focus", 2024, "hatchback", 112000, "1.5 L", "150 hp", "Petrol", "6.8 L/100km", 40, "Ford_Focus"],
  ["ford", "Ford", "Kuga", 2024, "crossover", 168000, "1.5 L", "150 hp", "Petrol", "7.5 L/100km", 42, "Ford_Kuga"],
  ["renault", "Renault", "Duster", 2024, "crossover", 108000, "1.6 L", "114 hp", "Petrol", "7.6 L/100km", 39, "Renault_Duster"],
  ["renault", "Renault", "Arkana", 2024, "crossover", 148000, "1.3 L", "150 hp", "Petrol", "6.9 L/100km", 41, "Renault_Arkana"],
  ["nissan", "Nissan", "Qashqai", 2024, "crossover", 178000, "1.3 L", "158 hp", "Petrol", "6.8 L/100km", 42, "Nissan_Qashqai"],
  ["mazda", "Mazda", "3", 2024, "sedan", 148000, "2.0 L", "150 hp", "Petrol", "6.5 L/100km", 41, "Mazda3"],
  ["volvo", "Volvo", "XC60", 2024, "crossover", 468000, "2.0 L", "250 hp", "Petrol", "8.5 L/100km", 50, "Volvo_XC60"],
  ["volvo", "Volvo", "XC90", 2024, "suv", 598000, "2.0 L", "250 hp", "Petrol", "9.2 L/100km", 52, "Volvo_XC90"],
  ["land-rover", "Land Rover", "Defender", 2023, "suv", 698000, "3.0 L", "400 hp", "Petrol", "11.2 L/100km", 58, "Land_Rover_Defender"],
  ["land-rover", "Land Rover", "Range Rover Sport", 2024, "suv", 798000, "3.0 L", "400 hp", "Petrol", "10.8 L/100km", 58, "Range_Rover_Sport"],
  ["tesla", "Tesla", "Model Y", 2024, "crossover", 399000, "Dual Motor", "450 hp", "Electric", "15.0 kWh/100km", 48, "Tesla_Model_Y"],
  ["tesla", "Tesla", "Model 3", 2024, "sedan", 329000, "Dual Motor", "450 hp", "Electric", "14.0 kWh/100km", 46, "Tesla_Model_3"],
  ["peugeot", "Peugeot", "3008", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.3 L/100km", 44, "Peugeot_3008"],
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function modelPhotoKey(brandSlug, model) {
  return `${brandSlug}:${slugify(model)}`;
}

function countryFor(slug) {
  if (["toyota", "lexus", "honda", "nissan", "mazda", "subaru"].includes(slug)) return "Japan";
  if (["hyundai", "kia", "genesis"].includes(slug)) return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "skoda") return "Czech Republic";
  if (slug === "land-rover") return "UK";
  if (["tesla", "ford"].includes(slug)) return "USA";
  if (["peugeot", "renault"].includes(slug)) return "France";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  return "China";
}

const ACTIVE_LISTINGS = LISTINGS.filter((row) => countryFor(row[0]) !== "China");

function driveFor(type, fuel, brandSlug) {
  if (fuel === "Electric" && ["tesla", "porsche", "bmw", "nio", "xpeng", "zeekr", "avatr", "xiaomi"].includes(brandSlug)) {
    return type === "sedan" ? "RWD" : "AWD";
  }
  if (type === "suv" || type === "crossover") return "AWD";
  return "FWD";
}

function transmissionFor(fuel) {
  if (fuel === "Electric") return "Single-speed";
  return "Auto";
}

function estimateCustoms(priceRub, engine, year, fuel) {
  const ageYears = Math.max(0, new Date().getFullYear() - year);
  let cc = 2000;
  if (fuel === "Electric") cc = 0;
  else {
    const match = String(engine).match(/([\d.]+)\s*[lL]/);
    if (match) cc = Math.round(parseFloat(match[1]) * 1000);
  }
  const ageFactor = ageYears <= 3 ? 1.2 : ageYears <= 5 ? 1.0 : 0.85;
  const dutyBase = fuel === "Electric" ? priceRub * 0.15 : priceRub * 0.15 * (cc / 2000 || 1);
  const duty = Math.round(dutyBase * ageFactor);
  const vat = Math.round((priceRub + duty) * 0.2);
  return duty + vat + (ageYears <= 3 ? 5200 : 2600);
}

function toThumb800(url) {
  if (!url) return url;
  return url
    .replace(/\/\d+px-/, "/800px-")
    .replace(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\//i, (m, a, b, offset, s) => {
      // non-thumb original → leave; next/image can resize
      return m;
    });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWikiImage(wikiTitle) {
  const langs = ["en", "zh", "ru"];
  for (const lang of langs) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`;
        const r = await fetch(url, {
          headers: {
            "User-Agent": "VEDCompanyCatalogBot/1.0 (local demo rebuild; cars catalog)",
            Accept: "application/json",
          },
        });
        if (r.status === 429) {
          await sleep(1500 * (attempt + 1));
          continue;
        }
        if (!r.ok) break;
        const j = await r.json();
        const src = j.originalimage?.source || j.thumbnail?.source;
        if (src && /upload\.wikimedia\.org/i.test(src)) {
          return { ok: true, url: toThumb800(src), lang, title: j.title, desc: j.description || "" };
        }
        break;
      } catch {
        await sleep(800 * (attempt + 1));
      }
    }
  }
  return { ok: false };
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

async function resolveAllPhotos() {
  const cache = loadCache();
  const unique = new Map();
  for (const row of ACTIVE_LISTINGS) {
    const key = modelPhotoKey(row[0], row[2]);
    if (!unique.has(key)) unique.set(key, row[11]);
  }

  let i = 0;
  for (const [key, wikiTitle] of unique) {
    i++;
    if (cache[key]?.url && cache[key].ok !== false) {
      process.stdout.write(`[${i}/${unique.size}] cache ${key}\n`);
      continue;
    }
    process.stdout.write(`[${i}/${unique.size}] fetch ${key} <- ${wikiTitle} ... `);
    const res = await fetchWikiImage(wikiTitle);
    if (res.ok) {
      cache[key] = { ok: true, url: res.url, wikiTitle, lang: res.lang, desc: res.desc };
      console.log("OK");
    } else {
      cache[key] = { ok: false, wikiTitle };
      console.log("FAIL");
    }
    saveCache(cache);
    await sleep(600);
  }
  return cache;
}

function buildCars(photoMap) {
  const cars = [];
  function buildOne(entry) {
    const [brandSlug, brand, model, year, type, priceCny, engine, power, fuel, consumption, deliveryDays] = entry;
    const id = `ah-${slugify(brand)}-${slugify(model)}-${year}`;
    const price = Math.round(priceCny * RATE);
    const key = modelPhotoKey(brandSlug, model);
    const photo = photoMap[key];
    if (!photo) throw new Error(`Missing photo for ${key}`);
    return {
      id,
      brand,
      brandSlug,
      model,
      year,
      type,
      price,
      customsCost: estimateCustoms(price, engine, year, fuel),
      deliveryDays,
      country: countryFor(brandSlug),
      imageColor: "#1a3a5c",
      specs: {
        engine,
        power,
        transmission: transmissionFor(fuel),
        drive: driveFor(type, fuel, brandSlug),
        fuel,
        consumption,
      },
      description: `${brand} ${model} ${year} — импорт под ключ с расчётом таможни и доставкой.`,
      sync: {
        source: "autohome",
        sourceId: id,
        sourceUrl: "https://www.autohome.com.cn/",
        photos: [photo],
        priceCny,
        exchangeRate: RATE,
        exchangeBank: "VTB",
        exchangeRateAt: SYNCED_AT,
        customsSource: "tks.ru",
        syncedAt: SYNCED_AT,
      },
    };
  }
  function alt(entry) {
    const year = entry[3];
    const altYear = year >= 2024 ? 2023 : 2024;
    const priceFactor = altYear < year ? 0.88 : 1.06;
    return [
      entry[0],
      entry[1],
      entry[2],
      altYear,
      entry[4],
      Math.round(entry[5] * priceFactor),
      entry[6],
      entry[7],
      entry[8],
      entry[9],
      entry[10] + (altYear === 2023 ? 2 : 0),
      entry[11],
    ];
  }
  for (const entry of ACTIVE_LISTINGS) {
    cars.push(buildOne(entry));
    cars.push(buildOne(alt(entry)));
  }
  return cars;
}

function writeDemoPhotosTs(photoMap) {
  const entries = Object.entries(photoMap)
    .filter(([, v]) => v && v.url)
    .sort(([a], [b]) => a.localeCompare(b));
  const lines = [
    'import type { CarType } from "@/types/car";',
    "",
    "/** Stable slug — year variants of the same model share one photo. */",
    "export function modelPhotoKey(brandSlug: string, model: string): string {",
    '  const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");',
    "  return `${brandSlug}:${slug}`;",
    "}",
    "",
    "/** Exact model photos from Wikimedia (Wikipedia lead images). */",
    "const MODEL_PHOTOS: Record<string, string> = {",
  ];
  for (const [key, meta] of entries) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(meta.url)},`);
  }
  lines.push("};");
  lines.push("");
  lines.push("export function photoForDemoCar(_type: CarType, brandSlug: string, model: string): string {");
  lines.push("  const key = modelPhotoKey(brandSlug, model);");
  lines.push("  const exact = MODEL_PHOTOS[key];");
  lines.push('  if (!exact) throw new Error(`No curated photo for ${key}`);');
  lines.push("  return exact;");
  lines.push("}");
  lines.push("");
  fs.writeFileSync(path.join(ROOT, "src", "data", "demo-car-photos.ts"), lines.join("\n"), "utf8");
}

function writeAutohomeDemoTs() {
  const listingLines = ACTIVE_LISTINGS.map((row) => {
    const [slug, brand, model, year, type, price, engine, power, fuel, cons, days] = row;
    return `  [${JSON.stringify(slug)}, ${JSON.stringify(brand)}, ${JSON.stringify(model)}, ${year}, ${JSON.stringify(type)}, ${price}, ${JSON.stringify(engine)}, ${JSON.stringify(power)}, ${JSON.stringify(fuel)}, ${JSON.stringify(cons)}, ${days}],`;
  });

  const content = `import type { Car, CarType } from "@/types/car";
import { photoForDemoCar } from "./demo-car-photos";

const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";

type RawListing = [string, string, string, number, CarType, number, string, string, string, string, number];

const LISTINGS: RawListing[] = [
${listingLines.join("\n")}
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function countryFor(slug: string): string {
  if (["toyota", "lexus", "honda", "nissan", "mazda", "subaru"].includes(slug)) return "Japan";
  if (["hyundai", "kia", "genesis"].includes(slug)) return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "skoda") return "Czech Republic";
  if (slug === "land-rover") return "UK";
  if (["tesla", "ford"].includes(slug)) return "USA";
  if (["peugeot", "renault"].includes(slug)) return "France";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  return "China";
}

function driveFor(type: CarType, fuel: string, brandSlug: string): string {
  if (fuel === "Electric" && ["tesla", "porsche", "bmw", "nio", "xpeng", "zeekr", "avatr", "xiaomi"].includes(brandSlug)) {
    return type === "sedan" ? "RWD" : "AWD";
  }
  if (type === "suv" || type === "crossover") return "AWD";
  return "FWD";
}

function transmissionFor(fuel: string): string {
  return fuel === "Electric" ? "Single-speed" : "Auto";
}

function estimateCustoms(priceRub: number, engine: string, year: number, fuel: string): number {
  const ageYears = Math.max(0, new Date().getFullYear() - year);
  let cc = 2000;
  if (fuel === "Electric") cc = 0;
  else {
    const match = engine.match(/([\\d.]+)\\s*[lL]/);
    if (match) cc = Math.round(parseFloat(match[1]) * 1000);
  }
  const ageFactor = ageYears <= 3 ? 1.2 : ageYears <= 5 ? 1.0 : 0.85;
  const dutyBase = fuel === "Electric" ? priceRub * 0.15 : priceRub * 0.15 * (cc / 2000 || 1);
  const duty = Math.round(dutyBase * ageFactor);
  const vat = Math.round((priceRub + duty) * 0.2);
  return duty + vat + (ageYears <= 3 ? 5200 : 2600);
}

function buildOne(entry: RawListing): Car {
  const [brandSlug, brand, model, year, type, priceCny, engine, power, fuel, consumption, deliveryDays] = entry;
  const id = \`ah-\${slugify(brand)}-\${slugify(model)}-\${year}\`;
  const price = Math.round(priceCny * RATE);
  const photo = photoForDemoCar(type, brandSlug, model);
  return {
    id, brand, brandSlug, model, year, type, price,
    customsCost: estimateCustoms(price, engine, year, fuel),
    deliveryDays, country: countryFor(brandSlug), imageColor: "#1a3a5c",
    specs: {
      engine, power,
      transmission: transmissionFor(fuel),
      drive: driveFor(type, fuel, brandSlug),
      fuel, consumption,
    },
    description: \`\${brand} \${model} \${year} — импорт под ключ с расчётом таможни и доставкой.\`,
    sync: {
      source: "autohome", sourceId: id, sourceUrl: "https://www.autohome.com.cn/",
      photos: [photo], priceCny, exchangeRate: RATE, exchangeBank: "VTB",
      exchangeRateAt: SYNCED_AT, customsSource: "tks.ru", syncedAt: SYNCED_AT,
    },
  };
}

function altListing(entry: RawListing): RawListing {
  const year = entry[3];
  const altYear = year >= 2024 ? 2023 : 2024;
  const priceFactor = altYear < year ? 0.88 : 1.06;
  return [
    entry[0], entry[1], entry[2], altYear, entry[4],
    Math.round(entry[5] * priceFactor), entry[6], entry[7], entry[8], entry[9],
    entry[10] + (altYear === 2023 ? 2 : 0),
  ];
}

function buildDemoCars(): Car[] {
  const cars: Car[] = [];
  LISTINGS.forEach((entry) => {
    cars.push(buildOne(entry));
    cars.push(buildOne(altListing(entry)));
  });
  return cars;
}

export const autohomeDemoCars: Car[] = buildDemoCars();
`;
  fs.writeFileSync(path.join(ROOT, "src", "data", "cars.autohome-demo.ts"), content, "utf8");
}

function patchNextConfig() {
  const file = path.join(ROOT, "next.config.ts");
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("upload.wikimedia.org")) {
    text = text.replace(
      '{ protocol: "https", hostname: "images.unsplash.com" },',
      '{ protocol: "https", hostname: "images.unsplash.com" },\n      { protocol: "https", hostname: "upload.wikimedia.org" },'
    );
    fs.writeFileSync(file, text, "utf8");
    console.log("Patched next.config.ts for upload.wikimedia.org");
  }
}

function patchExportCatalogForce() {
  // Keep keep-logic for normal builds, but this script writes catalog directly.
}

async function main() {
  console.log(`Models: ${ACTIVE_LISTINGS.length}, expected cars: ${ACTIVE_LISTINGS.length * 2}`);
  const cache = await resolveAllPhotos();
  const missing = [];
  const photoMap = {};
  for (const row of ACTIVE_LISTINGS) {
    const key = modelPhotoKey(row[0], row[2]);
    const hit = cache[key];
    if (!hit?.url) missing.push(key + " <- " + row[11]);
    else photoMap[key] = hit.url;
  }
  if (missing.length) {
    console.error("Missing photos:", missing.length);
    console.error(missing.join("\n"));
    process.exit(1);
  }

  writeDemoPhotosTs(cache);
  writeAutohomeDemoTs();
  patchNextConfig();

  const cars = buildCars(photoMap);
  const outFile = path.join(ROOT, "data", "cars.catalog.json");
  fs.writeFileSync(outFile, JSON.stringify(cars, null, 2), "utf8");
  console.log(`Wrote ${cars.length} cars -> ${outFile}`);

  // Spot-check
  const samples = [
    
    "ah-toyota-camry-2024",
    "ah-bmw-x5-2023",
    "ah-tesla-model-y-2024",
    "ah-haval-h6-2024",
    "ah-xiaomi-su7-2024",
    "ah-nio-et5-2024",
    "ah-mercedes-benz-e-class-2024",
    "ah-audi-q5-2023",
    "ah-tank-300-2024",
  ];
  for (const id of samples) {
    const c = cars.find((x) => x.id === id);
    if (!c) {
      console.log("MISSING SAMPLE", id);
      continue;
    }
    console.log(
      id,
      c.specs.fuel,
      c.specs.power,
      c.sync.photos[0].includes("wikimedia") ? "wikimedia-ok" : c.sync.photos[0]
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
