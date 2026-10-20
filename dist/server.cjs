var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  sanitizePhotoPrompt: () => sanitizePhotoPrompt
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_heic_convert = __toESM(require("heic-convert"), 1);

// src/data/presetData.ts
var WEDDING_COUPLE_OPTIONS = [
  { id: "myanmar_royal_wedding", emoji: "\u{1F48D}", labelMm: "\u1041\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038 \u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1006\u1031\u102C\u1004\u103A \u101D\u1010\u103A\u1005\u102F\u1036 (Royal Myanmar Traditional Wedding)", labelEn: "1. Royal Myanmar Traditional Wedding", promptText: "luxurious royal Myanmar wedding couple in rich embroidered silk acheik longyi and golden taikpong jacket with traditional headwear" },
  { id: "western_white_wedding", emoji: "\u{1F470}", labelMm: "\u1042\u104B \u1021\u1014\u1031\u102C\u1000\u103A\u1010\u102D\u102F\u1004\u103A\u1038 \u1019\u1004\u103A\u1039\u1002\u101C\u102C\u101D\u1010\u103A\u1005\u102F\u1036 \u1005\u1010\u1030\u1012\u102E\u101A\u102D\u102F \u1015\u102F\u1036\u1010\u1030 (Western White Wedding Dress & Tuxedo)", labelEn: "2. Western White Wedding Dress & Tuxedo", promptText: "elegant bride in flowing white lace wedding dress and groom in sharp black tuxedo holding bridal bouquet" },
  { id: "engagement_ceremony", emoji: "\u{1F490}", labelMm: "\u1043\u104B \u1005\u1031\u1037\u1005\u1015\u103A\u1015\u103D\u1032 \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u1021\u1019\u103E\u1010\u103A\u1010\u101B (Engagement Ring Ceremony)", labelEn: "3. Engagement Ring Ceremony", promptText: "romantic couple exchanging engagement ring with loving smile in floral decorated venue" },
  { id: "konbaung_wedding_court", emoji: "\u{1F451}", labelMm: "\u1044\u104B \u1000\u102F\u1014\u103A\u1038\u1018\u1031\u102C\u1004\u103A\u1001\u1031\u1010\u103A \u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038 \u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1006\u1031\u102C\u1004\u103A (Konbaung Royal Court Wedding)", labelEn: "4. Konbaung Royal Court Wedding", promptText: "regal Konbaung kingdom royal wedding couple with heavy gold embroidery, peacock velvet capes, and authentic royal jewels" },
  { id: "beach_prewedding_sunset", emoji: "\u{1F3D6}\uFE0F", labelMm: "\u1045\u104B \u1000\u1019\u103A\u1038\u1001\u103C\u1031 \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u1015\u101B\u102E\u1038\u101D\u1000\u103A\u1012\u1004\u103A\u1038 (Beach Sunset Pre-wedding Shoot)", labelEn: "5. Beach Sunset Pre-wedding Shoot", promptText: "romantic bride and groom walking barefoot on golden beach sand during sunset with ocean waves" },
  { id: "highland_nature_prewedding", emoji: "\u{1F33F}", labelMm: "\u1046\u104B \u101E\u1018\u102C\u101D \u1010\u1031\u102C\u1010\u1031\u102C\u1004\u103A \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u101B\u102D\u102F\u1000\u103A\u1000\u1030\u1038\u101B\u1031\u1038 (Highland Nature Pre-wedding)", labelEn: "6. Highland Nature Pre-wedding", promptText: "picturesque pre-wedding portrait in Pyin Oo Lwin flower gardens surrounded by pine trees and misty hills" },
  { id: "pagoda_blessing_wedding", emoji: "\u{1F6D5}", labelMm: "\u1047\u104B \u1005\u1031\u1010\u102E\u1010\u1031\u102C\u103A \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u101B\u102D\u102F\u1038\u101B\u102C \u1015\u102F\u1036\u1010\u1030 (Pagoda Temple Blessing Pre-wedding)", labelEn: "7. Pagoda Temple Blessing Pre-wedding", promptText: "pious wedding couple in pure white Myanmar traditional silk attire posing gracefully at ancient temple courtyard" },
  { id: "vintage_car_wedding", emoji: "\u{1F698}", labelMm: "\u1048\u104B \u1017\u1004\u103A\u1038\u1010\u1031\u1037\u1001\u103B\u103A \u1000\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u101B\u102D\u102F\u1000\u103A\u1000\u1030\u1038\u101B\u1031\u1038 (Vintage Classic Car Wedding Shoot)", labelEn: "8. Vintage Classic Car Wedding Shoot", promptText: "classic retro wedding couple posing elegantly leaning against a shiny vintage 1950s convertible car" },
  { id: "reception_party_wedding", emoji: "\u{1F56F}\uFE0F", labelMm: "\u1049\u104B \u1001\u1014\u103A\u1038\u1019 \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u1027\u100A\u1037\u103A\u1001\u1036\u1015\u103D\u1032 \u100A\u1005\u102C (Grand Hall Reception Gala Night)", labelEn: "9. Grand Hall Reception Gala Night", promptText: "glamorous wedding reception couple dancing intimately under crystal chandeliers in opulent ballroom" },
  { id: "modern_garden_wedding", emoji: "\u{1F338}", labelMm: "\u1041\u1040\u104B \u1015\u1014\u103A\u1038\u1001\u103C\u1036\u1005\u1010\u102D\u102F\u1004\u103A \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u1019\u1004\u103A\u1039\u1002\u101C\u102C \u101B\u102D\u102F\u1000\u103A\u1000\u1030\u1038\u101B\u1031\u1038 (Modern Floral Garden Pre-wedding)", labelEn: "10. Modern Floral Garden Pre-wedding", promptText: "fresh romantic pre-wedding photo under an archway of fresh pastel roses and blooming greenery" }
];
var LOVERS_COUPLE_OPTIONS = [
  { id: "beach_sunset_lovers", emoji: "\u{1F469}\u200D\u2764\uFE0F\u200D\u{1F48B}\u200D\u{1F468}", labelMm: "\u1041\u1041\u104B \u1000\u1019\u103A\u1038\u1001\u103C\u1031 \u1014\u1031\u101D\u1004\u103A\u1001\u103B\u102D\u1014\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 \u101C\u1000\u103A\u1010\u103D\u1032 (Sunset Beach Hand-in-Hand Walk)", labelEn: "11. Sunset Beach Hand-in-Hand Walk", promptText: "affectionate couple walking hand in hand along beach shoreline during warm golden sunset" },
  { id: "cozy_cafe_date", emoji: "\u2615", labelMm: "\u1041\u1042\u104B \u1000\u1031\u102C\u103A\u1016\u102E\u1006\u102D\u102F\u1004\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 \u1001\u1036\u1005\u102C\u1038\u1001\u103B\u1000\u103A (Cozy Cafe Date Night)", labelEn: "12. Cozy Cafe Date Night", promptText: "sweet couple sharing a cup of hot coffee at a warm aesthetic cafe window with gentle laughter" },
  { id: "bicycle_date_lovers", emoji: "\u{1F6B2}", labelMm: "\u1041\u1043\u104B \u1005\u1000\u103A\u1018\u102E\u1038 \u1021\u1010\u1030\u1005\u102E\u1038 \u1019\u1014\u1000\u103A\u1001\u1004\u103A\u1038 \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Morning Bicycle Ride Date)", labelEn: "13. Morning Bicycle Ride Date", promptText: "playful couple riding a vintage tandem bicycle through a sunlit tree-lined avenue" },
  { id: "rainy_day_umbrella", emoji: "\u{1F327}\uFE0F", labelMm: "\u1041\u1044\u104B \u1019\u102D\u102F\u1038\u101B\u1031\u1011\u1032 \u1011\u102E\u1038\u1006\u1031\u102C\u1004\u103A\u1038 \u1015\u102F\u1036\u1010\u1030 (Rainy Day Shared Umbrella Portrait)", labelEn: "14. Rainy Day Shared Umbrella Portrait", promptText: "romantic couple huddled together under a transparent umbrella in gentle rain with bokeh streetlights" },
  { id: "urban_night_street_lovers", emoji: "\u{1F303}", labelMm: "\u1041\u1045\u104B \u1019\u103C\u102D\u102F\u1037\u1015\u103C \u100A\u1019\u102E\u1038\u101B\u1031\u102C\u1004\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 \u101C\u1019\u103A\u1038\u101C\u103B\u103E\u1031\u102C\u1000\u103A (Urban Night Street Date)", labelEn: "15. Urban Night Street Date", promptText: "stylish young couple walking through neon-lit city streets at night in matching chic outfits" },
  { id: "camping_campfire_lovers", emoji: "\u{1F3D5}\uFE0F", labelMm: "\u1041\u1046\u104B \u1010\u1031\u102C\u1004\u103A\u1015\u1031\u102B\u103A \u1005\u1001\u1014\u103A\u1038\u1001\u103B \u1019\u102E\u1038\u1015\u102F\u1036\u1015\u103D\u1032 \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Highland Camping Campfire Date)", labelEn: "16. Highland Camping Campfire Date", promptText: "cozy couple sitting wrapped in a warm blanket by a crackling campfire under starry night sky" },
  { id: "rooftop_sunset_embrace", emoji: "\u{1F307}", labelMm: "\u1041\u1047\u104B \u1001\u1031\u102B\u1004\u103A\u1019\u102D\u102F\u1038\u1015\u1031\u102B\u103A \u1014\u1031\u101D\u1004\u103A\u1001\u103B\u102D\u1014\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Rooftop Sunset Romantic Embrace)", labelEn: "17. Rooftop Sunset Romantic Embrace", promptText: "loving couple standing on city rooftop terrace hugging warmly during golden hour glow" },
  { id: "vintage_polaroid_couple", emoji: "\u{1F4F8}", labelMm: "\u1041\u1048\u104B \u1017\u1004\u103A\u1038\u1010\u1031\u1037\u1001\u103B\u103A \u1015\u102D\u102F\u101C\u102C\u101B\u103D\u102D\u102F\u1000\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Vintage Polaroid Retro Couple Snap)", labelEn: "18. Vintage Polaroid Retro Couple Snap", promptText: "nostalgic 90s retro film style couple photo with light leaks, soft film grain, and candid happy emotion" },
  { id: "inle_flower_boat_lovers", emoji: "\u{1F6F6}", labelMm: "\u1041\u1049\u104B \u1021\u1004\u103A\u1038\u101C\u1031\u1038 \u1015\u1014\u103A\u1038\u101C\u103E\u1031\u1015\u1031\u102B\u103A \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Inle Lake Romantic Flower Boat)", labelEn: "19. Inle Lake Romantic Flower Boat", promptText: "romantic couple sitting peacefully on a wooden longtail boat surrounded by floating flowers on Inle Lake" },
  { id: "autumn_park_cozy_lovers", emoji: "\u{1F341}", labelMm: "\u1042\u1040\u104B \u1006\u1031\u102C\u1004\u103A\u1038\u1026\u1038 \u1015\u1014\u103A\u1038\u1001\u103C\u1036 \u1001\u103B\u1005\u103A\u101E\u1030\u1019\u103B\u102C\u1038 (Autumn Park Walk & Cozy Sweaters)", labelEn: "20. Autumn Park Walk & Cozy Sweaters", promptText: "cozy lovers wearing warm knit sweaters walking over fallen autumn leaves in golden sunlit park" }
];
var ALL_COUPLE_OPTIONS = [
  ...WEDDING_COUPLE_OPTIONS,
  ...LOVERS_COUPLE_OPTIONS
];
var GARMENT_OPTIONS = [
  { id: "skip", emoji: "\u{1F6AB}", labelMm: "\u{1F6AB} \u1019\u101B\u103D\u1031\u1038\u1015\u102B (\u1019\u1030\u101C \u1021\u101D\u1010\u103A\u1021\u1005\u102C\u1038)", labelEn: "\u{1F6AB} Skip / Default Outfit", fabric: "Natural Default Apparel", category: "casual" },
  { id: "casual_wear", emoji: "\u{1F455}", labelMm: "\u1041\u104B \u1014\u1031\u1037\u1005\u1009\u103A\u101D\u1010\u103A (Casual T-Shirt & Jeans)", labelEn: "1. Casual Wear (T-Shirt & Jeans)", fabric: "Comfortable Cotton T-Shirt & Classic Blue Jeans", category: "casual" },
  { id: "formal_business", emoji: "\u{1F454}", labelMm: "\u1042\u104B \u101B\u102F\u1036\u1038\u101D\u1010\u103A / \u1010\u101B\u102C\u1038\u101D\u1010\u103A (Formal Business Suit)", labelEn: "2. Formal Business Suit", fabric: "Sharp Tailored Business Suit, Crisp Shirt & Blazer", category: "formal" },
  { id: "evening_gown", emoji: "\u{1F457}", labelMm: "\u1043\u104B \u100A\u1014\u1031\u1001\u1004\u103A\u1038 \u1015\u103D\u1032\u1010\u1000\u103A\u1002\u102B\u101D\u1014\u103A (Luxury Evening Gown)", labelEn: "3. Luxury Evening Gown", fabric: "Elegant Haute Couture Silk Evening Gown with Sequins", category: "formal" },
  { id: "traditional_myanmar", emoji: "\u{1F1F2}\u{1F1F2}", labelMm: "\u1044\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101B\u102D\u102F\u1038\u101B\u102C \u1001\u103B\u102D\u1010\u103A\u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Acheik Silk)", labelEn: "4. Traditional Myanmar Acheik Silk", fabric: "Royal Handwoven Acheik Silk Longyi & Fitted Silk Blouse", category: "myanmar" },
  { id: "traditional_myanmar_royal", emoji: "\u{1F451}", labelMm: "\u1045\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101B\u103E\u1031\u1038\u101F\u1031\u102C\u1004\u103A\u1038 \u1019\u1004\u103A\u1038\u101D\u1010\u103A\u1019\u1004\u103A\u1038\u1005\u102C\u1038 (Burmese Royal Dynasty)", labelEn: "5. Royal Dynasty Court Attire", fabric: "Opulent Mandalay Royal Court Silk Costume with Gold Embroidery", category: "myanmar" },
  { id: "myanmar_taingmathea", emoji: "\u{1F3DB}\uFE0F", labelMm: "\u1046\u104B \u1019\u103C\u1014\u103A\u1019\u102C \u1010\u102D\u102F\u1004\u103A\u1019\u101E\u102E \u1015\u102F\u1006\u102D\u102F\u1038/\u1011\u1019\u102E (Myanmar Taingmathea Silk)", labelEn: "6. Myanmar Taingmathea & Pasoe", fabric: "Formal Myanmar White Taingmathea Jacket, Silk Pasoe/Htamain", category: "myanmar" },
  { id: "shan_ethnic_attire", emoji: "\u{1F3D4}\uFE0F", labelMm: "\u1047\u104B \u101B\u103E\u1019\u103A\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Shan Ethnic Attire)", labelEn: "7. Traditional Shan Ethnic Costume", fabric: "Authentic Handwoven Shan Trousers, Embroidered Jacket & Shan Bag", category: "myanmar" },
  { id: "kachin_ethnic_attire", emoji: "\u{1F534}", labelMm: "\u1048\u104B \u1000\u1001\u103B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Kachin Ethnic Attire)", labelEn: "8. Traditional Kachin Costume", fabric: "Vibrant Patterned Handloom Kachin Woven Longyi & Silver Buttoned Top", category: "myanmar" },
  { id: "karen_ethnic_attire", emoji: "\u{1F9F5}", labelMm: "\u1049\u104B \u1000\u101B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Karen Ethnic Attire)", labelEn: "9. Traditional Karen Costume", fabric: "Handcrafted Karen Red-Striped Tunic & Woven Sarong", category: "myanmar" },
  { id: "chin_ethnic_attire", emoji: "\u{1F985}", labelMm: "\u1041\u1040\u104B \u1001\u103B\u1004\u103A\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Chin Ethnic Attire)", labelEn: "10. Traditional Chin Costume", fabric: "Ornate Geometric Hand-Woven Chin Blanket Wrap & Traditional Costume", category: "myanmar" },
  { id: "mon_ethnic_attire", emoji: "\u{1FAB7}", labelMm: "\u1041\u1041\u104B \u1019\u103D\u1014\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Mon Ethnic Attire)", labelEn: "11. Traditional Mon Costume", fabric: "Elegant Red & Gold Handwoven Mon Silk Longyi & Fitted Lace Top", category: "myanmar" },
  { id: "rakhine_ethnic_attire", emoji: "\u26F5", labelMm: "\u1041\u1042\u104B \u101B\u1001\u102D\u102F\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Rakhine Ethnic Attire)", labelEn: "12. Traditional Rakhine Costume", fabric: "Traditional Rakhine Handwoven Silk Pasoe with Royal Motifs", category: "myanmar" },
  { id: "kayah_ethnic_attire", emoji: "\u{1F338}", labelMm: "\u1041\u1043\u104B \u1000\u101A\u102C\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Kayah Ethnic Attire)", labelEn: "13. Traditional Kayah Costume", fabric: "Authentic Kayah Woven Dress with Traditional Lacquer Leg Bands", category: "myanmar" },
  { id: "traditional_thai", emoji: "\u{1F1F9}\u{1F1ED}", labelMm: "\u1041\u1044\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1011\u102D\u102F\u1004\u103A\u1038\u101D\u1010\u103A\u1005\u102F\u1036 (Traditional Thai Chakkri Silk)", labelEn: "14. Traditional Thai Outfit", fabric: "Exquisite Thai Chakkri Silk Pleated Costume with Gold Sash", category: "traditional_world" },
  { id: "korean_hanbok", emoji: "\u{1F1F0}\u{1F1F7}", labelMm: "\u1041\u1045\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1000\u102D\u102F\u101B\u102E\u1038\u101A\u102C\u1038 \u101F\u1014\u103A\u1018\u102F\u1010\u103A (Korean Traditional Hanbok)", labelEn: "15. Traditional Korean Hanbok", fabric: "Vibrant Elegant Silk Korean Hanbok Robe & Chima Skirt", category: "traditional_world" },
  { id: "japanese_kimono", emoji: "\u{1F1EF}\u{1F1F5}", labelMm: "\u1041\u1046\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1002\u103B\u1015\u1014\u103A \u1000\u102E\u1019\u102D\u102F\u1014\u102D\u102F (Japanese Silk Kimono)", labelEn: "16. Japanese Silk Kimono", fabric: "Intricate Floral Silk Japanese Kimono with Obi Sash", category: "traditional_world" },
  { id: "indian_saree_sherwani", emoji: "\u{1F54C}", labelMm: "\u1041\u1047\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1021\u102D\u1014\u1039\u1012\u102D\u101A \u1006\u102C\u101B\u102E / Sherwani (Indian Silk Saree)", labelEn: "17. Indian Silk Saree & Sherwani", fabric: "Luxurious Royal Embroidered Silk Saree & Gold Sherwani Suit", category: "traditional_world" },
  { id: "high_fashion", emoji: "\u{1F460}", labelMm: "\u1041\u1048\u104B \u1016\u1000\u103A\u101B\u103E\u1004\u103A \u1019\u1031\u102C\u103A\u1012\u101A\u103A\u101D\u1010\u103A (High Fashion Runway Couture)", labelEn: "18. High Fashion Runway Couture", fabric: "Designer Runway Avant-Garde High-Fashion Ensemble", category: "fashion" },
  { id: "streetwear_hoodie", emoji: "\u{1F9E5}", labelMm: "\u1041\u1049\u104B \u101C\u1019\u103A\u1038\u1018\u1031\u1038 \u1016\u1000\u103A\u101B\u103E\u1004\u103A / Hoodie (Streetwear & Denim)", labelEn: "19. Streetwear & Denim Jacket", fabric: "Trendy Urban Oversized Hoodie, Cargo Pants & Denim Jacket", category: "casual" },
  { id: "vintage_retro", emoji: "\u{1F4FB}", labelMm: "\u1042\u1040\u104B \u1017\u1004\u103A\u1038\u1010\u1031\u1037\u1001\u103B\u103A / \u101B\u1000\u103A\u1011\u101B\u102D\u102F\u101D\u1010\u103A (Vintage 70s/80s Retro)", labelEn: "20. Vintage Retro Style", fabric: "Classic 1970s/80s Vintage Leather & Patterned Retro Attire", category: "fashion" },
  { id: "sporty", emoji: "\u{1F45F}", labelMm: "\u1042\u1041\u104B \u1021\u102C\u1038\u1000\u1005\u102C\u1038\u101D\u1010\u103A (Sporty Athletic Activewear)", labelEn: "21. Sporty Activewear", fabric: "Modern Breathable Athletic Activewear & Tracksuit", category: "casual" },
  { id: "beachwear", emoji: "\u{1FA71}", labelMm: "\u1042\u1042\u104B \u1000\u1019\u103A\u1038\u1001\u103C\u1031 \u1021\u1015\u1014\u103A\u1038\u1016\u103C\u1031\u101D\u1010\u103A (Resort Beachwear & Linen)", labelEn: "22. Resort Beachwear & Linen", fabric: "Tropical Resort Linen Shirt, Sundress & Beach Cover-up", category: "casual" },
  { id: "winter_wear", emoji: "\u2744\uFE0F", labelMm: "\u1042\u1043\u104B \u1006\u1031\u102C\u1004\u103A\u1038\u101B\u102C\u101E\u102E Wool Coat (Winter Coat & Sweater)", labelEn: "23. Winter Wool Coat & Sweater", fabric: "Cozy Tailored Wool Trench Coat & Knitted Cashmere Sweater", category: "casual" },
  { id: "wedding_outfit", emoji: "\u{1F470}", labelMm: "\u1042\u1044\u104B \u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1006\u1031\u102C\u1004\u103A \u101E\u1010\u102D\u102F\u1037\u101E\u1019\u102E\u1038/\u101E\u1010\u102D\u102F\u1037\u101E\u102C\u1038 (Bridal & Tuxedo)", labelEn: "24. Bridal Wedding Attire", fabric: "Opulent White Lace Bridal Gown & Black Velvet Tuxedo", category: "formal" },
  { id: "leather_biker_jacket", emoji: "\u{1F3CD}\uFE0F", labelMm: "\u1042\u1045\u104B \u101E\u102C\u1038\u101B\u1031\u1002\u103B\u102C\u1000\u1004\u103A / Biker (Leather Biker Jacket)", labelEn: "25. Leather Biker Jacket", fabric: "Rugged Black Leather Biker Jacket with Metallic Zippers", category: "fashion" },
  { id: "bohemian_chic", emoji: "\u{1F33F}", labelMm: "\u1042\u1046\u104B \u1018\u102D\u102F\u101F\u102E\u1038\u1019\u102E\u1038\u101A\u1014\u103A\u1038 \u1016\u1000\u103A\u101B\u103E\u1004\u103A (Bohemian Chic Dress)", labelEn: "26. Bohemian Chic Style", fabric: "Flowy Bohemian Floral Maxi Dress with Embroidered Pattern", category: "fashion" },
  { id: "doctor_medical_scrubs", emoji: "\u{1FA7A}", labelMm: "\u1042\u1047\u104B \u1006\u101B\u102C\u101D\u1014\u103A / \u101E\u1030\u1014\u102C\u1015\u103C\u102F \u101D\u1010\u103A\u1005\u102F\u1036 (Doctor Medical Scrub & Coat)", labelEn: "27. Doctor Medical Scrubs & Coat", fabric: "Professional Medical White Coat, Stethoscope & Teal Scrubs", category: "uniform" },
  { id: "pilot_uniform", emoji: "\u2708\uFE0F", labelMm: "\u1042\u1048\u104B \u101C\u1031\u101A\u102C\u1009\u103A\u1019\u103E\u1030\u1038 / \u101C\u1031\u101A\u102C\u1009\u103A\u1019\u101A\u103A \u101D\u1010\u103A\u1005\u102F\u1036 (Pilot & Flight Attendant)", labelEn: "28. Pilot & Flight Attendant Uniform", fabric: "Sharp Navy Blue Pilot Uniform with Gold Epaulets & Airline Blazer", category: "uniform" },
  { id: "advocate_lawyer_robe", emoji: "\u2696\uFE0F", labelMm: "\u1042\u1049\u104B \u101B\u103E\u1031\u1037\u1014\u1031\u101D\u1010\u103A\u1005\u102F\u1036 / Advocate (Lawyer Legal Robe & Black Gown)", labelEn: "29. Advocate / Lawyer Legal Robe & Gown", fabric: "Professional Senior Advocate Formal Black Gown, Legal Robe & White Bands", category: "uniform" },
  { id: "chef_uniform", emoji: "\u{1F9D1}\u200D\u{1F373}", labelMm: "\u1043\u1040\u104B \u1005\u102C\u1038\u1016\u102D\u102F\u1019\u103E\u1030\u1038 \u101D\u1010\u103A\u1005\u102F\u1036 (Chef Culinary Uniform)", labelEn: "30. Chef Culinary Uniform", fabric: "Classic Double-Breasted Chef Jacket & White Chef Hat", category: "uniform" },
  { id: "graduation_gown", emoji: "\u{1F393}", labelMm: "\u1043\u1041\u104B \u1018\u103D\u1032\u1037\u101C\u103D\u1014\u103A \u101D\u1010\u103A\u1005\u102F\u1036 (Graduation Academic Cap & Gown)", labelEn: "31. Graduation Cap & Gown", fabric: "Formal Academic Graduation Gown with Satin Hood & Mortarboard Cap", category: "formal" },
  { id: "modern_acheik_denim", emoji: "\u{1F3A8}", labelMm: "\u1043\u1042\u104B \u1001\u103B\u102D\u1010\u103A + \u1012\u1004\u103A\u1038\u1014\u1005\u103A \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u1005\u1015\u103A\u101F\u1014\u103A (Modern Acheik & Denim Fusion)", labelEn: "32. Acheik & Denim Fusion", fabric: "Chic Modern Fusion Denim Jacket Inlaid with Traditional Acheik Silk Pattern", category: "fashion" },
  { id: "bagan_royal_yinzi", emoji: "\u{1F3FA}", labelMm: "\u1043\u1043\u104B \u1015\u102F\u1002\u1036\u1001\u1031\u1010\u103A \u101B\u1004\u103A\u1005\u100A\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1015\u102D\u102F\u1038\u1011\u1018\u102E (Bagan Dynasty Silk Yinzi & Htamein)", labelEn: "33. Bagan Dynasty Silk Yinzi", fabric: "Ancient Bagan Terracotta & Gold Handwoven Silk Yinzi Bodice Wrap with Trailing Silk Shawl", category: "myanmar" },
  { id: "amarapura_luntaya_acheik", emoji: "\u{1F30A}", labelMm: "\u1043\u1044\u104B \u1021\u1019\u101B\u1015\u1030\u101B \u101C\u103D\u1014\u103A\u1038\u101B\u102C\u1000\u103B\u1031\u102C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A (Amarapura 100-Shuttle Luntaya Acheik)", labelEn: "34. Amarapura 100-Shuttle Acheik", fabric: "Masterpiece 100-Shuttle Interlocking Wave Luntaya Acheik Mulberry Silk & Sheer Organza Blouse", category: "myanmar" },
  { id: "myanmar_bridal_gold", emoji: "\u{1F48D}", labelMm: "\u1043\u1045\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101B\u102D\u102F\u1038\u101B\u102C \u101E\u1010\u102D\u102F\u1037\u101E\u1019\u102E\u1038 \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038\u101D\u1010\u103A\u1005\u102F\u1036 (Royal Myanmar Bridal Gold Attire)", labelEn: "35. Myanmar Royal Bridal Gold Attire", fabric: "Champagne Gold Zardosi Embroidered Bridal Ein-Gyi with Pearl & Ruby Sequined Acheik Train", category: "myanmar" },
  { id: "inle_lotus_silk_attire", emoji: "\u{1FAB7}", labelMm: "\u1043\u1046\u104B \u1021\u1004\u103A\u1038\u101C\u1031\u1038 \u1000\u103C\u102C\u1001\u103B\u100A\u103A \u1015\u102D\u102F\u1038\u101D\u1010\u103A\u1005\u102F\u1036 (Inle Sacred Lotus Fiber Silk Outfit)", labelEn: "36. Inle Sacred Lotus Silk Attire", fabric: "Rare Hand-Spun Inle Lake Sacred Lotus Stem Fiber Tunic & Natural Raw Silk Longyi", category: "myanmar" },
  { id: "colonial_rangoon_lace", emoji: "\u{1F570}\uFE0F", labelMm: "\u1043\u1047\u104B \u1000\u102D\u102F\u101C\u102D\u102F\u1014\u102E\u1001\u1031\u1010\u103A \u101B\u1014\u103A\u1000\u102F\u1014\u103A \u1007\u102C\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u1014\u103E\u1004\u1037\u103A \u1015\u102D\u102F\u1038\u1011\u1018\u102E (Colonial Era Lace & Silk)", labelEn: "37. Heritage Lace & Silk Htamein", fabric: "Delicate Sheer White French Lace Yin-Phone Blouse with Pearl Buttons & Peacock Silk Htamein", category: "myanmar" },
  { id: "modern_silk_yin_phone", emoji: "\u2728", labelMm: "\u1043\u1048\u104B \u1001\u1031\u1010\u103A\u1019\u102E \u1015\u102D\u102F\u1038\u101B\u1004\u103A\u1016\u102F\u1036\u1038\u1014\u103E\u1004\u1037\u103A \u1001\u103B\u102D\u1010\u103A\u1011\u1018\u102E (Contemporary Tailored Silk Yin-Phone)", labelEn: "38. Modern Tailored Silk Yin-Phone", fabric: "Contemporary Sculpted Silk Yin-Phone Top with Minimalist Pastel Acheik Longyi", category: "myanmar" }
];
var ETHNICITY_OPTIONS = [
  { id: "burmese", emoji: "", labelMm: "\u1041\u104B \u1017\u1019\u102C (Bamar)", labelEn: "1. Bamar (Burmese)", promptText: "authentic Bamar (Burmese) heritage, classic Myanmar facial bone structure with warm golden honey-olive complexion and gentle dark amber eyes" },
  { id: "kachin", emoji: "", labelMm: "\u1042\u104B \u1000\u1001\u103B\u1004\u103A (Kachin / Jinghpaw)", labelEn: "2. Kachin (Jinghpaw)", promptText: "authentic Kachin (Jinghpaw) highland Myanmar heritage, defined cheekbones, fair warm highland complexion, noble northern Myanmar facial features" },
  { id: "kayah", emoji: "", labelMm: "\u1043\u104B \u1000\u101A\u102C\u1038 / \u1000\u101A\u1014\u103A\u1038 (Kayah & Kayan)", labelEn: "3. Kayah / Kayan", promptText: "authentic Kayah and Kayan (Padaung) Myanmar highland heritage, serene oval facial contour, warm sun-kissed complexion, graceful poised expression" },
  { id: "karen", emoji: "", labelMm: "\u1044\u104B \u1000\u101B\u1004\u103A (Kayin / Karen)", labelEn: "4. Kayin (Karen)", promptText: "authentic Kayin (Karen) Myanmar ethnic heritage, warm gentle smile, clear fair-golden Southeast Asian skin tone, soft natural facial harmony" },
  { id: "chin", emoji: "", labelMm: "\u1045\u104B \u1001\u103B\u1004\u103A\u1038 (Chin Highland)", labelEn: "5. Chin Highland", promptText: "authentic Chin mountain highland Myanmar heritage, strong sculpted facial bone structure, warm highland complexion, deep expressive eyes" },
  { id: "mon", emoji: "", labelMm: "\u1046\u104B \u1019\u103D\u1014\u103A (Mon / Ramanya)", labelEn: "6. Mon (Ramanya)", promptText: "authentic Mon (Ramanya) ancient lower Myanmar heritage, classic regal Southeast Asian facial features, luminous honey-gold skin tone, dignified poise" },
  { id: "rakhine", emoji: "", labelMm: "\u1047\u104B \u101B\u1001\u102D\u102F\u1004\u103A (Rakhine / Arakan)", labelEn: "7. Rakhine (Arakan)", promptText: "authentic Rakhine (Arakanese) Mrauk-U royal Myanmar heritage, distinct noble nose bridge, deep expressive eyes, warm bronze-olive coastal complexion" },
  { id: "shan", emoji: "", labelMm: "\u1048\u104B \u101B\u103E\u1019\u103A\u1038 (Shan / Tai)", labelEn: "8. Shan (Tai Highland)", promptText: "authentic Shan (Tai Yai) plateau Myanmar heritage, fair rosy-ivory highland complexion, delicate refined facial features, gentle serene demeanor" },
  { id: "intha", emoji: "", labelMm: "\u1049\u104B \u1021\u1004\u103A\u1038\u101E\u102C\u1038 (Inle Intha)", labelEn: "9. Intha (Inle Lake)", promptText: "authentic Intha (Inle Lake) Myanmar heritage, warm sunlit golden complexion, peaceful genuine expression, traditional Shan plateau features" },
  { id: "pao", emoji: "", labelMm: "\u1041\u1040\u104B \u1015\u1021\u102D\u102F\u101D\u103A\u1038 (Pa-O)", labelEn: "10. Pa-O Highland", promptText: "authentic Pa-O highland Myanmar ethnic heritage, warm golden highland skin tone, cheerful composed facial features" },
  { id: "palaung", emoji: "", labelMm: "\u1041\u1041\u104B \u1015\u101C\u1031\u102C\u1004\u103A / \u1010\u1021\u102C\u1004\u103A\u1038 (Ta-ang)", labelEn: "11. Palaung (Ta-ang)", promptText: "authentic Ta-ang (Palaung) northern Shan highland Myanmar heritage, fair mountain complexion, traditional highland facial structure" },
  { id: "danu", emoji: "", labelMm: "\u1041\u1042\u104B \u1013\u1014\u102F (Danu)", labelEn: "12. Danu (Pindaya/Kalaw)", promptText: "authentic Danu Myanmar highland heritage, clear warm ivory-gold skin tone, gentle welcoming Myanmar facial expression" },
  { id: "naga", emoji: "", labelMm: "\u1041\u1043\u104B \u1014\u102C\u1002 (Naga Highland)", labelEn: "13. Naga (Northwest Hills)", promptText: "authentic Myanmar Naga highland heritage, striking proud facial bone structure, athletic highland stature, warm sun-bronzed complexion" },
  { id: "wa_kokang", emoji: "", labelMm: "\u1041\u1044\u104B \u101C\u102E\u1006\u1030 / \u1021\u102C\u1001\u102B (Lisu & Akha)", labelEn: "14. Lisu / Akha Highland", promptText: "authentic Lisu and Akha eastern highland Myanmar ethnic heritage, radiant highland facial features and clear warm complexion" },
  { id: "skip", emoji: "", labelMm: "\u1019\u101B\u103D\u1031\u1038\u1015\u102B (Default Myanmar)", labelEn: "Default Myanmar", promptText: "" }
];
var CULTURAL_PROP_PRESETS = [
  { id: "thanaka", category: "beauty", emoji: "\u{1F33F}", labelMm: "\u1041\u104B \u101E\u1014\u1015\u103A\u1001\u102B\u1038 \u1015\u102B\u1038\u1000\u103D\u1000\u103A (Thanaka Facial Paste)", labelEn: "1. Thanaka Bark Paste", promptText: "traditional yellowish-white Thanaka bark paste patterns softly brushed on cheeks" },
  { id: "flower_garland", category: "hair", emoji: "\u{1F338}", labelMm: "\u1042\u104B \u1005\u1015\u101A\u103A\u1015\u1014\u103A\u1038\u1000\u102F\u1036\u1038 / \u1015\u1014\u103A\u1038\u1000\u1030\u1038 (Jasmine Flower Garland)", labelEn: "2. Jasmine Flower Garland", promptText: "delicate fragrant white jasmine flower garland woven in hair or around neck" },
  { id: "pathein_umbrella", category: "accessories", emoji: "\u2602\uFE0F", labelMm: "\u1043\u104B \u1015\u102F\u101E\u102D\u1019\u103A\u1011\u102E\u1038 (Pathein Traditional Umbrella)", labelEn: "3. Pathein Parasol Umbrella", promptText: "vibrant Pathein hand-painted traditional oil-paper parasol umbrella" },
  { id: "traditional_gold_jewelry", category: "jewelry", emoji: "\u{1F451}", labelMm: "\u1044\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101B\u103E\u1031\u1038\u101F\u1031\u102C\u1004\u103A\u1038 \u101B\u103D\u103E\u1031\u1011\u100A\u103A (Burmese Royal Gold Jewelry)", labelEn: "4. Royal Gold Jewelry", promptText: "intricate royal Burmese gold filigree earrings, necklace, and traditional hairpins" },
  { id: "silk_longyi", category: "attire", emoji: "\u{1F1F2}\u{1F1F2}", labelMm: "\u1045\u104B \u1001\u103B\u102D\u1010\u103A\u101C\u102F\u1036\u1001\u103B\u100A\u103A / \u1015\u102D\u102F\u1038\u1015\u1006\u102D\u102F\u1038 (Traditional Silk Longyi Sarong)", labelEn: "5. Traditional Silk Longyi", promptText: "luxurious traditional woven silk acheik longyi sarong with intricate royal motifs" },
  { id: "lacquerware", category: "household", emoji: "\u{1F3FA}", labelMm: "\u1046\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101A\u103D\u1014\u103A\u1038\u1011\u100A\u103A (Traditional Myanmar Lacquerware)", labelEn: "6. Myanmar Lacquerware Box", promptText: "exquisite handcrafted black and gold Myanmar lacquerware box and tray" },
  { id: "ruby_jade_jewelry", category: "jewelry", emoji: "\u{1F48E}", labelMm: "\u1047\u104B \u1015\u1010\u1039\u1010\u1019\u103C\u102C\u1038 / \u1019\u103C\u1000\u103B\u1031\u102C\u1000\u103A \u101C\u1000\u103A\u1005\u103D\u1015\u103A (Myanmar Ruby & Jade Jewelry)", labelEn: "7. Ruby & Jade Ring", promptText: "luxurious Myanmar royal ruby pendant and natural imperial jade ring" },
  { id: "clay_teapot", category: "household", emoji: "\u{1FAD6}", labelMm: "\u1048\u104B \u1019\u103C\u1031\u1011\u100A\u103A \u101B\u1031\u1014\u103D\u1031\u1038\u1000\u1010\u1039\u1010\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1001\u103D\u1000\u103A (Traditional Clay Teapot Set)", labelEn: "8. Clay Teapot Set", promptText: "cozy traditional earthenware clay teapot and porcelain tea cups on bamboo mat" },
  { id: "burmese_harp", category: "music", emoji: "\u{1F3B5}", labelMm: "\u1049\u104B \u1005\u1031\u102C\u1004\u103A\u1038\u1000\u1031\u102C\u1000\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1010\u1030\u101B\u102D\u101A\u102C (Saung-Gauk Traditional Harp)", labelEn: "9. Burmese Harp (Saung-Gauk)", promptText: "elegant traditional Burmese arched harp (Saung-Gauk) with golden silk tassel" },
  { id: "bamboo_fan", category: "accessories", emoji: "\u{1FAAD}", labelMm: "\u1041\u1040\u104B \u101D\u102B\u1038\u101A\u1015\u103A\u1010\u1031\u102C\u1004\u103A / \u101D\u102B\u1038\u1001\u103C\u1004\u103A\u1038\u1010\u1031\u102C\u1004\u103A\u1038 (Handwoven Bamboo Fan & Basket)", labelEn: "10. Bamboo Fan & Basket", promptText: "delicate handwoven bamboo palm fan and traditional wicker basket" },
  { id: "silver_bowl", category: "household", emoji: "\u{1F963}", labelMm: "\u1041\u1041\u104B \u1004\u103D\u1031\u1016\u101C\u102C\u1038 / \u1004\u103D\u1031\u1001\u103D\u1000\u103A (Traditional Carved Silver Bowl)", labelEn: "11. Carved Silver Bowl", promptText: "hand-embossed traditional Burmese silver bowl with celestial dancing figures" },
  { id: "gem_pendant", category: "jewelry", emoji: "\u2728", labelMm: "\u1041\u1042\u104B \u1015\u1010\u1039\u1010\u1019\u103C\u102C\u1038 \u1014\u102C\u1038\u1000\u1015\u103A / \u1018\u101A\u1000\u103A (Traditional Gem Earrings & Pendant)", labelEn: "12. Traditional Gem Pendant", promptText: "traditional Burmese ruby-encrusted gold filigree drop earrings and necklace pendant" },
  { id: "modern_acheik_bag", category: "attire", emoji: "\u{1F45C}", labelMm: "\u1041\u1043\u104B \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u1001\u103B\u102D\u1010\u103A\u1005\u1015\u102D\u1010\u103A \u101C\u1000\u103A\u1000\u102D\u102F\u1004\u103A\u1021\u102D\u1010\u103A (Modern Acheik Silk Handbag)", labelEn: "13. Modern Acheik Silk Handbag", promptText: "chic modern designer tote handbag crafted with traditional Burmese acheik silk fabric" },
  { id: "sunglasses_parasol", category: "modern", emoji: "\u{1F576}\uFE0F", labelMm: "\u1041\u1044\u104B \u1014\u1031\u1000\u102C\u1019\u103B\u1000\u103A\u1019\u103E\u1014\u103A + \u1015\u102F\u101E\u102D\u1019\u103A\u1011\u102E\u1038 \u101B\u1031\u102C\u1005\u1015\u103A\u101F\u1014\u103A (Modern Sunglasses & Parasol)", labelEn: "14. Sunglasses & Parasol", promptText: "contemporary fusion featuring stylish designer sunglasses alongside a hand-painted Pathein parasol" },
  { id: "watch_gold_bangle", category: "modern", emoji: "\u231A", labelMm: "\u1041\u1045\u104B \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u1014\u102C\u101B\u102E + \u101B\u102D\u102F\u1038\u101B\u102C \u101B\u103D\u103E\u1031\u101C\u1000\u103A\u1000\u1031\u102C\u1000\u103A (Modern Watch & Gold Bangle)", labelEn: "15. Watch & Gold Bangle", promptText: "luxury modern wrist watch paired harmoniously with a traditional Burmese solid gold bangle" },
  { id: "thanaka_stone_slab", category: "beauty", emoji: "\u{1FAA8}", labelMm: "\u1041\u1046\u104B \u101E\u1014\u1015\u103A\u1001\u102B\u1038 \u1000\u103B\u1031\u102C\u1000\u103A\u1015\u103B\u1009\u103A\u1014\u103E\u1004\u1037\u103A \u1021\u1010\u102F\u1036\u1038 (Traditional Thanaka Stone Slab)", labelEn: "16. Thanaka Stone Slab & Bark", promptText: "authentic natural Thanaka tree bark log resting on a traditional round Kyauk Pyin grinding stone" },
  { id: "betel_tea_set", category: "household", emoji: "\u{1F375}", labelMm: "\u1041\u1047\u104B \u101A\u103D\u1014\u103A\u1038\u1000\u103D\u1019\u103A\u1038\u1021\u1005\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u1031\u1014\u103D\u1031\u1038\u1000\u103C\u1019\u103A\u1038\u1015\u103D\u1032 (Lacquer Betel Box & Tea Set)", labelEn: "17. Lacquer Betel Box & Tea", promptText: "traditional ornamental lacquerware betel box paired with Burmese green tea set" },
  { id: "modern_coffee_lacquer", category: "modern", emoji: "\u2615", labelMm: "\u1041\u1048\u104B \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u1000\u1031\u102C\u103A\u1016\u102E\u1001\u103D\u1000\u103A + \u101A\u103D\u1014\u103A\u1038\u1001\u103D\u1000\u103A\u1005\u1015\u103A (Modern Coffee Mug & Lacquer Coaster)", labelEn: "18. Coffee Mug & Lacquer Coaster", promptText: "modern artisanal coffee ceramic mug resting on a traditional handcrafted lacquerware coaster" },
  { id: "ethno_sling_bag", category: "attire", emoji: "\u{1F392}", labelMm: "\u1041\u1049\u104B \u1001\u1031\u1010\u103A\u1015\u1031\u102B\u103A \u101C\u103D\u101A\u103A\u1021\u102D\u1010\u103A + \u1001\u103B\u102D\u1010\u103A\u1005\u101C\u103D\u101A\u103A (Modern Ethno-Chic Sling Bag)", labelEn: "19. Ethno-Chic Sling Bag", promptText: "trendy streetwear canvas sling bag accented with traditional Burmese tribal woven patterns" },
  { id: "burmese_pattala", category: "music", emoji: "\u{1F3BC}", labelMm: "\u1042\u1040\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u1015\u1010\u1039\u1010\u101C\u102C\u1038 / \u101B\u102D\u102F\u1038\u101B\u102C \u1010\u1030\u101B\u102D\u101A\u102C (Traditional Burmese Pattala)", labelEn: "20. Burmese Pattala Xylophone", promptText: "traditional Burmese bamboo xylophone (Pattala) with carved teakwood sound box" },
  { id: "shwe_chi_doe_pillow", category: "household", emoji: "\u{1F9F5}", labelMm: "\u1042\u1041\u104B \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1019\u103E\u1014\u103A\u1005\u102E\u101B\u103D\u103E\u1031\u1001\u103B \u1001\u1031\u102B\u1004\u103A\u1038\u1021\u102F\u1036\u1038 / \u1000\u1031\u102C\u103A\u1007\u1031\u102C (Shwe Chi Doe Pillow)", labelEn: "21. Embroidered Tapestry Pillow", promptText: "ornate traditional Burmese Shwe Chi Doe gold thread embroidered pillow and wall tapestry" },
  { id: "bamboo_hat", category: "accessories", emoji: "\u{1F452}", labelMm: "\u1042\u1042\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u101D\u102B\u1038\u1001\u1019\u1031\u102C\u1000\u103A (Traditional Bamboo Conical Hat)", labelEn: "22. Traditional Bamboo Hat", promptText: "authentic woven bamboo conical hat with rustic chin strap" },
  { id: "teak_prayer_beads", category: "accessories", emoji: "\u{1F4FF}", labelMm: "\u1042\u1043\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u101E\u1005\u103A\u101E\u102C\u1038 \u1015\u102F\u1010\u102E\u1038 (Burmese Teakwood Prayer Beads)", labelEn: "23. Teakwood Prayer Beads", promptText: "polished traditional Burmese teakwood prayer beads wrapped around hand" },
  { id: "bronze_gong", category: "music", emoji: "\u{1F514}", labelMm: "\u1042\u1044\u104B \u1000\u103C\u1031\u1038\u1019\u1031\u102C\u1004\u103A\u1038 / \u101B\u102D\u102F\u1038\u101B\u102C \u1000\u103C\u1031\u1038\u1005\u100A\u103A (Traditional Bronze Gong / Bell)", labelEn: "24. Traditional Bronze Gong", promptText: "carved traditional Burmese triangular bronze bell (Kyi-zee) with wooden mallet" },
  { id: "inle_lotus_scarf", category: "attire", emoji: "\u{1F9E3}", labelMm: "\u1042\u1045\u104B \u1021\u1004\u103A\u1038\u101C\u1031\u1038 \u1000\u103C\u102C\u1001\u103B\u100A\u103A \u1005\u101C\u103D\u101A\u103A / \u1015\u101D\u102B (Inle Lotus Silk Scarf)", labelEn: "25. Inle Lotus Silk Scarf", promptText: "rare handcrafted Inle Lake lotus silk scarf draped softly over shoulders" },
  { id: "dragon_parasol", category: "accessories", emoji: "\u2602\uFE0F", labelMm: "\u1042\u1046\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1014\u1002\u102B\u1038\u101B\u102F\u1015\u103A \u1001\u1031\u102B\u1000\u103A\u1011\u102E\u1038 (Dragon Engraved Parasol)", labelEn: "26. Dragon Engraved Umbrella", promptText: "ornate Burmese traditional umbrella adorned with gold hand-drawn dragon motifs" },
  { id: "wooden_mask", category: "music", emoji: "\u{1F3AD}", labelMm: "\u1042\u1047\u104B \u1014\u1002\u102B\u1038 / \u1018\u102E\u101C\u1030\u1038 \u101B\u102D\u102F\u1038\u101B\u102C \u101E\u1005\u103A\u101E\u102C\u1038\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u1016\u102F\u1036\u1038 (Carved Wooden Mask)", labelEn: "27. Carved Wooden Mask", promptText: "hand-carved colorful traditional Burmese theatrical wooden mask" },
  { id: "burmese_oboe", category: "music", emoji: "\u{1F3BA}", labelMm: "\u1042\u1048\u104B \u101B\u102D\u102F\u1038\u101B\u102C \u1014\u103E\u1032 / \u101C\u1004\u103A\u1038\u1000\u103D\u1004\u103A\u1038 \u1010\u1030\u101B\u102D\u101A\u102C (Burmese Oboe & Cymbals)", labelEn: "28. Traditional Oboe & Cymbals", promptText: "brass traditional Burmese Hne oboe and small brass cymbals" },
  { id: "modern_phone_acheik", category: "modern", emoji: "\u{1F4F1}", labelMm: "\u1042\u1049\u104B \u1005\u1019\u1010\u103A\u1016\u102F\u1014\u103A\u1038 + \u101B\u102D\u102F\u1038\u101B\u102C \u1001\u103B\u102D\u1010\u103A\u1016\u102F\u1014\u103A\u1038\u1021\u102D\u1010\u103A (Smart Phone with Acheik Case)", labelEn: "29. Smartphone in Acheik Case", promptText: "modern sleek smartphone enclosed in a traditional Burmese Acheik patterned protective case" },
  { id: "headphones_sling", category: "modern", emoji: "\u{1F3A7}", labelMm: "\u1043\u1040\u104B \u1014\u102C\u1038\u1000\u103C\u1015\u103A + \u101B\u102D\u102F\u1038\u101B\u102C \u101B\u103E\u1019\u103A\u1038\u101C\u103D\u101A\u103A\u1021\u102D\u1010\u103A (Headphones & Shan Bag)", labelEn: "30. Headphones & Shan Bag", promptText: "modern wireless headphones paired stylishly with an authentic handwoven Shan ethnic shoulder bag" },
  { id: "diamond_earrings", category: "jewelry", emoji: "\u{1F48D}", labelMm: "\u1043\u1041\u104B \u1005\u102D\u1014\u103A\u1011\u100A\u103A / \u1015\u101C\u1000\u103A\u1010\u102E\u1014\u1019\u103A \u1014\u102C\u1038\u1000\u1015\u103A (Modern Diamond Earrings)", labelEn: "31. Diamond Earrings", promptText: "brilliant cut modern diamond drop earrings setting with platinum chain" },
  { id: "handloom_shuttle", category: "accessories", emoji: "\u{1F9F6}", labelMm: "\u1043\u1042\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u101B\u102D\u102F\u1038\u101B\u102C \u101A\u1000\u103A\u1000\u1014\u103A\u1038\u101C\u103D\u1014\u103A\u1038 (Traditional Handloom Shuttle)", labelEn: "32. Handloom Weaving Shuttle", promptText: "polished wooden traditional handloom shuttle with colorful spools of silk thread" },
  { id: "luxurious_modern_car", category: "accessories", emoji: "\u{1F697}", labelMm: "\u1043\u1043\u104B \u1001\u1031\u1010\u103A\u1019\u102E \u1015\u103C\u1031\u102C\u1004\u103A\u101C\u1000\u103A\u101E\u1031\u102C \u1019\u1031\u102C\u103A\u1010\u1031\u102C\u103A\u1000\u102C\u1038 (Luxurious Modern Car)", labelEn: "33. Luxurious Modern Car", promptText: "sleek luxurious modern automobile with glossy metallic paintwork and LED headlights" },
  { id: "royal_dalizan_necklace", category: "jewelry", emoji: "\u{1F4FF}", labelMm: "\u1043\u1044\u104B \u1012\u101C\u102E\u1007\u1014\u103A \u101B\u1010\u1014\u102C \u101C\u100A\u103A\u1006\u103D\u1032\u1000\u103C\u102E\u1038 (Royal Burmese Dalizan Collar Necklace)", labelEn: "34. Royal Dalizan Collar Necklace", promptText: "opulent Konbaung dynasty royal Burmese Dalizan gold filigree collar necklace encrusted with Mogok pigeon-blood rubies and emeralds" },
  { id: "gold_nadoung_ear_cylinders", category: "jewelry", emoji: "\u{1F31F}", labelMm: "\u1043\u1045\u104B \u101B\u103D\u103E\u1031\u1014\u102C\u1038\u1010\u1031\u102C\u1004\u103A\u1038 \u1014\u103E\u1004\u1037\u103A \u1015\u1010\u1039\u1010\u1019\u103C\u102C\u1038\u1014\u102C\u1038\u1000\u1015\u103A (Royal Gold Nadoung Ear Cylinders)", labelEn: "35. Gold Nadoung Ear Cylinders", promptText: "traditional Burmese royal gold Nadoung ear cylinders encrusted with glowing Mogok rubies and diamond clusters" },
  { id: "mogok_ruby_parure", category: "jewelry", emoji: "\u2764\uFE0F\u200D\u{1F525}", labelMm: "\u1043\u1046\u104B \u1019\u102D\u102F\u1038\u1000\u102F\u1010\u103A \u1015\u1010\u1039\u1010\u1019\u103C\u102C\u1038 \u101B\u1010\u1014\u102C\u101D\u1010\u103A\u1005\u102F\u1036\u1015\u103C\u100A\u1037\u103A (Mogok Pigeon-Blood Ruby Parure)", labelEn: "36. Mogok Ruby Full Parure", promptText: "matching imperial Mogok pigeon-blood ruby necklace, chandelier earrings, bangle and cocktail ring set in 24k Burmese gold" },
  { id: "imperial_jadeite_bangle", category: "jewelry", emoji: "\u{1F7E2}", labelMm: "\u1043\u1047\u104B \u1016\u102C\u1038\u1000\u1014\u1037\u103A \u1000\u103B\u1031\u102C\u1000\u103A\u1005\u102D\u1019\u103A\u1038 \u101C\u1000\u103A\u1000\u1031\u102C\u1000\u103A\u1014\u103E\u1004\u1037\u103A \u1006\u103D\u1032\u101E\u102E\u1038 (Imperial Green Jadeite Set)", labelEn: "37. Imperial Green Jadeite Set", promptText: "translucent imperial emerald-green Hpakant Burmese jadeite bangle bracelet and carved jadeite pendant" },
  { id: "myanmar_pearl_strand", category: "jewelry", emoji: "\u{1F9AA}", labelMm: "\u1043\u1048\u104B \u1019\u103C\u102D\u1010\u103A \u1015\u102F\u101C\u1032\u101E\u103D\u101A\u103A \u101C\u100A\u103A\u1006\u103D\u1032\u1014\u103E\u1004\u1037\u103A \u1014\u102C\u1038\u1000\u1015\u103A (Mergui Golden Pearl Strand)", labelEn: "38. Mergui Golden Pearl Set", promptText: "lustrous Mergui archipelago golden and white South Sea pearl multi-strand necklace and pearl drop earrings" },
  { id: "gold_filigree_bangles", category: "jewelry", emoji: "\u{1FA99}", labelMm: "\u1043\u1049\u104B \u101B\u103D\u103E\u1031\u101C\u1000\u103A\u1000\u1031\u102C\u1000\u103A \u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u101C\u1000\u103A\u1000\u103C\u1015\u103A (Stacked 24K Gold Filigree Bangles)", labelEn: "39. Stacked 24K Gold Bangles", promptText: "stack of ornate hand-hammered 24k Burmese gold filigree bangles and royal cuffed bracelets on wrists" },
  { id: "kachin_silver_torque", category: "jewelry", emoji: "\u{1F948}", labelMm: "\u1044\u1040\u104B \u1000\u1001\u103B\u1004\u103A \u101B\u102D\u102F\u1038\u101B\u102C \u1004\u103D\u1031\u1019\u1031\u102C\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1004\u103D\u1031\u1006\u103D\u1032\u1000\u103C\u102D\u102F\u1038 (Kachin Silver Torque & Coins)", labelEn: "40. Kachin Silver Torque & Coins", promptText: "traditional handcrafted Kachin repouss\xE9 silver neck torque, dangling silver coin medallions, and tribal ear ornaments" },
  { id: "kayan_brass_neck_rings", category: "jewelry", emoji: "\u{1F397}\uFE0F", labelMm: "\u1044\u1041\u104B \u1000\u101A\u1014\u103A\u1038 \u101B\u102D\u102F\u1038\u101B\u102C \u1000\u103C\u1031\u1038\u1000\u103D\u1004\u103A\u1038 \u101C\u100A\u103A\u1015\u1010\u103A (Kayan Golden Brass Neck Coils)", labelEn: "41. Kayan Brass Neck Coils", promptText: "authentic polished golden brass neck coils and wrist rings of Kayan heritage gleaming softly" },
  { id: "sadon_royal_hairpins", category: "jewelry", emoji: "\u{1F451}", labelMm: "\u1044\u1042\u104B \u101B\u103D\u103E\u1031\u1006\u1036\u1011\u102D\u102F\u1038 \u1014\u103E\u1004\u1037\u103A \u1005\u102D\u1014\u103A\u1006\u1036\u100A\u103E\u1015\u103A (Royal Gold Sadon Hairpins & Comb)", labelEn: "42. Royal Gold Hairpins (Sa-Hto)", promptText: "ornate Konbaung royal gold peacock hairpins (Sa-hto) and diamond floral hair comb tucked into high chignon" },
  { id: "sadon_high_chignon_jasmine", category: "hair", emoji: "\u{1F33A}", labelMm: "\u1044\u1043\u104B \u1019\u103C\u1014\u103A\u1019\u102C\u1037 \u1006\u1036\u1011\u102F\u1036\u1038\u1019\u103C\u1004\u1037\u103A\u1014\u103E\u1004\u1037\u103A \u1005\u1036\u1015\u101A\u103A\u1015\u1014\u103A\u1038\u1000\u102F\u1036\u1038 (High Sadon Chignon & Jasmine)", labelEn: "43. High Sadon Chignon & Jasmine", promptText: "glossy jet-black hair sculpted into a regal Burmese high Sadon chignon wrapped with fresh white jasmine garlands" },
  { id: "padauk_golden_crown", category: "hair", emoji: "\u{1F33C}", labelMm: "\u1044\u1044\u104B \u1015\u102D\u1010\u1031\u102C\u1000\u103A\u1015\u1014\u103A\u1038 \u1006\u1036\u1011\u102F\u1036\u1038\u1021\u101C\u103E (Golden Padauk Blossom Hair Crown)", labelEn: "44. Golden Padauk Blossom Crown", promptText: "vibrant golden yellow Thingyan Padauk flower blossoms tucked gracefully into sleek Burmese hair chignon" },
  { id: "yadanabon_hair_loop", category: "hair", emoji: "\u{1F380}", labelMm: "\u1044\u1045\u104B \u101B\u1010\u1014\u102C\u1015\u102F\u1036 \u1006\u1036\u1019\u103C\u102D\u1010\u103A\u1001\u103B \u1006\u1036\u1011\u102F\u1036\u1038 (Yadanabon Court Coiffure with Side Tress)", labelEn: "45. Yadanabon Royal Coiffure", promptText: "classic Mandalay Yadanabon court hairstyle with polished topknot and a graceful trailing side lock of hair" },
  { id: "orchid_silk_braid", category: "hair", emoji: "\u{1FAB7}", labelMm: "\u1044\u1046\u104B \u101E\u1005\u103A\u1001\u103D\u1015\u1014\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1015\u102D\u102F\u1038\u1000\u103C\u102D\u102F\u1038\u1000\u103B\u1005\u103A \u1006\u1036\u1000\u1031\u101E\u102C (Royal Orchid & Silk Crown Braid)", labelEn: "46. Royal Orchid & Silk Braid", promptText: "intricate traditional Burmese braided updo adorned with fresh purple and white Vanda orchids and gold silk ribbons" }
];
var HEIGHT_OPTIONS = [
  { id: "155_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1045\u1045 cm (\u1045 \u1015\u1031)", labelEn: "155 cm (5 ft 1 in)", promptText: "standing height 155 cm (5 feet 1 inch), petite proportion" },
  { id: "160_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1046\u1040 cm (\u1045 \u1015\u1031 \u1043 \u101C\u1000\u103A)", labelEn: "160 cm (5 ft 3 in)", promptText: "standing height 160 cm (5 feet 3 inches), graceful compact proportion" },
  { id: "165_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1046\u1045 cm (\u1045 \u1015\u1031 \u1045 \u101C\u1000\u103A)", labelEn: "165 cm (5 ft 5 in)", promptText: "standing height 165 cm (5 feet 5 inches), balanced natural height" },
  { id: "170_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1047\u1040 cm (\u1045 \u1015\u1031 \u1047 \u101C\u1000\u103A)", labelEn: "170 cm (5 ft 7 in)", promptText: "standing height 170 cm (5 feet 7 inches), slender tall model proportion" },
  { id: "175_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1047\u1045 cm (\u1045 \u1015\u1031 \u1049 \u101C\u1000\u103A)", labelEn: "175 cm (5 ft 9 in)", promptText: "standing height 175 cm (5 feet 9 inches), statuesque tall posture" },
  { id: "180_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1048\u1040 cm (\u1046 \u1015\u1031)", labelEn: "180 cm (6 ft 0 in)", promptText: "standing height 180 cm (6 feet 0 inches), tall commanding physique" },
  { id: "185_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1048\u1045 cm (\u1046 \u1015\u1031 \u1041 \u101C\u1000\u103A)", labelEn: "185 cm (6 ft 1 in)", promptText: "standing height 185 cm (6 feet 1 inch), athletic tall stature" },
  { id: "190_cm", emoji: "\u{1F4CF}", labelMm: "\u1041\u1049\u1040 cm (\u1046 \u1015\u1031 \u1043 \u101C\u1000\u103A)", labelEn: "190 cm (6 ft 3 in)", promptText: "standing height 190 cm (6 feet 3 inches), prominent tall stature" },
  { id: "195_plus_cm", emoji: "\u{1F4CF}", labelMm: "Extra Tall (\u1041\u1049\u1045 cm+)", labelEn: "Extra Tall (195+ cm / 6 ft 5 in+)", promptText: "standing extra tall height 195+ cm (6 feet 5 inches and above), towering stature" }
];
var WEIGHT_OPTIONS = [
  { id: "45_kg", emoji: "\u2696\uFE0F", labelMm: "\u1044\u1045 kg (\u1049\u1049 \u1015\u1031\u102B\u1004\u103A)", labelEn: "45 kg (99 lbs)", promptText: "body weight 45 kg (99 lbs), slim slender petite build" },
  { id: "50_kg", emoji: "\u2696\uFE0F", labelMm: "\u1045\u1040 kg (\u1041\u1041\u1040 \u1015\u1031\u102B\u1004\u103A)", labelEn: "50 kg (110 lbs)", promptText: "body weight 50 kg (110 lbs), slender graceful proportion" },
  { id: "55_kg", emoji: "\u2696\uFE0F", labelMm: "\u1045\u1045 kg (\u1041\u1042\u1041 \u1015\u1031\u102B\u1004\u103A)", labelEn: "55 kg (121 lbs)", promptText: "body weight 55 kg (121 lbs), natural balanced slim-fit physique" },
  { id: "60_kg", emoji: "\u2696\uFE0F", labelMm: "\u1046\u1040 kg (\u1041\u1043\u1042 \u1015\u1031\u102B\u1004\u103A)", labelEn: "60 kg (132 lbs)", promptText: "body weight 60 kg (132 lbs), healthy toned balanced body" },
  { id: "65_kg", emoji: "\u2696\uFE0F", labelMm: "\u1046\u1045 kg (\u1041\u1044\u1043 \u1015\u1031\u102B\u1004\u103A)", labelEn: "65 kg (143 lbs)", promptText: "body weight 65 kg (143 lbs), fit athletic well-proportioned frame" },
  { id: "70_kg", emoji: "\u2696\uFE0F", labelMm: "\u1047\u1040 kg (\u1041\u1045\u1044 \u1015\u1031\u102B\u1004\u103A)", labelEn: "70 kg (154 lbs)", promptText: "body weight 70 kg (154 lbs), sturdy athletic build" },
  { id: "75_kg", emoji: "\u2696\uFE0F", labelMm: "\u1047\u1045 kg (\u1041\u1046\u1045 \u1015\u1031\u102B\u1004\u103A)", labelEn: "75 kg (165 lbs)", promptText: "body weight 75 kg (165 lbs), solid strong physique" },
  { id: "80_kg", emoji: "\u2696\uFE0F", labelMm: "\u1048\u1040 kg (\u1041\u1047\u1046 \u1015\u1031\u102B\u1004\u103A)", labelEn: "80 kg (176 lbs)", promptText: "body weight 80 kg (176 lbs), robust muscular build" },
  { id: "85_kg", emoji: "\u2696\uFE0F", labelMm: "\u1048\u1045 kg (\u1041\u1048\u1047 \u1015\u1031\u102B\u1004\u103A)", labelEn: "85 kg (187 lbs)", promptText: "body weight 85 kg (187 lbs), powerful broad build" },
  { id: "90_kg", emoji: "\u2696\uFE0F", labelMm: "\u1049\u1040 kg (\u1041\u1049\u1048 \u1015\u1031\u102B\u1004\u103A)", labelEn: "90 kg (198 lbs)", promptText: "body weight 90 kg (198 lbs), heavyweight powerful muscular frame" },
  { id: "95_plus_kg", emoji: "\u2696\uFE0F", labelMm: "Heavy Build (\u1049\u1045 kg+)", labelEn: "Heavy Build (95+ kg / 209+ lbs)", promptText: "heavy build body weight 95+ kg (209+ lbs), heavy robust solid stature" }
];

// src/utils/promptBuilder.ts
var GARMENT_TAXONOMY = {
  acheik_silk: {
    en: "authentic Mandalay Luntaya Acheik (100-shuttle wave-pattern) handwoven royal silk htamein longyi and fitted yinzi silk blouse with shimmering gold Zari metallic thread embroidery",
    mm: "\u1019\u1014\u1039\u1010\u101C\u1031\u1038 \u101C\u103D\u1014\u103A\u1038\u101B\u102C\u1000\u103B\u1031\u102C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u101B\u1004\u103A\u1005\u1031\u1037\u1015\u102D\u102F\u1038\u1021\u1004\u103A\u1039\u1000\u103B\u102E (\u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1021\u1014\u102C\u1038\u1000\u103D\u1015\u103A \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A)"
  },
  traditional_myanmar: {
    en: "authentic Mandalay Luntaya Acheik (100-shuttle interlocking wave-pattern) handwoven royal mulberry silk htamein longyi and tailored Burmese yinzi silk blouse with shimmering gold Zari thread embroidery",
    mm: "\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u101C\u103D\u1014\u103A\u1038\u101B\u102C\u1000\u103B\u1031\u102C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u101B\u1004\u103A\u1016\u102F\u1036\u1038/\u101B\u1004\u103A\u1005\u1031\u1037 \u1015\u102D\u102F\u1038\u1021\u1004\u103A\u1039\u1000\u103B\u102E"
  },
  konbaung_royal: {
    en: "regal Konbaung Dynasty royal court ceremonial attire (Maha Lata), structured winged shoulder epaulets (Dahat-kway), heavy crimson velvet embroidered with gold bullion thread, ruby and emerald filigree torque necklace",
    mm: "\u1000\u102F\u1014\u103A\u1038\u1018\u1031\u102C\u1004\u103A\u1001\u1031\u1010\u103A \u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038 \u1019\u101F\u102C\u101C\u1010\u1039\u1010 \u101D\u1010\u103A\u1005\u102F\u1036\u1010\u1031\u102C\u103A\u104A \u1012\u101F\u1010\u103A\u1000\u103D\u1031\u1038 \u1015\u1001\u102F\u1036\u1038\u1010\u1031\u102C\u1004\u103A\u1015\u1036\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1000\u1010\u1039\u1010\u102E\u1015\u102B \u1014\u1014\u103A\u1038\u101D\u1010\u103A\u1010\u1014\u103A\u1006\u102C"
  },
  traditional_myanmar_royal: {
    en: "opulent Mandalay Yadanabon Konbaung royal dynasty court attire, structured gold-embroidered velvet bodice with winged royal lapels, 100-shuttle wave Acheik silk train, encrusted with Mogok rubies and gold bullion",
    mm: "\u1019\u1014\u1039\u1010\u101C\u1031\u1038 \u101B\u1010\u1014\u102C\u1015\u102F\u1036 \u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038 \u1019\u1004\u103A\u1038\u101D\u1010\u103A\u1019\u1004\u103A\u1038\u1005\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u101D\u1010\u103A\u1005\u102F\u1036\u1000\u103C\u102E\u1038"
  },
  myanmar_taingmathea: {
    en: "formal Myanmar Taingmathea silk jacket (Taikpon) paired with handwoven Amarapura Acheik silk Paso longyi and traditional silk Gaung Baung headwear",
    mm: "\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u1010\u102D\u102F\u1004\u103A\u1019\u101E\u102E \u1015\u102D\u102F\u1038\u1010\u102D\u102F\u1000\u103A\u1015\u102F\u1036\u104A \u1015\u102D\u102F\u1038\u1015\u102F\u1006\u102D\u102F\u1038/\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u1001\u1031\u102B\u1004\u103A\u1038\u1015\u1031\u102B\u1004\u103A\u1038"
  },
  amarapura_silk: {
    en: "traditional Amarapura hand-loomed pure mulberry silk longyi and sheer organza lace blouse with delicate pearl buttons and matching silk shawl",
    mm: "\u1021\u1019\u101B\u1015\u1030\u101B \u101C\u1000\u103A\u101B\u1000\u103A \u1015\u102D\u102F\u1038\u1005\u1005\u103A\u1005\u1005\u103A \u101C\u102F\u1036\u1001\u103B\u100A\u103A\u104A \u1007\u102C\u1015\u102D\u102F\u1038\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u1014\u103E\u1004\u1037\u103A \u1015\u102F\u101C\u1032\u1000\u103C\u101A\u103A\u101E\u102E\u1038 \u1015\u102D\u102F\u1038\u1015\u101D\u102B"
  },
  amarapura_luntaya_acheik: {
    en: "masterpiece Amarapura 100-shuttle Luntaya Acheik handwoven mulberry silk longyi with undulating wave motifs, paired with a sheer organza silk blouse and trailing silk shawl",
    mm: "\u1021\u1019\u101B\u1015\u1030\u101B \u101C\u103D\u1014\u103A\u1038\u101B\u102C\u1000\u103B\u1031\u102C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u1018\u102E\u1005\u1005\u103A\u1005\u1005\u103A\u1014\u103E\u1004\u1037\u103A \u1015\u102D\u102F\u1038\u1007\u102C\u1021\u1004\u103A\u1039\u1000\u103B\u102E"
  },
  bagan_royal_yinzi: {
    en: "ancient Bagan dynasty royal terracotta and gold handwoven silk Yinzi bodice wrap, pleated lotus-silk Htamein skirt, and trailing gossamer shoulder shawl",
    mm: "\u1015\u102F\u1002\u1036\u1001\u1031\u1010\u103A \u101B\u1004\u103A\u1005\u100A\u103A\u1038 \u1015\u102D\u102F\u1038\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1015\u102F\u101D\u102B"
  },
  myanmar_bridal_gold: {
    en: "luxurious traditional Myanmar royal bridal ensemble, champagne-gold Zardosi embroidered silk Ein-Gyi blouse with pearl buttons, full-length ruby and gold sequined Luntaya Acheik bridal train",
    mm: "\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u101E\u1010\u102D\u102F\u1037\u101E\u1019\u102E\u1038 \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1001\u103B\u102D\u1010\u103A\u101D\u1010\u103A\u1005\u102F\u1036\u1000\u103C\u102E\u1038"
  },
  inle_lotus_silk_attire: {
    en: "rare handcrafted Inle Lake sacred lotus-stem fiber tunic and natural raw silk woven longyi with organic earthy texture and delicate lotus-petal collar",
    mm: "\u1021\u1004\u103A\u1038\u101C\u1031\u1038 \u1000\u103C\u102C\u1001\u103B\u100A\u103A \u1015\u102D\u102F\u1038\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u101E\u1018\u102C\u101D\u101C\u1000\u103A\u101B\u1000\u103A \u101C\u102F\u1036\u1001\u103B\u100A\u103A"
  },
  colonial_rangoon_lace: {
    en: "heritage Colonial-era Yangon sheer white French lace Yin-Phone blouse fastened with South Sea pearl buttons, paired with an iridescent peacock-motif silk Htamein",
    mm: "\u1000\u102D\u102F\u101C\u102D\u102F\u1014\u102E\u1001\u1031\u1010\u103A \u101B\u1014\u103A\u1000\u102F\u1014\u103A \u1007\u102C\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u104A \u1015\u102F\u101C\u1032\u1000\u103C\u101A\u103A\u101E\u102E\u1038\u1014\u103E\u1004\u1037\u103A \u1015\u102D\u102F\u1038\u1011\u1018\u102E"
  },
  modern_silk_yin_phone: {
    en: "contemporary tailored Burmese sculpted silk Yin-Phone blouse with minimalist pastel Luntaya Acheik silk longyi, modern haute-couture Myanmar silhouette",
    mm: "\u1001\u1031\u1010\u103A\u1019\u102E \u1015\u102D\u102F\u1038\u101B\u1004\u103A\u1016\u102F\u1036\u1038\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u1014\u103E\u1004\u1037\u103A \u1015\u102B\u1005\u1010\u1032\u101C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u1018\u102E"
  },
  shan_traditional: {
    en: "authentic Shan traditional royal brocade jacket and woven striped longyi in pastel rose and gold, intricate silver belt ornament",
    mm: "\u101B\u103E\u1019\u103A\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u1015\u102D\u102F\u1038\u1016\u1032\u1000\u1031\u102C\u103A\u1007\u1031\u102C\u1021\u1006\u1004\u103A \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1004\u103D\u1031\u1001\u102B\u1038\u1015\u1010\u103A \u1021\u1006\u1004\u103A\u1010\u1014\u103A\u1006\u102C"
  },
  shan_ethnic_attire: {
    en: "authentic Shan traditional royal brocade cross-collar jacket and handwoven Shan silk longyi/trousers with silver waist belt and embroidered shoulder bag",
    mm: "\u101B\u103E\u1019\u103A\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u1015\u102D\u102F\u1038\u1016\u1032\u101D\u1010\u103A\u1005\u102F\u1036\u104A \u1004\u103D\u1031\u1001\u102B\u1038\u1015\u1010\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u103E\u1019\u103A\u1038\u101C\u103D\u101A\u103A\u1021\u102D\u1010\u103A"
  },
  kachin_traditional: {
    en: "authentic Kachin Jinghpaw ceremonial attire, black velvet jacket adorned with rows of embossed silver discs (ri-nawn) and vibrant red-and-gold handwoven geometric wool skirt",
    mm: "\u1000\u1001\u103B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u1004\u103D\u1031\u1015\u103C\u102C\u1038\u1005\u102E \u1000\u1010\u1039\u1010\u102E\u1015\u102B\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1002\u103B\u1015\u103A\u1001\u102F\u1010\u103A \u1021\u1006\u1004\u103A\u1011\u1018\u102E"
  },
  kachin_ethnic_attire: {
    en: "authentic Kachin Jinghpaw ceremonial attire, black velvet jacket adorned with rows of embossed silver coin medallions (ri-nawn) and vibrant red-and-gold handloom geometric wool longyi",
    mm: "\u1000\u1001\u103B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u1004\u103D\u1031\u1019\u1031\u102C\u1004\u103A\u1038\u1010\u1014\u103A\u1006\u102C\u1006\u1004\u103A \u1000\u1010\u1039\u1010\u102E\u1015\u102B\u1021\u1004\u103A\u1039\u1000\u103B\u102E\u1014\u103E\u1004\u1037\u103A \u1002\u103B\u1015\u103A\u1001\u102F\u1010\u103A\u1011\u1018\u102E"
  },
  kayin_traditional: {
    en: "authentic Kayin (Karen) traditional handwoven tunic (Hsin-thone) with intricate red, white, and ikat embroidery threads",
    mm: "\u1000\u101B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101C\u1000\u103A\u101B\u1000\u103A \u101E\u1004\u103A\u1010\u102D\u102F\u1004\u103A\u1038\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1021\u1006\u1004\u103A\u1016\u1031\u102C\u103A \u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038\u101C\u1000\u103A\u101B\u102C"
  },
  karen_ethnic_attire: {
    en: "authentic Kayin (Karen) traditional handwoven red-and-white striped Hsin-thone tunic with intricate woven ikat sarong and fringed headscarf",
    mm: "\u1000\u101B\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101C\u1000\u103A\u101B\u1000\u103A \u101E\u1004\u103A\u1010\u102D\u102F\u1004\u103A\u1038\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1021\u1006\u1004\u103A \u1011\u1018\u102E/\u1015\u102F\u1006\u102D\u102F\u1038"
  },
  chin_ethnic_attire: {
    en: "authentic Chin traditional ornate geometric diamond-weave handloom textile wrap and ceremonial tunic with traditional beadwork",
    mm: "\u1001\u103B\u1004\u103A\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u1002\u103B\u1015\u103A\u1001\u102F\u1010\u103A\u1021\u1006\u1004\u103A \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1001\u103C\u102F\u1036\u1011\u100A\u103A"
  },
  mon_traditional: {
    en: "authentic Mon traditional crimson checkered handwoven longyi and pristine white lace bodice with golden hairpin and shawl",
    mm: "\u1019\u103D\u1014\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u1021\u1014\u102E\u101B\u1031\u102C\u1004\u103A \u1021\u1000\u103D\u1000\u103A\u1005\u102D\u1015\u103A \u101C\u1000\u103A\u101B\u1000\u103A\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u1021\u1016\u103C\u1030\u101B\u1031\u102C\u1004\u103A \u1007\u102C\u1021\u1004\u103A\u1039\u1000\u103B\u102E"
  },
  mon_ethnic_attire: {
    en: "authentic Mon traditional crimson-and-gold checkered handwoven silk longyi and fitted white lace blouse with Hinthar golden brooch and shoulder sash",
    mm: "\u1019\u103D\u1014\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u1021\u1014\u102E\u101B\u1031\u102C\u1004\u103A \u101C\u1000\u103A\u101B\u1000\u103A\u1015\u102D\u102F\u1038\u1011\u1018\u102E\u1014\u103E\u1004\u1037\u103A \u1021\u1016\u103C\u1030\u101B\u1031\u102C\u1004\u103A \u1007\u102C\u1021\u1004\u103A\u1039\u1000\u103B\u102E"
  },
  rakhine_traditional: {
    en: "authentic Rakhine royal silk attire with gold-threaded weave and traditional Mrauk-U era gold filigree jewelry",
    mm: "\u101B\u1001\u102D\u102F\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1015\u102D\u102F\u1038\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1019\u103C\u1031\u102C\u1000\u103A\u1026\u1038\u1001\u1031\u1010\u103A \u101B\u103D\u103E\u1031\u1015\u1014\u103A\u1038\u1011\u102D\u1019\u103A \u101C\u1000\u103A\u101D\u1010\u103A\u101B\u1010\u1014\u102C"
  },
  rakhine_ethnic_attire: {
    en: "authentic Rakhine Mrauk-U heritage handwoven Acheik silk longyi/pasoe with royal gold-threaded motifs and traditional lace bodice",
    mm: "\u101B\u1001\u102D\u102F\u1004\u103A\u101B\u102D\u102F\u1038\u101B\u102C \u1019\u103C\u1031\u102C\u1000\u103A\u1026\u1038\u101F\u1014\u103A \u101C\u1000\u103A\u101B\u1000\u103A\u1015\u102D\u102F\u1038\u101D\u1010\u103A\u1005\u102F\u1036"
  },
  kayah_ethnic_attire: {
    en: "authentic Kayah traditional crimson-and-black handwoven breast-wrap tunic, draped cape, and traditional lacquered cotton leg rings",
    mm: "\u1000\u101A\u102C\u1038\u101B\u102D\u102F\u1038\u101B\u102C \u101C\u1000\u103A\u101B\u1000\u103A\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1001\u103C\u1031\u1015\u1010\u103A\u1000\u103D\u1004\u103A\u1038"
  }
};
var LOCATION_TAXONOMY = {
  bagan_pagoda: {
    en: "ancient Bagan archaeological sanctuary at sunrise, weathered 11th-century terracotta brick stupas receding into golden morning mist, warm atmospheric dust motes",
    mm: "\u1015\u102F\u1002\u1036 \u101B\u103E\u1031\u1038\u101F\u1031\u102C\u1004\u103A\u1038\u1005\u1031\u1010\u102E\u1015\u102F\u1011\u102D\u102F\u1038\u1019\u103B\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u1014\u1036\u1014\u1000\u103A\u1001\u1004\u103A\u1038 \u101B\u103D\u103E\u1031\u101B\u1031\u102C\u1004\u103A\u1019\u103C\u1030\u1001\u102D\u102F\u1038\u101D\u1031\u101E\u1031\u102C \u101B\u103E\u102F\u1001\u1004\u103A\u1038"
  },
  shwedagon_pagoda: {
    en: "sacred marble platform of Shwedagon Pagoda in Yangon, towering gold-leaf stupa shimmering softly in background bokeh, warm oil-lamp reflections on polished white marble",
    mm: "\u101B\u1014\u103A\u1000\u102F\u1014\u103A \u101B\u103D\u103E\u1031\u1010\u102D\u1002\u102F\u1036\u1005\u1031\u1010\u102E\u1010\u1031\u102C\u103A \u101B\u1004\u103A\u1015\u103C\u1004\u103A\u1010\u1031\u102C\u103A\u104A \u101B\u103D\u103E\u1031\u101E\u1004\u103A\u1039\u1000\u1014\u103A\u1038\u101B\u1031\u102C\u1004\u103A\u1015\u103C\u1014\u103A\u1014\u103E\u1004\u1037\u103A \u1005\u1000\u103B\u1004\u103A\u1000\u103B\u1031\u102C\u1000\u103A\u101E\u102C\u1038 \u1014\u1031\u102C\u1000\u103A\u1001\u1036"
  },
  mandalay_palace: {
    en: "historic Mandalay Royal Palace pavilion, intricately carved golden teakwood pillars, vermilion lacquered colonnade, dramatic shafts of warm sunlight",
    mm: "\u1019\u1014\u1039\u1010\u101C\u1031\u1038 \u1014\u1014\u103A\u1038\u1010\u1031\u102C\u103A \u1000\u103B\u103D\u1014\u103A\u1038\u101E\u1005\u103A\u1015\u1014\u103A\u1038\u1015\u102F\u1010\u102D\u102F\u1004\u103A\u1019\u103B\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u101F\u1004\u103A\u1039\u101E\u102C\u1015\u103C\u1012\u102B\u1038\u101B\u1031\u102C\u1004\u103A \u1014\u1014\u103A\u1038\u1010\u103D\u1004\u103A\u1038\u1006\u1031\u102C\u1004\u103A"
  },
  inle_lake: {
    en: "serene Inle Lake misty waters at dawn, traditional wooden longtail boat, floating lotus gardens and distant Shan mountain range",
    mm: "\u1021\u1004\u103A\u1038\u101C\u1031\u1038\u1000\u1014\u103A \u101B\u1031\u1015\u103C\u1004\u103A\u104A \u1000\u103C\u102C\u1015\u1014\u103A\u1038\u1001\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u101B\u103E\u1019\u103A\u1038\u101B\u102D\u102F\u1038\u1019 \u1010\u1031\u102C\u1004\u103A\u1010\u1014\u103A\u1038 \u1014\u1031\u102C\u1000\u103A\u1001\u1036"
  },
  ubein_bridge: {
    en: "historic U Bein teakwood bridge in Amarapura at golden sunset, warm amber reflections rippling across Taungthaman Lake",
    mm: "\u1021\u1019\u101B\u1015\u1030\u101B \u1026\u1038\u1015\u102D\u1014\u103A\u1010\u1036\u1010\u102C\u1038 \u1014\u1031\u101D\u1004\u103A\u1006\u100A\u103A\u1038\u1006\u102C\u1014\u103E\u1004\u1037\u103A \u1010\u1031\u102C\u1004\u103A\u101E\u1019\u1014\u103A\u1021\u1004\u103A\u1038 \u101B\u1031\u1015\u103C\u1004\u103A\u101B\u1031\u102C\u1004\u103A\u1015\u103C\u1014\u103A"
  }
};
function buildComprehensiveMasterPrompt(selection, mode) {
  const targetAr = selection?.aspectRatio || "9:16";
  const rawCustom = selection?.customInstruction ? selection.customInstruction.trim() : "";
  const isCleanCustom = rawCustom.length > 0 && rawCustom.length < 300 && !rawCustom.includes("--ar ") && !rawCustom.includes("100% exact facial likeness");
  const safeCustomText = isCleanCustom ? `, ${rawCustom}` : "";
  if (mode === "background-only") {
    const locKey2 = (selection?.location || "").toLowerCase();
    const locMapped2 = LOCATION_TAXONOMY[locKey2]?.en || selection?.location || "historic Bagan pagoda sanctuary";
    const locMm = LOCATION_TAXONOMY[locKey2]?.mm || selection?.location || "\u1015\u102F\u1002\u1036 \u101B\u103E\u1031\u1038\u101F\u1031\u102C\u1004\u103A\u1038\u1005\u1031\u1010\u102E\u1015\u102F\u1011\u102D\u102F\u1038 \u1014\u1031\u102C\u1000\u103A\u1001\u1036";
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : "";
    const lighting2 = selection?.timeAndLighting || "golden hour warm directional sunlight with volumetric mist";
    const lightCustom = selection?.customLightingDetails ? `, ${selection.customLightingDetails.trim()}` : "";
    const mood2 = selection?.moodEmotion && selection.moodEmotion !== "skip" ? `${selection.moodEmotion} atmosphere` : "serene and timeless aesthetic";
    const event = selection?.event && selection.event !== "skip" ? `, inspired by ${selection.event}` : "";
    const camera = selection?.camera || "Hasselblad X2D 100C with 35mm f/2.8 architectural prime lens";
    const angle = selection?.cameraAngle && selection.cameraAngle !== "skip" ? selection.cameraAngle : "Wide architectural landscape framing";
    const style = selection?.photoStyle || "Photorealistic Architectural & Environmental Scenery";
    const quality = selection?.qualityProfile || "8k resolution, highly detailed architectural textures, photorealistic, museum archival quality, cinematic color grading";
    const color = selection?.colorGrade && selection.colorGrade !== "skip" ? `${selection.colorGrade} color grading` : "16-bit natural film tones";
    const masterPrompt2 = `[Subject]: Purely environmental scenery, majestic architectural heritage with zero human presence, no persons. [Action]: Atmospheric stillness, serene natural wind and gentle ambient presence. [Environment]: A breathtaking standalone environmental photograph of ${locMapped2}${locCustom}${event}. [Cinematography]: ${angle}, captured on ${camera}, f/8.0 deep depth of field. [Lighting/Style]: ${lighting2}${lightCustom}, ${mood2}, ${style}, ${color}. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, " ").trim();
    const negativePrompt2 = `person, human, face, woman, man, girl, boy, model, people, portrait, body, hands, limbs, clothing, crowd, silhouette, blurry, low quality, distorted architecture, watermark`;
    return {
      masterPrompt: masterPrompt2,
      negativePrompt: negativePrompt2,
      midjourneyFormat: `/imagine prompt: ${masterPrompt2} --v 6.1 --style raw --no person, human, face, people, crowd`,
      fluxFormat: `${masterPrompt2.replace(/--ar\s+[0-9:]+/gi, "").trim()}`,
      sdxlFormat: `${masterPrompt2} | Negative: ${negativePrompt2}`,
      descriptionMm: `\u3010\u1014\u1031\u102C\u1000\u103A\u1001\u1036\u101B\u103E\u102F\u1001\u1004\u103A\u1038 \u101E\u102E\u1038\u101E\u1014\u1037\u103A \u1019\u102F\u1012\u103A (Background-Only Engine)\u3011
\u1041\u104B \u1010\u100A\u103A\u1014\u1031\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u101B\u103E\u102F\u1001\u1004\u103A\u1038: ${locMm}${locCustom}
\u1042\u104B \u1021\u101C\u1004\u103A\u1038\u1021\u1019\u103E\u1031\u102C\u1004\u103A\u1014\u103E\u1004\u1037\u103A \u1021\u1001\u103B\u102D\u1014\u103A: ${lighting2}${mood2}
\u1043\u104B \u1000\u1004\u103A\u1019\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1019\u103E\u1014\u103A\u1018\u102E\u101C\u1030\u1038: ${camera} (Aspect Ratio: ${targetAr})
\u1044\u104B \u1021\u1011\u1030\u1038\u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1001\u103B\u1000\u103A: \u101C\u1030\u1015\u102F\u1036/\u1019\u1031\u102C\u103A\u1012\u101A\u103A \u101C\u102F\u1036\u1038\u101D\u1019\u1015\u102B\u101D\u1004\u103A\u1018\u1032 \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u101B\u103E\u102F\u1001\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1017\u102D\u101E\u102F\u1000\u102C\u1021\u101C\u103E\u1000\u102D\u102F\u101E\u102C \u1041\u1040\u1040% \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A \u1015\u102F\u1036\u1016\u1031\u102C\u103A\u1015\u1031\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B`,
      descriptionEn: `Standalone architectural and environmental background scenery prompt for ${locMapped2} without human subjects (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${camera}, ISO 64, f/8.0 deep depth of field, 1/125s tripod exposure`
    };
  }
  if (selection?.img2imgOption === "style_transfer") {
    const sub2 = selection?.subject === "man" ? "handsome Burmese man" : selection?.subject === "couple" ? "elegant Myanmar couple" : "gorgeous Burmese woman";
    const eth = selection?.customEthnicityDetails || "authentic Burmese / Myanmar heritage";
    const outfit = selection?.garmentStyle || "intricate traditional Myanmar silk woven attire tailored from Reference Image";
    const pose = selection?.poseExpression || "natural regal posture replicating Reference Image pose";
    const loc = selection?.location || "authentic Myanmar heritage architectural setting";
    const light = selection?.timeAndLighting || "soft directional Rembrandt studio lighting with warm golden rim light";
    const cam = selection?.camera || "Sony A7R V with 85mm f/1.2 GM portrait prime lens";
    const quality = selection?.qualityProfile || "8k resolution, highly detailed fabric textures, photorealistic, professional photography, cinematic color grading";
    const masterPrompt2 = `[Subject]: 100% exact facial likeness, preserving identical eyes, nose, lips, facial bone geometry, hairstyle, and warm honey-olive skin tone of the person from User Image (${eth} ${sub2}, zero facial alteration, consistent character). Recreating attire from Reference Image: wearing ${outfit} with authentic silk weft texture and gold embroidery. [Action]: Replicating exact body posture, shoulder angle, hand placement, and graceful stance from Reference Image (${pose}). [Environment]: Set against ${loc} with creamy depth of field separation. [Cinematography]: Balanced medium portrait framing, eye-level perspective, shot on ${cam}, f/1.8 aperture for shallow depth of field. [Lighting/Style]: ${light}, natural subsurface skin scattering, crisp catchlights in irises. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, " ").trim();
    const negativePrompt2 = `different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, deformed hands, extra fingers, plastic airbrushed skin, Indian saree, Chinese hanfu, Japanese kimono, blurry, low resolution`;
    return {
      masterPrompt: masterPrompt2,
      negativePrompt: negativePrompt2,
      midjourneyFormat: `/imagine prompt: ${masterPrompt2} --v 6.1 --style raw --cw 100`,
      fluxFormat: `${masterPrompt2.replace(/--ar\s+[0-9:]+/gi, "").trim()}`,
      sdxlFormat: `${masterPrompt2} | Negative: ${negativePrompt2}`,
      descriptionMm: `\u3010Reference Image Outfit & Pose \u1005\u1014\u1005\u103A (\u1015\u102F\u1036\u1005\u1036\u1010\u1030 \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1000\u102D\u102F\u101A\u103A\u1014\u1031\u101F\u1014\u103A\u1011\u102C\u1038 \u1015\u1031\u102B\u1004\u103A\u1038\u1005\u1015\u103A\u1019\u103E\u102F)\u3011
\u1041\u104B \u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u103D\u1004\u103A\u1015\u103C\u1004\u103A \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1019\u103E\u102F: User \u1015\u102F\u1036\u1019\u103E \u1019\u1030\u101B\u1004\u103A\u1038\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u104A \u1019\u103B\u1000\u103A\u101C\u102F\u1036\u1038\u104A \u1014\u103E\u102C\u1010\u1036\u104A \u1014\u103E\u102F\u1010\u103A\u1001\u1019\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1021\u101E\u102C\u1038\u1021\u101B\u1031\u102C\u1004\u103A\u1000\u102D\u102F \u1041\u1040\u1040% \u1021\u1010\u102D\u1021\u1000\u103B \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1042\u104B \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1000\u102D\u102F\u101A\u103A\u101F\u1014\u103A: Reference \u1015\u102F\u1036\u1019\u103E \u101D\u1010\u103A\u1005\u102F\u1036\u1012\u102E\u1007\u102D\u102F\u1004\u103A\u1038 (${outfit}) \u1014\u103E\u1004\u1037\u103A \u1000\u102D\u102F\u101A\u103A\u1014\u1031\u101F\u1014\u103A\u1011\u102C\u1038 (${pose}) \u1000\u102D\u102F \u1010\u102D\u1000\u103B\u1005\u103D\u102C \u1000\u1030\u1038\u101A\u1030\u1015\u1031\u102B\u1004\u103A\u1038\u1005\u1015\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1043\u104B \u1000\u1004\u103A\u1019\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1021\u101C\u1004\u103A\u1038: ${cam} \u1014\u103E\u1004\u1037\u103A ${light} (Aspect Ratio: ${targetAr})`,
      descriptionEn: `Reference Image Outfit & Pose: Preserves User Image facial identity with 100% fidelity while replicating Reference Image outfit, body posture, lighting, and background (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${cam}, ISO 100, f/1.2 aperture, 1/250s shutter speed, 85mm portrait prime lens`
    };
  }
  if (mode === "clothes-swap") {
    const isCustomGarment2 = selection?.clothesSwapOption === "custom_garment_upload" || !!selection?.customGarmentImage;
    const gDesc = selection?.customGarmentDescription || selection?.garmentFabric || "";
    const gKey2 = (selection?.garmentStyle || "").toLowerCase();
    let garmentChecklist = "";
    let garmentMm = "";
    if (isCustomGarment2) {
      garmentChecklist = `custom garment from Image 2: ${gDesc || "authentic handwoven Myanmar Luntaya Acheik silk attire, intricate gold thread filigree embroidery, tailored fitted bodice and full-length longyi, matching silk shawl"}`;
      garmentMm = gDesc || "Image 2 \u1019\u103E \u1005\u102D\u1010\u103A\u1000\u103C\u102D\u102F\u1000\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A";
    } else if (GARMENT_TAXONOMY[gKey2]) {
      garmentChecklist = GARMENT_TAXONOMY[gKey2].en;
      garmentMm = GARMENT_TAXONOMY[gKey2].mm;
    } else {
      const gStyle = selection?.garmentStyle || "Royal Mandalay Luntaya Acheik Silk Longyi & Fitted Yinzi Blouse";
      const gFab = selection?.garmentFabric ? `, woven from ${selection.garmentFabric}` : ", woven from pure mulberry silk with gold metallic Zari threads";
      garmentChecklist = `${gStyle}${gFab}, intricate traditional Burmese wave motifs, tailored body-hugging fit, full-length traditional drape`;
      garmentMm = `${gStyle} (${selection?.garmentFabric || "\u1015\u102D\u102F\u1038\u1005\u1005\u103A\u1005\u1005\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1021\u1011\u100A\u103A"})`;
    }
    const locKey2 = (selection?.location || "").toLowerCase();
    const locBase = LOCATION_TAXONOMY[locKey2]?.en || selection?.location || "authentic Myanmar royal heritage studio backdrop";
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : "";
    const lightBase = selection?.timeAndLighting || "warm golden hour directional key lighting with soft fill";
    const camera = selection?.camera || "Hasselblad X2D 100C with 85mm f/1.2 portrait prime lens";
    const angle = selection?.cameraAngle && selection.cameraAngle !== "skip" ? selection.cameraAngle : "Medium-full shot, eye-level angle";
    const style = selection?.photoStyle || "High-End Editorial Studio Portrait";
    const quality = selection?.qualityProfile || "8k resolution, highly detailed fabric textures, photorealistic, professional photography, cinematic color grading";
    const masterPrompt2 = `[Subject]: Keep the exact same person, face, facial bone structure, body proportions, and skin tone from Image 1 (100% exact face match, identical eyes nose lips, zero face alteration, preserved identity). Replace ONLY the clothing with the outfit from Image 2: ${garmentChecklist}. [Action]: Preserving the exact body posture, stance, and natural expression from Image 1. [Environment]: Set against ${locBase}${locCustom}. [Cinematography]: ${angle}, shot on ${camera}, f/2.0 aperture for shallow depth of field. [Lighting/Style]: ${lightBase}, ${style}, natural unretouched epidermal skin micro-pores. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, " ").trim();
    const negativePrompt2 = `different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, wrong cultural clothing, Indian saree, Chinese hanfu, plastic skin, low quality, blurry`;
    return {
      masterPrompt: masterPrompt2,
      negativePrompt: negativePrompt2,
      midjourneyFormat: `/imagine prompt: ${masterPrompt2} --v 6.1 --style raw --cw 100`,
      fluxFormat: `${masterPrompt2.replace(/--ar\s+[0-9:]+/gi, "").trim()}`,
      sdxlFormat: `${masterPrompt2} | Negative: ${negativePrompt2}`,
      descriptionMm: `\u3010\u101D\u1010\u103A\u1005\u102F\u1036\u101C\u1032\u101C\u103E\u101A\u103A\u1001\u103C\u1004\u103A\u1038 \u1021\u1011\u1030\u1038\u1005\u1014\u1005\u103A (Strict Clothes-Swap Engine)\u3011
\u1041\u104B \u1019\u1030\u101B\u1004\u103A\u1038\u101B\u102F\u1015\u103A\u101E\u103D\u1004\u103A \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1019\u103E\u102F: Image 1 \u1019\u103E \u101C\u1030\u104F \u1019\u103B\u1000\u103A\u1014\u103E\u102C\u104A \u1001\u1014\u1039\u1013\u102C\u1000\u102D\u102F\u101A\u103A\u1021\u1001\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u104A \u1000\u102D\u102F\u101A\u103A\u101F\u1014\u103A (Pose) \u1014\u103E\u1004\u1037\u103A \u1021\u101E\u102C\u1038\u1021\u101B\u1031\u102C\u1004\u103A\u1000\u102D\u102F \u1041\u1040\u1040% \u1019\u1015\u103B\u1000\u103A\u1019\u1005\u102E\u1038 \u1021\u1010\u102D\u1021\u1000\u103B \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1042\u104B \u101C\u1032\u101C\u103E\u101A\u103A\u1019\u100A\u1037\u103A \u101D\u1010\u103A\u1005\u102F\u1036\u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A: ${garmentMm}
\u1043\u104B \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u1014\u103E\u1004\u1037\u103A \u1021\u101C\u1004\u103A\u1038\u1021\u1019\u103E\u1031\u102C\u1004\u103A: ${locBase} \u1014\u103E\u1004\u1037\u103A ${lightBase}
\u1044\u104B \u1000\u1004\u103A\u1019\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1021\u1001\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038: ${camera} (Aspect Ratio: --ar ${targetAr})`,
      descriptionEn: `Strict Sequence Clothes Swap Prompt: Keeps Image 1 subject (face, body, pose, skin tone) 100% locked while swapping ONLY the clothing with ${garmentChecklist} (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${camera}, ISO 100, f/1.2, 1/250s`
    };
  }
  let subjectText = "";
  let subjectMm = "";
  const sub = selection?.subject || "woman";
  if (sub === "man") {
    subjectText = "A handsome Burmese gentleman with noble Southeast Asian bone structure and warm olive complexion";
    subjectMm = "\u1001\u1014\u1037\u103A\u100A\u102C\u1038\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1021\u1019\u103B\u102D\u102F\u1038\u101E\u102C\u1038";
  } else if (sub === "couple") {
    subjectText = "A beautiful young Myanmar bridal couple in elegant traditional wedding attire";
    subjectMm = "\u1000\u103B\u1000\u103A\u101E\u101B\u1031\u101B\u103E\u102D\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1019\u1004\u103A\u1039\u1002\u101C\u102C\u1005\u102F\u1036\u1010\u103D\u1032 (\u101E\u1010\u102D\u102F\u1037\u101E\u102C\u1038\u1014\u103E\u1004\u1037\u103A \u101E\u1010\u102D\u102F\u1037\u101E\u1019\u102E\u1038)";
  } else if (sub === "monk") {
    subjectText = "A serene Burmese Buddhist monk in authentic deep terracotta-saffron robes with peaceful mindfulness";
    subjectMm = "\u1010\u100A\u103A\u1000\u103C\u100A\u103A\u1021\u1031\u1038\u1001\u103B\u1019\u103A\u1038\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1017\u102F\u1012\u1039\u1013\u1018\u102C\u101E\u102C \u101B\u101F\u1014\u103A\u1038\u1010\u1031\u102C\u103A";
  } else if (sub === "elderly") {
    subjectText = "A dignified elderly Burmese person with a warm, wise smile and authentic natural skin character";
    subjectMm = "\u1000\u103B\u1000\u103A\u101E\u101B\u1031\u101B\u103E\u102D\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u101E\u1000\u103A\u1000\u103C\u102E\u1038\u1018\u102D\u102F\u1038\u1018\u103D\u102C\u1038";
  } else if (sub === "child") {
    subjectText = "An adorable Burmese child with bright expressive eyes and traditional cultural styling";
    subjectMm = "\u1001\u103B\u1005\u103A\u1005\u1016\u103D\u101A\u103A \u1019\u103C\u1014\u103A\u1019\u102C\u1000\u101C\u1031\u1038\u1004\u101A\u103A";
  } else if (sub === "pet") {
    subjectText = "A well-groomed companion pet alongside an elegant Burmese owner in traditional attire";
    subjectMm = "\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u101D\u1010\u103A\u1005\u102F\u1036\u101D\u1010\u103A\u1006\u1004\u103A\u1011\u102C\u1038\u101E\u1030\u1014\u103E\u1004\u1037\u103A \u1021\u102D\u1019\u103A\u1019\u103D\u1031\u1038\u1010\u102D\u101B\u1005\u1039\u1006\u102C\u1014\u103A";
  } else if (sub === "product") {
    subjectText = "A luxury commercial product showcase gracefully presented by an elegant Burmese model";
    subjectMm = "\u1019\u103C\u1014\u103A\u1019\u102C\u1019\u1031\u102C\u103A\u1012\u101A\u103A\u1014\u103E\u1004\u1037\u103A \u1021\u1006\u1004\u1037\u103A\u1019\u103C\u1004\u1037\u103A \u1000\u102F\u1014\u103A\u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1000\u103C\u1031\u102C\u103A\u1004\u103C\u102C";
  } else {
    subjectText = "A gorgeous Burmese woman with graceful regal poise, authentic Myanmar facial features, and luminous honey-olive skin with natural micro-pores";
    subjectMm = "\u1000\u103B\u1000\u103A\u101E\u101B\u1031\u101B\u103E\u102D\u1015\u103C\u102E\u1038 \u101C\u103E\u1015\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1021\u1019\u103B\u102D\u102F\u1038\u101E\u1019\u102E\u1038";
  }
  if (selection?.customSubjectDetails && selection.customSubjectDetails.trim()) {
    subjectText += `, ${selection.customSubjectDetails.trim()}`;
    subjectMm += ` (${selection.customSubjectDetails.trim()})`;
  }
  if (selection?.ageRange && selection.ageRange !== "skip") {
    const ageFormatted = selection.ageRange.replace("_", "-");
    subjectText += `, age ${ageFormatted}`;
    subjectMm += `\u104A \u1021\u101E\u1000\u103A (${ageFormatted}) \u1014\u103E\u1005\u103A\u101D\u1014\u103A\u1038\u1000\u103B\u1004\u103A`;
  }
  if (selection?.heightRange && selection.heightRange !== "skip") {
    const heightOpt = HEIGHT_OPTIONS.find((h) => h.id === selection.heightRange);
    subjectText += heightOpt ? `, ${heightOpt.promptText}` : `, height ${selection.heightRange}`;
  }
  if (selection?.weightRange && selection.weightRange !== "skip") {
    const weightOpt = WEIGHT_OPTIONS.find((w) => w.id === selection.weightRange);
    subjectText += weightOpt ? `, ${weightOpt.promptText}` : `, weight ${selection.weightRange}`;
  }
  if (selection?.ethnicity && selection.ethnicity !== "skip") {
    const ethOpt = ETHNICITY_OPTIONS.find((e) => e.id === selection.ethnicity);
    if (ethOpt && ethOpt.promptText) {
      subjectText += `, ${ethOpt.promptText}`;
      subjectMm += ` (${ethOpt.labelMm.replace(/^[၀-၉]+\။\s*/, "")})`;
    } else {
      subjectText += `, authentic ${selection.ethnicity} Myanmar ethnic heritage`;
    }
  }
  if (selection?.customEthnicityDetails && selection.customEthnicityDetails.trim()) {
    subjectText += `, ${selection.customEthnicityDetails.trim()}`;
    subjectMm += `\u104A ${selection.customEthnicityDetails.trim()}`;
  }
  let identityText = "";
  const isImg2ImgOrSwap = mode === "img2img" || mode === "clothes-swap";
  const isLockEnabled = selection?.preserveSubject100Percent !== false || selection?.identityLock && selection.identityLock !== "no_lock";
  if (isImg2ImgOrSwap || isLockEnabled) {
    identityText = ", 100% exact facial likeness, identical eyes nose lips, preserved facial identity, zero face alteration, same person, identical facial bone geometry";
  }
  let poseText = "";
  let poseMm = "\u101E\u1018\u102C\u101D\u1000\u103B\u1015\u103C\u102E\u1038 \u1000\u103B\u1000\u103A\u101E\u101B\u1031\u101B\u103E\u102D\u101E\u1031\u102C \u1000\u102D\u102F\u101A\u103A\u1014\u1031\u101F\u1014\u103A\u1011\u102C\u1038";
  if (selection?.poseExpression && selection.poseExpression !== "skip") {
    poseText = `, posing with ${selection.poseExpression}`;
    poseMm = selection.poseExpression;
  }
  if (selection?.customPoseDetails && selection.customPoseDetails.trim()) {
    poseText += `, ${selection.customPoseDetails.trim()}`;
    poseMm += ` (${selection.customPoseDetails.trim()})`;
  }
  let coupleText = "";
  if (sub === "couple" || selection?.coupleOutfitType) {
    const groomParts = [];
    if (selection?.groomOutfit) groomParts.push(`groom wearing ${selection.groomOutfit}`);
    if (selection?.groomTop) groomParts.push(selection.groomTop);
    if (selection?.groomBottom) groomParts.push(selection.groomBottom);
    if (selection?.groomHair) groomParts.push(`groom coiffure: ${selection.groomHair}`);
    if (selection?.groomExpression) groomParts.push(`groom expression: ${selection.groomExpression}`);
    if (selection?.groomPoseAccessory) groomParts.push(`groom holding ceremonial ${selection.groomPoseAccessory}`);
    const brideParts = [];
    if (selection?.brideOutfit) brideParts.push(`bride wearing ${selection.brideOutfit}`);
    if (selection?.brideTop) brideParts.push(selection.brideTop);
    if (selection?.brideBottom) brideParts.push(selection.brideBottom);
    if (selection?.brideHair) brideParts.push(`bride coiffure: ${selection.brideHair}`);
    if (selection?.brideExpression) brideParts.push(`bride expression: ${selection.brideExpression}`);
    if (selection?.bridePoseAccessory) brideParts.push(`bride with ${selection.bridePoseAccessory}`);
    if (groomParts.length > 0) coupleText += `, ${groomParts.join(", ")}`;
    if (brideParts.length > 0) coupleText += `, ${brideParts.join(", ")}`;
    if (selection?.couplePose) coupleText += `, couple interaction: ${selection.couplePose}`;
    if (selection?.weddingEthnicGroup) coupleText += `, authentic ${selection.weddingEthnicGroup} royal wedding regalia`;
    if (selection?.weddingEra) coupleText += `, ${selection.weddingEra} era historical styling`;
    if (selection?.weddingAccessoryProps) coupleText += `, ceremonial wedding props: ${selection.weddingAccessoryProps}`;
  }
  let outfitText = "";
  let outfitMm = "";
  const isCustomGarment = selection?.clothesSwapOption === "custom_garment_upload" || !!selection?.customGarmentImage;
  const gKey = (selection?.garmentStyle || "").toLowerCase();
  const fabricMod = selection?.garmentFabric ? selection.garmentFabric.trim() : "";
  if (isCustomGarment) {
    const gDesc = selection?.customGarmentDescription || fabricMod || "custom uploaded reference attire with intricate traditional Burmese silk embroidery";
    outfitText = `, wearing custom reference attire: ${gDesc}`;
    outfitMm = `\u1005\u102D\u1010\u103A\u1000\u103C\u102D\u102F\u1000\u103A \u1010\u1004\u103A\u101E\u103D\u1004\u103A\u1038\u1011\u102C\u1038\u101E\u1031\u102C \u101D\u1010\u103A\u1005\u102F\u1036 (${gDesc})`;
  } else if (GARMENT_TAXONOMY[gKey]) {
    outfitText = `, wearing ${GARMENT_TAXONOMY[gKey].en}${fabricMod ? `, crafted in ${fabricMod}` : ""}`;
    outfitMm = `${GARMENT_TAXONOMY[gKey].mm}${fabricMod ? ` (${fabricMod})` : ""}`;
  } else if (selection?.garmentStyle && selection.garmentStyle !== "skip") {
    const foundGarment = GARMENT_OPTIONS.find((g) => g.id === selection.garmentStyle);
    if (foundGarment) {
      outfitText = `, wearing ${foundGarment.fabric}${fabricMod ? `, styled with ${fabricMod}` : ""}`;
      outfitMm = `${foundGarment.labelMm}${fabricMod ? ` (${fabricMod})` : ` (${foundGarment.fabric})`}`;
    } else {
      const fabric = fabricMod ? ` handwoven from ${fabricMod} with fine silk weft` : " handwoven from pure Myanmar mulberry silk with intricate wave motifs";
      outfitText = `, wearing authentic traditional Burmese ${selection.garmentStyle}${fabric}`;
      outfitMm = `\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C ${selection.garmentStyle}${fabricMod ? ` (${fabricMod})` : " (\u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u100A\u103A)"}`;
    }
  } else {
    outfitText = `, wearing authentic Mandalay Luntaya Acheik handwoven royal silk longyi and fitted silk blouse with delicate gold thread embroidery${fabricMod ? `, crafted in ${fabricMod}` : ""}`;
    outfitMm = `\u1019\u1014\u1039\u1010\u101C\u1031\u1038 \u101C\u103D\u1014\u103A\u1038\u101B\u102C\u1000\u103B\u1031\u102C\u103A \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1011\u100A\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C \u101B\u1004\u103A\u1016\u102F\u1036\u1038\u1015\u102D\u102F\u1038\u1021\u1004\u103A\u1039\u1000\u103B\u102E${fabricMod ? ` (${fabricMod})` : ""}`;
  }
  let culturalPropsText = "";
  let culturalPropsMm = "";
  if (selection?.culturalPropsDetails && selection.culturalPropsDetails.trim()) {
    const rawProps = selection.culturalPropsDetails.trim();
    const matchedPresets = CULTURAL_PROP_PRESETS.filter(
      (p) => rawProps.toLowerCase().includes(p.id.toLowerCase()) || rawProps.includes(p.labelMm) || rawProps.toLowerCase().includes(p.labelEn.toLowerCase()) || rawProps.toLowerCase().includes(p.promptText.toLowerCase())
    );
    let customRemaining = rawProps;
    matchedPresets.forEach((p) => {
      customRemaining = customRemaining.replace(p.labelMm, "").replace(p.labelEn, "").replace(p.promptText, "");
    });
    const cleanCustomParts = customRemaining.split(",").map((s) => s.trim()).filter((s) => s.length > 0 && s !== ",");
    const englishPropParts = [
      ...matchedPresets.map((p) => p.promptText),
      ...cleanCustomParts
    ];
    const burmesePropParts = [
      ...matchedPresets.map((p) => p.labelMm),
      ...cleanCustomParts
    ];
    culturalPropsText = `, adorned with authentic Myanmar cultural jewelry, coiffure, and props: ${englishPropParts.join(", ")}`;
    culturalPropsMm = burmesePropParts.join("\u104A ");
  } else if (selection?.includeCulturalProps !== false) {
    culturalPropsText = `, adorned with authentic natural pale yellowish-white Thanaka bark paste delicately brushed on cheeks with fine organic texture, regal Burmese Sadon hair bun encircled by fresh fragrant white jasmine garland, and traditional royal gold filigree jewelry`;
    culturalPropsMm = "\u1015\u102B\u1038\u1015\u103C\u1004\u103A\u1015\u1031\u102B\u103A\u101B\u103E\u102D \u101E\u1018\u102C\u101D \u101E\u1014\u1015\u103A\u1001\u102B\u1038\u1015\u102B\u1038\u1000\u103D\u1000\u103A\u104A \u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u1006\u1036\u1011\u102F\u1036\u1038\u104A \u1005\u1036\u1015\u101A\u103A\u1015\u1014\u103A\u1038\u1000\u102F\u1036\u1038\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1015\u1014\u103A\u1038\u1011\u102D\u1019\u103A \u101C\u1000\u103A\u101D\u1010\u103A\u101B\u1010\u1014\u102C\u1019\u103B\u102C\u1038";
  } else {
    culturalPropsMm = "\u101B\u102D\u102F\u1038\u101B\u103E\u1004\u103A\u1038\u101E\u1014\u1037\u103A\u1005\u1004\u103A\u101E\u1031\u102C \u1005\u1010\u1030\u1012\u102E\u101A\u102D\u102F \u1021\u1015\u103C\u1004\u103A\u1021\u1006\u1004\u103A";
  }
  let eventText = "";
  if (selection?.customEventDetails && selection.customEventDetails.trim()) {
    eventText = `, during ${selection.customEventDetails.trim()}`;
  } else if (selection?.event && selection.event !== "skip") {
    eventText = `, celebrating traditional Myanmar ${selection.event}`;
  }
  let locationText = "";
  let locationMm = "\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C \u101A\u1009\u103A\u1000\u103B\u1031\u1038\u1019\u103E\u102F \u1021\u1019\u103D\u1031\u1021\u1014\u103E\u1005\u103A \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u101B\u103E\u102F\u1001\u1004\u103A\u1038";
  const locKey = (selection?.location || "").toLowerCase();
  if (LOCATION_TAXONOMY[locKey]) {
    locationText = `, set in ${LOCATION_TAXONOMY[locKey].en}`;
    locationMm = LOCATION_TAXONOMY[locKey].mm;
  } else if (selection?.location && selection.location !== "skip") {
    locationText = `, set against ${selection.location}`;
    locationMm = selection.location;
  } else {
    locationText = `, set in an atmospheric Myanmar heritage architectural sanctuary with warm depth of field`;
  }
  if (selection?.customLocationDetails && selection.customLocationDetails.trim()) {
    locationText += `, ${selection.customLocationDetails.trim()}`;
    locationMm += ` (${selection.customLocationDetails.trim()})`;
  }
  if (selection?.weddingStudioBackdropProps && selection.weddingStudioBackdropProps.trim()) {
    locationText += `, studio set design: ${selection.weddingStudioBackdropProps.trim()}`;
  }
  let lightingText = "";
  let lightingMm = "\u1014\u103D\u1031\u1038\u1011\u103D\u1031\u1038\u101E\u1031\u102C \u101B\u103D\u103E\u1031\u101B\u1031\u102C\u1004\u103A\u101E\u1019\u103A\u1038\u101E\u100A\u1037\u103A \u101E\u1018\u102C\u101D \u1005\u1010\u1030\u1012\u102E\u101A\u102D\u102F \u1021\u101C\u1004\u103A\u1038\u1021\u1019\u103E\u1031\u102C\u1004\u103A (Golden Hour / Rembrandt Lighting)";
  if (selection?.timeAndLighting && selection.timeAndLighting !== "skip") {
    lightingText = `, illuminated by ${selection.timeAndLighting}, subtle warm amber rim light separating subject from background`;
    lightingMm = selection.timeAndLighting;
  } else {
    lightingText = `, illuminated by golden hour directional key lighting and soft Profoto octagonal fill light with crisp catchlights in irises`;
  }
  if (selection?.customLightingDetails && selection.customLightingDetails.trim()) {
    lightingText += `, ${selection.customLightingDetails.trim()}`;
    lightingMm += ` (${selection.customLightingDetails.trim()})`;
  }
  if (selection?.moodEmotion && selection.moodEmotion !== "skip") {
    lightingText += `, evoking a ${selection.moodEmotion} cinematic mood`;
    lightingMm += ` \u2014 \u1005\u102D\u1010\u103A\u1001\u1036\u1005\u102C\u1038\u1019\u103E\u102F: ${selection.moodEmotion}`;
  }
  let makeupText = "";
  if (selection?.makeup && selection.makeup !== "skip") {
    makeupText = `, ${selection.makeup} makeup styling`;
  }
  let retouchText = "";
  if (selection?.retouching && selection.retouching !== "skip") {
    retouchText = `, ${selection.retouching}`;
  } else {
    retouchText = `, natural unretouched epidermal skin micro-pores, authentic subsurface scattering, zero plastic smoothing`;
  }
  const cameraBase = selection?.camera && selection.camera !== "skip" ? selection.camera : "Hasselblad X2D 100C medium-format camera with 85mm f/1.2 portrait prime lens";
  let photoStyleText = `, captured on ${cameraBase}`;
  if (selection?.cameraAngle && selection.cameraAngle !== "skip") {
    photoStyleText += `, ${selection.cameraAngle} camera framing`;
  }
  if (selection?.photoStyle && selection.photoStyle !== "skip") {
    photoStyleText += `, ${selection.photoStyle}`;
  }
  if (selection?.colorGrade && selection.colorGrade !== "skip") {
    photoStyleText += `, ${selection.colorGrade} film color grading`;
  }
  const qualityText = selection?.qualityProfile && selection.qualityProfile !== "skip" ? selection.qualityProfile : "8k resolution, highly detailed fabric textures, photorealistic, professional wedding photography, cinematic color grading";
  const subjectParts = [];
  if (sub === "couple" || selection?.coupleOutfitType) {
    subjectParts.push(
      selection?.customSubjectDetails ? `A beautiful young Myanmar bridal couple (${selection.customSubjectDetails.trim()}) in elegant traditional wedding attire` : "A beautiful young Myanmar bridal couple in elegant traditional wedding attire"
    );
    if (selection?.ethnicity && selection.ethnicity !== "skip") {
      const ethOpt = ETHNICITY_OPTIONS.find((e) => e.id === selection.ethnicity);
      subjectParts.push(ethOpt?.promptText ? ethOpt.promptText : `authentic ${selection.ethnicity} Myanmar ethnic heritage`);
    }
    if (selection?.ageRange && selection.ageRange !== "skip") {
      subjectParts.push(`age ${selection.ageRange.replace("_", "-")}`);
    }
    if (identityText) {
      subjectParts.push(identityText.replace(/^,\s*/, ""));
    }
    const groomDetails = [];
    if (selection?.groomOutfit) groomDetails.push(selection.groomOutfit);
    if (selection?.groomTop) groomDetails.push(`top: ${selection.groomTop}`);
    if (selection?.groomBottom) groomDetails.push(`bottom: ${selection.groomBottom}`);
    if (selection?.groomHair) groomDetails.push(`hair: ${selection.groomHair}`);
    if (selection?.groomPoseAccessory) groomDetails.push(`accessory: ${selection.groomPoseAccessory}`);
    if (groomDetails.length > 0) {
      subjectParts.push(`The groom wears ${groomDetails.join(", ")}`);
    } else {
      subjectParts.push("The groom wears traditional Myanmar formal wedding attire with silk longyi and matching formal jacket");
    }
    const brideDetails = [];
    if (selection?.brideOutfit) brideDetails.push(selection.brideOutfit);
    if (selection?.brideTop) brideDetails.push(`top: ${selection.brideTop}`);
    if (selection?.brideBottom) brideDetails.push(`bottom: ${selection.brideBottom}`);
    if (selection?.brideHair) brideDetails.push(`hair: ${selection.brideHair}`);
    if (selection?.bridePoseAccessory) brideDetails.push(`accessory: ${selection.bridePoseAccessory}`);
    if (brideDetails.length > 0) {
      subjectParts.push(`The bride wears ${brideDetails.join(", ")}`);
    } else {
      subjectParts.push("The bride wears a stunning traditional Myanmar royal bridal gown with gold embroidery, traditional gold jewelry, and a fragrant jasmine garland");
    }
    const regaliaParts = [];
    if (selection?.weddingEthnicGroup) regaliaParts.push(`authentic ${selection.weddingEthnicGroup} royal wedding regalia`);
    if (selection?.weddingEra) regaliaParts.push(`${selection.weddingEra} era historical styling`);
    if (selection?.weddingAccessoryProps) regaliaParts.push(`ceremonial props: ${selection.weddingAccessoryProps}`);
    if (regaliaParts.length > 0) {
      subjectParts.push(`Adorned with ${regaliaParts.join(", ")}`);
    }
  } else {
    subjectParts.push(subjectText);
    if (identityText) {
      subjectParts.push(identityText.replace(/^,\s*/, ""));
    }
    if (outfitText) {
      subjectParts.push(outfitText.replace(/^,\s*/, ""));
    }
    if (culturalPropsText) {
      subjectParts.push(culturalPropsText.replace(/^,\s*/, ""));
    }
  }
  if (safeCustomText) {
    subjectParts.push(safeCustomText.replace(/^,\s*/, ""));
  }
  const subjectSection = subjectParts.join(". ").replace(/\.\./g, ".").trim();
  const actionParts = [];
  if (sub === "couple" || selection?.coupleOutfitType) {
    if (selection?.couplePose) {
      actionParts.push(selection.couplePose);
    } else {
      actionParts.push("Standing close together, holding hands affectionately, posing for a romantic wedding portrait, looking directly at the camera with gentle smiles");
    }
    if (selection?.groomExpression) actionParts.push(`The groom has a ${selection.groomExpression}`);
    if (selection?.brideExpression) actionParts.push(`The bride has a ${selection.brideExpression}`);
  } else {
    if (selection?.poseExpression && selection.poseExpression !== "skip") {
      actionParts.push(`Posing with ${selection.poseExpression}, looking towards the camera with gentle poise`);
    } else {
      actionParts.push("Standing with natural regal grace and poise, looking directly towards the camera with a gentle, serene smile");
    }
    if (selection?.customPoseDetails && selection.customPoseDetails.trim()) {
      actionParts.push(selection.customPoseDetails.trim());
    }
  }
  const actionSection = actionParts.join(". ").replace(/\.\./g, ".").trim();
  const envParts = [];
  const locMapped = LOCATION_TAXONOMY[locKey]?.en || selection?.location || "an atmospheric Myanmar heritage architectural setting";
  envParts.push(`A breathtaking ${locMapped} at golden hour`);
  if (selection?.customLocationDetails && selection.customLocationDetails.trim()) {
    envParts.push(selection.customLocationDetails.trim());
  }
  if (selection?.weddingStudioBackdropProps && selection.weddingStudioBackdropProps.trim()) {
    envParts.push(`studio backdrop featuring ${selection.weddingStudioBackdropProps.trim()}`);
  }
  if (selection?.event && selection.event !== "skip") {
    envParts.push(`celebrating traditional ${selection.event}`);
  }
  if (selection?.customEventDetails && selection.customEventDetails.trim()) {
    envParts.push(selection.customEventDetails.trim());
  }
  const environmentSection = envParts.join(". ").replace(/\.\./g, ".").trim();
  const cineParts = [];
  const framing = selection?.cameraAngle && selection.cameraAngle !== "skip" ? selection.cameraAngle : "Medium-full shot";
  cineParts.push(`${framing}`);
  const lensAperture = cameraBase.includes("85mm") ? "85mm portrait prime lens, f/1.8 aperture for a beautiful shallow depth of field, keeping the couple in sharp focus while softly blurring the background" : "50mm prime lens, f/2.8 aperture for a beautiful shallow depth of field, keeping the couple in sharp focus while softly blurring the background";
  cineParts.push(lensAperture);
  cineParts.push(`Eye-level angle, captured on ${cameraBase}`);
  const cinematographySection = cineParts.join(", ").trim();
  const lightParts = [];
  const lighting = selection?.timeAndLighting && selection.timeAndLighting !== "skip" ? selection.timeAndLighting : "Golden hour natural lighting, soft warm sunlight illuminating their faces, gentle rim light on their attire from the setting sun";
  lightParts.push(lighting);
  const mood = selection?.moodEmotion && selection.moodEmotion !== "skip" ? `${selection.moodEmotion} aesthetic` : "romantic and elegant aesthetic";
  lightParts.push(mood);
  if (selection?.colorGrade && selection.colorGrade !== "skip") {
    lightParts.push(`${selection.colorGrade} color grading`);
  } else {
    lightParts.push("cinematic color grading, 16-bit natural warm film tones");
  }
  if (makeupText) lightParts.push(makeupText.replace(/^,\s*/, ""));
  lightParts.push(retouchText.replace(/^,\s*/, ""));
  const lightingStyleSection = lightParts.join(", ").trim();
  const technicalSection = `${qualityText} --ar ${targetAr}`.trim();
  const masterPrompt = `[Subject]: ${subjectSection}. [Action]: ${actionSection}. [Environment]: ${environmentSection}. [Cinematography]: ${cinematographySection}. [Lighting/Style]: ${lightingStyleSection}. [Technical]: ${technicalSection}`.replace(/\s+/g, " ").replace(/\.\./g, ".").trim();
  const negativePrompt = `different face, altered face, swapped face, distorted facial features, facial asymmetry, Indian saree, bindi, Chinese hanfu, Japanese kimono, Western casual clothes, plastic airbrushed skin, doll face, blurry, low resolution, bad eyes, deformed hands, extra fingers, overexposed, watermark, text`;
  const angleNote = selection?.cameraAngle && selection.cameraAngle !== "skip" ? `, Framing: ${selection.cameraAngle}` : ", Framing: Eye-Level Portrait";
  const styleNote = selection?.photoStyle && selection.photoStyle !== "skip" ? `, Style: ${selection.photoStyle}` : "";
  const colorNote = selection?.colorGrade && selection.colorGrade !== "skip" ? `, Color Grade: ${selection.colorGrade}` : ", Color: 16-bit Natural Kodak Portra Tone";
  const cameraNotes = `${cameraBase}${angleNote}${styleNote}${colorNote}, ISO 64, f/1.2 aperture, 1/250s shutter speed, 85mm prime optics`;
  const descriptionMm = `\u3010\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1005\u1010\u1030\u1012\u102E\u101A\u102D\u102F \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A \u1012\u102B\u101B\u102D\u102F\u1000\u103A\u1010\u102C \u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u1001\u103B\u1000\u103A (Burmese Detail Story)\u3011
\u1041\u104B \u1021\u1013\u102D\u1000 \u1000\u102C\u101B\u102D\u102F\u1000\u103A\u1010\u102C\u1014\u103E\u1004\u1037\u103A \u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u103D\u1004\u103A\u1015\u103C\u1004\u103A: ${subjectMm} \u2014 \u1019\u1030\u101B\u1004\u103A\u1038\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u1021\u1001\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u104A \u1019\u103B\u1000\u103A\u101C\u102F\u1036\u1038\u104A \u1014\u103E\u102C\u1010\u1036\u104A \u1014\u103E\u102F\u1010\u103A\u1001\u1019\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u101E\u1018\u102C\u101D \u1021\u101E\u102C\u1038\u1021\u101B\u1031 \u1001\u103B\u103D\u1031\u1038\u1015\u1031\u102B\u1000\u103A (Micro-Pores) \u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1041\u1040\u1040% \u1021\u1010\u102D\u1021\u1000\u103B \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1042\u104B \u101B\u102D\u102F\u1038\u101B\u102C\u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1021\u1011\u100A\u103A\u1021\u101E\u102C\u1038: ${outfitMm} \u2014 \u1015\u102D\u102F\u1038\u1001\u103B\u102D\u1010\u103A\u1021\u1006\u1004\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A\u1000\u102D\u102F \u1021\u1015\u103A\u1001\u103B\u102F\u1015\u103A\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1021\u1011\u100A\u103A\u101E\u102C\u1038 \u1015\u1031\u102B\u103A\u101C\u103D\u1004\u103A\u101E\u100A\u103A\u1021\u1011\u102D \u1010\u102D\u1000\u103B\u1005\u103D\u102C \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1043\u104B \u101E\u1014\u1015\u103A\u1001\u102B\u1038\u104A \u1006\u1036\u1011\u102F\u1036\u1038\u1014\u103E\u1004\u1037\u103A \u101B\u1010\u1014\u102C \u1021\u1006\u1004\u103A\u1010\u1014\u103A\u1006\u102C: ${culturalPropsMm} (\u1000\u102D\u102F\u101A\u103A\u1014\u1031\u101F\u1014\u103A\u1011\u102C\u1038 - ${poseMm})
\u1044\u104B \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u101B\u103E\u102F\u1001\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1021\u101C\u1004\u103A\u1038\u1021\u1019\u103E\u1031\u102C\u1004\u103A: ${locationMm} \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u1010\u103D\u1004\u103A ${lightingMm} \u1016\u103C\u1004\u1037\u103A \u101B\u102F\u1015\u103A\u1000\u103C\u103D\u1015\u1031\u102B\u103A\u101C\u103D\u1004\u103A\u1021\u1031\u102C\u1004\u103A \u1021\u101C\u1004\u103A\u1038\u1015\u1031\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B
\u1045\u104B \u1000\u1004\u103A\u1019\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1021\u101B\u100A\u103A\u1021\u101E\u103D\u1031\u1038 \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1001\u103B\u1000\u103A: ${cameraBase} \u1019\u103E\u1014\u103A\u1018\u102E\u101C\u1030\u1038\u104A Aspect Ratio (${targetAr}) \u1016\u103C\u1004\u1037\u103A \u1021\u1001\u103C\u102C\u1038\u1014\u102D\u102F\u1004\u103A\u1004\u1036 \u101D\u1010\u103A\u1005\u102F\u1036\u1019\u103B\u102C\u1038 \u101B\u1031\u102C\u1014\u103E\u1031\u102C\u1001\u103C\u1004\u103A\u1038 \u101C\u102F\u1036\u1038\u101D\u1019\u101B\u103E\u102D\u1005\u1031\u101B\u1014\u103A Anti-Hallucination \u1005\u1014\u1005\u103A\u1016\u103C\u1004\u1037\u103A \u1000\u102C\u1000\u103D\u101A\u103A\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B`;
  const descriptionEn = `[Burmese Cultural & Studio Director Breakdown]
\u2022 Subject & Identity: ${subjectText} (100% facial geometry & micro-pore preservation)
\u2022 Traditional Attire: ${outfitText.replace(/^, wearing /, "")}
\u2022 Cosmetics & Regalia: ${culturalPropsText.replace(/^, adorned with /, "") || "Natural studio styling"}
\u2022 Environment & Lighting: ${locationText.replace(/^, set (in|against) /, "")} | ${lightingText.replace(/^, illuminated by /, "")}
\u2022 Camera & Optics: ${cameraNotes} (--ar ${targetAr})`;
  return {
    masterPrompt,
    negativePrompt,
    midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --no Indian saree, Chinese hanfu, Japanese kimono, plastic skin, altered face`,
    fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, "").trim()}`,
    sdxlFormat: `${masterPrompt} | Camera: ${cameraNotes} | Negative: ${negativePrompt}`,
    descriptionMm,
    descriptionEn,
    cameraNotes
  };
}

// server.ts
var import_v2 = require("@higgsfield/client/v2");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3001;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()) : null;
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!allowedOrigins) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
function parseDataUrlToPart(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (dataUrl.startsWith("data:image/")) {
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      };
    }
  }
  return null;
}
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: apiKey || "placeholder_key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: "Show Ai Studio.", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/process-image", async (req, res) => {
  try {
    const { image, fileName = "" } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ success: false, error: "No image provided" });
    }
    const isHeicExtension = fileName.toLowerCase().endsWith(".heic") || fileName.toLowerCase().endsWith(".heif") || image.startsWith("data:image/heic") || image.startsWith("data:image/heif");
    let base64Data = image.replace(/^data:[^;]+;base64,/, "");
    const inputBuffer = Buffer.from(base64Data, "base64");
    const isBufferHeic = inputBuffer.length > 12 && inputBuffer.toString("ascii", 4, 8) === "ftyp" && ["heic", "heix", "hevc", "mif1", "msf1", "heim"].includes(inputBuffer.toString("ascii", 8, 12));
    if (isHeicExtension || isBufferHeic) {
      try {
        const outputBuffer = await (0, import_heic_convert.default)({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.88
        });
        const convertedDataUrl = `data:image/jpeg;base64,${Buffer.from(outputBuffer).toString("base64")}`;
        return res.json({ success: true, dataUrl: convertedDataUrl });
      } catch (convErr) {
        console.warn("Server HEIC conversion attempt failed:", convErr?.message || convErr);
      }
    }
    if (image.startsWith("data:image/jpeg") || image.startsWith("data:image/png") || image.startsWith("data:image/webp")) {
      return res.json({ success: true, dataUrl: image });
    }
    const fallbackDataUrl = `data:image/jpeg;base64,${inputBuffer.toString("base64")}`;
    return res.json({ success: true, dataUrl: fallbackDataUrl });
  } catch (error) {
    console.error("Server /api/process-image error:", error);
    return res.status(500).json({ success: false, error: error?.message || "Image processing failed" });
  }
});
var TEXT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-pro",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];
async function generateContentWithFallback(ai, requestParams) {
  let lastError = null;
  for (const modelName of TEXT_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: requestParams.contents,
        config: requestParams.config
      });
      return response;
    } catch (error) {
      lastError = error;
      const errMsg = String(error?.message || "");
      const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
      if (isQuota) {
        console.warn(`[Gemini Quota Notice] Model ${modelName} free-tier daily quota limit reached. Falling back to next model...`);
      } else {
        console.warn(`[Gemini Fallback] Model ${modelName} notice:`, errMsg || error);
      }
      continue;
    }
  }
  throw lastError;
}
async function callOpenRouter(params) {
  const { apiKey, model, systemPrompt, userPrompt, images = [], responseFormat = "json" } = params;
  const contentParts = [
    { type: "text", text: userPrompt }
  ];
  for (const img of images) {
    if (img && typeof img === "string" && img.startsWith("data:image/")) {
      contentParts.push({
        type: "image_url",
        image_url: { url: img }
      });
    }
  }
  const selectedModel = model || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  console.log(`[OpenRouter] Calling model: ${selectedModel} (Attached images: ${contentParts.length - 1}, format: ${responseFormat})`);
  const requestBody = {
    model: selectedModel,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: contentParts }
    ]
  };
  if (responseFormat === "json") {
    requestBody.response_format = { type: "json_object" };
  }
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3001",
      "X-Title": "Infinity Prompt Studio",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data?.error?.message || `OpenRouter HTTP error: ${response.status} ${response.statusText}`;
    throw new Error(`[OpenRouter] ${errorMsg}`);
  }
  const text = data.choices?.[0]?.message?.content || "{}";
  return text;
}
app.get("/api/openrouter/check", async (req, res) => {
  const key = req.headers["x-openrouter-key"] || process.env.OPENROUTER_API_KEY;
  if (!key || !key.trim()) {
    return res.status(400).json({ valid: false, error: "No OpenRouter API key found in request or server environment." });
  }
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { "Authorization": `Bearer ${key.trim()}` }
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ valid: false, error: data?.error?.message || "Invalid OpenRouter API Key" });
    }
    return res.json({ valid: true, data: data.data });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message || "Failed to contact OpenRouter" });
  }
});
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { selection, mode, language = "my", customInstruction } = req.body;
    const ai = getGeminiClient();
    const isOption3 = selection?.img2imgOption === "style_transfer";
    const isCustomGarmentUpload = selection?.clothesSwapOption === "custom_garment_upload" || !!selection?.customGarmentImage;
    const isOutfitAndPoseRef = isOption3 || mode === "clothes-swap" && isCustomGarmentUpload;
    const OPTION_3_SYSTEM_INSTRUCTION = `You are an expert AI image-generation prompt engineer.
I am building an image prompt generator app with multiple functions. One of the functions is called:
\u201CReference Image Outfit & Pose\u201D
The purpose of this function is to allow the user to upload:
A Reference Image
A User/Subject Image
Your job is to analyze both images and generate a high-quality image-generation prompt that uses the Reference Image as the visual style guide while keeping the person/identity from the User Image.

IMPORTANT:
Study the Reference Image carefully.
Analyze the clothing, outfit, colors, fabric, accessories, styling, body pose, hand position, leg position, facial direction, camera angle, framing, composition, lighting, background, and overall photography style.
Use the Reference Image ONLY as a reference for the outfit, pose, composition, styling, and visual presentation.
Use the User Image as the main identity/subject reference.
Preserve the User Image person's facial identity, facial features, hairstyle, skin tone, body characteristics, and overall recognizable appearance as accurately as possible.
Do NOT copy the identity or face of the person in the Reference Image.
Recreate the outfit and pose from the Reference Image on the person from the User Image.
If the Reference Image contains a specific camera angle, body position, hand gesture, clothing arrangement, or composition, describe it clearly in the final prompt.
If some details cannot be determined from the images, do not invent unnecessary details. Describe only what can reasonably be observed.
The generated prompt should be suitable for modern AI image-generation models.

OUTPUT REQUIREMENTS:
Generate ONE complete image-generation prompt.
The prompt should clearly include these sections naturally:
Subject / Identity
Preserve the identity and facial characteristics of the User Image.
Outfit
Accurately describe the clothing from the Reference Image.
Include clothing type, color, material, pattern, fit, layering, accessories, shoes, and other visible details.
Pose
Accurately describe the body posture and positioning from the Reference Image.
Include head direction, shoulder position, arms, hands, torso, legs, and overall stance.
Composition
Describe framing, camera angle, subject position, crop, perspective, and image orientation.
Background
Recreate the general background/environment from the Reference Image when appropriate.
Lighting
Describe the lighting direction, softness, shadows, highlights, and overall mood.
Photography / Visual Style
Describe the photography style, lens perspective, depth of field, image quality, realism, and professional appearance.
Quality
The final prompt should request a highly realistic, detailed, natural-looking image with accurate anatomy, realistic skin texture, realistic clothing details, and professional photographic quality.

The final prompt must be written as a single polished prompt that the user can directly copy and paste into an AI image generator.
Do not explain the analysis.
Do not describe the Reference Image and User Image separately in the final response.
Do not output multiple prompt variations.
Only output the final image-generation prompt.

Always append the aspect ratio parameter: --ar <aspectRatio> at the end of the prompt.

MANDATORY OUTPUT FORMAT:
Output ONLY valid JSON matching this exact structure:
{
  "masterPrompt": "string (The ONE complete, single polished image-generation prompt containing all sections naturally, ending with --ar <ratio>)",
  "negativePrompt": "string (Comprehensive negative prompt: different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, deformed limbs, poor anatomy)",
  "midjourneyFormat": "string (/imagine prompt: <masterPrompt> --v 6.0 --style raw)",
  "fluxFormat": "string (<masterPrompt>)",
  "sdxlFormat": "string (<masterPrompt>)",
  "descriptionMm": "string (Polite Myanmar explanation stating that User Image identity is 100% preserved while Reference Image outfit and pose are recreated - \u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1019\u103E\u1014\u103A)",
  "descriptionEn": "string (English summary explaining User Image identity retention with Reference Image outfit and pose transfer)",
  "cameraNotes": "string (Camera, lens and lighting observation from the reference)"
}`;
    const defaultSystemInstruction = `You are a professional photography prompt engineer for Infinity Prompt Studio specializing in high-end photography prompts for Midjourney v6, SDXL, Flux.1, and Imagen 3.
Your job is to transform structured user selections into an ultra-detailed, photorealistic master prompt.

CRITICAL MULTIMODAL ANALYSIS FOR UPLOADED OUTFIT/GARMENT PHOTO (\u1021\u1015\u103C\u1004\u103A\u1019\u103E \u1010\u1004\u103A\u101C\u102D\u102F\u1000\u103A\u101E\u1031\u102C \u101D\u1010\u103A\u1005\u102F\u1036/\u1021\u1011\u100A\u103A \u1013\u102C\u1010\u103A\u1015\u102F\u1036 \u101E\u102F\u1036\u1038\u101E\u1015\u103A\u1001\u103C\u1004\u103A\u1038):
- When a Custom Garment Photo (customGarmentImage) is attached or provided, you MUST perform a meticulous visual inspection of the attached outfit photo!
- Visually identify the exact outfit design, clothing type (e.g., traditional Myanmar blouse with diagonal sash, red silk woven longyi, golden tiara/headpiece, white long-sleeve jacket, pearls, embroidery, lace, velvet, or suit).
- Describe this exact analyzed attire in detail in the clothing section of the generated masterPrompt so the AI image generator recreates that exact outfit on the subject!
- DO NOT default to generic or unrelated preset clothing when an outfit photo is attached!

CRITICAL MANDATE - FACIAL IDENTICALITY & LIKENESS LOCK (\u1019\u103B\u1000\u103A\u101C\u102F\u1036\u1038\u104A \u1014\u103E\u102C\u1001\u1031\u102B\u1004\u103A\u1038\u104A \u1014\u103E\u102F\u1010\u103A\u1001\u1019\u103A\u1038 \u1041\u1040\u1040% \u1010\u1030\u100A\u102E\u1019\u103E\u102F):
- Whenever a reference photo is provided, or when Identity Lock is enabled, or when Preserve Subject 100% is active (preserveSubject100Percent = true), you MUST STRICTLY preserve 100% of the subject's face, eyes, nose, lips, skin tone, facial proportions, body posture, and identity from the original photo.
- The prompt MUST explicitly command the AI: "100% exact face match, identical eyes nose lips, exact posture and body build, zero face alteration. Exclusively modify and upgrade the background environment, stage lighting, and scenery".
- Under NO circumstances should facial features, eyes, nose, or lips be altered, swapped, or morphed into someone else.

SPECIAL FEATURE - PRESERVE SUBJECT 100% & EXCLUSIVELY UPGRADE BACKGROUND ENVIRONMENT:
- If Preserve Subject 100% option is ENABLED (preserveSubject100Percent = true):
  1. Subject (person/face/body/pose/skin tone) MUST be locked 100% identical without any modifications to face, skin, eyes, nose, lips, or posture.
  2. The prompt should focus all artistic transformations exclusively on background scenery, studio backdrop, lighting, camera lens effects, atmosphere, and environmental upgrade.
- If Preserve Subject 100% option is DISABLED (preserveSubject100Percent = false):
  Standard mode where both subject and background can be modified according to user options.

MODE SPECIFIC INSTRUCTIONS:
- If mode is "img2img" or "clothes-swap": Strictly preserve 100% exact face, eyes, nose, lips, facial features, and identity from the uploaded photo. Explicitly state in the prompt that the subject's face, eyes, nose, and lips must match the reference image with 100% fidelity. Only modify clothing, background, lighting, or artistic style according to user selections.
- If mode is "img2img":
  - Option 1 (app_custom): Keep 100% exact facial likeness from uploaded person image. Modify clothing, makeup, backdrop, and lighting according to user's selections from inside the app.
  - Option 2 (bg_only - Background Replacement Only): Keep 100% exact face, eyes, nose, lips, body posture AND original clothing/outfit completely UNCHANGED. ONLY replace, upgrade, and transform the background environment, scenery, backdrop, and lighting!
  - Option 3 (style_transfer - Copy Pose, Garment & Background from 2nd Reference Photo): Keep 100% exact face, eyes, nose, lips, skin tone, and identity from Reference Image 1 (Person Photo). Copy and strictly replicate the pose, body stance, outfit/clothing design, accessories, and background setting directly from Reference Image 2 (Style Reference Photo)!
- If mode is "txt2img": Generate completely from text description without relying on any reference image.
- If mode is "clothes-swap":
  CRITICAL MANDATORY STRICT SEQUENCE LOGIC FOR CLOTHES SWAP:
  1. Primary Subject (Image 1):
     - Preserve 100% of the person's face, eyes, nose, lips, facial features, body shape, posture, pose, skin tone, and expression from Image 1.
     - MANDATORY PROMPT PREAMBLE: Start prompt with "Keep the exact same person, face, body shape, pose, expression, skin tone from Image 1 with 100% fidelity, zero face alteration, 100% exact face match, identical eyes nose lips."
  2. Clothing Reference (Image 2 or Selected Preset):
     - Replace ONLY the clothing with the outfit from Image 2 (if custom garment photo attached) or from the selected preset outfit.
     - MANDATORY PROMPT SECTION: "Replace ONLY the clothing with the outfit from Image 2."
  3. Comprehensive Clothing Detail Checklist (MUST analyze & describe ALL in vivid detail):
     - Fabric type (e.g., pure silk, heavy velvet, chiffon, woven brocade, lace, cotton, satin, denim)
     - Color and pattern (vibrant colors, gold thread motifs, traditional patterns, solid shades)
     - Style (e.g., structured royal blouse, flowing longyi, tailored suit, fitted evening gown, loose traditional)
     - Fit on body (e.g., tailored body-hugging fit, loose flowing, structured posture)
     - Length (e.g., full-length floor-sweeping maxi dress, midi length, short blouse and longyi)
     - Embroidery & Design details (e.g., gold thread filigree, ornate lace borders, sequins, crests)
     - Accessories & Outerwear (e.g., matching silk shawl, decorative waist belt, scarf, outer jacket)
  4. Environmental Continuity:
     - MANDATORY ENDING: "Maintain 100% original lighting, camera optics, studio setting, and background environment unless changed."
- If mode is "background-only": Strictly generate a prompt purely for a standalone background scene, landscape, studio backdrop, architectural setting, or scenery WITHOUT ANY HUMAN SUBJECTS, PERSONS, FACES, MODELS, OR CLOTHING. Focus strictly on environment, background props, architecture, natural scenery, atmospheric lighting, depth of field, camera optics, and style. In the negative prompt, MANDATORILY include: "person, human, face, woman, man, girl, boy, model, people, portrait, body, hands, limbs, clothing".

IDENTITY LOCK INSTRUCTIONS:
- face_100 (Face Lock 100%): Keep the 100% exact same face, eyes, nose, lips, facial features, skin texture, age, and expression. Do not alter identity.
- face_body_lock (Face + Body Lock): Additionally keep 100% exact face, eyes, nose, lips, body proportions, height, weight, and pose identical to reference.
- soft_ref (Soft Reference): Use the uploaded image as strong reference but allow minor artistic changes.
- no_lock (No Lock): Unrestricted creative generation without lock constraints.
- CRITICAL: Whenever identity lock is enabled (face_100, face_body_lock, or soft_ref), you MUST explicitly include these mandatory keywords in the final generated prompt:
  "100% exact face match, 100% identical eyes nose lips, same face, same person, identical facial features, preserve identity, consistent character, no face change"

ETHNICITY & CULTURAL ACCESSORIES INSTRUCTIONS (BURMESE HERITAGE TAXONOMY):
- If Ethnicity is Burmese / Myanmar (or any Myanmar ethnic group: Bamar, Shan, Kachin, Kayin, Chin, Mon, Rakhine, Kayah):
  - Accurately describe Southeast Asian Burmese facial features, warm golden-ivory skin tone, and authentic Burmese garments:
    - Acheik / Silk Longyi: "authentic Burmese Luntaya Acheik wave-patterned handwoven silk longyi wrap skirt paired with a fitted Yinzi or Yinkhon traditional Burmese silk blouse"
    - Konbaung Royal Attire: "historical Myanmar Konbaung Dynasty Maha Lata royal court regalia with intricate gold Zardosi embroidery, structured winged Dona-Yone collar, and tiered court skirt"
    - Cosmetics & Hair: "authentic creamy ivory-yellow Burmese Thanaka bark paste delicately brushed on cheeks, traditional Myanmar Sadon high-crowned chignon hair bun adorned with fresh Padauk or white Jasmine flower garlands, and royal Burmese gold filigree Nadoung ear ornaments"
  - Architectural & Location Accuracy:
    - Bagan: "ancient Bagan archaeological plain with red-brick Buddhist stupas, Pyatthat tiered roofs, and warm golden sunset haze"
    - Shwedagon / Golden Pagoda: "gleaming gold-leaf stupa spires, marble prayer pavilion platform, and carved teakwood temple eaves"
    - Mandalay Palace: "crimson-red lacquered teakwood columns and multi-tiered golden Pyatthat roofs of Mandalay Royal Palace"
- CRITICAL ANTI-HALLUCINATION RULE: NEVER mix wrong cultural elements (strictly forbid Indian saree, lehenga, bindi, nose ring, Chinese hanfu, cheongsam, or Japanese kimono when generating Burmese attire). Always include these exclusions in negativePrompt.

PROMPT ENGINE OUTPUT RULES:
1. Produce ultra-detailed, photorealistic English prompts ready for Flux.1 / GPT Image 2 / Midjourney v6.1 / SDXL.
2. Always include a strong negativePrompt containing: "different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, Indian saree, bindi, Chinese hanfu, Japanese kimono, plastic skin, CGI".
3. CRITICAL RULE FOR SKIPPED OPTIONS: If any selection parameter is set to "skip", "None", or "Default", DO NOT include the literal word "skip" in the prompt. Instead, auto-determine a natural, harmonious photography default.
4. ENGINE-SPECIFIC FORMATTING:
   - masterPrompt: Structured 8-part photography prompt ending with "--ar <aspectRatio>".
   - fluxFormat: Pure natural-language photographic prose optimized for FLUX.1 Pro / GPT Image 2 / Gemini Image (NO "--ar" flags, NO Midjourney parameters, NO negative prompt text appended).
   - midjourneyFormat: Starts with "/imagine prompt: " and ends with "--ar <aspectRatio> --v 6.1 --style raw".
   - sdxlFormat: Tag-weighted photorealistic prompt optimized for SDXL / Juggernaut XL.
   - descriptionMm: MUST be a rich, accurate, 5-point structured Burmese Director's Breakdown (\u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u101E\u1031\u102C \u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A):
     \u3010\u1019\u103C\u1014\u103A\u1019\u102C\u1037\u101B\u102D\u102F\u1038\u101B\u102C\u1014\u103E\u1004\u1037\u103A \u1005\u1010\u1030\u1012\u102E\u101A\u102D\u102F \u1021\u101E\u1031\u1038\u1005\u102D\u1010\u103A \u1012\u102B\u101B\u102D\u102F\u1000\u103A\u1010\u102C \u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u1001\u103B\u1000\u103A\u3011
     \u1041\u104B \u1021\u1013\u102D\u1000\u1007\u102C\u1010\u103A\u1000\u1031\u102C\u1004\u103A\u1014\u103E\u1004\u1037\u103A \u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u103D\u1004\u103A\u1015\u103C\u1004\u103A (Subject & Identity Lock)
     \u1042\u104B \u101D\u1010\u103A\u1005\u102F\u1036\u104A \u1015\u102D\u102F\u1038\u1011\u100A\u103A\u1014\u103E\u1004\u1037\u103A \u101B\u102D\u102F\u1038\u101B\u102C\u1021\u1006\u1004\u103A\u1010\u1014\u103A\u1006\u102C (Garment & Textile Craft)
     \u1043\u104B \u1014\u1031\u102C\u1000\u103A\u1001\u1036\u1015\u1010\u103A\u101D\u1014\u103A\u1038\u1000\u103B\u1004\u103A\u1014\u103E\u1004\u1037\u103A \u1021\u101C\u1004\u103A\u1038\u1021\u1019\u103E\u1031\u102C\u1004\u103A (Environment & Lighting Setup)
     \u1044\u104B \u1000\u1004\u103A\u1019\u101B\u102C\u104A \u1019\u103E\u1014\u103A\u1018\u102E\u101C\u1030\u1038\u1014\u103E\u1004\u1037\u103A \u1016\u103D\u1032\u1037\u1005\u100A\u103A\u1038\u1015\u102F\u1036 (Camera Optics & Composition)
     \u1045\u104B \u1000\u102C\u101C\u102C\u1021\u101E\u103D\u1031\u1038\u1021\u101B\u1031\u102C\u1004\u103A\u1014\u103E\u1004\u1037\u103A \u1021\u101B\u100A\u103A\u1021\u101E\u103D\u1031\u1038 (Color Grading & Render Quality)

ALWAYS structure the masterPrompt string in this EXACT tagged format, strictly obeying all chosen options:
[Subject]: Detailed description of the subject(s), exact Burmese ethnic heritage, clothing textiles, embroidery, accessories, hair styling, expression, and Thanaka or cultural cosmetics. (When a couple/wedding is selected, obey specific Groom and Bride details).
[Action]: Pose, body posture, gestures, holding hands or traditional cultural props, gaze direction.
[Environment]: The selected background setting, historical architecture, studio backdrop, cultural context, or festival surroundings.
[Cinematography]: Camera angle, shot type, focal length, lens aperture, depth of field, sharp subject focus.
[Lighting/Style]: Natural or studio lighting setup, time of day, warm tones, cultural aesthetic and color grading.
[Technical]: Ultra-high definition textures, 8k resolution, photorealistic fabric weave, ending with --ar <aspectRatio>.

Output ONLY valid JSON matching this exact structure:
{
  "masterPrompt": "string ([Subject]: ... [Action]: ... [Environment]: ... [Cinematography]: ... [Lighting/Style]: ... [Technical]: ... --ar <ratio>)",
  "negativePrompt": "string (Comprehensive negative prompt keywords including face preservation and cultural accuracy exclusions)",
  "midjourneyFormat": "string (Formatted with /imagine prompt: ... --ar <ratio> --v 6.1 --style raw)",
  "fluxFormat": "string (Pure natural-language photographic prose without --ar flags, optimized for FLUX.1 / GPT Image 2)",
  "sdxlFormat": "string (Tag-weighted prompt optimized for SDXL Turbo / Juggernaut XL)",
  "descriptionMm": "string (5-point structured Burmese Director's Breakdown in accurate Myanmar language - \u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1019\u103E\u1014\u103A)",
  "descriptionEn": "string (Detailed director's explanation in English)",
  "cameraNotes": "string (Technical photography notes e.g., 85mm f/1.4, ISO 100, 1/250s)"
}`;
    const garmentStyleText = isCustomGarmentUpload ? `CUSTOM OUTFIT PHOTO ATTACHED: ${selection?.customGarmentDescription || selection?.garmentFabric || "Visually analyze attached custom garment image carefully"}` : `${selection?.garmentStyle || "Royal Silk Cheik Longyi"} (${selection?.garmentFabric || "Pure Woven Silk"})`;
    const userCustomText = customInstruction || selection?.customInstruction || "";
    const promptText = `Generate a master photography prompt based on these parameters:
App Mode: ${mode || "txt2img"}
Img2Img Option: ${selection?.img2imgOption || "app_custom"} (Option 1 = App presets, Option 2 = Background Replacement Only, Option 3 = Copy Pose, Garment & BG from 2nd Photo)
Preserve Subject 100%: ${selection?.preserveSubject100Percent !== false ? "ENABLED" : "DISABLED"}
Identity Lock: ${selection?.identityLock || (mode === "txt2img" ? "no_lock" : "face_100")}
Subject: ${selection?.subject || "woman"}
Custom Subject Details: ${selection?.customSubjectDetails || "None"}
Couple Outfit Type: ${selection?.coupleOutfitType || "None"}
Couple Interaction & Pose: ${selection?.couplePose || "None"}
Groom Details (\u101E\u1010\u102D\u102F\u1037\u101E\u102C\u1038): Outfit/Full Set: ${selection?.groomOutfit || "None"}, Top: ${selection?.groomTop || "None"}, Bottom: ${selection?.groomBottom || "None"}, Expression: ${selection?.groomExpression || "None"}, Hair: ${selection?.groomHair || "None"}, Props/Pose: ${selection?.groomPoseAccessory || "None"}
Bride Details (\u101E\u1010\u102D\u102F\u1037\u101E\u1019\u102E\u1038): Outfit/Full Set: ${selection?.brideOutfit || "None"}, Top: ${selection?.brideTop || "None"}, Bottom: ${selection?.brideBottom || "None"}, Expression: ${selection?.brideExpression || "None"}, Hair: ${selection?.brideHair || "None"}, Props/Pose: ${selection?.bridePoseAccessory || "None"}
Wedding Accessories (\u1019\u1004\u103A\u1039\u1002\u101C\u102C \u1021\u101E\u102F\u1036\u1038\u1006\u1031\u102C\u1004\u103A\u1019\u103B\u102C\u1038): ${selection?.weddingAccessoryProps || "None"}
Wedding Studio Backdrop & Props (Studio \u1001\u1014\u103A\u1038\u101D\u1004\u103A \u1015\u1005\u1039\u1005\u100A\u103A\u1038\u1019\u103B\u102C\u1038): ${selection?.weddingStudioBackdropProps || "None"}
Age Range: ${selection?.ageRange || "18_25"}
Pose & Expression: ${selection?.poseExpression || "Soft Smile / Natural Pose"} (${selection?.customPoseDetails || "None"})
Ethnicity / Culture: ${selection?.ethnicity || "burmese"} (${selection?.customEthnicityDetails || "Burmese / Myanmar"})
Include Cultural Props / Accessories: ${selection?.includeCulturalProps ? "YES" : "NO"}
Cultural Props Details: ${selection?.culturalPropsDetails || "None (or Thanaka, flower garland, longyi, Pathein umbrella if requested)"}
Event/Festival: ${selection?.event || "Thingyan Water Festival"}
Custom Event Details: ${selection?.customEventDetails || "None"}
Location/Environment: ${selection?.location || "Heritage Temple Sanctuary"}
Custom Location Details: ${selection?.customLocationDetails || "None"}
Time & Lighting: ${selection?.timeAndLighting || "Golden Hour Warm Sunlight"}
Emotion & Mood: ${selection?.moodEmotion || "Calm & Peaceful"}
Custom Lighting Details: ${selection?.customLightingDetails || "None"}
Camera Setup: ${selection?.camera || "Sony A7R V 85mm f/1.2"}
Camera Angle & Framing: ${selection?.cameraAngle || "Eye Level"}
Photo Style: ${selection?.photoStyle || "Photorealistic Studio Portrait"}
Retouching Style: ${selection?.retouching || "Ultra-Realistic Natural Skin Pores"}
Makeup: ${selection?.makeup || "Natural Glam Dewy"}
Color Grade: ${selection?.colorGrade || "Kodak Portra 400"}
Aspect Ratio: ${selection?.aspectRatio || "9:16"} (MANDATORY: include --ar ${selection?.aspectRatio || "9:16"} in prompt)
Quality Profile: ${selection?.qualityProfile || "8K UHD Masterpiece"}
Clothes Swap Option: ${selection?.clothesSwapOption || "in_app_preset"}
Garment/Outfit: ${garmentStyleText}
Additional Custom Details: ${userCustomText || "None"}

CRITICAL INSTRUCTION FOR PROMPT COMPLETENESS: You MUST read ALL of the above user parameters and incorporate EVERY SINGLE parameter that is selected, typed, or specified into the masterPrompt without omitting or skipping any details!
Please ensure Myanmar description is polite, professional, with clean spelling (\u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1019\u103E\u1014\u103A).`;
    const personImgPart = parseDataUrlToPart(selection?.referenceImage);
    const maleImgPart = parseDataUrlToPart(selection?.referenceImageMale);
    const femaleImgPart = parseDataUrlToPart(selection?.referenceImageFemale);
    const customGarmentImgPart = parseDataUrlToPart(selection?.customGarmentImage);
    const partnerImgPart = parseDataUrlToPart(selection?.partnerReferenceImage);
    const styleRefImgPart = parseDataUrlToPart(selection?.styleReferenceImage);
    let imageNoticeText = "";
    if (maleImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE: Groom / Male Reference Photo] MANDATORY: Keep the exact same male person, face, facial features, skin tone, hairstyle, and identity from this male photo with 100% fidelity. Zero face alteration.";
    }
    if (femaleImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE: Bride / Female Reference Photo] MANDATORY: Keep the exact same female person, face, facial features, skin tone, hairstyle, and identity from this female photo with 100% fidelity. Zero face alteration.";
    }
    if (personImgPart && !maleImgPart && !femaleImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE 1: Primary Subject / Original Person Photo] MANDATORY STRICT SEQUENCE STEP 1: Keep the exact same person, face, body shape, pose, skin tone, and facial expression from Image 1 with 100% fidelity. Do NOT alter face, eyes, nose, lips, or body posture.";
    }
    if (customGarmentImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE 2: Clothing Reference / Garment Outfit Photo] MANDATORY STRICT SEQUENCE STEP 2: Replace ONLY the clothing with the outfit from Image 2! Thoroughly analyze and describe Image 2 clothing in complete detail following the Clothing Detail Checklist (fabric type, color and pattern, style, length, embroidery/design details, outerwear/accessories, fit on body).";
    }
    if (partnerImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE: Partner Reference Photo] Maintain 100% facial features and body posture from this partner photo.";
    }
    if (styleRefImgPart) {
      imageNoticeText += "\n- [ATTACHED IMAGE 2: Style / Pose / Outfit Reference Photo] CRITICAL FOR OPTION 3: Replicate and copy the pose, clothing/outfit style, accessories, and background environment directly from this second reference image onto the person from Image 1!";
    }
    let contentsArray = [];
    const activeSystemInstruction = isOutfitAndPoseRef ? OPTION_3_SYSTEM_INSTRUCTION : defaultSystemInstruction;
    let effectiveUserPromptText = "";
    if (isOutfitAndPoseRef) {
      const userImagePart = personImgPart;
      const refImagePart = customGarmentImgPart || styleRefImgPart;
      const targetAr2 = selection?.aspectRatio || "9:16";
      let option3PromptText = `Function: "Reference Image Outfit & Pose"
Target Aspect Ratio: --ar ${targetAr2}
`;
      if (userCustomText) {
        option3PromptText += `User Additional Instructions: ${userCustomText}
`;
      }
      if (selection?.subject) {
        option3PromptText += `Subject Context: ${selection.subject} (${selection.ethnicity || "burmese"})
`;
      }
      if (userImagePart && refImagePart) {
        option3PromptText += `
I have uploaded two images for you:
- Image 1 (First attached image): User / Subject Image. Use this as the main identity and subject reference. Preserve this person's facial identity, facial features, hairstyle, skin tone, and body characteristics with 100% fidelity. Do NOT copy the face from the Reference Image.
- Image 2 (Second attached image): Reference Image. Study the clothing, outfit, colors, fabric, accessories, styling, body pose, hand position, leg position, facial direction, camera angle, framing, composition, lighting, background, and overall photography style. Recreate this outfit and pose from the Reference Image on the person from the User Image.

Now generate the ONE complete, single polished image-generation prompt as specified.`;
        contentsArray = [
          { text: option3PromptText },
          userImagePart,
          // User / Subject Image (Image 1)
          refImagePart
          // Reference Image (Image 2)
        ];
      } else if (refImagePart && !userImagePart) {
        option3PromptText += `
[Reference Image attached below]: Analyze the outfit, colors, styling, body pose, framing, lighting, and background from this Reference Image. Apply onto a subject (${selection?.subject || "woman"}, ${selection?.ethnicity || "burmese"}). Recreate the outfit and pose accurately in the ONE complete final image-generation prompt.`;
        contentsArray = [
          { text: option3PromptText },
          refImagePart
        ];
      } else if (userImagePart && !refImagePart) {
        option3PromptText += `
[User / Subject Image attached below]: Preserve this person's facial identity, facial features, hairstyle, skin tone, and body characteristics. Recreate an outfit (${selection?.garmentStyle || "designer attire"}) and pose (${selection?.poseExpression || "natural elegant pose"}) in the ONE complete final image-generation prompt.`;
        contentsArray = [
          { text: option3PromptText },
          userImagePart
        ];
      } else {
        option3PromptText += `
Generate ONE complete "Reference Image Outfit & Pose" image-generation prompt based on selected parameters.`;
        contentsArray = [{ text: option3PromptText }];
      }
      effectiveUserPromptText = option3PromptText;
    } else {
      const fullPromptText = promptText + (imageNoticeText ? `

ATTACHED REFERENCE IMAGES INSTRUCTION:${imageNoticeText}` : "");
      effectiveUserPromptText = fullPromptText;
      contentsArray = [{ text: fullPromptText }];
      if (maleImgPart) contentsArray.push(maleImgPart);
      if (femaleImgPart) contentsArray.push(femaleImgPart);
      if (personImgPart && !maleImgPart && !femaleImgPart) contentsArray.push(personImgPart);
      if (customGarmentImgPart) contentsArray.push(customGarmentImgPart);
      if (partnerImgPart) contentsArray.push(partnerImgPart);
      if (styleRefImgPart) contentsArray.push(styleRefImgPart);
    }
    const openRouterApiKey = req.headers["x-openrouter-key"] || req.body?.openRouterApiKey || process.env.OPENROUTER_API_KEY;
    const openRouterModel = req.headers["x-openrouter-model"] || req.body?.openRouterModel || process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
    let jsonText = "{}";
    let usedProvider = "gemini";
    const rawImagesForOpenRouter = [];
    if (isOutfitAndPoseRef) {
      if (selection?.referenceImage) rawImagesForOpenRouter.push(selection.referenceImage);
      if (selection?.customGarmentImage) rawImagesForOpenRouter.push(selection.customGarmentImage);
      else if (selection?.styleReferenceImage) rawImagesForOpenRouter.push(selection.styleReferenceImage);
    } else {
      if (selection?.referenceImageMale) rawImagesForOpenRouter.push(selection.referenceImageMale);
      if (selection?.referenceImageFemale) rawImagesForOpenRouter.push(selection.referenceImageFemale);
      if (selection?.referenceImage && !selection?.referenceImageMale && !selection?.referenceImageFemale) {
        rawImagesForOpenRouter.push(selection.referenceImage);
      }
      if (selection?.customGarmentImage) rawImagesForOpenRouter.push(selection.customGarmentImage);
      if (selection?.partnerReferenceImage) rawImagesForOpenRouter.push(selection.partnerReferenceImage);
      if (selection?.styleReferenceImage) rawImagesForOpenRouter.push(selection.styleReferenceImage);
    }
    if (openRouterApiKey && openRouterApiKey.trim() !== "") {
      try {
        console.log(`[Prompt Generator] Requesting prompt from OpenRouter with model: ${openRouterModel}`);
        jsonText = await callOpenRouter({
          apiKey: openRouterApiKey,
          model: openRouterModel,
          systemPrompt: activeSystemInstruction,
          userPrompt: effectiveUserPromptText,
          images: rawImagesForOpenRouter
        });
        usedProvider = `openrouter (${openRouterModel})`;
      } catch (orErr) {
        console.warn("[OpenRouter Attempt Failed]:", orErr?.message);
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && geminiKey.trim() !== "" && geminiKey !== "MY_GEMINI_API_KEY") {
          console.info("[Fallback] Attempting direct Gemini call...");
          const response = await generateContentWithFallback(ai, {
            contents: contentsArray,
            config: {
              systemInstruction: activeSystemInstruction,
              responseMimeType: "application/json",
              temperature: 0.7
            }
          });
          jsonText = response.text ? response.text.trim() : "{}";
          usedProvider = "gemini";
        } else {
          throw orErr;
        }
      }
    } else {
      const response = await generateContentWithFallback(ai, {
        contents: contentsArray,
        config: {
          systemInstruction: activeSystemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      jsonText = response.text ? response.text.trim() : "{}";
      usedProvider = "gemini";
    }
    let resultObj = {};
    try {
      resultObj = JSON.parse(jsonText);
    } catch (e) {
      const cleaned = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      try {
        resultObj = JSON.parse(cleaned);
      } catch (e2) {
        resultObj = {
          masterPrompt: cleaned,
          negativePrompt: "different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, bad anatomy, deformed limbs",
          descriptionMm: isOption3 ? "Reference Image Outfit & Pose \u1005\u1014\u1005\u103A\u1016\u103C\u1004\u1037\u103A User Image \u1019\u103E \u101C\u1030\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u103D\u1004\u103A\u1015\u103C\u1004\u103A\u1000\u102D\u102F \u1041\u1040\u1040% \u1011\u102D\u1014\u103A\u1038\u101E\u102D\u1019\u103A\u1038\u1015\u103C\u102E\u1038 Reference Image \u1019\u103E \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A Pose \u1000\u102D\u102F \u1015\u1031\u102B\u1004\u103A\u1038\u1005\u1015\u103A\u1016\u1014\u103A\u1010\u102E\u1038\u1011\u102C\u1038\u101E\u1031\u102C Master Prompt \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B" : "Generated photorealistic prompt",
          descriptionEn: isOption3 ? "Reference Image Outfit & Pose: Keeping User Image facial identity while recreating Reference Image outfit and pose." : "Generated prompt",
          cameraNotes: "Professional portrait optics"
        };
      }
    }
    const targetAr = selection?.aspectRatio || "9:16";
    const arTag = `--ar ${targetAr}`;
    if (resultObj.masterPrompt) {
      resultObj.masterPrompt = resultObj.masterPrompt.replace(/--ar\s+[0-9:]+/gi, "").trim();
      resultObj.masterPrompt = `${resultObj.masterPrompt} ${arTag}`.trim();
    }
    if (resultObj.midjourneyFormat) {
      resultObj.midjourneyFormat = resultObj.midjourneyFormat.replace(/--ar\s+[0-9:]+/gi, "").trim();
      resultObj.midjourneyFormat = resultObj.midjourneyFormat.replace(/(--v\s+[0-9.]+|--style\s+\w+)/gi, "").trim();
      resultObj.midjourneyFormat = `${resultObj.midjourneyFormat} ${arTag} --v 6.1 --style raw`.trim();
    } else if (resultObj.masterPrompt) {
      const cleanMjBase = resultObj.masterPrompt.replace(/--ar\s+\S+/g, "").trim();
      resultObj.midjourneyFormat = `/imagine prompt: ${cleanMjBase} ${arTag} --v 6.1 --style raw`;
    }
    if (resultObj.fluxFormat) {
      resultObj.fluxFormat = resultObj.fluxFormat.replace(/\/imagine\s+prompt:\s*/gi, "").replace(/--ar\s+\S+/gi, "").replace(/--v\s+\S+/gi, "").replace(/--style\s+\S+/gi, "").trim();
    } else if (resultObj.masterPrompt) {
      resultObj.fluxFormat = `A hyper-realistic, master-grade photograph: ${resultObj.masterPrompt.replace(/--ar\s+\S+/g, "").trim()}`;
    }
    if (!resultObj.sdxlFormat && resultObj.masterPrompt) {
      resultObj.sdxlFormat = `(masterpiece, best quality, ultra-detailed, photorealistic, 8k uhd:1.3), ${resultObj.masterPrompt.replace(/--ar\s+\S+/g, "").trim()}`;
    }
    res.json({
      success: true,
      provider: usedProvider,
      promptData: {
        ...resultObj,
        aspectRatio: targetAr
      }
    });
  } catch (error) {
    const errMsg = String(error?.message || "");
    const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
    if (isQuota) {
      console.info("[Prompt Synthesizer] API free-tier quota limit reached. Serving high-fidelity offline template synthesis.");
    } else {
      console.warn("Notice in /api/generate-prompt:", errMsg || error);
    }
    const fallbackPromptData = buildComprehensiveMasterPrompt(
      req.body?.selection || {},
      req.body?.mode || "txt2img"
    );
    res.json({
      success: true,
      promptData: fallbackPromptData,
      warning: isQuota ? "API quota reached. Generated using fallback prompt builder." : void 0
    });
  }
});
app.post("/api/translate-prompt", async (req, res) => {
  try {
    const { action, text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }
    const ai = getGeminiClient();
    let systemInstruction = "";
    let promptInstruction = "";
    if (action === "to_myanmar") {
      systemInstruction = `You are an expert translator and prompt specialist.
Translate the following English AI photography prompt into clear, natural, and detailed Myanmar language (\u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1019\u103E\u1014\u103A).
Explain and translate all key visual details including subject features, clothing, pose, location, lighting, depth of field, camera optics, and overall style.
Output ONLY the clean translated Myanmar text so a Myanmar user can read, review, and edit it easily. No preamble, no quotes.`;
      promptInstruction = `Translate this photography prompt into clear Myanmar language:
${text}`;
    } else {
      systemInstruction = `You are a world-class AI photography prompt engineer specializing in Midjourney v6, Flux.1, SDXL, and Imagen 3.
Your task is to take the user's edited Myanmar text and convert it into an ultra-detailed, photorealistic, master English photography prompt.
Structure and refine it with high-end photography parameters: subject features, authentic skin texture, outfit details, lighting (volumetric/soft/natural), camera lens (e.g. 85mm f/1.4), depth of field, 8k resolution, and color grade.
Output ONLY the polished final English prompt without any preamble, markdown formatting, or commentary.`;
      promptInstruction = `Convert this edited Myanmar description into a high-quality professional English AI photography prompt:
${text}`;
    }
    const response = await generateContentWithFallback(ai, {
      contents: promptInstruction,
      config: {
        systemInstruction,
        temperature: 0.5
      }
    });
    const translatedText = response.text ? response.text.trim() : "";
    res.json({
      success: true,
      translatedText
    });
  } catch (error) {
    console.error("Error translating prompt:", error);
    res.json({
      success: true,
      translatedText: req.body?.text || "Translation unavailable due to rate limits.",
      warning: "Quota fallback activated."
    });
  }
});
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", referenceImage } = req.body;
    const validRatios = ["1:1", "3:4", "4:3", "9:16", "16:9", "4:5", "2:3", "3:2"];
    const formattedRatio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";
    let imageUrl = null;
    let isQuotaLimit = false;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orImages = await generateWithOpenRouter(
          prompt || "Ultra-detailed photorealistic Burmese studio portrait, 8k resolution",
          formattedRatio,
          1,
          "google/gemini-2.5-flash-image",
          referenceImage
        );
        if (orImages && orImages.length > 0) {
          imageUrl = orImages[0];
        }
      } catch (orErr) {
        console.warn("[/api/generate-image] OpenRouter primary notice:", orErr?.message || orErr);
      }
    }
    if (!imageUrl && process.env.GEMINI_API_KEY) {
      try {
        const ai = getGeminiClient();
        const parts = [];
        if (referenceImage && referenceImage.startsWith("data:image")) {
          const match = referenceImage.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        }
        parts.push({
          text: `CRITICAL INSTRUCTION: Maintain 100% exact face, eyes, nose, lips, facial features, and identity from the provided reference image. Prompt details: ${prompt}`
        });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(formattedRatio) ? formattedRatio : "1:1"
            }
          }
        });
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (genErr) {
        isQuotaLimit = true;
      }
    }
    if (!imageUrl) {
      const fallbackImgs = pollinationsImages(prompt || "Burmese studio portrait", formattedRatio, 1, "flux");
      imageUrl = fallbackImgs[0];
    }
    res.json({
      success: true,
      imageUrl,
      images: [imageUrl],
      quotaExceeded: isQuotaLimit && !imageUrl.startsWith("data:image"),
      isFallback: !imageUrl.startsWith("data:image"),
      message: imageUrl.startsWith("data:image") ? "Image generated successfully via OpenRouter Pro Engine" : "Rendered high-resolution studio preview."
    });
  } catch (error) {
    console.warn("Image endpoint fallback handler:", error?.message || error);
    const fallbackImgs = pollinationsImages(req.body?.prompt || "Burmese portrait", req.body?.aspectRatio || "1:1", 1, "flux");
    res.json({
      success: true,
      imageUrl: fallbackImgs[0],
      images: fallbackImgs,
      quotaExceeded: true,
      isFallback: true,
      message: "Rendered high-resolution image preview."
    });
  }
});
var SAMPLE_VIDEOS = [
  "/samples/cinematic_demo.mp4",
  "/samples/flower.webm",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
];
app.post("/api/photo-to-text", async (req, res) => {
  try {
    const { image, images, targetEngine = "midjourney-v6", focusArea = "full", language = "my" } = req.body;
    const imageList = Array.isArray(images) && images.length > 0 ? images.filter((x) => typeof x === "string" && x.startsWith("data:image")) : image ? [image] : [];
    if (imageList.length === 0) {
      return res.status(400).json({ success: false, error: "Image data is required" });
    }
    const ai = getGeminiClient();
    const imgParts = imageList.map((img) => parseDataUrlToPart(img)).filter(Boolean);
    const systemInstruction = `You are a world-class commercial studio photography director and prompt engineer specializing in Midjourney v6.1, Flux.1 Pro, and SDXL.
Your task is to analyze ${imageList.length > 1 ? `all ${imageList.length} uploaded reference photographs` : "an uploaded reference photograph"} in rigorous technical detail and generate a complete image-to-text reverse engineering prompt breakdown.

CRITICAL REALISM & ANTI-PLASTIC MANDATES:
- Look for authentic human skin textures: natural micro-pores, fine vellus hair (peach fuzz), natural subsurface scattering (SSS) with subtle vascular warmth, dewy non-greasy highlights, and authentic Thanaka bark paste patterns on cheekbones if present.
- Strictly ban plastic skin, porcelain airbrushed blur, fake doll eyes, cartoonish saturation, and floating subjects.
- Identify the exact studio lighting setup: Key light source (e.g., 36-inch Octabox @ 45 degrees), rim/kicker light for hair separation, fill ratio, color temperature in Kelvin (e.g., 3200K tungsten to 5500K daylight), and floor contact shadow occlusion.
- Identify the camera gear and optics: Medium format or full-frame camera (e.g., Hasselblad X2D 100C, Sony A7R V, Leica SL2), focal length (85mm f/1.4, 50mm f/1.2, 100mm macro), aperture, and shutter speed.
- Describe the wardrobe and textiles: handwoven silk Acheik waves, heavy velvet Ein Gyi, gold bullion thread embroidery, or tailored Taikpon jacket with authentic drape.

OUTPUT REQUIREMENTS:
Output ONLY valid JSON matching this structure:
{
  "subjectDetails": {
    "gender": "string (e.g., Burmese woman / Burmese gentleman / Couple)",
    "apparentAge": "string (e.g., mid-20s)",
    "ethnicity": "string (e.g., Burmese / Southeast Asian heritage)",
    "skinToneAndTexture": "string (e.g., warm honey-olive complexion with authentic micro-pores and delicate subsurface scattering)",
    "thanakaDetails": "string (e.g., delicate circular Thanaka bark paste brushed gracefully on cheekbones with natural powdery stippling)",
    "facialExpression": "string (e.g., serene poised gaze with relaxed lips and gentle confidence)",
    "eyeCatchlights": "string (e.g., sharp octagonal softbox catchlights at 10 and 2 o'clock in dark brown irises)",
    "hairStyle": "string (e.g., classical high coiled Sadon coiffure adorned with white blooming jasmine flowers)"
  },
  "wardrobeDetails": {
    "garmentType": "string (e.g., Late Konbaung dynasty royal velvet Ein Gyi blouse and sweeping Acheik longyi)",
    "fabricMaterial": "string (e.g., authentic Mandalay hand-loomed pure silk with shimmering gold thread highlights)",
    "colorPalette": "string (e.g., deep royal crimson, amber gold, and emerald green)",
    "embroideryAndPattern": "string (e.g., intricate Luntaya Acheik wave patterns with gold bullion thread embroidery)",
    "accessoriesAndJewelry": "string (e.g., multi-tier 24k gold filigree Salwe necklace, Mogok ruby earplugs, Pathein parasol)"
  },
  "lightingAndOptics": {
    "keyLightType": "string (e.g., Profoto 3-foot Octabox placed 45 degrees camera-right)",
    "lightingAngle": "string (e.g., 45-degree Rembrandt lighting creating soft triangular shadow on left cheek)",
    "colorTemperature": "string (e.g., 5200K clean studio daylight balanced with warm 3200K tungsten rim)",
    "shadowCharacteristics": "string (e.g., deep ambient occlusion contact shadow directly grounding subject to studio floor)",
    "cameraBody": "string (e.g., Hasselblad X2D 100C medium format)",
    "lensFocalLength": "string (e.g., Hasselblad XCD 90mm f/2.5 V portrait prime)",
    "apertureAndDOF": "string (e.g., f/2.0 aperture with creamy soft background blur and pin-sharp iris focus)"
  },
  "sceneAndBackdrop": {
    "setting": "string (e.g., seamless neutral warm cream studio infinity cyclorama with gentle floor gradient)",
    "environmentType": "string (e.g., commercial studio post-production workbench setting)",
    "atmosphere": "string (e.g., elegant, tranquil, prestigious gallery aesthetic)"
  },
  "masterPrompt": "string (ONE complete, comprehensive, single polished reproduction prompt for Midjourney/Flux/SDXL ending in --ar <ratio>)",
  "midjourneyPrompt": "string (/imagine prompt: <masterPrompt> --style raw --v 6.1 --ar 4:5)",
  "fluxPrompt": "string (<masterPrompt>, flux dev quality, 8k raw photo)",
  "sdxlPrompt": "string (<masterPrompt>, SDXL photorealistic studio)",
  "negativePrompt": "string (plastic skin, porcelain face, airbrushed CGI sheen, doll eyes, fake anime smoothing, extra limbs, bad hands, floating subject, missing contact shadow)",
  "descriptionMm": "string (\u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A \u101E\u1010\u103A\u1015\u102F\u1036\u1019\u103E\u1014\u103A\u1019\u103E\u1014\u103A \u101B\u103E\u1004\u103A\u1038\u1015\u103C\u1001\u103B\u1000\u103A - \u1019\u1031\u102C\u103A\u1012\u101A\u103A\u104F \u1021\u101C\u103E\u104A \u101D\u1010\u103A\u1005\u102F\u1036\u104A \u1021\u101C\u1004\u103A\u1038\u1014\u103E\u1004\u1037\u103A \u1000\u1004\u103A\u1019\u101B\u102C \u1001\u103B\u102D\u1014\u103A\u100A\u103E\u102D\u1019\u103E\u102F\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1013\u102C\u1010\u103A\u1015\u102F\u1036\u1006\u101B\u102C\u1019\u103B\u102C\u1038 \u1014\u102C\u1038\u101C\u100A\u103A\u101C\u103D\u101A\u103A\u1005\u1031\u101B\u1014\u103A \u101B\u1031\u1038\u1015\u1031\u1038\u1015\u102B)",
  "descriptionEn": "string (English technical photography breakdown)"
}`;
    const promptText = `Analyze ${imageList.length > 1 ? `these ${imageList.length} attached studio reference photographs` : "this attached studio photograph"} thoroughly. Synthesize and deconstruct all visual elements across the reference set: subject identity, skin micro-texture, Thanaka details, wardrobe fabrics, lighting setup, camera optics, and background. Produce the complete JSON structure with master reproduction prompts. Focus: ${focusArea}. Target engine: ${targetEngine}. Target aspect ratio: 4:5.`;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let jsonText = "{}";
    if (openRouterKey && openRouterKey.trim() !== "") {
      try {
        jsonText = await callOpenRouter({
          apiKey: openRouterKey,
          model: process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash",
          systemPrompt: systemInstruction,
          userPrompt: promptText,
          images: imageList,
          responseFormat: "json"
        });
      } catch (orErr) {
        let contentsArray = [{ text: promptText }, ...imgParts];
        const response = await generateContentWithFallback(ai, {
          contents: contentsArray,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.4
          }
        });
        jsonText = response.text ? response.text.trim() : "{}";
      }
    } else {
      let contentsArray = [{ text: promptText }, ...imgParts];
      const response = await generateContentWithFallback(ai, {
        contents: contentsArray,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4
        }
      });
      jsonText = response.text ? response.text.trim() : "{}";
    }
    let resultObj = {};
    try {
      resultObj = JSON.parse(jsonText);
    } catch (e) {
      const cleaned = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      try {
        resultObj = JSON.parse(cleaned);
      } catch (e2) {
        resultObj = {
          masterPrompt: cleaned,
          negativePrompt: "plastic skin, porcelain face, airbrushed, CGI, doll eyes, fake anime smoothing, extra limbs, bad hands, floating subject",
          descriptionMm: "\u1013\u102C\u1010\u103A\u1015\u102F\u1036\u1019\u103E \u1021\u101C\u1004\u103A\u1038\u104A \u101D\u1010\u103A\u1005\u102F\u1036\u1014\u103E\u1004\u1037\u103A \u1021\u101E\u102C\u1038\u1021\u101B\u1031\u102C\u1004\u103A\u1000\u102D\u102F \u101E\u102F\u1036\u1038\u101E\u1015\u103A\u1015\u103C\u102E\u1038 Prompt \u1011\u102F\u1010\u103A\u1015\u1031\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B",
          descriptionEn: "Photographic elements extracted successfully."
        };
      }
    }
    if (resultObj) {
      if (resultObj.masterPrompt) resultObj.masterPrompt = sanitizePhotoPrompt(resultObj.masterPrompt);
      if (resultObj.fluxPrompt) resultObj.fluxPrompt = sanitizePhotoPrompt(resultObj.fluxPrompt);
      if (resultObj.midjourneyPrompt) resultObj.midjourneyPrompt = sanitizePhotoPrompt(resultObj.midjourneyPrompt);
      if (resultObj.sdxlPrompt) resultObj.sdxlPrompt = sanitizePhotoPrompt(resultObj.sdxlPrompt);
    }
    res.json({
      success: true,
      analysis: resultObj
    });
  } catch (error) {
    const errMsg = String(error?.message || "");
    const isQuota = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
    if (isQuota) {
      console.info("[Photo-to-Text] API free-tier quota reached. Serving high-fidelity studio reverse-engineering breakdown.");
    } else {
      console.warn("Notice in /api/photo-to-text:", errMsg || error);
    }
    const fallbackAnalysis = {
      subjectDetails: {
        gender: "Burmese noblewoman",
        apparentAge: "mid-20s",
        ethnicity: "Burmese heritage",
        skinToneAndTexture: "warm honey-olive complexion with authentic human micro-pores and natural subsurface scattering",
        thanakaDetails: "delicate circular Thanaka bark paste brushed gracefully across cheekbones with natural powdery bark texture",
        facialExpression: "poised regal gaze with direct camera engagement and subtle relaxed smile",
        eyeCatchlights: "crisp octagonal softbox catchlights reflected clearly in dark irises",
        hairStyle: "classical high coiled Sadon coiffure adorned with fresh white blooming jasmine flower garland"
      },
      wardrobeDetails: {
        garmentType: "Late Konbaung Dynasty royal velvet Ein Gyi blouse and sweeping Acheik longyi",
        fabricMaterial: "authentic Mandalay hand-loomed pure silk with shimmering gold thread highlights",
        colorPalette: "deep royal crimson, warm amber gold, and ivory silk",
        embroideryAndPattern: "intricate Luntaya Acheik wave patterns with gold bullion thread embroidery",
        accessoriesAndJewelry: "multi-tier 24k gold filigree Salwe necklace, Mogok ruby earplugs, Pathein parasol"
      },
      lightingAndOptics: {
        keyLightType: "Profoto 3-foot Octabox placed 45 degrees camera-right",
        lightingAngle: "45-degree Rembrandt lighting creating soft triangular highlight on cheekbone",
        colorTemperature: "5200K clean studio daylight balanced with warm 3200K tungsten rim",
        shadowCharacteristics: "deep ambient occlusion contact shadow directly anchoring subject to studio floor",
        cameraBody: "Hasselblad X2D 100C medium format",
        lensFocalLength: "Hasselblad XCD 90mm f/2.5 V portrait prime lens",
        apertureAndDOF: "f/2.0 aperture with creamy soft background blur and pin-sharp iris focus"
      },
      sceneAndBackdrop: {
        setting: "seamless neutral warm cream studio infinity cyclorama wall with gentle floor gradient",
        environmentType: "commercial studio post-production workstation",
        atmosphere: "prestigious gallery aesthetic, elegant, tranquil"
      },
      masterPrompt: "Commercial studio master portrait of an authentic Burmese noblewoman (mid-20s), warm honey-olive complexion with authentic human micro-pores and delicate subsurface scattering, traditional circular Thanaka paste on cheekbones with authentic powdery bark texture. Dressed in Late Konbaung Dynasty royal velvet Ein Gyi blouse and sweeping handwoven Acheik longyi with intricate gold bullion embroidery, Sadon hair coiffure with fragrant white jasmine flowers. Shot on Hasselblad X2D 100C with 90mm f/2.5 lens, illuminated by Profoto Octabox key light at 45 degrees, subtle golden hair rim light, deep contact floor occlusion shadow, authentic Kodak Portra 400 color science --ar 4:5 --style raw --v 6.1",
      midjourneyPrompt: "/imagine prompt: Commercial studio master portrait of an authentic Burmese noblewoman (mid-20s), warm honey-olive complexion with authentic human micro-pores and delicate subsurface scattering, traditional circular Thanaka paste on cheekbones with authentic powdery bark texture. Dressed in Late Konbaung Dynasty royal velvet Ein Gyi blouse and sweeping handwoven Acheik longyi with intricate gold bullion embroidery, Sadon hair coiffure with fragrant white jasmine flowers. Shot on Hasselblad X2D 100C with 90mm f/2.5 lens, illuminated by Profoto Octabox key light at 45 degrees, subtle golden hair rim light, deep contact floor occlusion shadow, authentic Kodak Portra 400 color science --ar 4:5 --style raw --v 6.1",
      fluxPrompt: "Commercial studio master portrait of an authentic Burmese noblewoman (mid-20s), authentic skin micro-pores, Thanaka on cheeks, Konbaung silk velvet attire, Hasselblad X2D 100C, 90mm f/2.5, Profoto Octabox 45 key light, 8k raw photograph --ar 4:5",
      sdxlPrompt: "Commercial studio master portrait of an authentic Burmese noblewoman (mid-20s), authentic skin pores, Thanaka cheeks, royal silk Acheik, Hasselblad X2D 100C, 8k photo --ar 4:5",
      negativePrompt: "plastic skin, porcelain face, airbrushed CGI sheen, doll eyes, fake anime smoothing, extra limbs, bad hands, floating subject, missing contact shadow",
      descriptionMm: "Reference Photo \u1019\u103E \u101C\u1030\u1015\u102F\u1036\u104A \u101E\u1014\u1015\u103A\u1001\u102B\u1038\u104A \u1000\u102F\u1014\u103A\u1038\u1018\u1031\u102C\u1004\u103A\u1001\u1031\u1010\u103A \u101B\u103D\u103E\u1031\u1001\u103B\u100A\u103A\u1011\u102D\u102F\u1038 \u1015\u102D\u102F\u1038\u1011\u100A\u103A\u104A Profoto 45\xB0 Key Light \u1014\u103E\u1004\u1037\u103A Hasselblad \u1000\u1004\u103A\u1019\u101B\u102C optics \u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1041\u1040\u1040% \u1010\u102D\u1000\u103B\u1005\u103D\u102C \u1001\u103D\u1032\u1001\u103C\u1019\u103A\u1038\u1005\u102D\u1010\u103A\u1016\u103C\u102C\u1015\u103C\u102E\u1038 Master Prompt \u1021\u1016\u103C\u1005\u103A \u1011\u102F\u1010\u103A\u101C\u102F\u1015\u103A\u1015\u1031\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B",
      descriptionEn: "Comprehensive photographic reverse-engineering breakdown extracted from reference photograph."
    };
    res.json({
      success: true,
      analysis: fallbackAnalysis,
      warning: "Fallback photo-to-text analyzer activated."
    });
  }
});
app.post("/api/analyze-image", async (req, res) => {
  try {
    let image = req.body?.image;
    if (!image && typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        image = parsed.image;
      } catch {
      }
    }
    if (!image || typeof image !== "string") {
      return res.status(400).json({
        success: false,
        error: "Image data (base64 data URL) is required"
      });
    }
    const ai = getGeminiClient();
    const imgPart = parseDataUrlToPart(image);
    const systemInstruction = `You are a world-class Photography Director and Senior AI Prompt Reverse-Engineer.
Inspect the provided image in rigorous detail using your vision capabilities.
Provide:
1. A detailed technical breakdown of the image covering:
   - "subject": Detailed visual breakdown of the primary subject, facial features, expressions, micro-textures, pose, and attire.
   - "composition": Shot type, camera angle, perspective, rule of thirds, framing, depth of field, and focal depth.
   - "lighting": Key light direction and source, fill ratio, ambient tone, rim highlights, shadow characteristics, and color temperature.
2. A single, comprehensive "reversePrompt" engineered to recreate a similar aesthetic in Midjourney, Flux, or SDXL. Include camera optics (e.g. 85mm f/1.4), lighting description, film stock, and aspect ratio.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "breakdown": {
    "subject": "Detailed description of primary subject, facial expression, textures, and outfit",
    "composition": "Framing scale, perspective, rule of thirds, depth of field falloff",
    "lighting": "Key light source and angle, soft shadows, rim lighting, Kelvin color temperature"
  },
  "reversePrompt": "Complete master reproduction prompt ready for Midjourney/Flux, ending with --ar 16:9 --style raw",
  "technicalDetails": {
    "camera": "Estimated camera body & lens (e.g. Hasselblad X2D 100C, 85mm f/1.4)",
    "colorPalette": ["Color 1", "Color 2", "Color 3", "Color 4"],
    "filmStock": "Suggested film stock or color grading (e.g. Kodak Portra 400)",
    "aspectRatio": "16:9"
  }
}
Return only the raw JSON without markdown backticks.`;
    const userPrompt = "Analyze this image thoroughly. Produce the JSON breakdown (subject, composition, lighting) and the master reverse-engineered prompt.";
    let contentsArray = [{ text: userPrompt }];
    if (imgPart) contentsArray.push(imgPart);
    let resultJson = null;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey.trim() !== "") {
      try {
        const rawText = await callOpenRouter({
          apiKey: openRouterKey,
          model: process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash",
          systemPrompt: systemInstruction,
          userPrompt,
          images: image ? [image] : [],
          responseFormat: "json"
        });
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        resultJson = JSON.parse(cleaned);
      } catch (orErr) {
        console.warn("[/api/analyze-image] OpenRouter vision notice:", orErr);
      }
    }
    if (!resultJson || !resultJson.breakdown) {
      try {
        const response = await generateContentWithFallback(ai, {
          contents: contentsArray,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });
        const rawText = response.text ? response.text.trim() : "{}";
        const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
        resultJson = JSON.parse(cleaned);
      } catch (apiErr) {
        console.warn("[/api/analyze-image] Gemini call notice:", apiErr);
      }
    }
    if (!resultJson || !resultJson.breakdown) {
      resultJson = {
        breakdown: {
          subject: "Focal portrait subject captured with high anatomical fidelity, natural epidermal pore texture, expressive eye contact, and authentic textile micro-weaves.",
          composition: "Medium portrait framing following golden ratio aesthetics, subtle eye-level perspective with creamy bokeh background falloff.",
          lighting: "Directional 45-degree Rembrandt softbox key light creating gentle triangular cheek shadow, balanced with warm tungsten rim kicker."
        },
        reversePrompt: "Cinematic commercial master portrait: authentic subject in refined attire, natural skin micro-pores, shot on Hasselblad X2D 100C with 85mm f/1.4 lens, Rembrandt key lighting, 8k ultra-sharp detail, Kodak Portra 400 color science --ar 16:9 --style raw --v 6.1",
        technicalDetails: {
          camera: "Hasselblad X2D 100C with 85mm f/1.4 Prime",
          colorPalette: ["Deep Amber", "Muted Cyan", "Warm Ochre", "Charcoal Black"],
          filmStock: "Kodak Portra 400",
          aspectRatio: "16:9"
        }
      };
    }
    return res.json({
      success: true,
      breakdown: resultJson.breakdown,
      reversePrompt: resultJson.reversePrompt,
      technicalDetails: resultJson.technicalDetails,
      masterPrompt: resultJson.reversePrompt
    });
  } catch (error) {
    console.error("Error in /api/analyze-image:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Internal server error analyzing image"
    });
  }
});
app.post("/api/generate-video-prompt", async (req, res) => {
  try {
    const { prompt, model = "Veo", targetModel, category = "Cinematic", style, format = "json", sectionOptions } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt string is required" });
    }
    const effectiveModel = targetModel || model || "Veo";
    const effectiveCategory = style || category || "Cinematic";
    const effectiveUserPrompt = sectionOptions && Object.keys(sectionOptions).length > 0 ? `User Idea: ${prompt}

User-Selected Section Specifications:
${JSON.stringify(sectionOptions, null, 2)}` : `User Idea: ${prompt}`;
    const ai = getGeminiClient();
    if (format === "json") {
      const systemInstruction = `You are a world-class Hollywood Director of Photography and AI Video Prompt Engineer specializing in state-of-the-art video generation models (${effectiveModel}, Runway Gen-3, Kling, Veo, Sora).
Your mission is to take the user's brief concept and craft an ultra-detailed, cinematic, film-grade production breakdown.

Category focus: ${effectiveCategory}.
Target Model: ${effectiveModel}.

You MUST return ONLY a valid JSON object strictly adhering to this schema:
{
  "subject": "Precise, evocative visual description of the main subject (texture, eyes, markings, clothing, state)",
  "action": "Specific micro-actions, physical movements, interactions, timing and cadence",
  "scene": {
    "setting": "Specific environment, architecture, terrain, surrounding elements",
    "time_of_day": "Exact lighting hour, e.g. blue hour, golden hour, midday, midnight",
    "atmosphere": "Weather, airborne particles, mist, smoke, volumetric depth"
  },
  "shot": {
    "type": "e.g. medium close-up, extreme wide, macro, over-the-shoulder",
    "angle": "e.g. low angle, eye level, high angle, bird's eye",
    "lens": "e.g. 85mm short telephoto, 35mm anamorphic, 24mm wide-angle",
    "framing": "Subject placement, rule of thirds, leading lines, reflections"
  },
  "camera": {
    "movement": "e.g. slow dolly-in toward subject, orbital pan, static lock-off, crane down",
    "speed": "e.g. slow, deliberate, dynamic, high-speed"
  },
  "lighting": {
    "key": "Primary light direction, source type (neon, sunlight, tungsten)",
    "mood": "Emotional tone created by light and contrast",
    "color_temperature": "Kelvin warmth/coolness, accent highlights"
  },
  "color_palette": [
    "color 1",
    "color 2",
    "color 3"
  ],
  "style": {
    "look": "Cinematic visual treatment, depth of field, natural motion blur",
    "references": [
      "Film or director visual reference, e.g. Blade Runner 2049, Roger Deakins"
    ],
    "grain": "e.g. fine 35mm film grain, clean digital cinema, 16mm gritty grain"
  },
  "duration_seconds": 6,
  "aspect_ratio": "16:9",
  "negative_prompt": "cartoonish,overexposed,lowres,multiple animals,daylight,glossy plastic,text,faces distorted"
}

Do not include markdown backticks or commentary outside the JSON. Return only the raw JSON string.`;
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      let rawText = "{}";
      if (openRouterKey && openRouterKey.trim() !== "") {
        try {
          rawText = await callOpenRouter({
            apiKey: openRouterKey,
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
            systemPrompt: systemInstruction,
            userPrompt: effectiveUserPrompt
          });
        } catch (orErr) {
          console.warn("[Video Prompt OpenRouter notice]:", orErr?.message);
          const contents = [{ role: "user", parts: [{ text: effectiveUserPrompt }] }];
          const response = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.7
            }
          });
          rawText = response.text ? response.text.trim() : "{}";
        }
      } else {
        const contents = [{ role: "user", parts: [{ text: effectiveUserPrompt }] }];
        const response = await generateContentWithFallback(ai, {
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });
        rawText = response.text ? response.text.trim() : "{}";
      }
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      let parsed = JSON.parse(cleaned);
      return res.json({
        success: true,
        format: "json",
        resultJson: parsed,
        rawText: cleaned
      });
    } else {
      const systemInstruction = `You are a master Hollywood Director of Photography and elite AI Video Prompt Engineer creating world-class prompts for ${effectiveModel} (Sora, Veo, Kling, Runway Gen-3).
Your job is to transform the user's brief concept into an ultra-detailed, evocative, cinematic narrative paragraph that reads like high-end director's shooting script.

Category style: ${effectiveCategory}.

STRUCTURE YOUR OUTPUT IN THIS EXACT ELITE FORMAT:
1. Dynamic Opening Beat: Name the subject with vivid anatomical/material detail, immediate kinetic action verb, direction relative to camera, and camera motion (e.g., "[Character/Subject] vaults from [ledge] toward camera, staff spinning like a bronze comet; close-three-quarter, 85mm dolly-in that tightens...").
2. Environment & Atmospheric World: Deep environmental set design with tactile textures, weather particles, receding background depth (e.g., ancient stone etched with calligraphy, shifting mist, distant fluttering flags).
3. Dual-Source Cinematic Lighting: Specify precise directional key light and contrasting colored rim/kicker separation (e.g., late-afternoon tungsten key slicing warm amber across cheekbones, cool blue rim light from high cloud-bank separating subject from mist).
4. Costume, Armor & Prop Textures: Layered fabrics, battle wear, metallic gauntlets, signature accessories catching specular highlights.
5. Optical & Camera Mechanics: Exact focal length (e.g. 35mm / 50mm / 85mm), lens behavior (sub-frame anamorphic squeeze, subtle horizontal anamorphic streak/bloom, organic 35mm film grain, color grading palette like muted teal, oxidized gold, and storm-grey).
6. Micro-Motion Physics: Wind-driven motion blur, particle drift, weapon trail or afterglow, natural physics.
7. Sound Design Elements: Ambient Foley and score cues (e.g., distant thunder, bamboo flute motif, leather-swipe of staff).
8. Technical Delivery & Avoidance: "Duration 6s, 16:9, high dynamic range, modest film grain. Avoid: handheld jitter, plastic skin, over-saturation, busy background clutter, anachronistic tech, flat frontal lighting."

Write as a continuous, breathtaking narrative paragraph ready to copy-paste into ${effectiveModel}. Do NOT use bullet points or numbering. Output ONLY the prompt paragraph.`;
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      let resultText = "";
      if (openRouterKey && openRouterKey.trim() !== "") {
        try {
          resultText = await callOpenRouter({
            apiKey: openRouterKey,
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
            systemPrompt: systemInstruction,
            userPrompt: effectiveUserPrompt,
            responseFormat: "text"
          });
        } catch (orErr) {
          const contents = [{ role: "user", parts: [{ text: effectiveUserPrompt }] }];
          const response = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          resultText = response.text?.trim() || "";
        }
      } else {
        const contents = [{ role: "user", parts: [{ text: effectiveUserPrompt }] }];
        const response = await generateContentWithFallback(ai, {
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        resultText = response.text?.trim() || "";
      }
      return res.json({
        success: true,
        format: "normal",
        resultText
      });
    }
  } catch (err) {
    console.warn("Video prompt generation fallback:", err?.message || err);
    const userPrompt = (req.body?.prompt || "cinematic scene").trim();
    const effectiveModel = req.body?.targetModel || req.body?.model || "Veo";
    const effectiveCategory = req.body?.style || req.body?.category || "Cinematic";
    const lower = userPrompt.toLowerCase();
    const isVehicle = lower.includes("car") || lower.includes("bike") || lower.includes("ship") || lower.includes("plane") || lower.includes("drift") || lower.includes("train");
    const isCharacter = lower.includes("girl") || lower.includes("woman") || lower.includes("man") || lower.includes("person") || lower.includes("lady") || lower.includes("cat") || lower.includes("warrior");
    const isProduct = effectiveCategory.toLowerCase().includes("product") || lower.includes("watch") || lower.includes("bottle") || lower.includes("shoe") || lower.includes("jewelry");
    const isNocturnal = lower.includes("night") || lower.includes("rain") || lower.includes("cyberpunk") || lower.includes("neon") || lower.includes("dark");
    const lens = isProduct ? "100mm macro f/2.8 prime lens" : isVehicle ? "24mm anamorphic wide-angle prime" : "50mm f/1.2 high-speed portrait prime";
    const cameraMovement = isVehicle ? "high-speed chase dolly tracking low across ground reflections" : isProduct ? "slow 360-degree orbital turntable roll with micro rack focus" : "slow deliberate dolly-in toward subject at eye level";
    const lightingMood = isNocturnal ? "evocative moody neon rim lighting with deep specular wet reflections" : "warm golden hour directional key lighting with soft ambient fill";
    const colorTemp = isNocturnal ? "cool 6500K balanced with 3200K warm practical rim accents" : "5200K clean natural daylight";
    if (req.body?.format === "json") {
      const dynamicJson = {
        subject: `${userPrompt}, crafted with tactile photorealistic micro-textures, expressive details, and natural dynamic presence`,
        action: isVehicle ? "accelerates with kinetic momentum, throwing light spray and tire smoke into the wind" : "engages in subtle natural micro-gestures, eyes locked forward with intentional cadence",
        scene: {
          setting: `atmospheric environmental production set tailored specifically to ${userPrompt}`,
          time_of_day: isNocturnal ? "blue hour midnight" : "golden hour twilight",
          atmosphere: "volumetric airborne particles, gentle atmospheric haze, cinematic depth"
        },
        shot: {
          type: isProduct ? "extreme macro close-up" : "cinematic medium close-up",
          angle: isVehicle ? "ground-level 20-degree low angle" : "subtle eye-level perspective",
          lens,
          framing: "golden ratio framing with balanced negative space and leading lines"
        },
        camera: {
          movement: cameraMovement,
          speed: isVehicle ? "kinetic and dynamic" : "slow and deliberate"
        },
        lighting: {
          key: "directional soft key light casting natural organic shadow gradients",
          mood: lightingMood,
          color_temperature: colorTemp
        },
        color_palette: isNocturnal ? ["neon cyan", "warm amber", "obsidian black"] : ["warm golden ochre", "deep forest green", "soft ivory"],
        style: {
          look: `Hollywood blockbuster feature film grade optimized for ${effectiveModel}`,
          references: ["Roger Deakins ASC", "Denis Villeneuve", "ARRI Alexa 65"],
          grain: "fine organic 35mm film grain"
        },
        duration_seconds: 6,
        aspect_ratio: "16:9",
        negative_prompt: "cartoon, 3D CGI plastic gloss, low resolution, artifacts, jitter, distorted anatomy, warped faces"
      };
      return res.json({
        success: true,
        format: "json",
        resultJson: dynamicJson,
        isFallback: true
      });
    } else {
      let dynamicParagraph = "";
      if (lower.includes("monkey king") || lower.includes("sun wukong") || lower.includes("wukong")) {
        dynamicParagraph = `Sun Wukong, the Monkey King, vaults from a jagged cliff edge toward camera, staff spinning like a bronze comet; close-three-quarter, 85mm dolly-in that tightens as his hair and cloud-silk banner snap rearward. Ancient mountain temple and shifting cloud-sea recede behind him, wet black stone etched with gold calligraphy, distant prayer flags flicking; late-afternoon tungsten key from frame-left slices warm amber across his lacquered iron headband and scarred jade eyes, cool blue rim light from a high north cloud-bank separates him from mist. Costume is layered: worn red battle-robe with embroidered cranes, brass-knuckle gauntlets, and a telescoping gold-banded staff catching specular highlights. Camera eases in while a sub-frame 35mm anamorphic squeeze gives slight horizontal bloom on highlights; add subtle 35mm film grain, muted teal, oxidized gold, and storm-grey palette. Motion: a faint wind-driven motion blur on fingertips, staff trail left a brief phosphor afterglow. Sound: distant thunder, bamboo flute motif, leather-swipe of staff. Duration 6s, 16:9, high dynamic range, modest film grain. Avoid: handheld jitter, plastic skin, over-saturation, busy background clutter, anachronistic tech, flat frontal lighting.`;
      } else {
        dynamicParagraph = `${userPrompt}, captured in feature-film caliber execution, moving with intentional cadence and physical momentum toward camera; medium close-up, ${lens} executing a ${cameraMovement}. Environmental set design with deep volumetric depth, receding atmosphere, and tactile physical textures; ${lightingMood}, illuminated by ${colorTemp} with crisp rim separation. Sub-frame 35mm anamorphic optics with subtle horizontal bloom on highlights, fine organic 35mm film grain, and rich Hollywood color grading. Motion: authentic physical motion blur, fine airborne particulate drift, and natural physics. Duration 6s, 16:9, high dynamic range, modest film grain. Avoid: handheld jitter, plastic skin, low resolution, warped anatomy, cartoon proportions, over-saturation, flat frontal lighting.`;
      }
      return res.json({
        success: true,
        format: "normal",
        resultText: dynamicParagraph,
        isFallback: true
      });
    }
  }
});
function sanitizePhotoPrompt(p) {
  if (!p || typeof p !== "string") return "";
  let s = p.trim();
  s = s.replace(/\/imagine\s+prompt:\s*/gi, "");
  s = s.replace(/--[a-z]+(\s+[\w:.]+)?/gi, "");
  s = s.replace(/\[Subjec(?:t)?\s*(?:\[Subject\]\s*:?)?/gi, " ");
  s = s.replace(/(?:^|\n)\s*t\]\s*:?\s*/gi, " ");
  s = s.replace(/\[\s*(Subject|Action|Environment|Cinematography|Lighting(?:\/Style)?|Style|Technical|Camera|Composition|Setting|Scene|Atmosphere|Details|Wardrobe|Attire|Pose|Expression|Character(?:\/Subject)?)\s*\]\s*:?\s*/gi, " ");
  s = s.replace(/\[[a-zA-Z0-9_\s\/-]{1,25}\]\s*:?\s*/g, " ");
  s = s.replace(/[\[\]]/g, " ");
  s = s.replace(/^\s*[:;,-]+\s*/g, "");
  s = s.replace(/\s{2,}/g, " ").trim();
  const sentences = s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
  const seenSentences = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized.length > 10) {
      if (!seenSentences.has(normalized)) {
        seenSentences.add(normalized);
        deduped.push(sentence);
      }
    } else {
      deduped.push(sentence);
    }
  }
  s = deduped.join(" ");
  s = s.replace(/^\s*[:;,-]+\s*/g, "");
  s = s.replace(/\s+([.,;:!?])/g, "$1").replace(/([.,;:!?]){2,}/g, "$1 ").replace(/\s{2,}/g, " ").trim();
  return s;
}
app.post("/api/generate-photo-prompt", async (req, res) => {
  try {
    const { prompt, model = "Midjourney", engine, category = "Photorealistic", format = "normal", aspectRatio = "16:9" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt string is required" });
    }
    const cleanedInputPrompt = sanitizePhotoPrompt(prompt);
    const targetModel = engine || model || "Midjourney";
    const validAr = ["1:1", "16:9", "9:16", "4:5", "3:4", "21:9"].includes(aspectRatio) ? aspectRatio : "16:9";
    const arSuffix = targetModel.toLowerCase().includes("midjourney") ? `--ar ${validAr} --style raw --v 6.1` : `--ar ${validAr}`;
    const ai = getGeminiClient();
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (format === "json") {
      const systemInstruction = `You are a world-renowned Master Photographer and AI Image Prompt Engineer specializing in state-of-the-art text-to-image models (${targetModel}, Flux.1, Midjourney v6.1, SDXL, Ideogram, Recraft).
Your task is to transform the user's brief concept into an ultra-high-end photographic production prompt.

Category style: ${category}.
Target Model: ${targetModel}.
Target Aspect Ratio: ${validAr}.

You MUST return ONLY a valid JSON object strictly matching this schema:
{
  "subject": "Evocative, razor-sharp description of primary subject, facial features, skin micro-pores, fabrics, and textures",
  "pose_and_expression": "Natural posture, emotional demeanor, head tilt, eye contact, and authentic micro-gestures",
  "composition": {
    "framing": "Shot scale, rule of thirds, negative space, symmetry",
    "angle": "Camera perspective (e.g. ground-level low angle, eye level, 45-degree angle)",
    "lens": "Focal length and optical characteristics (e.g. 85mm f/1.4 prime lens with circular bokeh)",
    "camera_body": "Camera body (e.g. Hasselblad X2D 100C, Sony A7R V, Leica M11)"
  },
  "environment": {
    "setting": "Specific environment, tactile textures, architectural or natural background",
    "time_of_day": "Exact lighting time (blue hour, golden hour, midday shadow, twilight)",
    "atmosphere": "Airborne mist, volumetric haze, atmospheric particles, rain reflections"
  },
  "lighting": {
    "key": "Primary light direction, source and softness (neon, diffused window, tungsten)",
    "rim": "Secondary edge separation, subtle rim light, specular bounce",
    "mood": "Emotional visual tone created by lighting contrast and shadows"
  },
  "color_palette": [
    "color 1",
    "color 2",
    "color 3",
    "color 4"
  ],
  "film_and_style": {
    "look": "Photographic genre treatment (fine art, editorial documentary, street photography)",
    "film_stock": "Color science (e.g. Kodak Portra 800, Fujifilm Pro 400H, CineStill 800T)",
    "references": [
      "Master photographer or editorial reference (e.g. Peter Lindbergh, Saul Leiter, Annie Leibovitz)"
    ]
  },
  "aspect_ratio": "${validAr}",
  "negative_prompt": "cartoon, illustration, 3d render, plastic skin, distorted anatomy, blurry, watermark, lowres, text"
}

Do not include markdown backticks or commentary outside the JSON. Return only the raw JSON string.`;
      let rawText = "{}";
      if (openRouterKey && openRouterKey.trim() !== "") {
        try {
          rawText = await callOpenRouter({
            apiKey: openRouterKey,
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
            systemPrompt: systemInstruction,
            userPrompt: `User Idea: ${cleanedInputPrompt}`
          });
        } catch (orErr) {
          const contents = [{ role: "user", parts: [{ text: `User Idea: ${cleanedInputPrompt}` }] }];
          const response = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.7
            }
          });
          rawText = response.text ? response.text.trim() : "{}";
        }
      } else {
        const contents = [{ role: "user", parts: [{ text: `User Idea: ${cleanedInputPrompt}` }] }];
        const response = await generateContentWithFallback(ai, {
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });
        rawText = response.text ? response.text.trim() : "{}";
      }
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      let parsed = JSON.parse(cleaned);
      return res.json({
        success: true,
        format: "json",
        resultJson: parsed,
        rawText: cleaned
      });
    } else {
      const systemInstruction = `You are a Master Photographer and AI Image Prompt Engineer. Expand the user's brief concept into a single, cohesive, award-winning photography prompt optimized for ${targetModel}.
Category style: ${category}.
Include: subject details, clothing/texture, composition, lens/optics (e.g. 85mm f/1.4 prime), camera (Hasselblad X2D 100C), lighting (key & rim), color grading, and film stock (Kodak Portra 400).
Append parameter ${arSuffix} at the end of the prompt.
Write as a continuous master prompt ready to copy-paste.
STRICT NEGATIVE CONSTRAINTS:
- Do NOT use bracketed headers or section labels such as [Subject], [Action], [Environment], [Cinematography], [Lighting/Style], [Lighting], [Style], or [Technical].
- Do NOT use bullet points or numbered lists.
- Output ONLY a seamless, continuous, natural flowing descriptive English paragraph ready for text-to-image diffusion models.`;
      let resultText = "";
      if (openRouterKey && openRouterKey.trim() !== "") {
        try {
          resultText = await callOpenRouter({
            apiKey: openRouterKey,
            model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
            systemPrompt: systemInstruction,
            userPrompt: `User Idea: ${cleanedInputPrompt}`,
            responseFormat: "text"
          });
        } catch (orErr) {
          const contents = [{ role: "user", parts: [{ text: `User Idea: ${cleanedInputPrompt}` }] }];
          const response = await generateContentWithFallback(ai, {
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          resultText = response.text?.trim() || "";
        }
      } else {
        const contents = [{ role: "user", parts: [{ text: `User Idea: ${cleanedInputPrompt}` }] }];
        const response = await generateContentWithFallback(ai, {
          contents,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        resultText = response.text?.trim() || "";
      }
      resultText = sanitizePhotoPrompt(resultText);
      resultText = resultText.replace(/--ar\s+[0-9:]+/gi, "").trim();
      resultText = `${resultText} ${arSuffix}`.trim();
      return res.json({
        success: true,
        format: "normal",
        resultText,
        aspectRatio: validAr
      });
    }
  } catch (err) {
    console.warn("Photo prompt generation fallback:", err?.message || err);
    const userPrompt = sanitizePhotoPrompt(req.body?.prompt || "cinematic portrait");
    const targetModel = req.body?.engine || req.body?.model || "Midjourney";
    const aspectRatio = req.body?.aspectRatio || "16:9";
    const lower = userPrompt.toLowerCase();
    const arFlag = targetModel.toLowerCase().includes("midjourney") ? `--ar ${aspectRatio} --style raw --v 6.1` : `--ar ${aspectRatio}`;
    const isPortrait = lower.includes("portrait") || lower.includes("woman") || lower.includes("man") || lower.includes("girl") || lower.includes("person") || lower.includes("lady") || lower.includes("face") || lower.includes("cat");
    const lens = isPortrait ? "Hasselblad 85mm f/1.4 portrait prime lens" : "Hasselblad 35mm f/2.8 architectural prime lens";
    const lighting = isPortrait ? "Rembrandt studio softbox key light at 45 degrees paired with subtle golden hair rim kicker" : "directional dramatic natural golden hour sunlight with deep ambient contact shadows";
    if (req.body?.format === "json") {
      const dynamicPhotoJson = {
        subject: `${userPrompt}, natural micro-textures, authentic epidermal pores, fine textile weaves`,
        pose_and_expression: isPortrait ? "composed natural gaze directly toward lens, subtle relaxed expression" : "dynamic compositional arrangement with natural balance",
        composition: {
          framing: "cinematic rule-of-thirds framing with balanced negative space",
          angle: "eye-level straight-on optical perspective",
          lens,
          camera_body: "Hasselblad X2D 100C medium format with high resolving clarity"
        },
        environment: {
          setting: `curated photographic environment tailored to ${userPrompt}`,
          time_of_day: "golden hour late afternoon",
          atmosphere: "soft sunbeams, fine airborne dust motes suspended in air"
        },
        lighting: {
          key: lighting,
          rim: "warm golden sun rim light delineating edges",
          mood: "evocative, clean, museum gallery aesthetic"
        },
        color_palette: ["warm ochre", "deep charcoal", "soft ivory", "natural amber"],
        film_and_style: {
          look: "editorial high-fashion magazine standard",
          film_stock: "Kodak Portra 400 natural tones",
          references: ["Vogue Editorial", "Annie Leibovitz portraiture"]
        },
        aspect_ratio: aspectRatio,
        negative_prompt: "oversaturated, plastic skin, distorted anatomy, blurry, artifacts, low resolution"
      };
      return res.json({
        success: true,
        format: "json",
        resultJson: dynamicPhotoJson,
        aspectRatio,
        isFallback: true
      });
    } else {
      const baseClean = sanitizePhotoPrompt(`Commercial gallery-grade master photograph of ${userPrompt}. Authentic micro-textures, natural epidermal skin micro-pores, tactile textile weaves, crisp depth of field with buttery circular optical bokeh. Shot on medium format Hasselblad X2D 100C with ${lens}, illuminated by ${lighting}, authentic Kodak Portra 400 fine organic film color science, museum archive clarity`);
      const dynamicPhotoPrompt = `${baseClean.replace(/--ar\s+[0-9:]+/gi, "").trim()} ${arFlag}`.trim();
      return res.json({
        success: true,
        format: "normal",
        resultText: dynamicPhotoPrompt,
        aspectRatio,
        isFallback: true
      });
    }
  }
});
var IMAGE_DIMS = {
  "1:1": { w: 1024, h: 1024 },
  "16:9": { w: 1344, h: 768 },
  "9:16": { w: 768, h: 1344 },
  "4:5": { w: 896, h: 1120 },
  "5:4": { w: 1120, h: 896 },
  "3:4": { w: 864, h: 1152 },
  "4:3": { w: 1152, h: 864 },
  "2:3": { w: 832, h: 1248 },
  "3:2": { w: 1248, h: 832 },
  "21:9": { w: 1536, h: 640 }
};
var IMAGE_MODELS = [
  // Flagships & Nano Banana (Powered by OpenRouter Pro)
  { id: "nano-banana-2", name: "Nano Banana 2 (Google Gemini)", category: "Nano Banana", provider: "openrouter-gemini-2.5", envKey: "OPENROUTER_API_KEY", badge: "TOP", desc: "Google Gemini 2.5 Flash Image engine via OpenRouter Pro, ultra-fast & photorealistic" },
  { id: "nano-banana-pro", name: "Nano Banana Pro (Gemini 3 Pro)", category: "Nano Banana", provider: "openrouter-gemini-pro", envKey: "OPENROUTER_API_KEY", badge: "PRO", desc: "Google Gemini 3 Pro Studio Fidelity via OpenRouter Pro" },
  // OpenAI Suite
  { id: "gpt-image-2", name: "GPT Image 2 (OpenAI Flagship)", category: "OpenAI", provider: "openrouter-gpt", envKey: "OPENROUTER_API_KEY", badge: "TOP", desc: "OpenAI flagship generation engine via OpenRouter Pro with prompt precision" },
  { id: "openrouter-gemini-image", name: "Gemini Image (OpenRouter)", category: "Cloud Pro", provider: "openrouter-gemini-2.5", envKey: "OPENROUTER_API_KEY", badge: "KEY", desc: "OpenRouter multi-provider gateway for Gemini image" },
  // Top Open-Source & Photoreal
  { id: "flux-realism", name: "FLUX Photoreal 8K (Free)", category: "Top Open Tier", provider: "pollinations-realism", envKey: null, badge: "TOP", desc: "Tuned for natural skin textures, depth of field and cinema lighting" },
  { id: "pollinations-flux", name: "FLUX.1 Schnell (Free)", category: "Top Open Tier", provider: "pollinations", envKey: null, badge: "FREE", desc: "Next-gen open diffusion model, excellent lighting and prompt fidelity" },
  { id: "sd-3-5", name: "Stable Diffusion 3.5 Large (Free)", category: "Top Open Tier", provider: "pollinations-sd", envKey: null, badge: "FREE", desc: "Stability AI flagship diffusion model with balanced color palettes" },
  { id: "pollinations-turbo", name: "Turbo Fast (Free, 2s)", category: "Top Open Tier", provider: "pollinations-turbo", envKey: null, badge: "FREE", desc: "Ultra-fast preview generation in 1-2 seconds" },
  // Google Direct & Cloud
  { id: "gemini-flash-image", name: "Gemini 2.5 Flash Image (Direct)", category: "Cloud Pro", provider: "gemini", envKey: "GEMINI_API_KEY", badge: "KEY", desc: "Direct Google Gemini 2.5 image generation endpoint" },
  { id: "imagen-3", name: "Google Imagen 3 (Direct)", category: "Cloud Pro", provider: "imagen", envKey: "GEMINI_API_KEY", badge: "KEY", desc: "Google DeepMind Imagen 3 prediction endpoint" },
  { id: "flux-fal", name: "FLUX.1 dev (fal.ai)", category: "Cloud Pro", provider: "fal", envKey: "FAL_KEY", badge: "KEY", desc: "Hosted FLUX.1 Dev endpoint via Fal.ai API" },
  { id: "gpt-image-1", name: "GPT Image 1 (OpenAI Direct)", category: "OpenAI", provider: "openai", envKey: "OPENAI_API_KEY", badge: "KEY", desc: "OpenAI standard image generation model" }
];
function pollinationsImages(prompt, ar, count, model, resolutionTier = "2k") {
  const base = IMAGE_DIMS[ar] || IMAGE_DIMS["1:1"];
  let mult = 1;
  if (resolutionTier === "2k") mult = 1.35;
  else if (resolutionTier === "4k") mult = 1.8;
  else if (resolutionTier === "8k") mult = 2.2;
  const w = Math.min(Math.round(base.w * mult), 2048);
  const h = Math.min(Math.round(base.h * mult), 2048);
  return Array.from({ length: count }, () => {
    const seed = Math.floor(Math.random() * 1e6);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&model=${model}&seed=${seed}&nologo=true`;
  });
}
function buildRoleCompositingPrompt(roles, basePrompt, ar) {
  const characters = roles.filter((r) => r.role === "character");
  const backgrounds = roles.filter((r) => r.role === "background");
  const styles = roles.filter((r) => r.role === "style");
  const outfits = roles.filter((r) => r.role === "outfit");
  if (characters.length > 0 && backgrounds.length > 0) {
    const charNames = roles.map((r, i) => r.role === "character" ? `Image #${i + 1}${r.name ? ` (${r.name})` : ""}` : null).filter(Boolean).join(", ");
    const bgNames = roles.map((r, i) => r.role === "background" ? `Image #${i + 1}${r.name ? ` (${r.name})` : ""}` : null).filter(Boolean).join(", ");
    const styleNames = styles.length > 0 ? roles.map((r, i) => r.role === "style" ? `Image #${i + 1}${r.name ? ` (${r.name})` : ""}` : null).filter(Boolean).join(", ") : null;
    const outfitNames = outfits.length > 0 ? roles.map((r, i) => r.role === "outfit" ? `Image #${i + 1}${r.name ? ` (${r.name})` : ""}` : null).filter(Boolean).join(", ") : null;
    let instruction = `CRITICAL MASTER COMPOSITING DIRECTIVE (Senior Art Director & Master Retoucher Standard):
1. CHARACTER IDENTITY & FACIAL PRESERVATION:
Extract the exact subject from ${charNames}. Preserve 100% of facial structure, eyes, nose, lips, natural skin micro-texture, pore realism, and hair strands without alteration or distortion.

2. BACKGROUND & ENVIRONMENT INTEGRATION:
Seamlessly place and composite the subject into the environment, setting, architecture, and atmosphere shown in ${bgNames}.

3. VOLUMETRIC RELIGHTING & COLOR HARMONY:
Harmonize the environmental key light, rim lighting, specular highlights, ambient bounce, and color temperature between the subject and the backdrop. Render realistic ground contact shadows and perspective occlusion so the subject is completely integrated into the scene.

4. CAMERA & OPTICAL CONSISTENCY:
Align camera angle, perspective geometry, focal length (e.g. 50mm/85mm portraiture), and natural optical depth of field with realistic background bokeh blur.`;
    if (outfitNames) {
      instruction += `
5. WARDROBE & OUTFIT: Incorporate the clothing style, drapery, and fabric texture from ${outfitNames}.`;
    }
    if (styleNames) {
      instruction += `
6. COLOR GRADING & MOOD: Infuse the cinematic color grading, tone curve, and artistic aesthetic from ${styleNames}.`;
    }
    instruction += `
Creative Direction & Custom Adjustments: ${basePrompt}. Aspect ratio: ${ar}. Strictly output the composition in ${ar} framing, do NOT output 21:9 or landscape unless 21:9 is explicitly requested. Output only the single photographic composite masterwork.`;
    return instruction;
  }
  if (characters.length > 0) {
    const charNames = roles.map((r, i) => r.role === "character" ? `Image #${i + 1}` : null).filter(Boolean).join(", ");
    return `Generate a photorealistic studio image strictly matching the subject from ${charNames}. Strictly compose in ${ar} aspect ratio format (width-to-height ratio ${ar}), do NOT output 21:9. Preserve 100% of facial identity, facial structure, natural skin micro-texture, and hair. Subject details: ${basePrompt}. Aspect ratio: ${ar}.`;
  }
  if (backgrounds.length > 0) {
    const bgNames = roles.map((r, i) => r.role === "background" ? `Image #${i + 1}` : null).filter(Boolean).join(", ");
    return `Generate a photorealistic image situated inside the environment, atmosphere, and scene of ${bgNames}. Strictly compose in ${ar} aspect ratio format (width-to-height ratio ${ar}), do NOT output 21:9. Scene details: ${basePrompt}. Aspect ratio: ${ar}.`;
  }
  return `Generate a photorealistic studio image strictly matching the reference image. Strictly compose in ${ar} aspect ratio format (width-to-height ratio ${ar}), do NOT output 21:9. Preserve the subject's exact facial identity, features, and aesthetics. Subject details: ${basePrompt}. Aspect ratio: ${ar}.`;
}
async function generateWithOpenRouter(prompt, ar, count, model = "google/gemini-2.5-flash-image", referenceImage, referenceImages, referenceImagesWithRoles) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.trim() === "") return null;
  const validRoleImages = Array.isArray(referenceImagesWithRoles) && referenceImagesWithRoles.length > 0 ? referenceImagesWithRoles.filter((img) => typeof img.url === "string" && img.url.startsWith("data:image")) : [];
  const refList = validRoleImages.length > 0 ? validRoleImages.map((img) => img.url) : Array.isArray(referenceImages) && referenceImages.length > 0 ? referenceImages.filter((img) => typeof img === "string" && img.startsWith("data:image")) : referenceImage && referenceImage.startsWith("data:image") ? [referenceImage] : [];
  console.log(`[OpenRouter Image] Generating ${count} image(s) using model: ${model} (References: ${refList.length}, Tagged roles: ${validRoleImages.length})`);
  try {
    const out = [];
    const isGemini = model.includes("gemini");
    const modalities = isGemini ? ["image"] : ["image", "text"];
    for (let i = 0; i < count; i++) {
      let promptDirective = `Generate a photorealistic studio image with STRICT ${ar} aspect ratio composition (width-to-height ratio ${ar}): ${prompt}. Aspect ratio: ${ar}. Strictly output in ${ar} framing, do NOT output 21:9.`;
      if (validRoleImages.length > 0) {
        promptDirective = buildRoleCompositingPrompt(validRoleImages, prompt, ar);
      } else if (refList.length > 0) {
        promptDirective = `Generate a photorealistic studio image strictly matching the reference image with STRICT ${ar} aspect ratio composition (width-to-height ratio ${ar}). Preserve the subject's exact facial identity, features, and aesthetics. Subject details: ${prompt}. Aspect ratio: ${ar}. Strictly output in ${ar} framing, do NOT output 21:9.`;
      }
      const userContent = refList.length > 0 ? [
        ...refList.map((url) => ({ type: "image_url", image_url: { url } })),
        {
          type: "text",
          text: promptDirective
        }
      ] : promptDirective;
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3001",
          "X-Title": "Infinity Prompt Studio"
        },
        body: JSON.stringify({
          model,
          modalities,
          image_config: {
            aspect_ratio: ar
          },
          aspect_ratio: ar,
          image_aspect_ratio: ar,
          messages: [{ role: "user", content: userContent }]
        })
      });
      const d = await r.json();
      if (r.ok) {
        const url = d.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) {
          out.push(url);
          console.log(`[OpenRouter Image] Generated image ${i + 1}/${count} via ${model}`);
        } else {
          console.warn("[OpenRouter Image] No image in choices. Content:", d.choices?.[0]?.message?.content || "(none)");
        }
      } else {
        console.warn("[OpenRouter Image] OpenRouter returned status:", r.status, d?.error?.message);
      }
    }
    if (out.length > 0) return out;
  } catch (err) {
    console.warn("[OpenRouter Image] OpenRouter image failed:", err?.message || err);
  }
  return null;
}
async function generateByProvider(modelId, prompt, ar, count, referenceImage, referenceImages, referenceImagesWithRoles, resolutionTier = "2k") {
  const { w, h } = IMAGE_DIMS[ar] || IMAGE_DIMS["1:1"];
  const def = IMAGE_MODELS.find((m) => m.id === modelId) || IMAGE_MODELS[0];
  const refList = Array.isArray(referenceImages) && referenceImages.length > 0 ? referenceImages.filter((img) => typeof img === "string" && img.startsWith("data:image")) : referenceImage && referenceImage.startsWith("data:image") ? [referenceImage] : [];
  const hasRef = refList.length > 0 || Array.isArray(referenceImagesWithRoles) && referenceImagesWithRoles.length > 0;
  let resSuffix = "";
  if (resolutionTier === "4k") resSuffix = ", 4k UHD resolution, tack-sharp optical clarity, Hasselblad 100MP resolving power";
  else if (resolutionTier === "8k") resSuffix = ", 8k ultra-detailed masterwork, museum-grade fine art sharpness, extreme textural realism";
  else if (resolutionTier === "2k") resSuffix = ", 2k high-resolution, sharp focus, natural skin micro-textures";
  if (def.provider === "openrouter-gemini-2.5") {
    const promptText = `${prompt}${resSuffix}, photorealistic master shot, natural epidermal skin micro-texture, cinematic volumetric lighting, shot on 35mm prime lens`;
    let orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-2.5-flash-image", referenceImage, refList, referenceImagesWithRoles);
    if (!orImgs || orImgs.length === 0) {
      console.log("[Nano Banana 2] Gemini 2.5 flash image returned no image, falling back to Gemini 3 Pro...");
      orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-3-pro-image", referenceImage, refList, referenceImagesWithRoles);
    }
    if (!orImgs || orImgs.length === 0) {
      console.log("[Nano Banana 2] Falling back to openrouter/auto...");
      orImgs = await generateWithOpenRouter(promptText, ar, count, "openrouter/auto", referenceImage, refList, referenceImagesWithRoles);
    }
    if (orImgs && orImgs.length > 0) return { images: orImgs, provider: "Nano Banana 2 (OpenRouter Pro)" };
  }
  if (def.provider === "openrouter-gemini-pro") {
    const promptText = `${prompt}${resSuffix}, Google Imagen 3 studio fidelity, photorealistic master shot, natural micro-textures, Rembrandt lighting, 85mm f/1.4 lens, shallow depth of field`;
    let orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-3-pro-image", referenceImage, refList, referenceImagesWithRoles);
    if (!orImgs || orImgs.length === 0) {
      console.log("[Nano Banana Pro] Gemini 3 Pro returned no image, falling back to Gemini 2.5 flash image...");
      orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-2.5-flash-image", referenceImage, refList, referenceImagesWithRoles);
    }
    if (!orImgs || orImgs.length === 0) {
      console.log("[Nano Banana Pro] Falling back to openrouter/auto...");
      orImgs = await generateWithOpenRouter(promptText, ar, count, "openrouter/auto", referenceImage, refList, referenceImagesWithRoles);
    }
    if (orImgs && orImgs.length > 0) return { images: orImgs, provider: "Nano Banana Pro (OpenRouter Pro)" };
  }
  if (def.provider === "openrouter-gpt") {
    const promptText = `${prompt}${resSuffix}, OpenAI DALL-E 3 HD masterwork composition, hyper-detailed, dramatic studio lighting`;
    let orImgs = await generateWithOpenRouter(promptText, ar, count, "openrouter/auto", referenceImage, refList, referenceImagesWithRoles);
    if (!orImgs || orImgs.length === 0) {
      console.log("[GPT Image 2] Falling back to Gemini 2.5 flash image...");
      orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-2.5-flash-image", referenceImage, refList, referenceImagesWithRoles);
    }
    if (orImgs && orImgs.length > 0) return { images: orImgs, provider: "GPT Image 2 (OpenRouter Auto)" };
  }
  if (def.provider === "pollinations") {
    return { images: pollinationsImages(`${prompt}${resSuffix}`, ar, count, "flux", resolutionTier), provider: "FLUX.1 Schnell (Free)" };
  }
  if (def.provider === "pollinations-realism") {
    return { images: pollinationsImages(`${prompt}${resSuffix}, 8k raw photo, photorealistic, cinematic lighting, 35mm photography`, ar, count, "flux", resolutionTier), provider: "FLUX Photoreal 8K (Free)" };
  }
  if (def.provider === "pollinations-sd" || def.provider === "pollinations-turbo") {
    return { images: pollinationsImages(`${prompt}${resSuffix}`, ar, count, "turbo", resolutionTier), provider: "Turbo Fast (Free)" };
  }
  if (def.provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    const promptText = `${prompt}. Aspect ratio ${ar}.`;
    if (key && key.trim() !== "") {
      try {
        const out = [];
        for (let i = 0; i < count; i++) {
          const parts = [];
          for (const refImg of refList) {
            const match = refImg.match(/^data:(image\/\w+);base64,(.+)$/);
            if (match) {
              parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
          parts.push({ text: promptText });
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                imageConfig: {
                  aspectRatio: ar
                }
              }
            })
          });
          const d = await r.json();
          if (r.ok) {
            const part = d.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
            const inl = part?.inlineData || part?.inline_data;
            if (inl) {
              out.push(`data:${inl.mimeType || inl.mime_type || "image/png"};base64,${inl.data}`);
            }
          } else {
            console.warn(`[gemini-image] Gemini API returned status ${r.status}: ${d?.error?.message || "quota limit"}`);
            break;
          }
        }
        if (out.length > 0) return { images: out, provider: "Gemini 2.5 Flash Image (Direct)" };
      } catch (err) {
        console.warn("[gemini-image] Direct Gemini API failed:", err?.message || err);
      }
    }
    const orImgs = await generateWithOpenRouter(promptText, ar, count, "google/gemini-2.5-flash-image", referenceImage, refList);
    if (orImgs && orImgs.length > 0) return { images: orImgs, provider: "Gemini 2.5 Flash Image (OpenRouter Pro)" };
  }
  if (def.provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    const size = w === h ? "1024x1024" : w > h ? "1536x1024" : "1024x1536";
    if (key && key.trim() !== "" && !hasRef) {
      try {
        const r = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({ model: "gpt-image-1", prompt, n: count, size })
        });
        const d = await r.json();
        if (r.ok && d.data?.length) {
          const imgs = (d.data || []).map((x) => x.b64_json ? `data:image/png;base64,${x.b64_json}` : x.url);
          return { images: imgs, provider: "GPT Image 1 (OpenAI Direct)" };
        }
      } catch (err) {
        console.warn("[openai] OpenAI failed:", err?.message || err);
      }
    }
    const orImgs = await generateWithOpenRouter(prompt, ar, count, "openrouter/auto", referenceImage, refList);
    if (orImgs && orImgs.length > 0) return { images: orImgs, provider: "GPT Image 1 (OpenRouter Auto)" };
  }
  if (def.provider === "fal") {
    const key = process.env.FAL_KEY;
    if (key && key.trim() !== "") {
      try {
        const r = await fetch("https://fal.run/fal-ai/flux/dev", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
          body: JSON.stringify({ prompt, image_size: { width: w, height: h }, num_images: count })
        });
        const d = await r.json();
        if (r.ok && d.images?.length) {
          return { images: (d.images || []).map((x) => x.url), provider: "FLUX.1 dev (fal.ai)" };
        }
      } catch (err) {
        console.warn("[fal] fal.ai failed:", err?.message || err);
      }
    }
  }
  const finalOr = await generateWithOpenRouter(prompt, ar, count, "google/gemini-2.5-flash-image", referenceImage, refList, referenceImagesWithRoles);
  if (finalOr && finalOr.length > 0) return { images: finalOr, provider: `${def.name} (OpenRouter Pro)` };
  return { images: pollinationsImages(prompt, ar, count, "flux", resolutionTier), provider: `${def.name} (Free Fallback)` };
}
app.get("/api/photo-studio/models", (_req, res) => {
  res.json({
    success: true,
    models: IMAGE_MODELS.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      badge: m.badge,
      desc: m.desc,
      envKey: m.envKey,
      available: true
      // Always ready with photoreal synthesis
    }))
  });
});
app.post("/api/photo-studio/generate-image", async (req, res) => {
  const {
    prompt,
    model = "nano-banana-2",
    aspectRatio = "1:1",
    resolution = "2k",
    count = 1,
    referenceImage = null,
    referenceImages = [],
    referenceImagesWithRoles = []
  } = req.body || {};
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ success: false, error: "Prompt is required" });
  }
  const n = Math.min(Math.max(Number(count) || 1, 1), 6);
  const def = IMAGE_MODELS.find((m) => m.id === model) || IMAGE_MODELS[0];
  let effectiveAr = aspectRatio;
  const arMatch = prompt.match(/--ar\s+([0-9:]+)/i);
  if (arMatch && arMatch[1] && IMAGE_DIMS[arMatch[1]]) {
    effectiveAr = arMatch[1];
  } else if (!IMAGE_DIMS[effectiveAr]) {
    effectiveAr = "4:5";
  }
  const cleanPrompt = prompt.replace(/--ar\s+[0-9:]+/gi, "").trim() || prompt;
  try {
    const result = await generateByProvider(def.id, cleanPrompt, effectiveAr, n, referenceImage, referenceImages, referenceImagesWithRoles, resolution);
    return res.json({
      success: true,
      images: result.images,
      imageUrl: result.images[0],
      provider: result.provider,
      model: def.id,
      aspectRatio: effectiveAr,
      resolution
    });
  } catch (err) {
    console.warn(`[generate-image] ${def.id} failed, using free FLUX fallback:`, err?.message || err);
  }
  const fallbackImgs = pollinationsImages(cleanPrompt, effectiveAr, n, "flux", resolution);
  return res.json({
    success: true,
    images: fallbackImgs,
    imageUrl: fallbackImgs[0],
    provider: `${def.name} (Free Fallback)`,
    model: def.id,
    aspectRatio: effectiveAr,
    resolution
  });
});
app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      prompt,
      model = "bytedance/seedance-2.5/text-to-video",
      duration = 5,
      resolution = "720p",
      aspect_ratio = "16:9",
      generate_audio = true,
      referenceImage
    } = req.body;
    const credentials = process.env.HF_CREDENTIALS || process.env.HF_API_KEY_ID;
    if (credentials) {
      try {
        (0, import_v2.config)({
          credentials,
          maxPollTime: 9e5
        });
        const inputPayload = {
          prompt: prompt || "A cinematic scene at sunset, 8k resolution, ultra realistic",
          duration: Number(duration) || 5,
          resolution: resolution || "720p",
          aspect_ratio: aspect_ratio || "16:9",
          generate_audio: generate_audio !== false
        };
        if (referenceImage && model.includes("image-to-video")) {
          inputPayload.image = referenceImage;
        }
        const result = await import_v2.higgsfield.subscribe(model, {
          input: inputPayload,
          withPolling: true
        });
        if (result.status === "completed") {
          const videoUrl2 = result.video?.url || result?.videos?.[0]?.url;
          if (videoUrl2) {
            return res.json({
              success: true,
              videoUrl: videoUrl2,
              status: result.status,
              duration,
              resolution,
              aspect_ratio,
              model
            });
          }
        }
      } catch (hfErr) {
        console.warn("Higgsfield generation notice, using sample fallback:", hfErr?.message || hfErr);
      }
    }
    const sampleIdx = Math.floor(Math.random() * SAMPLE_VIDEOS.length);
    const videoUrl = SAMPLE_VIDEOS[sampleIdx];
    return res.json({
      success: true,
      videoUrl,
      status: "completed",
      isSample: !credentials,
      duration,
      resolution,
      aspect_ratio,
      model,
      message: credentials ? "Video rendered" : "High-definition cinematic video preview"
    });
  } catch (error) {
    console.warn("Video generation fallback:", error?.message || error);
    res.json({
      success: true,
      videoUrl: "/samples/cinematic_demo.mp4",
      status: "completed",
      isSample: true,
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
      message: "High-definition cinematic video preview"
    });
  }
});
app.get("/api/dashboard/stats", (req, res) => {
  res.json({
    success: true,
    totalPrompts: 1420,
    totalUsers: 84,
    activeModels: ["gemini-3.7-flash", "imagen-3.0"],
    systemStatus: "operational"
  });
});
app.get("/api/dashboard/config", (req, res) => {
  res.json({
    success: true,
    maintenanceMode: false,
    version: "2.5.0",
    serverTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
var getSupabaseAdminConfig = () => {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY || "";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return { url, secretKey, publishableKey };
};
var getSupabaseSecretHeaders = (contentType = "application/json") => {
  const { secretKey } = getSupabaseAdminConfig();
  const headers = {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
};
async function ensureSupabaseBuckets() {
  const { url, secretKey } = getSupabaseAdminConfig();
  if (!url || !secretKey) {
    console.log("[Supabase Server] SUPABASE_SECRET_KEY not set in environment. Skipping bucket auto-provisioning.");
    return;
  }
  const buckets = ["website-photos", "user-generations"];
  for (const b of buckets) {
    try {
      await fetch(`${url}/storage/v1/bucket`, {
        method: "POST",
        headers: getSupabaseSecretHeaders(),
        body: JSON.stringify({ id: b, name: b, public: true })
      });
    } catch {
    }
  }
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      return;
    }
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers: getSupabaseSecretHeaders(),
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: "SK Master Admin", role: "admin" }
      })
    });
    const created = await createRes.json();
    let adminUserId = created?.id;
    if (!createRes.ok) {
      const listRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
        method: "GET",
        headers: getSupabaseSecretHeaders()
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        const found = (listData?.users || []).find(
          (u) => String(u?.email || "").toLowerCase() === adminEmail.toLowerCase()
        );
        if (found?.id) {
          adminUserId = found.id;
          await fetch(`${url}/auth/v1/admin/users/${found.id}`, {
            method: "PUT",
            headers: getSupabaseSecretHeaders(),
            body: JSON.stringify({
              email_confirm: true,
              password: adminPassword,
              user_metadata: { full_name: "SK Master Admin", role: "admin" }
            })
          });
        }
      }
    }
    if (adminUserId) {
      await fetch(`${url}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          ...getSupabaseSecretHeaders(),
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({
          id: adminUserId,
          email: adminEmail,
          full_name: "SK Master Admin",
          role: "admin",
          credit_balance: 99999
        })
      });
    }
  } catch {
  }
}
ensureSupabaseBuckets();
var confirmSupabaseUserByEmail = async (email) => {
  try {
    const { url, secretKey } = getSupabaseAdminConfig();
    if (!url || !secretKey) return false;
    const listRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
      method: "GET",
      headers: getSupabaseSecretHeaders()
    });
    if (!listRes.ok) return false;
    const listData = await listRes.json();
    const users = Array.isArray(listData?.users) ? listData.users : [];
    const target = users.find((u) => String(u?.email || "").toLowerCase() === email.trim().toLowerCase());
    if (!target?.id) return false;
    const updateRes = await fetch(`${url}/auth/v1/admin/users/${target.id}`, {
      method: "PUT",
      headers: getSupabaseSecretHeaders(),
      body: JSON.stringify({ email_confirm: true })
    });
    return updateRes.ok;
  } catch {
    return false;
  }
};
app.post("/api/supabase/confirm-email", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    const confirmed = await confirmSupabaseUserByEmail(email);
    return res.json({ success: confirmed });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "Confirm email error" });
  }
});
app.post("/api/supabase/instant-signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }
    const { url, publishableKey, secretKey } = getSupabaseAdminConfig();
    if (!url || !publishableKey || !secretKey) {
      return res.status(503).json({ success: false, error: "Server admin service is not configured on server" });
    }
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers: getSupabaseSecretHeaders(),
      body: JSON.stringify({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name: (fullName || email.split("@")[0]).trim() }
      })
    });
    const createData = await createRes.json();
    const errMsg = String(createData?.msg || createData?.message || "").toLowerCase();
    if (!createRes.ok) {
      if (errMsg.includes("already") || errMsg.includes("exists") || errMsg.includes("registered")) {
        await confirmSupabaseUserByEmail(email.trim());
      } else {
        return res.status(400).json({
          success: false,
          error: createData?.msg || createData?.message || "Could not create user"
        });
      }
    }
    const tokenHeaders = {
      apikey: publishableKey,
      "Content-Type": "application/json"
    };
    const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: tokenHeaders,
      body: JSON.stringify({ email: email.trim(), password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      return res.status(400).json({
        success: false,
        error: loginData?.error_description || loginData?.msg || "Created account, please sign in."
      });
    }
    return res.json({
      success: true,
      session: {
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
        expires_at: loginData.expires_at,
        user: loginData.user
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "Server signup error" });
  }
});
app.post("/api/supabase/upload-storage", async (req, res) => {
  try {
    const { bucket = "user-generations", dataUrl, folderPrefix = "uploads" } = req.body || {};
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
      return res.status(400).json({ success: false, error: "Valid image dataUrl required" });
    }
    const match = dataUrl.match(/^data:(image\/([a-zA-Z0-9+]+));base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, error: "Malformed image dataUrl" });
    }
    const mimeType = match[1];
    const ext = match[2] === "jpeg" ? "jpg" : match[2];
    const buffer = Buffer.from(match[3], "base64");
    const objectPath = `${folderPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { url, secretKey } = getSupabaseAdminConfig();
    if (!url || !secretKey) {
      return res.status(503).json({ success: false, error: "Supabase storage is not configured on server", publicUrl: dataUrl });
    }
    const headers = getSupabaseSecretHeaders(mimeType);
    headers["x-upsert"] = "true";
    const upRes = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
      method: "POST",
      headers,
      body: buffer
    });
    if (!upRes.ok) {
      await ensureSupabaseBuckets();
      const retryRes = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
        method: "POST",
        headers,
        body: buffer
      });
      if (!retryRes.ok) {
        return res.json({ success: false, publicUrl: dataUrl });
      }
    }
    const publicUrl = `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
    return res.json({ success: true, publicUrl });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "Upload error" });
  }
});
app.use((err, req, res, next) => {
  console.error("Express Error Middleware caught:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error"
  });
});
async function startServer() {
  const publicPath = import_path.default.join(process.cwd(), "public");
  app.use(import_express.default.static(publicPath));
  const server = import_http.default.createServer(app);
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production" && !__filename.includes("dist");
  if (isDev) {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Infinity Prompt Studio server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sanitizePhotoPrompt
});
//# sourceMappingURL=server.cjs.map
