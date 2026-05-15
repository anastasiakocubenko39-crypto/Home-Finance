// 🔥 КЛЮЧІ
const API_KEY = "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";
const APP_ID = "fef718fe";
const APP_KEY = "0ca16e9b9b0642e4806c1389dbe6ab10";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCfpBkCjYYkvTI1bMrXeEKtvcqWQx9yX80",
  authDomain: "home-finance-c6bb8.firebaseapp.com",
  projectId: "home-finance-c6bb8",
  storageBucket: "home-finance-c6bb8.firebasestorage.app",
  messagingSenderId: "781971004293",
  appId: "1:781971004293:web:e6dd3d14d5401406b182ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsRef    = collection(db, "products");
const buyRef         = collection(db, "buyProducts");
const recipesRef     = collection(db, "weekRecipes");
const priceCatalogRef = collection(db, "priceCatalog");
const weekArchiveRef  = collection(db, "weekArchive");

let products    = [];
let buy         = [];
let recipesWeek = [];
let priceCatalog = [];
let weekArchive  = [];

// ============================================================
// 🆕 ПОВНИЙ СПИСОК ПРОДУКТІВ ДЛЯ КАТАЛОГУ
// Усі продукти з nutritionData — для швидкого вводу ціни
// ============================================================
const ALL_CATALOG_PRODUCTS = [
  // М'ясо
  "яловичина", "яловичина філе", "яловичина вирізка", "яловичина антрекот",
  "яловичина стейк", "яловичина ребра", "яловичина лопатка", "яловичина грудинка",
  "яловичина гомілка", "яловичина шия", "яловичина печінка", "яловичина серце",
  "яловичина нирки", "яловичина язик", "яловичий фарш", "телятина",
  "свинина", "свинина філе", "свинина вирізка", "свинина шия",
  "свинина лопатка", "свинина грудинка", "свинина ребра", "свинина окіст",
  "свинина гомілка", "свинячий фарш", "свинина печінка", "сало",
  "баранина", "баранина нога", "баранина ребра", "баранина лопатка", "баранячий фарш",
  "курка", "ціла курка", "куряче філе", "куряча грудка", "куряче стегно",
  "куряча ніжка", "куряче крило", "курячий фарш", "куряча печінка",
  "курячі серця", "курячі шлунки", "індичка", "індиче філе",
  "індиче стегно", "індичий фарш", "качка", "качина грудка", "гусак", "перепілка",
  // Ковбаси
  "ковбаса", "ковбаса варена", "ковбаса копчена", "ковбаса сирокопчена",
  "ковбаса лікарська", "сосиски", "сосиски молочні", "сардельки",
  "шинка", "шинка варена", "шинка копчена", "бекон", "бекон копчений",
  "салямі", "паштет печінковий", "шпроти",
  // Риба
  "риба", "лосось", "лосось філе", "сьомга", "форель", "тунець",
  "тунець консервований", "тріска", "тріска філе", "минтай", "хек",
  "судак", "щука", "карп", "оселедець", "оселедець солоний",
  "скумбрія", "скумбрія копчена", "сардина", "сардина консервована",
  "камбала", "палтус", "дорадо", "тілапія", "пангасіус",
  // Морепродукти
  "морепродукти", "креветки", "креветки варені", "мідії",
  "кальмар", "восьминіг", "краб", "крабові палички", "устриці",
  "ікра червона", "ікра чорна",
  // Яйця
  "яйце", "яйця", "яйце куряче", "яйця курячі", "яйце перепелине",
  "яйце варене", "яєчний білок", "яєчний жовток",
  // Молочні
  "молоко", "молоко 1%", "молоко 2.5%", "молоко 3.2%", "молоко знежирене",
  "молоко топлене", "молоко козяче", "молоко вівсяне", "молоко мигдальне",
  "молоко соєве", "молоко кокосове", "молоко згущене", "молоко сухе",
  "вершки", "вершки 10%", "вершки 20%", "вершки 33%", "вершки збиті",
  "сметана", "сметана 10%", "сметана 15%", "сметана 20%",
  "кефір", "кефір 1%", "кефір знежирений", "йогурт", "йогурт натуральний",
  "йогурт грецький", "йогурт питний", "ряжанка",
  "творог", "творог 0%", "творог 5%", "творог 9%", "творог 18%", "творожна маса",
  "сир", "твердий сир", "сир пармезан", "сир гауда", "сир едам", "сир чеддер",
  "сир моцарела", "сир бринза", "сир фета", "сир рікота", "сир маскарпоне",
  "сир камамбер", "плавлений сир", "сир сулугуні", "сир адигейський",
  // Жири
  "масло", "масло вершкове", "масло топлене", "маргарин", "олія",
  "соняшникова олія", "оливкова олія", "олія кокосова", "олія ріпакова",
  "олія лляна", "олія кунжутна", "олія авокадо",
  // Овочі
  "картопля", "картопля молода", "батат", "морква", "морква молода",
  "буряк", "ріпа", "редиска", "редька", "дайкон", "пастернак",
  "селера корінь", "цибуля", "цибуля червона", "цибуля зелена",
  "цибуля порей", "цибуля шалот", "часник", "часник молодий",
  "капуста", "капуста червона", "капуста пекінська", "капуста брюссельська",
  "капуста савойська", "броколі", "цвітна капуста", "капуста квашена",
  "помідор", "помідори черрі", "огірок", "перець", "перець червоний",
  "перець жовтий", "перець зелений", "перець гострий", "баклажан",
  "кабачок", "гарбуз", "авокадо", "шпинат", "щавель", "руккола",
  "салат", "салат айсберг", "петрушка", "кріп", "кінза", "селера",
  "фенхель", "спаржа", "артишок",
  // Гриби
  "гриби", "гриби шампіньйони", "гриби печериці", "гриби вешенки",
  "гриби білі", "гриби лисички", "гриби сушені",
  // Бобові
  "горох", "горох свіжий", "нут", "квасоля", "квасоля червона",
  "квасоля біла", "квасоля консервована", "квасоля стручкова",
  "сочевиця", "сочевиця червона", "сочевиця зелена", "нут консервований",
  "едамаме", "соя", "тофу",
  // Фрукти
  "персик", "нектарин", "абрикос", "слива", "вишня", "черешня",
  "яблуко", "яблуко зелене", "яблуко червоне", "груша", "айва",
  "апельсин", "мандарин", "грейпфрут", "лимон", "лайм", "помело",
  "банан", "ананас", "манго", "ківі", "папайя", "маракуя",
  "гранат", "інжир", "хурма", "виноград", "полуниця", "малина",
  "чорниця", "смородина чорна", "смородина червона", "агрус",
  "журавлина", "суниця", "диня", "кавун",
  // Сухофрукти
  "родзинки", "курага", "чорнослив", "фініки сушені", "інжир сушений", "журавлина сушена",
  // Горіхи і насіння
  "горіхи", "волоський горіх", "мигдаль", "фундук", "кешью",
  "фісташки", "арахіс", "арахісова паста", "кедровий горіх", "макадамія",
  "насіння соняшника", "насіння гарбуза", "насіння льону", "насіння кунжуту",
  "насіння чіа", "насіння конопель", "кунжут", "тахіні",
  // Хліб і випічка
  "хліб", "хліб білий", "хліб чорний", "хліб житній", "хліб цільнозерновий",
  "батон", "багет", "лаваш", "піта", "тортилья", "хлібці рисові",
  "сухарі", "грінки", "булочка", "рогалик",
  // Крупи
  "рис", "рис білий", "рис бурий", "рис басматі", "рис дикий",
  "гречка", "гречка зелена", "пшоно", "вівсянка", "вівсяні пластівці",
  "вівсяні висівки", "перловка", "ячмінь", "булгур", "кус-кус",
  "кіноа", "амарант", "манка", "кукурудзяна крупа",
  // Макарони
  "макарони", "спагеті", "пенне", "фарфалле", "лазанья",
  "вермішель", "локшина", "локшина яєчна", "локшина рисова",
  "локшина гречана", "удон",
  // Борошно
  "борошно", "борошно пшеничне", "борошно цільнозернове", "борошно житнє",
  "борошно вівсяне", "борошно кукурудзяне", "борошно рисове", "борошно мигдальне",
  "крохмаль картопляний", "крохмаль кукурудзяний", "панірувальні сухарі",
  // Солодке
  "цукор", "цукор коричневий", "цукрова пудра", "мед", "мед гречаний",
  "сироп кленовий", "сироп агави", "стевія", "фруктоза",
  "шоколад", "шоколад чорний", "шоколад молочний", "шоколад білий",
  "какао порошок", "нутелла", "печиво", "печиво вівсяне",
  "цукерки", "карамель", "мармелад", "зефір", "халва",
  "торт", "бісквіт", "вафлі", "пряники", "морозиво",
  // Спеції
  "сіль", "сіль морська", "перець чорний", "перець білий", "паприка",
  "паприка копчена", "куркума", "кмин", "коріандр", "кориця",
  "кардамон", "гвоздика", "мускатний горіх", "імбир", "імбир сушений",
  "орегано", "базилік", "лавровий лист", "чебрець", "розмарин",
  "каррі", "ванілін", "ваніль", "ванільний цукор",
  "часниковий порошок", "цибульний порошок",
  // Соуси та консерви
  "соус", "кетчуп", "майонез", "майонез 67%", "майонез 30%",
  "гірчиця", "хрін", "аджика", "соус соєвий", "соус теріякі",
  "соус устричний", "томатна паста", "оцет", "оцет яблучний",
  "оцет бальзамічний", "оливки", "маслини", "каперси",
  "огірки мариновані", "варення", "джем",
  // Напої
  "вода", "сік яблучний", "сік апельсиновий", "сік томатний",
  "сік морквяний", "сік виноградний", "компот", "кава", "чай", "какао напій",
  // Інше
  "дріжджі", "дріжджі сухі", "розпушувач", "сода харчова",
  "желатин", "агар-агар", "пектин",
  "протеїн сироватковий", "казеїн", "протеїн рослинний",
];

// ============================================================
// УПРАВЛІННЯ ПОТОЧНИМ ТИЖНЕМ
// ============================================================
function getCurrentWeekInfo() {
  const stored = localStorage.getItem("currentWeekInfo");
  if (stored) {
    return JSON.parse(stored);
  }
  const now = new Date();
  return {
    week:  Math.min(4, Math.ceil(now.getDate() / 7)),
    month: now.getMonth() + 1,
    year:  now.getFullYear(),
    startDate: now.toLocaleDateString("uk-UA"),
  };
}

function saveCurrentWeekInfo(info) {
  localStorage.setItem("currentWeekInfo", JSON.stringify(info));
}

window.finishWeek = async function () {
  const info = getCurrentWeekInfo();
  const now = new Date();

  const recipeNeeds = buildRecipeNeeds(info);
  const factBuy = buildFactBuy(info);
  const comparison = buildComparisonRows(recipeNeeds, factBuy);

  const totalRecipePrice = Object.values(recipeNeeds)
    .reduce((s, p) => s + Number(p.totalPrice || 0), 0);

  const totalFactPrice = Object.values(factBuy)
    .reduce((s, p) => s + Number(p.totalPrice || 0), 0);

  const totalDiff = totalRecipePrice - totalFactPrice;

  const weekProducts = products.filter(
    p =>
      Number(p.week) === Number(info.week) &&
      Number(p.month) === Number(info.month) &&
      Number(p.year) === Number(info.year)
  );

  const weekRecipes = recipesWeek.filter(
    r =>
      Number(r.week) === Number(info.week) &&
      Number(r.month) === Number(info.month) &&
      Number(r.year) === Number(info.year)
  );

  await addDoc(weekArchiveRef, {
    type: "smart-check",

    week: info.week,
    month: info.month,
    year: info.year,

    startDate: info.startDate,
    endDate: now.toLocaleDateString("uk-UA"),

    recipes: weekRecipes,
    products: weekProducts,

    recipeNeeds: Object.values(recipeNeeds),
    factBuy: Object.values(factBuy),
    comparison,

    totalRecipePrice,
    totalFactPrice,
    totalDiff,

    totalPrice: totalFactPrice,

    createdAt: serverTimestamp(),
  });

  let nextWeek = Number(info.week) + 1;
  let nextMonth = Number(info.month);
  let nextYear = Number(info.year);

  if (nextWeek > 4) {
    nextWeek = 1;
    nextMonth++;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
  }

  saveCurrentWeekInfo({
    week: nextWeek,
    month: nextMonth,
    year: nextYear,
    startDate: now.toLocaleDateString("uk-UA"),
  });

  renderWeekHeader();

  if (typeof renderProducts === "function") {
    renderProducts();
  }

  if (typeof renderArchiveTables === "function") {
    renderArchiveTables();
  }

  if (typeof renderWeekArchive === "function") {
    renderWeekArchive();
  }

  alert(
    `✅ Тиждень ${info.week} завершено!\n` +
    `Рецепт: ${totalRecipePrice.toFixed(2)} грн\n` +
    `Факт: ${totalFactPrice.toFixed(2)} грн\n` +
    `Різниця: ${totalDiff.toFixed(2)} грн`
  );
};
window.resetToNewMonth = function () {
  const now = new Date();
  const newInfo = {
    week:      1,
    month:     now.getMonth() + 1,
    year:      now.getFullYear(),
    startDate: now.toLocaleDateString("uk-UA"),
  };
  saveCurrentWeekInfo(newInfo);
  renderWeekHeader();
  renderProducts();
  alert(`🔄 Місяць оновлено! Поточний тиждень: 1`);
};

function renderWeekHeader() {
  const el = document.getElementById("currentWeekLabel");
  if (!el) return;
  const info = getCurrentWeekInfo();
  const monthNames = [
    "","Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
  ];
  el.textContent =
    `Тиждень ${info.week} · ${monthNames[info.month]} ${info.year} (з ${info.startDate})`;
}

// ============================================================
// БЖУ СЛОВНИК
// ============================================================
const nutritionData = {
  "яловичина":              { protein: 26.0, fat: 16.0, carbs:  0.0 },
  "яловичина філе":         { protein: 22.0, fat:  8.0, carbs:  0.0 },
  "яловичина вирізка":      { protein: 22.0, fat:  6.0, carbs:  0.0 },
  "яловичина антрекот":     { protein: 20.0, fat: 16.0, carbs:  0.0 },
  "яловичина стейк":        { protein: 25.0, fat: 12.0, carbs:  0.0 },
  "яловичина ребра":        { protein: 17.0, fat: 20.0, carbs:  0.0 },
  "яловичина лопатка":      { protein: 20.0, fat: 13.0, carbs:  0.0 },
  "яловичина грудинка":     { protein: 18.0, fat: 22.0, carbs:  0.0 },
  "яловичина гомілка":      { protein: 20.0, fat:  7.0, carbs:  0.0 },
  "яловичина шия":          { protein: 19.0, fat: 18.0, carbs:  0.0 },
  "яловичина печінка":      { protein: 20.0, fat:  3.1, carbs:  4.0 },
  "яловичина серце":        { protein: 15.0, fat:  3.0, carbs:  0.0 },
  "яловичина нирки":        { protein: 15.0, fat:  2.8, carbs:  1.9 },
  "яловичина язик":         { protein: 16.0, fat: 12.0, carbs:  0.0 },
  "яловичий фарш":          { protein: 18.0, fat: 20.0, carbs:  0.0 },
  "телятина":               { protein: 20.0, fat:  2.0, carbs:  0.0 },
  "свинина":                { protein: 20.0, fat: 30.0, carbs:  0.0 },
  "свинина філе":           { protein: 22.0, fat: 10.0, carbs:  0.0 },
  "свинина вирізка":        { protein: 22.0, fat:  6.0, carbs:  0.0 },
  "свинина шия":            { protein: 18.0, fat: 28.0, carbs:  0.0 },
  "свинина лопатка":        { protein: 19.0, fat: 22.0, carbs:  0.0 },
  "свинина грудинка":       { protein: 10.0, fat: 52.0, carbs:  0.0 },
  "свинина ребра":          { protein: 15.0, fat: 29.0, carbs:  0.0 },
  "свинина окіст":          { protein: 22.0, fat: 15.0, carbs:  0.0 },
  "свинина гомілка":        { protein: 19.0, fat: 20.0, carbs:  0.0 },
  "свинячий фарш":          { protein: 16.0, fat: 27.0, carbs:  0.0 },
  "свинина печінка":        { protein: 19.0, fat:  3.6, carbs:  4.7 },
  "сало":                   { protein:  1.4, fat: 89.0, carbs:  0.0 },
  "баранина":               { protein: 16.0, fat: 17.0, carbs:  0.0 },
  "баранина нога":          { protein: 18.0, fat: 14.0, carbs:  0.0 },
  "баранина ребра":         { protein: 14.0, fat: 22.0, carbs:  0.0 },
  "баранина лопатка":       { protein: 16.0, fat: 18.0, carbs:  0.0 },
  "баранячий фарш":         { protein: 17.0, fat: 20.0, carbs:  0.0 },
  "курка":                  { protein: 25.0, fat:  7.4, carbs:  0.0 },
  "ціла курка":             { protein: 18.0, fat: 16.0, carbs:  0.0 },
  "куряче філе":            { protein: 31.0, fat:  3.6, carbs:  0.0 },
  "куряча грудка":          { protein: 31.0, fat:  3.6, carbs:  0.0 },
  "куряче стегно":          { protein: 21.0, fat: 11.0, carbs:  0.0 },
  "куряча ніжка":           { protein: 21.0, fat: 10.0, carbs:  0.0 },
  "куряче крило":           { protein: 20.0, fat: 12.0, carbs:  0.0 },
  "курячий фарш":           { protein: 17.0, fat: 13.0, carbs:  0.0 },
  "куряча печінка":         { protein: 20.0, fat:  5.9, carbs:  0.9 },
  "курячі серця":           { protein: 15.8, fat:  7.7, carbs:  0.7 },
  "курячі шлунки":          { protein: 21.0, fat:  3.7, carbs:  0.0 },
  "індичка":                { protein: 28.0, fat:  3.6, carbs:  0.0 },
  "індиче філе":            { protein: 25.0, fat:  3.0, carbs:  0.0 },
  "індиче стегно":          { protein: 20.0, fat:  8.0, carbs:  0.0 },
  "індичий фарш":           { protein: 20.0, fat:  7.0, carbs:  0.0 },
  "качка":                  { protein: 16.0, fat: 38.0, carbs:  0.0 },
  "качина грудка":          { protein: 19.0, fat: 12.0, carbs:  0.0 },
  "гусак":                  { protein: 16.0, fat: 33.0, carbs:  0.0 },
  "перепілка":              { protein: 18.0, fat: 13.0, carbs:  0.0 },
  "ковбаса":                { protein: 12.0, fat: 28.0, carbs:  2.0 },
  "ковбаса варена":         { protein: 13.0, fat: 22.0, carbs:  1.5 },
  "ковбаса копчена":        { protein: 15.0, fat: 40.0, carbs:  0.5 },
  "ковбаса сирокопчена":    { protein: 28.0, fat: 50.0, carbs:  0.0 },
  "ковбаса лікарська":      { protein: 12.0, fat: 22.0, carbs:  2.0 },
  "сосиски":                { protein: 11.0, fat: 20.0, carbs:  1.0 },
  "сосиски молочні":        { protein: 10.0, fat: 23.0, carbs:  2.0 },
  "сардельки":              { protein: 10.0, fat: 19.0, carbs:  1.3 },
  "шинка":                  { protein: 22.0, fat: 14.0, carbs:  0.0 },
  "шинка варена":           { protein: 22.0, fat: 14.0, carbs:  0.0 },
  "шинка копчена":          { protein: 20.0, fat: 17.0, carbs:  0.0 },
  "бекон":                  { protein: 12.0, fat: 45.0, carbs:  0.0 },
  "бекон копчений":         { protein: 12.0, fat: 45.0, carbs:  0.0 },
  "салямі":                 { protein: 22.0, fat: 39.0, carbs:  1.2 },
  "паштет печінковий":      { protein: 11.0, fat: 30.0, carbs:  3.0 },
  "шпроти":                 { protein: 17.0, fat: 32.0, carbs:  0.0 },
  "риба":                   { protein: 20.0, fat:  5.0, carbs:  0.0 },
  "лосось":                 { protein: 20.0, fat: 13.0, carbs:  0.0 },
  "лосось філе":            { protein: 20.0, fat: 13.0, carbs:  0.0 },
  "сьомга":                 { protein: 20.0, fat: 13.0, carbs:  0.0 },
  "форель":                 { protein: 19.0, fat:  6.0, carbs:  0.0 },
  "тунець":                 { protein: 29.0, fat:  1.0, carbs:  0.0 },
  "тунець консервований":   { protein: 25.0, fat:  2.0, carbs:  0.0 },
  "тріска":                 { protein: 17.0, fat:  0.6, carbs:  0.0 },
  "тріска філе":            { protein: 17.0, fat:  0.6, carbs:  0.0 },
  "минтай":                 { protein: 15.0, fat:  0.9, carbs:  0.0 },
  "хек":                    { protein: 16.0, fat:  2.2, carbs:  0.0 },
  "судак":                  { protein: 19.0, fat:  1.1, carbs:  0.0 },
  "щука":                   { protein: 18.0, fat:  0.7, carbs:  0.0 },
  "карп":                   { protein: 16.0, fat:  5.3, carbs:  0.0 },
  "оселедець":              { protein: 17.0, fat: 19.0, carbs:  0.0 },
  "оселедець солоний":      { protein: 16.0, fat: 14.0, carbs:  0.0 },
  "скумбрія":               { protein: 18.0, fat: 16.0, carbs:  0.0 },
  "скумбрія копчена":       { protein: 19.0, fat: 13.0, carbs:  0.0 },
  "сардина":                { protein: 25.0, fat: 11.0, carbs:  0.0 },
  "сардина консервована":   { protein: 22.0, fat: 10.0, carbs:  0.0 },
  "камбала":                { protein: 15.0, fat:  3.0, carbs:  0.0 },
  "палтус":                 { protein: 19.0, fat:  3.0, carbs:  0.0 },
  "дорадо":                 { protein: 18.0, fat:  3.5, carbs:  0.0 },
  "тілапія":                { protein: 20.0, fat:  2.7, carbs:  0.0 },
  "пангасіус":              { protein: 15.0, fat:  8.0, carbs:  0.0 },
  "морепродукти":           { protein: 17.0, fat:  2.0, carbs:  2.0 },
  "креветки":               { protein: 18.0, fat:  2.2, carbs:  0.0 },
  "креветки варені":        { protein: 20.0, fat:  2.5, carbs:  0.0 },
  "мідії":                  { protein: 11.0, fat:  2.0, carbs:  3.3 },
  "кальмар":                { protein: 18.0, fat:  2.2, carbs:  2.0 },
  "восьминіг":              { protein: 15.0, fat:  1.0, carbs:  1.3 },
  "краб":                   { protein: 16.0, fat:  1.8, carbs:  0.0 },
  "крабові палички":        { protein:  7.0, fat:  1.0, carbs: 15.0 },
  "устриці":                { protein:  9.0, fat:  2.0, carbs:  4.5 },
  "ікра червона":           { protein: 32.0, fat: 15.0, carbs:  0.0 },
  "ікра чорна":             { protein: 29.0, fat: 15.0, carbs:  0.0 },
  "яйце":                   { protein: 13.0, fat: 11.0, carbs:  1.1 },
  "яйця":                   { protein: 13.0, fat: 11.0, carbs:  1.1 },
  "яйце куряче":            { protein: 13.0, fat: 11.0, carbs:  1.1 },
  "яйця курячі":            { protein: 13.0, fat: 11.0, carbs:  1.1 },
  "яйце перепелине":        { protein: 13.0, fat: 11.0, carbs:  0.6 },
  "яйце варене":            { protein: 13.0, fat: 11.0, carbs:  1.1 },
  "яєчний білок":           { protein: 11.0, fat:  0.2, carbs:  0.7 },
  "яєчний жовток":          { protein: 16.0, fat: 31.0, carbs:  1.0 },
  "молоко":                 { protein:  3.2, fat:  3.5, carbs:  4.7 },
  "молоко 1%":              { protein:  3.0, fat:  1.0, carbs:  4.8 },
  "молоко 2.5%":            { protein:  2.8, fat:  2.5, carbs:  4.7 },
  "молоко 3.2%":            { protein:  2.9, fat:  3.2, carbs:  4.7 },
  "молоко знежирене":       { protein:  3.0, fat:  0.1, carbs:  4.7 },
  "молоко топлене":         { protein:  3.0, fat:  6.0, carbs:  4.7 },
  "молоко козяче":          { protein:  3.6, fat:  4.2, carbs:  4.5 },
  "молоко вівсяне":         { protein:  1.0, fat:  1.5, carbs:  6.5 },
  "молоко мигдальне":       { protein:  0.5, fat:  1.1, carbs:  3.0 },
  "молоко соєве":           { protein:  3.3, fat:  2.0, carbs:  2.9 },
  "молоко кокосове":        { protein:  2.3, fat: 24.0, carbs:  6.0 },
  "молоко згущене":         { protein:  7.2, fat:  8.5, carbs: 56.0 },
  "молоко сухе":            { protein: 26.0, fat: 25.0, carbs: 37.5 },
  "вершки":                 { protein:  2.8, fat: 20.0, carbs:  3.7 },
  "вершки 10%":             { protein:  3.0, fat: 10.0, carbs:  4.0 },
  "вершки 20%":             { protein:  2.8, fat: 20.0, carbs:  3.7 },
  "вершки 33%":             { protein:  2.5, fat: 33.0, carbs:  3.3 },
  "вершки збиті":           { protein:  2.0, fat: 33.0, carbs: 20.0 },
  "сметана":                { protein:  2.5, fat: 20.0, carbs:  3.4 },
  "сметана 10%":            { protein:  3.0, fat: 10.0, carbs:  3.9 },
  "сметана 15%":            { protein:  2.8, fat: 15.0, carbs:  3.6 },
  "сметана 20%":            { protein:  2.5, fat: 20.0, carbs:  3.4 },
  "кефір":                  { protein:  3.4, fat:  2.5, carbs:  4.0 },
  "кефір 1%":               { protein:  3.0, fat:  1.0, carbs:  4.0 },
  "кефір знежирений":       { protein:  3.0, fat:  0.1, carbs:  3.8 },
  "йогурт":                 { protein:  5.0, fat:  3.2, carbs:  3.5 },
  "йогурт натуральний":     { protein:  4.3, fat:  2.0, carbs:  6.3 },
  "йогурт грецький":        { protein: 10.0, fat:  0.7, carbs:  3.6 },
  "йогурт питний":          { protein:  3.2, fat:  1.5, carbs:  9.5 },
  "ряжанка":                { protein:  3.0, fat:  4.0, carbs:  4.2 },
  "творог":                 { protein: 18.0, fat:  9.0, carbs:  3.0 },
  "творог 0%":              { protein: 18.0, fat:  0.1, carbs:  3.3 },
  "творог 5%":              { protein: 17.0, fat:  5.0, carbs:  2.8 },
  "творог 9%":              { protein: 16.0, fat:  9.0, carbs:  2.0 },
  "творог 18%":             { protein: 14.0, fat: 18.0, carbs:  2.8 },
  "творожна маса":          { protein:  8.0, fat: 15.0, carbs: 26.0 },
  "сир":                    { protein: 26.0, fat: 30.0, carbs:  0.0 },
  "твердий сир":            { protein: 26.0, fat: 30.0, carbs:  0.0 },
  "сир пармезан":           { protein: 38.0, fat: 26.0, carbs:  0.0 },
  "сир гауда":              { protein: 25.0, fat: 31.0, carbs:  0.0 },
  "сир едам":               { protein: 25.0, fat: 26.0, carbs:  0.0 },
  "сир чеддер":             { protein: 25.0, fat: 33.0, carbs:  0.0 },
  "сир моцарела":           { protein: 22.0, fat: 20.0, carbs:  0.0 },
  "сир бринза":             { protein: 17.0, fat: 20.0, carbs:  0.0 },
  "сир фета":               { protein: 17.0, fat: 21.0, carbs:  0.0 },
  "сир рікота":             { protein: 11.0, fat: 13.0, carbs:  3.0 },
  "сир маскарпоне":         { protein:  5.0, fat: 47.0, carbs:  2.3 },
  "сир камамбер":           { protein: 20.0, fat: 24.0, carbs:  0.5 },
  "плавлений сир":          { protein: 16.0, fat: 18.0, carbs:  7.5 },
  "сир сулугуні":           { protein: 20.0, fat: 22.0, carbs:  0.0 },
  "сир адигейський":        { protein: 18.5, fat: 14.0, carbs:  0.0 },
  "масло":                  { protein:  0.8, fat: 82.0, carbs:  0.7 },
  "масло вершкове":         { protein:  0.8, fat: 82.0, carbs:  0.7 },
  "масло 72%":              { protein:  0.8, fat: 72.0, carbs:  0.7 },
  "масло 82%":              { protein:  0.5, fat: 82.0, carbs:  0.5 },
  "масло топлене":          { protein:  0.3, fat: 99.0, carbs:  0.0 },
  "маргарин":               { protein:  0.3, fat: 82.0, carbs:  1.0 },
  "олія":                   { protein:  0.0, fat: 99.9, carbs:  0.0 },
  "соняшникова олія":       { protein:  0.0, fat: 99.9, carbs:  0.0 },
  "оливкова олія":          { protein:  0.0, fat: 99.8, carbs:  0.0 },
  "олія кокосова":          { protein:  0.0, fat: 99.9, carbs:  0.0 },
  "олія ріпакова":          { protein:  0.0, fat: 99.9, carbs:  0.0 },
  "олія лляна":             { protein:  0.0, fat: 99.8, carbs:  0.0 },
  "олія кунжутна":          { protein:  0.0, fat: 99.5, carbs:  0.0 },
  "олія авокадо":           { protein:  0.0, fat: 99.9, carbs:  0.0 },
  "картопля":               { protein:  2.0, fat:  0.1, carbs: 17.0 },
  "картопля молода":        { protein:  2.0, fat:  0.1, carbs: 16.0 },
  "батат":                  { protein:  1.6, fat:  0.1, carbs: 20.0 },
  "морква":                 { protein:  1.3, fat:  0.1, carbs:  6.9 },
  "морква молода":          { protein:  1.2, fat:  0.1, carbs:  6.5 },
  "буряк":                  { protein:  1.5, fat:  0.1, carbs:  8.8 },
  "ріпа":                   { protein:  1.5, fat:  0.1, carbs:  6.2 },
  "редиска":                { protein:  1.2, fat:  0.1, carbs:  3.4 },
  "редька":                 { protein:  1.9, fat:  0.2, carbs:  6.7 },
  "дайкон":                 { protein:  1.2, fat:  0.1, carbs:  4.1 },
  "пастернак":              { protein:  1.4, fat:  0.5, carbs: 13.5 },
  "селера корінь":          { protein:  1.3, fat:  0.3, carbs:  9.2 },
  "цибуля":                 { protein:  1.4, fat:  0.2, carbs:  8.2 },
  "цибуля червона":         { protein:  1.2, fat:  0.1, carbs:  9.0 },
  "цибуля зелена":          { protein:  1.3, fat:  0.1, carbs:  4.6 },
  "цибуля порей":           { protein:  2.0, fat:  0.3, carbs: 14.0 },
  "цибуля шалот":           { protein:  2.5, fat:  0.1, carbs: 17.0 },
  "часник":                 { protein:  6.4, fat:  0.5, carbs: 30.0 },
  "часник молодий":         { protein:  4.0, fat:  0.3, carbs: 20.0 },
  "капуста":                { protein:  1.8, fat:  0.1, carbs:  4.7 },
  "капуста червона":        { protein:  1.8, fat:  0.2, carbs:  5.7 },
  "капуста пекінська":      { protein:  1.2, fat:  0.2, carbs:  2.0 },
  "капуста брюссельська":   { protein:  4.8, fat:  0.3, carbs:  9.0 },
  "капуста савойська":      { protein:  2.0, fat:  0.1, carbs:  5.5 },
  "броколі":                { protein:  2.8, fat:  0.4, carbs:  6.6 },
  "цвітна капуста":         { protein:  1.9, fat:  0.3, carbs:  4.0 },
  "капуста квашена":        { protein:  1.8, fat:  0.1, carbs:  3.0 },
  "помідор":                { protein:  0.9, fat:  0.2, carbs:  3.7 },
  "помідори черрі":         { protein:  0.9, fat:  0.2, carbs:  5.8 },
  "огірок":                 { protein:  0.8, fat:  0.1, carbs:  2.8 },
  "перець":                 { protein:  1.3, fat:  0.3, carbs:  5.3 },
  "перець червоний":        { protein:  1.0, fat:  0.3, carbs:  6.0 },
  "перець жовтий":          { protein:  1.0, fat:  0.2, carbs:  5.3 },
  "перець зелений":         { protein:  0.9, fat:  0.2, carbs:  4.6 },
  "перець гострий":         { protein:  2.0, fat:  0.4, carbs:  9.5 },
  "баклажан":               { protein:  1.2, fat:  0.1, carbs:  4.5 },
  "кабачок":                { protein:  0.6, fat:  0.3, carbs:  4.6 },
  "гарбуз":                 { protein:  1.3, fat:  0.3, carbs:  7.7 },
  "авокадо":                { protein:  2.0, fat: 15.0, carbs:  0.9 },
  "шпинат":                 { protein:  2.9, fat:  0.4, carbs:  2.0 },
  "щавель":                 { protein:  1.5, fat:  0.3, carbs:  2.9 },
  "руккола":                { protein:  2.6, fat:  0.7, carbs:  3.7 },
  "салат":                  { protein:  1.2, fat:  0.2, carbs:  2.9 },
  "салат айсберг":          { protein:  0.9, fat:  0.1, carbs:  2.0 },
  "петрушка":               { protein:  3.7, fat:  0.4, carbs:  7.6 },
  "кріп":                   { protein:  2.5, fat:  0.5, carbs:  4.1 },
  "кінза":                  { protein:  2.1, fat:  0.5, carbs:  3.7 },
  "селера":                 { protein:  0.9, fat:  0.1, carbs:  2.1 },
  "фенхель":                { protein:  1.2, fat:  0.2, carbs:  7.3 },
  "спаржа":                 { protein:  2.2, fat:  0.1, carbs:  3.9 },
  "артишок":                { protein:  3.3, fat:  0.2, carbs: 10.5 },
  "гриби":                  { protein:  3.2, fat:  0.5, carbs:  3.4 },
  "гриби шампіньйони":      { protein:  4.3, fat:  1.0, carbs:  0.1 },
  "гриби печериці":         { protein:  4.3, fat:  1.0, carbs:  0.1 },
  "гриби вешенки":          { protein:  1.7, fat:  0.6, carbs:  6.4 },
  "гриби білі":             { protein:  3.7, fat:  1.7, carbs:  1.1 },
  "гриби лисички":          { protein:  1.6, fat:  0.5, carbs:  2.3 },
  "гриби сушені":           { protein: 20.0, fat:  4.0, carbs: 33.0 },
  "горох":                  { protein: 23.0, fat:  1.6, carbs: 57.7 },
  "горох свіжий":           { protein:  5.4, fat:  0.4, carbs: 13.8 },
  "нут":                    { protein: 19.0, fat:  6.0, carbs: 61.0 },
  "квасоля":                { protein: 21.0, fat:  2.0, carbs: 47.0 },
  "квасоля червона":        { protein: 22.0, fat:  1.0, carbs: 47.0 },
  "квасоля біла":           { protein: 21.0, fat:  1.0, carbs: 47.0 },
  "квасоля консервована":   { protein:  6.0, fat:  0.5, carbs: 14.0 },
  "квасоля стручкова":      { protein:  2.5, fat:  0.2, carbs:  5.9 },
  "сочевиця":               { protein: 25.0, fat:  1.1, carbs: 60.0 },
  "сочевиця червона":       { protein: 25.0, fat:  1.2, carbs: 60.0 },
  "сочевиця зелена":        { protein: 24.0, fat:  1.5, carbs: 53.0 },
  "нут консервований":      { protein:  6.0, fat:  1.5, carbs: 19.0 },
  "едамаме":                { protein: 11.0, fat:  5.0, carbs: 10.0 },
  "соя":                    { protein: 34.0, fat: 17.0, carbs: 26.0 },
  "тофу":                   { protein:  8.0, fat:  4.8, carbs:  1.9 },
  "персик":                 { protein:  0.9, fat:  0.1, carbs:  9.5 },
  "нектарин":               { protein:  0.9, fat:  0.1, carbs:  9.0 },
  "абрикос":                { protein:  0.9, fat:  0.1, carbs: 10.9 },
  "слива":                  { protein:  0.7, fat:  0.3, carbs:  9.6 },
  "вишня":                  { protein:  1.1, fat:  0.4, carbs: 10.6 },
  "черешня":                { protein:  1.1, fat:  0.4, carbs: 12.2 },
  "яблуко":                 { protein:  0.4, fat:  0.4, carbs: 10.0 },
  "яблуко зелене":          { protein:  0.3, fat:  0.4, carbs:  9.8 },
  "яблуко червоне":         { protein:  0.4, fat:  0.4, carbs: 11.0 },
  "груша":                  { protein:  0.4, fat:  0.3, carbs:  9.5 },
  "айва":                   { protein:  0.6, fat:  0.5, carbs: 13.2 },
  "апельсин":               { protein:  0.9, fat:  0.2, carbs:  8.1 },
  "мандарин":               { protein:  0.8, fat:  0.2, carbs:  7.5 },
  "грейпфрут":              { protein:  0.9, fat:  0.2, carbs:  6.9 },
  "лимон":                  { protein:  0.9, fat:  0.1, carbs:  3.0 },
  "лайм":                   { protein:  0.7, fat:  0.2, carbs:  5.1 },
  "помело":                 { protein:  0.8, fat:  0.2, carbs:  6.7 },
  "банан":                  { protein:  1.5, fat:  0.2, carbs: 21.0 },
  "ананас":                 { protein:  0.4, fat:  0.2, carbs: 10.6 },
  "манго":                  { protein:  0.5, fat:  0.3, carbs: 11.5 },
  "ківі":                   { protein:  1.0, fat:  0.6, carbs: 10.3 },
  "папайя":                 { protein:  0.5, fat:  0.3, carbs: 10.8 },
  "маракуя":                { protein:  2.4, fat:  0.7, carbs: 23.4 },
  "гранат":                 { protein:  0.9, fat:  0.0, carbs: 13.9 },
  "інжир":                  { protein:  0.7, fat:  0.2, carbs: 12.4 },
  "хурма":                  { protein:  0.5, fat:  0.0, carbs: 15.9 },
  "виноград":               { protein:  0.6, fat:  0.2, carbs: 16.8 },
  "полуниця":               { protein:  0.8, fat:  0.4, carbs:  7.5 },
  "малина":                 { protein:  0.8, fat:  0.3, carbs:  8.3 },
  "чорниця":                { protein:  1.1, fat:  0.6, carbs: 11.4 },
  "смородина чорна":        { protein:  1.0, fat:  0.4, carbs: 11.5 },
  "смородина червона":      { protein:  0.6, fat:  0.2, carbs:  7.3 },
  "агрус":                  { protein:  0.7, fat:  0.2, carbs:  9.1 },
  "журавлина":              { protein:  0.5, fat:  0.2, carbs:  4.8 },
  "суниця":                 { protein:  0.8, fat:  0.4, carbs:  7.5 },
  "диня":                   { protein:  0.6, fat:  0.3, carbs:  7.4 },
  "кавун":                  { protein:  0.6, fat:  0.1, carbs:  5.8 },
  "родзинки":               { protein:  2.9, fat:  0.6, carbs: 66.0 },
  "курага":                 { protein:  5.2, fat:  0.3, carbs: 51.0 },
  "чорнослив":              { protein:  2.3, fat:  0.7, carbs: 57.5 },
  "фініки сушені":          { protein:  2.5, fat:  0.5, carbs: 69.2 },
  "інжир сушений":          { protein:  3.1, fat:  0.8, carbs: 57.9 },
  "журавлина сушена":       { protein:  0.1, fat:  1.4, carbs: 72.6 },
  "горіхи":                 { protein: 16.2, fat: 60.8, carbs: 11.1 },
  "волоський горіх":        { protein: 15.2, fat: 65.2, carbs: 13.7 },
  "мигдаль":                { protein: 21.2, fat: 53.7, carbs: 13.0 },
  "фундук":                 { protein: 15.0, fat: 62.6, carbs:  9.4 },
  "кешью":                  { protein: 18.2, fat: 43.9, carbs: 30.2 },
  "фісташки":               { protein: 20.6, fat: 45.4, carbs: 27.5 },
  "арахіс":                 { protein: 26.3, fat: 45.2, carbs:  9.9 },
  "арахісова паста":        { protein: 25.0, fat: 50.0, carbs: 20.0 },
  "кедровий горіх":         { protein: 13.7, fat: 68.4, carbs: 13.1 },
  "макадамія":              { protein:  7.9, fat: 75.8, carbs: 13.8 },
  "насіння соняшника":      { protein: 20.7, fat: 52.9, carbs: 10.5 },
  "насіння гарбуза":        { protein: 24.5, fat: 45.9, carbs: 14.8 },
  "насіння льону":          { protein: 18.3, fat: 42.2, carbs: 28.9 },
  "насіння кунжуту":        { protein: 17.7, fat: 61.7, carbs: 12.2 },
  "насіння чіа":            { protein: 16.5, fat: 30.7, carbs: 42.1 },
  "насіння конопель":       { protein: 31.6, fat: 49.4, carbs:  8.7 },
  "кунжут":                 { protein: 17.7, fat: 61.7, carbs: 12.2 },
  "тахіні":                 { protein: 17.0, fat: 53.0, carbs: 21.2 },
  "хліб":                   { protein:  8.0, fat:  1.2, carbs: 50.0 },
  "хліб білий":             { protein:  7.7, fat:  2.4, carbs: 53.4 },
  "хліб чорний":            { protein:  6.6, fat:  1.2, carbs: 40.7 },
  "хліб житній":            { protein:  4.7, fat:  0.7, carbs: 49.8 },
  "хліб цільнозерновий":    { protein:  9.0, fat:  2.5, carbs: 42.0 },
  "батон":                  { protein:  7.5, fat:  2.9, carbs: 51.0 },
  "багет":                  { protein:  8.9, fat:  1.1, carbs: 57.1 },
  "лаваш":                  { protein:  8.3, fat:  1.2, carbs: 55.0 },
  "піта":                   { protein:  8.5, fat:  1.2, carbs: 55.7 },
  "тортилья":               { protein:  8.3, fat:  5.2, carbs: 53.0 },
  "хлібці рисові":          { protein:  7.3, fat:  3.1, carbs: 76.9 },
  "сухарі":                 { protein: 11.2, fat:  1.4, carbs: 72.4 },
  "грінки":                 { protein:  7.6, fat:  3.7, carbs: 56.1 },
  "булочка":                { protein:  8.0, fat:  5.0, carbs: 54.0 },
  "рогалик":                { protein:  5.5, fat: 20.0, carbs: 46.0 },
  "рис":                    { protein:  6.7, fat:  0.7, carbs: 78.0 },
  "рис білий":              { protein:  6.7, fat:  0.7, carbs: 78.0 },
  "рис бурий":              { protein:  7.4, fat:  1.8, carbs: 72.9 },
  "рис басматі":            { protein:  8.0, fat:  0.5, carbs: 79.0 },
  "рис дикий":              { protein: 14.7, fat:  1.1, carbs: 75.3 },
  "гречка":                 { protein: 12.6, fat:  3.3, carbs: 62.1 },
  "гречка зелена":          { protein: 12.6, fat:  3.3, carbs: 62.1 },
  "пшоно":                  { protein: 11.5, fat:  3.3, carbs: 66.5 },
  "вівсянка":               { protein: 11.0, fat:  6.1, carbs: 65.4 },
  "вівсяні пластівці":      { protein: 12.0, fat:  6.0, carbs: 62.0 },
  "вівсяні висівки":        { protein: 17.3, fat:  7.0, carbs: 66.2 },
  "перловка":               { protein:  9.3, fat:  1.1, carbs: 73.7 },
  "ячмінь":                 { protein: 10.0, fat:  2.3, carbs: 56.0 },
  "булгур":                 { protein: 12.3, fat:  1.3, carbs: 65.6 },
  "кус-кус":                { protein: 12.8, fat:  0.6, carbs: 72.4 },
  "кіноа":                  { protein: 14.1, fat:  6.1, carbs: 64.2 },
  "амарант":                { protein: 13.6, fat:  7.0, carbs: 65.3 },
  "манка":                  { protein: 10.3, fat:  1.0, carbs: 73.3 },
  "кукурудзяна крупа":      { protein:  8.3, fat:  1.2, carbs: 75.0 },
  "макарони":               { protein: 10.4, fat:  1.1, carbs: 69.0 },
  "спагеті":                { protein: 12.5, fat:  1.8, carbs: 70.6 },
  "пенне":                  { protein: 12.0, fat:  1.5, carbs: 71.0 },
  "фарфалле":               { protein: 12.0, fat:  1.5, carbs: 71.0 },
  "лазанья":                { protein: 11.0, fat:  1.5, carbs: 72.0 },
  "вермішель":              { protein: 10.4, fat:  1.1, carbs: 70.0 },
  "локшина":                { protein: 12.0, fat:  1.2, carbs: 68.0 },
  "локшина яєчна":          { protein: 13.0, fat:  2.5, carbs: 68.0 },
  "локшина рисова":         { protein:  3.4, fat:  0.6, carbs: 80.3 },
  "локшина гречана":        { protein: 14.0, fat:  0.5, carbs: 70.0 },
  "удон":                   { protein:  9.0, fat:  0.6, carbs: 68.0 },
  "борошно":                { protein: 10.3, fat:  1.1, carbs: 70.6 },
  "борошно пшеничне":       { protein: 10.3, fat:  1.1, carbs: 70.6 },
  "борошно цільнозернове":  { protein: 13.7, fat:  1.8, carbs: 61.0 },
  "борошно житнє":          { protein:  8.9, fat:  1.7, carbs: 61.8 },
  "борошно вівсяне":        { protein: 12.4, fat:  6.1, carbs: 65.7 },
  "борошно кукурудзяне":    { protein:  8.3, fat:  1.2, carbs: 73.7 },
  "борошно рисове":         { protein:  5.9, fat:  1.4, carbs: 80.1 },
  "борошно мигдальне":      { protein: 21.4, fat: 53.5, carbs: 14.3 },
  "крохмаль картопляний":   { protein:  0.1, fat:  0.0, carbs: 83.0 },
  "крохмаль кукурудзяний":  { protein:  0.3, fat:  0.1, carbs: 85.0 },
  "панірувальні сухарі":    { protein: 11.0, fat:  2.7, carbs: 69.9 },
  "цукор":                  { protein:  0.0, fat:  0.0, carbs: 99.8 },
  "цукор коричневий":       { protein:  0.0, fat:  0.0, carbs: 98.1 },
  "цукрова пудра":          { protein:  0.0, fat:  0.0, carbs: 99.9 },
  "мед":                    { protein:  0.8, fat:  0.0, carbs: 80.3 },
  "мед гречаний":           { protein:  0.5, fat:  0.0, carbs: 79.5 },
  "сироп кленовий":         { protein:  0.0, fat:  0.1, carbs: 67.0 },
  "сироп агави":            { protein:  0.1, fat:  0.3, carbs: 76.0 },
  "стевія":                 { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "фруктоза":               { protein:  0.0, fat:  0.0, carbs: 99.9 },
  "шоколад":                { protein:  6.9, fat: 35.7, carbs: 48.2 },
  "шоколад чорний":         { protein:  7.8, fat: 34.0, carbs: 43.0 },
  "шоколад молочний":       { protein:  6.9, fat: 35.7, carbs: 52.4 },
  "шоколад білий":          { protein:  3.9, fat: 33.6, carbs: 56.9 },
  "какао порошок":          { protein: 24.3, fat: 15.0, carbs: 10.2 },
  "нутелла":                { protein:  6.3, fat: 31.0, carbs: 57.5 },
  "печиво":                 { protein:  7.5, fat: 15.8, carbs: 74.4 },
  "печиво вівсяне":         { protein:  7.0, fat: 14.0, carbs: 68.0 },
  "цукерки":                { protein:  2.7, fat: 10.0, carbs: 80.0 },
  "карамель":               { protein:  0.3, fat:  0.1, carbs: 91.0 },
  "мармелад":               { protein:  0.4, fat:  0.0, carbs: 76.7 },
  "зефір":                  { protein:  0.8, fat:  0.0, carbs: 78.3 },
  "халва":                  { protein: 12.7, fat: 29.5, carbs: 51.6 },
  "торт":                   { protein:  4.4, fat: 20.0, carbs: 45.0 },
  "бісквіт":                { protein:  7.0, fat: 12.0, carbs: 55.0 },
  "вафлі":                  { protein:  8.0, fat: 30.0, carbs: 64.0 },
  "пряники":                { protein:  5.8, fat:  2.8, carbs: 77.7 },
  "морозиво":               { protein:  3.5, fat: 11.0, carbs: 23.0 },
  "сіль":                   { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "сіль морська":           { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "перець чорний":          { protein: 10.4, fat:  3.3, carbs: 64.0 },
  "перець білий":           { protein: 10.4, fat:  2.1, carbs: 68.6 },
  "паприка":                { protein: 14.1, fat: 12.9, carbs: 54.0 },
  "паприка копчена":        { protein: 14.1, fat: 12.9, carbs: 54.0 },
  "куркума":                { protein:  9.7, fat:  3.3, carbs: 65.0 },
  "кмин":                   { protein: 17.8, fat: 22.3, carbs: 44.2 },
  "коріандр":               { protein: 12.4, fat: 17.8, carbs: 55.0 },
  "кориця":                 { protein:  4.0, fat:  1.2, carbs: 80.6 },
  "кардамон":               { protein: 10.8, fat:  6.7, carbs: 68.5 },
  "гвоздика":               { protein:  6.0, fat: 13.0, carbs: 61.2 },
  "мускатний горіх":        { protein:  5.8, fat: 36.3, carbs: 49.3 },
  "імбир":                  { protein:  1.8, fat:  0.8, carbs: 15.8 },
  "імбир сушений":          { protein:  8.8, fat:  4.2, carbs: 70.8 },
  "орегано":                { protein:  9.0, fat:  4.3, carbs: 64.4 },
  "базилік":                { protein: 14.4, fat:  4.0, carbs: 61.0 },
  "лавровий лист":          { protein:  7.6, fat:  8.4, carbs: 75.0 },
  "чебрець":                { protein:  5.6, fat:  1.7, carbs: 63.9 },
  "розмарин":               { protein:  3.3, fat:  5.9, carbs: 46.4 },
  "каррі":                  { protein: 12.7, fat: 13.8, carbs: 58.2 },
  "ванілін":                { protein:  0.0, fat:  0.0, carbs: 92.9 },
  "ваніль":                 { protein:  0.1, fat:  0.1, carbs: 12.7 },
  "ванільний цукор":        { protein:  0.0, fat:  0.0, carbs: 99.0 },
  "часниковий порошок":     { protein: 16.6, fat:  0.7, carbs: 73.3 },
  "цибульний порошок":      { protein: 10.4, fat:  0.9, carbs: 79.1 },
  "соус":                   { protein:  1.8, fat:  0.5, carbs: 10.0 },
  "кетчуп":                 { protein:  1.8, fat:  0.1, carbs: 17.0 },
  "майонез":                { protein:  2.8, fat: 67.0, carbs:  2.6 },
  "майонез 67%":            { protein:  2.8, fat: 67.0, carbs:  2.6 },
  "майонез 30%":            { protein:  2.2, fat: 30.0, carbs:  6.0 },
  "гірчиця":                { protein:  5.7, fat:  6.4, carbs: 22.5 },
  "хрін":                   { protein:  3.2, fat:  0.4, carbs: 16.3 },
  "аджика":                 { protein:  1.5, fat:  0.3, carbs:  5.3 },
  "соус соєвий":            { protein: 10.5, fat:  0.1, carbs: 12.0 },
  "соус теріякі":           { protein:  3.5, fat:  0.0, carbs: 20.0 },
  "соус устричний":         { protein:  2.5, fat:  0.3, carbs: 18.5 },
  "томатна паста":          { protein:  4.8, fat:  0.5, carbs: 11.0 },
  "оцет":                   { protein:  0.0, fat:  0.0, carbs:  0.2 },
  "оцет яблучний":          { protein:  0.0, fat:  0.0, carbs:  0.9 },
  "оцет бальзамічний":      { protein:  0.5, fat:  0.0, carbs: 17.0 },
  "оливки":                 { protein:  0.8, fat: 10.7, carbs:  6.3 },
  "маслини":                { protein:  1.0, fat: 12.8, carbs:  2.7 },
  "каперси":                { protein:  2.4, fat:  0.9, carbs:  4.9 },
  "огірки мариновані":      { protein:  0.8, fat:  0.1, carbs:  1.3 },
  "варення":                { protein:  0.5, fat:  0.3, carbs: 65.0 },
  "джем":                   { protein:  0.4, fat:  0.1, carbs: 55.0 },
  "вода":                   { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "сік яблучний":           { protein:  0.5, fat:  0.1, carbs: 11.9 },
  "сік апельсиновий":       { protein:  0.8, fat:  0.2, carbs: 10.4 },
  "сік томатний":           { protein:  1.1, fat:  0.2, carbs:  3.8 },
  "сік морквяний":          { protein:  1.1, fat:  0.1, carbs:  6.7 },
  "сік виноградний":        { protein:  0.3, fat:  0.1, carbs: 14.0 },
  "компот":                 { protein:  0.5, fat:  0.0, carbs: 19.0 },
  "кава":                   { protein:  0.2, fat:  0.0, carbs:  0.3 },
  "чай":                    { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "какао напій":            { protein:  1.0, fat:  1.0, carbs:  5.0 },
  "дріжджі":                { protein: 12.7, fat:  2.7, carbs:  8.5 },
  "дріжджі сухі":           { protein: 41.0, fat:  7.7, carbs: 40.0 },
  "розпушувач":             { protein:  0.0, fat:  0.0, carbs: 47.0 },
  "сода харчова":           { protein:  0.0, fat:  0.0, carbs:  0.0 },
  "желатин":                { protein: 87.2, fat:  0.4, carbs:  0.0 },
  "агар-агар":              { protein:  6.2, fat:  0.3, carbs: 76.0 },
  "пектин":                 { protein:  0.0, fat:  0.0, carbs: 94.0 },
  "протеїн сироватковий":   { protein: 80.0, fat:  4.0, carbs:  6.0 },
  "казеїн":                 { protein: 76.0, fat:  2.0, carbs:  4.0 },
  "протеїн рослинний":      { protein: 70.0, fat:  5.0, carbs: 10.0 },
};

// ============================================================
// БЖУ — отримати для заданої кількості
// ============================================================
function getNutrition(name, amount) {
  const key  = name.toLowerCase().trim();
  const base = nutritionData[key] || { protein: 5, fat: 5, carbs: 10 };
  const factor = amount / 100;
  const cal = (base.protein * 4 + base.fat * 9 + base.carbs * 4) * factor;
  return {
    protein:  +(base.protein * factor).toFixed(1),
    fat:      +(base.fat     * factor).toFixed(1),
    carbs:    +(base.carbs   * factor).toFixed(1),
    calories: Math.round(cal),
  };
}

// ============================================================
// КАТАЛОГ ЦІН — допоміжні функції
// ============================================================
function findInCatalog(name) {
  const key = name.toLowerCase().trim();
  return priceCatalog.find(p => p.name.toLowerCase().trim() === key) || null;
}

function calcIngredientPrice(catalogItem, usedAmount) {
  if (!catalogItem || !catalogItem.totalPrice || !catalogItem.totalAmount) return 0;
  const pricePerUnit = catalogItem.totalPrice / catalogItem.totalAmount;
  return +(pricePerUnit * usedAmount).toFixed(2);
}

function parseIngredients(text) {
  if (!text) return [];
  const lines = text.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  return lines.map(line => {
    const match = line.match(/^(.+?)[\s\-–]+(\d+\.?\d*)\s*(г|мл|шт|гр|ml|g)?$/i);
    if (match) {
      return {
        name:   match[1].trim().toLowerCase(),
        amount: parseFloat(match[2]),
        unit:   match[3] || "г",
      };
    }
    return { name: line.toLowerCase(), amount: 100, unit: "г" };
  });
}

// ============================================================
// ПЕРЕКЛАД ПРОДУКТІВ
// ============================================================
function translateProduct(name) {
  const dict = {
    "яловичина": "beef", "яловичина філе": "beef fillet",
    "яловичина вирізка": "beef tenderloin", "яловичина антрекот": "beef entrecote",
    "яловичина стейк": "beef steak", "яловичина ребра": "beef ribs",
    "яловичина лопатка": "beef shoulder", "яловичина грудинка": "beef brisket",
    "яловичина гомілка": "beef shank", "яловичина шия": "beef neck",
    "яловичина печінка": "beef liver", "яловичина серце": "beef heart",
    "яловичина нирки": "beef kidney", "яловичина язик": "beef tongue",
    "яловичий фарш": "ground beef", "фарш яловичий": "ground beef",
    "теляче м'ясо": "veal", "телятина": "veal",
    "свинина": "pork", "свинина філе": "pork fillet",
    "свинина вирізка": "pork tenderloin", "свинина шия": "pork neck",
    "свинина лопатка": "pork shoulder", "свинина грудинка": "pork belly",
    "свинина ребра": "pork ribs", "свинина окіст": "pork ham",
    "свинина гомілка": "pork shank", "свинячий фарш": "ground pork",
    "сало": "lard", "баранина": "lamb", "ягнятина": "lamb",
    "баранина нога": "leg of lamb", "баранина ребра": "lamb ribs",
    "баранина лопатка": "lamb shoulder", "баранячий фарш": "ground lamb",
    "курка": "chicken", "ціла курка": "whole chicken",
    "куряче філе": "chicken breast", "куряча грудка": "chicken breast",
    "куряче стегно": "chicken thigh", "куряча ніжка": "chicken drumstick",
    "куряче крило": "chicken wing", "курячі крила": "chicken wings",
    "курячий фарш": "ground chicken", "куряча печінка": "chicken liver",
    "курячі серця": "chicken hearts", "курячі шлунки": "chicken gizzards",
    "індичка": "turkey", "індиче філе": "turkey breast",
    "індиче стегно": "turkey thigh", "індичий фарш": "ground turkey",
    "качка": "duck", "качина грудка": "duck breast", "гусак": "goose",
    "перепілка": "quail", "ковбаса": "sausage",
    "ковбаса варена": "boiled sausage", "ковбаса копчена": "smoked sausage",
    "ковбаса сирокопчена": "dry-cured sausage",
    "ковбаса лікарська": "doctor sausage", "сосиски": "sausages",
    "сосиски молочні": "milk sausages", "сардельки": "frankfurters",
    "шинка": "ham", "шинка варена": "cooked ham", "шинка копчена": "smoked ham",
    "бекон": "bacon", "бекон копчений": "smoked bacon",
    "салямі": "salami", "шпроти": "sprats", "паштет": "pate",
    "паштет печінковий": "liver pate", "риба": "fish",
    "лосось": "salmon", "лосось філе": "salmon fillet", "сьомга": "salmon",
    "форель": "trout", "тунець": "tuna",
    "тунець консервований": "canned tuna", "тріска": "cod",
    "тріска філе": "cod fillet", "минтай": "pollock", "хек": "hake",
    "судак": "pike perch", "щука": "pike", "карп": "carp",
    "оселедець": "herring", "оселедець солоний": "salted herring",
    "скумбрія": "mackerel", "скумбрія копчена": "smoked mackerel",
    "сардина": "sardine", "сардина консервована": "canned sardine",
    "камбала": "flounder", "палтус": "halibut", "дорадо": "sea bream",
    "тілапія": "tilapia", "пангасіус": "pangasius",
    "морепродукти": "seafood", "креветки": "shrimp",
    "креветки варені": "cooked shrimp", "мідії": "mussels",
    "кальмар": "squid", "восьминіг": "octopus", "краб": "crab",
    "крабові палички": "crab sticks", "устриці": "oysters",
    "ікра червона": "red caviar", "ікра чорна": "black caviar",
    "яйце": "egg", "яйця": "eggs", "яйце куряче": "chicken egg",
    "яйця курячі": "chicken eggs", "яйце перепелине": "quail egg",
    "яйце варене": "boiled egg", "яєчний білок": "egg white",
    "яєчний жовток": "egg yolk", "молоко": "milk",
    "молоко козяче": "goat milk", "молоко знежирене": "skim milk",
    "молоко топлене": "baked milk", "молоко вівсяне": "oat milk",
    "молоко мигдальне": "almond milk", "молоко соєве": "soy milk",
    "молоко кокосове": "coconut milk", "молоко згущене": "condensed milk",
    "молоко сухе": "powdered milk", "вершки": "cream",
    "вершки 10%": "10% cream", "вершки 20%": "20% cream",
    "вершки 33%": "33% cream", "вершки збиті": "whipped cream",
    "сметана": "sour cream", "сметана 10%": "10% sour cream",
    "сметана 15%": "15% sour cream", "сметана 20%": "20% sour cream",
    "кефір": "kefir", "кефір 1%": "1% kefir",
    "кефір знежирений": "low-fat kefir", "йогурт": "yogurt",
    "йогурт натуральний": "plain yogurt", "йогурт грецький": "greek yogurt",
    "йогурт питний": "drinking yogurt", "ряжанка": "ryazhenka",
    "творог": "cottage cheese", "творог 0%": "fat-free cottage cheese",
    "творог 5%": "5% cottage cheese", "творог 9%": "9% cottage cheese",
    "творог 18%": "18% cottage cheese", "творожна маса": "curd mass",
    "сир": "cheese", "твердий сир": "hard cheese",
    "сир пармезан": "parmesan", "сир гауда": "gouda",
    "сир едам": "edam", "сир чеддер": "cheddar",
    "сир моцарела": "mozzarella", "сир бринза": "brynza",
    "сир фета": "feta", "сир рікота": "ricotta",
    "сир маскарпоне": "mascarpone", "сир камамбер": "camembert",
    "плавлений сир": "processed cheese", "сир адигейський": "adyghe cheese",
    "сир сулугуні": "suluguni", "масло": "butter",
    "масло вершкове": "butter", "масло топлене": "ghee",
    "маргарин": "margarine", "олія": "oil",
    "соняшникова олія": "sunflower oil", "оливкова олія": "olive oil",
    "олія кокосова": "coconut oil", "олія ріпакова": "canola oil",
    "олія лляна": "flaxseed oil", "олія кунжутна": "sesame oil",
    "олія авокадо": "avocado oil", "картопля": "potato",
    "картопля молода": "new potato", "батат": "sweet potato",
    "морква": "carrot", "цибуля": "onion", "цибуля червона": "red onion",
    "цибуля зелена": "green onion", "цибуля порей": "leek",
    "цибуля шалот": "shallot", "часник": "garlic",
    "капуста": "cabbage", "капуста пекінська": "chinese cabbage",
    "капуста брюссельська": "brussels sprouts", "броколі": "broccoli",
    "цвітна капуста": "cauliflower", "помідор": "tomato",
    "помідори черрі": "cherry tomatoes", "огірок": "cucumber",
    "перець": "pepper", "перець червоний": "red pepper",
    "перець жовтий": "yellow pepper", "перець зелений": "green pepper",
    "перець гострий": "chili pepper", "баклажан": "eggplant",
    "кабачок": "zucchini", "гарбуз": "pumpkin", "буряк": "beetroot",
    "редиска": "radish", "редька": "black radish", "дайкон": "daikon",
    "ріпа": "turnip", "пастернак": "parsnip", "селера": "celery",
    "фенхель": "fennel", "артишок": "artichoke", "спаржа": "asparagus",
    "шпинат": "spinach", "щавель": "sorrel", "руккола": "arugula",
    "салат": "lettuce", "салат айсберг": "iceberg lettuce",
    "петрушка": "parsley", "кріп": "dill", "базилік": "basil",
    "кінза": "cilantro", "розмарин": "rosemary", "чебрець": "thyme",
    "м'ята": "mint", "авокадо": "avocado", "гриби": "mushrooms",
    "гриби шампіньйони": "champignons", "гриби печериці": "button mushrooms",
    "гриби вешенки": "oyster mushrooms", "гриби білі": "porcini mushrooms",
    "гриби лисички": "chanterelles", "гриби сушені": "dried mushrooms",
    "яблуко": "apple", "яблуко зелене": "green apple",
    "яблуко червоне": "red apple", "банан": "banana",
    "апельсин": "orange", "мандарин": "mandarin",
    "грейпфрут": "grapefruit", "лимон": "lemon", "лайм": "lime",
    "помело": "pomelo", "груша": "pear", "персик": "peach",
    "нектарин": "nectarine", "абрикос": "apricot", "слива": "plum",
    "вишня": "cherry", "черешня": "sweet cherry",
    "полуниця": "strawberry", "малина": "raspberry",
    "чорниця": "blueberry", "смородина чорна": "blackcurrant",
    "смородина червона": "redcurrant", "агрус": "gooseberry",
    "виноград": "grapes", "ківі": "kiwi", "ананас": "pineapple",
    "манго": "mango", "папайя": "papaya", "маракуя": "passion fruit",
    "гранат": "pomegranate", "інжир": "fig", "хурма": "persimmon",
    "диня": "melon", "кавун": "watermelon",
    "родзинки": "raisins", "курага": "dried apricots",
    "чорнослив": "prunes", "фініки сушені": "dried dates",
    "горіхи": "nuts", "волоський горіх": "walnut", "мигдаль": "almond",
    "фундук": "hazelnut", "кешью": "cashew", "фісташки": "pistachios",
    "арахіс": "peanut", "арахісова паста": "peanut butter",
    "кедровий горіх": "pine nut", "насіння соняшника": "sunflower seeds",
    "насіння гарбуза": "pumpkin seeds", "насіння льону": "flax seeds",
    "насіння кунжуту": "sesame seeds", "насіння чіа": "chia seeds",
    "кунжут": "sesame", "тахіні": "tahini",
    "хліб": "bread", "хліб білий": "white bread",
    "хліб чорний": "black bread", "хліб житній": "rye bread",
    "хліб цільнозерновий": "whole grain bread", "батон": "white loaf",
    "багет": "baguette", "лаваш": "lavash", "піта": "pita",
    "тортилья": "tortilla", "сухарі": "rusks", "грінки": "croutons",
    "булочка": "bun", "рогалик": "croissant",
    "рис": "rice", "рис білий": "white rice", "рис бурий": "brown rice",
    "рис басматі": "basmati rice", "гречка": "buckwheat",
    "пшоно": "millet", "вівсянка": "oatmeal",
    "вівсяні пластівці": "oat flakes", "вівсяні висівки": "oat bran",
    "перловка": "pearl barley", "ячмінь": "barley",
    "булгур": "bulgur", "кус-кус": "couscous", "кіноа": "quinoa",
    "амарант": "amaranth", "кукурудзяна крупа": "cornmeal",
    "манка": "semolina", "сочевиця": "lentils",
    "сочевиця червона": "red lentils", "горох": "peas",
    "нут": "chickpeas", "квасоля": "beans",
    "квасоля червона": "red beans", "квасоля біла": "white beans",
    "едамаме": "edamame", "соя": "soy",
    "макарони": "pasta", "спагеті": "spaghetti", "пенне": "penne",
    "фарфалле": "farfalle", "лазанья": "lasagna",
    "вермішель": "vermicelli", "локшина": "noodles",
    "локшина яєчна": "egg noodles", "локшина рисова": "rice noodles",
    "локшина гречана": "soba noodles", "удон": "udon",
    "борошно": "flour", "борошно пшеничне": "wheat flour",
    "борошно цільнозернове": "whole wheat flour",
    "борошно житнє": "rye flour", "борошно вівсяне": "oat flour",
    "борошно кукурудзяне": "corn flour", "борошно рисове": "rice flour",
    "борошно мигдальне": "almond flour",
    "крохмаль картопляний": "potato starch",
    "крохмаль кукурудзяний": "corn starch",
    "панірувальні сухарі": "breadcrumbs",
    "цукор": "sugar", "цукор коричневий": "brown sugar",
    "цукрова пудра": "powdered sugar", "мед": "honey",
    "мед гречаний": "buckwheat honey", "сироп кленовий": "maple syrup",
    "сироп агави": "agave syrup", "стевія": "stevia",
    "шоколад": "chocolate", "шоколад чорний": "dark chocolate",
    "шоколад молочний": "milk chocolate", "шоколад білий": "white chocolate",
    "какао порошок": "cocoa powder", "нутелла": "nutella",
    "печиво": "cookies", "цукерки": "candies", "карамель": "caramel",
    "мармелад": "marmalade", "зефір": "marshmallow", "халва": "halva",
    "торт": "cake", "бісквіт": "sponge cake", "вафлі": "waffles",
    "пряники": "gingerbread", "морозиво": "ice cream",
    "сіль": "salt", "сіль морська": "sea salt",
    "перець чорний": "black pepper", "паприка": "paprika",
    "куркума": "turmeric", "кмин": "cumin", "коріандр": "coriander",
    "кориця": "cinnamon", "кардамон": "cardamom", "гвоздика": "cloves",
    "мускатний горіх": "nutmeg", "імбир": "ginger",
    "орегано": "oregano", "базилік сушений": "dried basil",
    "лавровий лист": "bay leaf", "каррі": "curry",
    "ванілін": "vanillin", "ваніль": "vanilla",
    "соус": "sauce", "кетчуп": "ketchup", "майонез": "mayonnaise",
    "гірчиця": "mustard", "хрін": "horseradish", "аджика": "adjika",
    "соус соєвий": "soy sauce", "соус теріякі": "teriyaki sauce",
    "соус устричний": "oyster sauce", "томатна паста": "tomato paste",
    "оцет": "vinegar", "оцет яблучний": "apple cider vinegar",
    "оцет бальзамічний": "balsamic vinegar",
    "оливки": "olives", "маслини": "black olives", "каперси": "capers",
    "огірки мариновані": "pickled cucumbers",
    "капуста квашена": "sauerkraut", "варення": "jam", "джем": "jam",
    "вода": "water", "сік яблучний": "apple juice",
    "сік апельсиновий": "orange juice", "сік томатний": "tomato juice",
    "компот": "compote", "чай": "tea", "кава": "coffee",
    "дріжджі": "yeast", "дріжджі сухі": "dry yeast",
    "розпушувач": "baking powder", "сода харчова": "baking soda",
    "желатин": "gelatin", "агар-агар": "agar agar",
  };
  return dict[name.toLowerCase().trim()] || name;
}

// ============================================================
// ОТРИМАТИ КАЛОРІЇ
// ============================================================
async function getCalories(product) {
  const key  = product.toLowerCase().trim();
  const local = nutritionData[key];
  if (local) {
    const cal = local.protein * 4 + local.fat * 9 + local.carbs * 4;
    return Math.round(cal);
  }

  const eng = translateProduct(product);
  try {
    const res = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=100g ${eng}`
    );
    const data = await res.json();
    if (!data.calories || data.calories === 0) return 150;
    return data.calories;
  } catch (e) {
    console.log("Помилка калорій:", e);
    return 150;
  }
}

// ============================================================
// ДОДАТИ ПРОДУКТ
// ============================================================
window.addProduct = async function () {
  const name   = document.getElementById("productInput").value.trim().toLowerCase();
  const amount = Number(document.getElementById("amountInput").value);
  const unit   = document.getElementById("unitInput").value;
  const price  = Number(document.getElementById("priceInput").value) || 0;

  if (!name || !amount) {
    alert("Заповни назву і кількість");
    return;
  }

  const cal100 = await getCalories(name);

  let calories;
  if (unit === "шт") {
    calories = amount * 70;
  } else {
    calories = (cal100 / 100) * amount;
  }

  const now  = new Date();
  const info = getCurrentWeekInfo();

  await addDoc(productsRef, {
    name,
    amount,
    unit,
    price,
    week:  info.week,
    month: info.month,
    year:  info.year,
    calories: Math.round(calories),
    date:     now.toLocaleString("uk-UA"),
    dateISO:  now.toISOString(),
    createdAt: serverTimestamp(),
  });

  document.getElementById("productInput").value = "";
  document.getElementById("amountInput").value  = "";
  document.getElementById("priceInput").value   = "";
};

window.deleteProduct = async function (id) {
  await deleteDoc(doc(db, "products", id));
};

window.moveToBuy = async function (id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  await addDoc(buyRef, {
    name:   product.name,
    amount: product.amount,
    unit:   product.unit,
    date:   new Date().toLocaleString("uk-UA"),
  });
  await deleteDoc(doc(db, "products", id));
};

window.removeFromBuy = async function (id) {
  await deleteDoc(doc(db, "buyProducts", id));
};

// ============================================================
// ВИТРАТИ
// ============================================================
function renderProductsMoney() {
  const totalBlock = document.getElementById("productsMoneyTotal");
  const weekChart  = document.getElementById("productsWeekChart");
  const allChart   = document.getElementById("allTimeChart");

  if (!totalBlock || !weekChart || !allChart) return;

  const info         = getCurrentWeekInfo();
  const currentMonth = info.month;
  const currentYear  = info.year;

  let totalAll = 0;
  const weeks  = [0, 0, 0, 0];
  const months = {};

  products.forEach(p => {
    const price = Number(p.price || 0);
    totalAll += price;
    const key = `${p.month}.${p.year}`;
    if (!months[key]) months[key] = 0;
    months[key] += price;

    if (p.month === currentMonth && p.year === currentYear) {
      const w = Number(p.week);
      if (w >= 1 && w <= 4) weeks[w - 1] += price;
    }
  });

  totalBlock.innerText = totalAll + " грн";
  localStorage.setItem("productsTotal", totalAll);

  const WEEK_LIMIT = 3875;

  weekChart.innerHTML = weeks.map((sum, index) => {
    const weekNum   = index + 1;
    const isActive  = weekNum === info.week;
    const isOver    = sum > WEEK_LIMIT;
    const over      = sum - WEEK_LIMIT;
    const width     = Math.min(100, (sum / WEEK_LIMIT) * 100);
    const color     = isOver ? "#f44336" : "#00c853";

    return `
      <div class="week-row" style="
        border-left: 4px solid ${isActive ? "#2196F3" : color};
        padding-left:8px; margin-bottom:8px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:${isActive ? "bold" : "normal"}; color:${isOver ? "red" : "inherit"}">
            ${isActive ? "▶ " : ""}Тиждень ${weekNum}: <b>${sum} грн</b>
            ${isOver ? `<span style="color:red"> — перевищено на ${over} грн 🔴</span>` : ""}
          </span>
        </div>
        <div class="week-bar" style="height:8px;background:#eee;border-radius:4px;margin-top:4px">
          <div style="width:${width}%;height:100%;background:${color};border-radius:4px;transition:width .3s"></div>
        </div>
        ${renderWeekProductList(weekNum, currentMonth, currentYear)}
      </div>`;
  }).join("");

  const maxMonth = Math.max(...Object.values(months), 1);
  allChart.innerHTML = Object.keys(months).sort().map(key => {
    const sum   = months[key];
    const width = Math.max(8, (sum / maxMonth) * 100);
    return `
      <div class="month-row" style="margin-bottom:6px">
        <span>${key}: <b>${sum} грн</b></span>
        <div class="month-bar" style="height:8px;background:#eee;border-radius:4px;margin-top:4px">
          <div style="width:${width}%;height:100%;background:#00c853;border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");

  renderWeekArchive();
}

function renderWeekProductList(weekNum, month, year) {
  const list = products.filter(
    p => Number(p.week) === weekNum && p.month === month && p.year === year
  );

  if (list.length === 0) return `<div style="opacity:.5;font-size:.85em;padding-top:4px">— порожньо —</div>`;

  const total = list.reduce((s, p) => s + Number(p.price || 0), 0);

  return `
    <div class="week-product-list" style="margin-top:6px;font-size:.85em">
      ${list.map(p => `
        <div class="week-product-item" style="
          display:flex;justify-content:space-between;
          padding:3px 0;border-bottom:1px solid #f0f0f0;
        ">
          <span>📦 ${p.name} — ${p.amount}${p.unit}</span>
          <span style="color:#555">${p.price > 0 ? p.price + " грн" : "—"} · ${p.date || ""}</span>
        </div>
      `).join("")}
      <div style="text-align:right;font-weight:bold;padding-top:4px">
        Разом: ${total} грн
      </div>
    </div>`;
}

function renderWeekArchive() {
  const el = document.getElementById("weekArchiveList");
  if (!el) return;

  if (weekArchive.length === 0) {
    el.innerHTML = "<p style='opacity:.5'>Архів порожній</p>";
    return;
  }

  const sorted = [...weekArchive].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return b.week - a.week;
  });

  const monthNames = [
    "","Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
  ];

  el.innerHTML = sorted.map(aw => {
    const productRows = (aw.products || []).map(p => `
      <div style="display:flex;justify-content:space-between;font-size:.82em;padding:2px 0">
        <span>${p.name} — ${p.amount}${p.unit}</span>
        <span>${p.price > 0 ? p.price + " грн" : "—"} · ${p.date || ""}</span>
      </div>`).join("");

    return `
      <div class="archive-week-card" style="
        border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:10px;
      ">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <b>📅 Тиждень ${aw.week} · ${monthNames[aw.month]} ${aw.year}</b>
          <span style="color:#888;font-size:.85em">${aw.startDate} — ${aw.endDate || "?"}</span>
        </div>
        <div style="color:#00c853;font-weight:bold;margin-bottom:6px">
          💰 Всього: ${aw.totalPrice || 0} грн · 🔥 ${aw.totalCalories || 0} ккал
        </div>
        ${productRows}
      </div>`;
  }).join("");
}

// ============================================================
// 🆕🆕🆕 ОНОВЛЕНИЙ КАТАЛОГ ЦІН
// ============================================================

// Стан пошуку для каталогу
let catalogSearchQuery = "";

// Отримати одиницю за замовчуванням для продукту
function getDefaultUnit(name) {
  const liquids = ["олія","молоко","вершки","кефір","сметана","сік","вода","компот","кава","чай","какао","оцет","соус","сироп"];
  const isLiquid = liquids.some(l => name.includes(l));
  return isLiquid ? "мл" : "г";
}

// Відображення каталогу цін (новий формат — список продуктів зі словника)
function renderPriceCatalog() {
  const list = document.getElementById("priceCatalogList");
  if (!list) return;

  // Фільтруємо продукти зі словника за пошуком
  const query = catalogSearchQuery.toLowerCase().trim();
  const filteredProducts = query
    ? ALL_CATALOG_PRODUCTS.filter(p => p.includes(query))
    : ALL_CATALOG_PRODUCTS;

  // Рендеримо рядки
  list.innerHTML = filteredProducts.map(productName => {
    // Шукаємо в Firebase чи є вже ціна для цього продукту
    const existing = priceCatalog.find(p => p.name.toLowerCase().trim() === productName.toLowerCase().trim());
    const defaultUnit = getDefaultUnit(productName);

    if (existing) {
      // Продукт вже є в каталозі — показуємо поточні дані + можливість редагувати
      const perUnit = existing.totalAmount
        ? (existing.totalPrice / existing.totalAmount).toFixed(2)
        : "—";
      return `
        <div class="catalog-row catalog-row--filled" id="crow-${existing.id}" data-name="${productName}">
          <span class="catalog-row__name">${productName}</span>
          <div class="catalog-row__inputs">
            <input
              type="number"
              class="catalog-input"
              placeholder="К-сть"
              value="${existing.totalAmount}"
              id="camount-${existing.id}"
              min="0" step="any"
            />
            <select class="catalog-select" id="cunit-${existing.id}">
              <option value="г" ${existing.unit === "г" ? "selected" : ""}>г</option>
              <option value="мл" ${existing.unit === "мл" ? "selected" : ""}>мл</option>
              <option value="шт" ${existing.unit === "шт" ? "selected" : ""}>шт</option>
            </select>
            <input
              type="number"
              class="catalog-input"
              placeholder="Ціна грн"
              value="${existing.totalPrice}"
              id="cprice-${existing.id}"
              min="0" step="any"
            />
            <span class="catalog-perunit" title="ціна за одиницю">${perUnit} грн/${existing.unit}</span>
            <button class="catalog-save-btn" onclick="updateCatalogItem('${existing.id}', '${productName}')">💾</button>
            <button class="catalog-delete-btn" onclick="deletePriceCatalogItem('${existing.id}')">✕</button>
          </div>
        </div>`;
    } else {
      // Продукту ще немає — пустий рядок для вводу
      return `
        <div class="catalog-row catalog-row--empty" id="crow-new-${productName.replace(/\s/g,'_')}" data-name="${productName}">
          <span class="catalog-row__name">${productName}</span>
          <div class="catalog-row__inputs">
            <input
              type="number"
              class="catalog-input"
              placeholder="К-сть"
              id="new-amount-${productName.replace(/\s/g,'_')}"
              min="0" step="any"
            />
            <select class="catalog-select" id="new-unit-${productName.replace(/\s/g,'_')}">
              <option value="г" ${defaultUnit === "г" ? "selected" : ""}>г</option>
              <option value="мл" ${defaultUnit === "мл" ? "selected" : ""}>мл</option>
              <option value="шт">шт</option>
            </select>
            <input
              type="number"
              class="catalog-input"
              placeholder="Ціна грн"
              id="new-price-${productName.replace(/\s/g,'_')}"
              min="0" step="any"
            />
            <span class="catalog-perunit">—</span>
            <button class="catalog-add-btn" onclick="addCatalogItemFromRow('${productName}')">➕</button>
          </div>
        </div>`;
    }
  }).join("");

  // Якщо нічого не знайшли при пошуку
  if (filteredProducts.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:20px;opacity:.5;">
        Нічого не знайдено за запитом "<b>${query}</b>"
      </div>`;
  }
}

// Додати новий продукт зі словника (якщо заповнено поля)
window.addCatalogItemFromRow = async function (productName) {
  const key    = productName.replace(/\s/g, "_");
  const amount = Number(document.getElementById(`new-amount-${key}`)?.value);
  const unit   = document.getElementById(`new-unit-${key}`)?.value || "г";
  const price  = Number(document.getElementById(`new-price-${key}`)?.value);

  if (!amount || !price) {
    // Підсвітити поля
    const amountInput = document.getElementById(`new-amount-${key}`);
    const priceInput  = document.getElementById(`new-price-${key}`);
    if (!amount && amountInput) amountInput.style.borderColor = "#f44336";
    if (!price && priceInput)   priceInput.style.borderColor  = "#f44336";
    return;
  }

  await addDoc(priceCatalogRef, {
    name:        productName.toLowerCase().trim(),
    totalAmount: amount,
    unit,
    totalPrice:  price,
    createdAt:   serverTimestamp(),
  });
};

// Оновити існуючий запис
window.updateCatalogItem = async function (id, productName) {
  const amount = Number(document.getElementById(`camount-${id}`)?.value);
  const unit   = document.getElementById(`cunit-${id}`)?.value || "г";
  const price  = Number(document.getElementById(`cprice-${id}`)?.value);

  if (!amount || !price) {
    alert("Заповни кількість і ціну");
    return;
  }

  await updateDoc(doc(db, "priceCatalog", id), {
    totalAmount: amount,
    unit,
    totalPrice:  price,
  });
};

// Стара функція addPriceCatalogItem — для ручного блоку додавання
window.addPriceCatalogItem = async function () {
  const name        = document.getElementById("pcName").value.trim().toLowerCase();
  const totalAmount = Number(document.getElementById("pcAmount").value);
  const unit        = document.getElementById("pcUnit").value;
  const totalPrice  = Number(document.getElementById("pcPrice").value);

  if (!name || !totalAmount || !totalPrice) {
    alert("Заповни назву, кількість і ціну");
    return;
  }

  await addDoc(priceCatalogRef, {
    name, totalAmount, unit, totalPrice,
    createdAt: serverTimestamp(),
  });

  document.getElementById("pcName").value   = "";
  document.getElementById("pcAmount").value = "";
  document.getElementById("pcPrice").value  = "";
};

window.deletePriceCatalogItem = async function (id) {
  await deleteDoc(doc(db, "priceCatalog", id));
};

window.togglePriceCatalog = function () {
  const body = document.getElementById("priceCatalogBody");
  const icon = document.getElementById("priceCatalogToggleIcon");
  if (!body) return;
  const isHidden = body.style.display === "none";
  body.style.display = isHidden ? "block" : "none";
  if (icon) icon.textContent = isHidden ? "▲" : "▼";
};

// Пошук у каталозі
window.filterCatalog = function (query) {
  catalogSearchQuery = query;
  renderPriceCatalog();
};

// ============================================================
// РЕЦЕПТИ — ДОДАТИ
// ============================================================
window.addRecipe = async function () {
  const day  = document.getElementById("recipeDay").value;
  const name = document.getElementById("recipeName").value.trim();
  const text = document.getElementById("recipeText").value.trim();

  if (!day || !name) {
    alert("Введи день і назву рецепта");
    return;
  }

  const parsedIngredients = parseIngredients(text);

  let totalProtein = 0, totalFat = 0, totalCarbs = 0, totalCal = 0, totalPrice = 0;

  const ingredientDetails = parsedIngredients.map(ing => {
    const n     = getNutrition(ing.name, ing.amount);
    const cat   = findInCatalog(ing.name);
    const price = calcIngredientPrice(cat, ing.amount);

    totalProtein += n.protein;
    totalFat     += n.fat;
    totalCarbs   += n.carbs;
    totalCal     += n.calories;
    totalPrice   += price;

    return {
      name:     ing.name,
      amount:   ing.amount,
      unit:     ing.unit,
      calories: n.calories,
      protein:  n.protein,
      fat:      n.fat,
      carbs:    n.carbs,
      price,
    };
  });

  await addDoc(recipesRef, {
    day, name, text,
    ingredients: ingredientDetails,
    total: {
      protein:  +totalProtein.toFixed(1),
      fat:      +totalFat.toFixed(1),
      carbs:    +totalCarbs.toFixed(1),
      calories: Math.round(totalCal),
      price:    +totalPrice.toFixed(2),
    },
    date:      new Date().toLocaleString("uk-UA"),
    createdAt: serverTimestamp(),
  });

  document.getElementById("recipeName").value = "";
  document.getElementById("recipeText").value = "";
};

window.deleteWeekRecipe = async function (id) {
  await deleteDoc(doc(db, "weekRecipes", id));
};

// ============================================================
// РЕЦЕПТИ — РЕНДЕР
// ============================================================
function renderWeekRecipes() {
  const container = document.getElementById("weekRecipes");
  if (!container) return;

  const days = [
    "понеділок","вівторок","середа",
    "четвер","пʼятниця","субота","неділя"
  ];

  container.innerHTML = "";

  days.forEach(day => {
    const list = recipesWeek.filter(r => r.day === day);
    container.innerHTML += `
      <div class="day-card">
        <h3>${day}</h3>
        ${list.length === 0
          ? "<p>Немає рецептів</p>"
          : list.map(r => renderRecipeCard(r)).join("")}
      </div>`;
  });
}

function renderRecipeCard(r) {
  const hasIng = r.ingredients && r.ingredients.length > 0;
  const total  = r.total || {};

  const rows = hasIng
    ? r.ingredients.map(ing => `
        <tr>
          <td>${ing.name}</td>
          <td>${ing.amount}${ing.unit || "г"}</td>
          <td>${ing.calories} ккал</td>
          <td>Б:${ing.protein} / Ж:${ing.fat} / В:${ing.carbs}</td>
          <td class="price-cell">${ing.price > 0 ? ing.price + " грн" : "—"}</td>
        </tr>`).join("")
    : `<tr><td colspan="5" style="opacity:.6">${r.text || "—"}</td></tr>`;

  const totalRow = hasIng ? `
    <tr class="recipe-total-row">
      <td>📊 Разом</td>
      <td>—</td>
      <td>${total.calories || 0} ккал</td>
      <td>Б:${total.protein||0} / Ж:${total.fat||0} / В:${total.carbs||0} г</td>
      <td class="price-cell">${total.price > 0 ? total.price + " грн" : "—"}</td>
    </tr>` : "";

  return `
    <div class="recipe-small">
      <div class="recipe-header">
        <b>${r.name}</b>
        <button class="delete-btn" onclick="deleteWeekRecipe('${r.id}')">❌</button>
      </div>
      ${hasIng ? `
        <table class="recipe-table">
          <thead>
            <tr>
              <th>Продукт</th><th>К-сть</th>
              <th>Калорії</th><th>БЖУ (г)</th><th>Ціна</th>
            </tr>
          </thead>
          <tbody>${rows}${totalRow}</tbody>
        </table>` : `<p>${r.text || ""}</p>`}
    </div>`;
}

// ============================================================
// РЕНДЕР ПРОДУКТІВ
// ============================================================
function renderProducts() {
  const list    = document.getElementById("productList");
  const buyList = document.getElementById("buyList");

  if (!list || !buyList) return;

  list.innerHTML    = "";
  buyList.innerHTML = "";

  if (products.length === 0) {
    list.innerHTML = "<p style='opacity:.5;padding:8px'>Список порожній</p>";
  } else {
    products.forEach(p => {
      list.innerHTML += `
        <div class="item">
          <span>
            <b>${p.name}</b> — ${p.amount}${p.unit} —
            ${p.calories} ккал — ${p.price > 0 ? p.price + " грн" : "безкоштовно"}
            <small style="color:#888;display:block">${p.date || ""} · Тиждень ${p.week}</small>
          </span>
          <button onclick="moveToBuy('${p.id}')">Закінчилось</button>
          <button class="delete-btn" onclick="deleteProduct('${p.id}')">❌</button>
        </div>`;
    });
  }

  buy.forEach(p => {
    buyList.innerHTML += `
      <div class="item">
        <span>${p.name} — ${p.amount}${p.unit}
          <small style="color:#888;display:block">${p.date || ""}</small>
        </span>
        <button onclick="removeFromBuy('${p.id}')">Куплено</button>
      </div>`;
  });

  renderProductsMoney();
  renderWeekHeader();
}

window.goBack = function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/Home-Finance/index.html";
  }
};

// ============================================================
// FIREBASE LIVE LISTENERS
// ============================================================
onSnapshot(productsRef, snapshot => {
  products = [];
  snapshot.forEach(docItem => {
    products.push({ id: docItem.id, ...docItem.data() });
  });
  renderProducts();
});

onSnapshot(buyRef, snapshot => {
  buy = [];
  snapshot.forEach(docItem => {
    buy.push({ id: docItem.id, ...docItem.data() });
  });
  renderProducts();
});

onSnapshot(recipesRef, snapshot => {
  recipesWeek = [];
  snapshot.forEach(docItem => {
    recipesWeek.push({ id: docItem.id, ...docItem.data() });
  });
  renderWeekRecipes();
});

onSnapshot(priceCatalogRef, snapshot => {
  priceCatalog = [];
  snapshot.forEach(docItem => {
    priceCatalog.push({ id: docItem.id, ...docItem.data() });
  });
  renderPriceCatalog();
});

onSnapshot(weekArchiveRef, snapshot => {
  weekArchive = [];
  snapshot.forEach(docItem => {
    weekArchive.push({ id: docItem.id, ...docItem.data() });
  });
  renderWeekArchive();
});



// ============================================================
// ІНІЦІАЛІЗАЦІЯ
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderWeekHeader();
});

// ============================================================
// 🔥 PREMIUM SCROLL SYSTEM
// ============================================================

window.addEventListener("load", () => {

  initScrollAreas();

  setTimeout(() => {
    refreshScrollAreas();
  }, 300);

});

// ============================================================
// 🔥 INIT SCROLL
// ============================================================

function initScrollAreas() {

  const areas = document.querySelectorAll(".scroll-area");

  areas.forEach(area => {

    // mobile smooth
    area.style.webkitOverflowScrolling = "touch";

    // smooth wheel
    area.addEventListener("wheel", (e) => {

      const hasScroll =
        area.scrollHeight > area.clientHeight;

      if (!hasScroll) return;

      e.preventDefault();

      area.scrollBy({
        top: e.deltaY,
        behavior: "smooth"
      });

    }, { passive: false });

  });

}

// ============================================================
// 🔥 REFRESH SCROLL
// ============================================================

function refreshScrollAreas() {

  const areas = document.querySelectorAll(".scroll-area");

  areas.forEach(area => {

    const hasOverflow =
      area.scrollHeight > area.clientHeight;

    if (hasOverflow) {

      area.style.overflowY = "auto";

    } else {

      area.style.overflowY = "hidden";

    }

  });

}

// ============================================================
// 🔥 AUTO UPDATE DOM
// ============================================================

const scrollObserver = new MutationObserver(() => {

  refreshScrollAreas();

});

scrollObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// ============================================================
// 🔥 RESIZE UPDATE
// ============================================================

window.addEventListener("resize", () => {

  refreshScrollAreas();

});

// ============================================================
// 🔥 AUTO HEIGHT
// ============================================================

function updateScrollHeights() {

  const areas = document.querySelectorAll(".scroll-area");

  areas.forEach(area => {

    if (window.innerWidth < 768) {

      area.style.maxHeight = "420px";

    } else {

      area.style.maxHeight = "520px";

    }

  });

}

window.addEventListener("resize", updateScrollHeights);

window.addEventListener("load", updateScrollHeights);

// ============================================================
// 🔥 SHADOW ON SCROLL
// ============================================================

function initScrollShadows() {

  const areas = document.querySelectorAll(".scroll-area");

  areas.forEach(area => {

    area.addEventListener("scroll", () => {

      if (area.scrollTop > 5) {

        area.style.boxShadow =
          "inset 0 8px 12px rgba(0,0,0,0.05)";

      } else {

        area.style.boxShadow = "none";

      }

    });

  });

}

window.addEventListener("load", initScrollShadows);

// ============================================================
// 🔥 TOUCH FIX
// ============================================================

document.addEventListener("touchmove", () => {

  refreshScrollAreas();

}, { passive: true });

// ============================================================
// 🔥 DEBUG
// ============================================================

// ============================================================
// 🔥 SMART ARCHIVE / CHECK
// ============================================================

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

// ============================================================
// 🔥 РЕЦЕПТИ -> ЩО ТРЕБА (по поточному тижню)
// ============================================================

function buildRecipeNeeds(info = getCurrentWeekInfo()) {
  const result = {};

  recipesWeek.forEach(recipe => {
    // Фільтр по тижню/місяцю/року
    if (
      Number(recipe.week)  !== Number(info.week)  ||
      Number(recipe.month) !== Number(info.month) ||
      Number(recipe.year)  !== Number(info.year)
    ) return;

    const ingredients = Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];

    ingredients.forEach(item => {
      const name   = normalizeName(item.name || item.product || "");
      const amount = Number(item.amount || item.grams || item.weight || 0);
      if (!name || !amount) return;

      // Шукаємо в каталозі — поля totalAmount і totalPrice
      const catalog = priceCatalog.find(
        p => normalizeName(p.name) === name
      );

      let totalPrice = 0;
      if (catalog) {
        const catalogAmount = Number(catalog.totalAmount || catalog.amount || 1000);
        const catalogPrice  = Number(catalog.totalPrice  || catalog.price  || 0);
        if (catalogAmount > 0) {
          totalPrice = (catalogPrice / catalogAmount) * amount;
        }
      }

      if (!result[name]) {
        result[name] = { name, amount: 0, totalPrice: 0 };
      }
      result[name].amount     += amount;
      result[name].totalPrice += totalPrice;
    });
  });

  return result;
}

// ============================================================
// 🔥 ФАКТ ПОКУПКИ (products за поточний тиждень)
// ============================================================

function buildFactBuy(info = getCurrentWeekInfo()) {
  const result = {};

  // products — колекція "Є вдома / Додати продукт"
  products.forEach(p => {
    if (
      Number(p.week)  !== Number(info.week)  ||
      Number(p.month) !== Number(info.month) ||
      Number(p.year)  !== Number(info.year)
    ) return;

    const name       = normalizeName(p.name || "");
    const amount     = Number(p.amount || 0);
    const totalPrice = Number(p.price  || 0);
    if (!name) return;

    if (!result[name]) {
      result[name] = { name, amount: 0, totalPrice: 0 };
    }
    result[name].amount     += amount;
    result[name].totalPrice += totalPrice;
  });

  return result;
}

// ============================================================
// 🔥 ПОРІВНЯЛЬНА ТАБЛИЦЯ (для архіву)
// ============================================================

function buildComparisonRows(recipeNeeds, factBuy) {
  const allNames = [
    ...new Set([
      ...Object.keys(recipeNeeds),
      ...Object.keys(factBuy)
    ])
  ];

  return allNames.map(name => {
    const need = recipeNeeds[name] || { amount: 0, totalPrice: 0 };
    const fact = factBuy[name]     || { amount: 0, totalPrice: 0 };
    const diff = need.totalPrice - fact.totalPrice;
    return { name, needAmount: need.amount, needPrice: need.totalPrice,
             factAmount: fact.amount, factPrice: fact.totalPrice, diff };
  });
}

// ============================================================
// 🔥 RENDER ARCHIVE TABLES
// ============================================================

// ============================================================
// ✅ АВТОМАТИЧНА РІЗНИЦЯ В РУЧНІЙ ТАБЛИЦІ
// Ціна - Куплено = Різниця
// ============================================================

function getCellNumber(cell) {
  if (!cell) return 0;

  return Number(
    cell.innerText
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  ) || 0;
}

function calculateManualTable() {
  const rows = document.querySelectorAll(".manual-table tbody tr");

  rows.forEach(row => {
    const priceCell = row.cells[2];   // 🙂 Ціна
    const boughtCell = row.cells[3];  // ❤️ Куплено
    const diffCell = row.cells[4];    // ✔ Різниця

    if (!priceCell || !boughtCell || !diffCell) return;

    const price = getCellNumber(priceCell);
    const bought = getCellNumber(boughtCell);

    const diff = price - bought;

    diffCell.innerText = diff;

    if (diff > 0) {
      diffCell.style.color = "#00c853";
    } else if (diff < 0) {
      diffCell.style.color = "red";
    } else {
      diffCell.style.color = "#333";
    }

    diffCell.style.fontWeight = "bold";
  });
}

document.addEventListener("input", function (e) {
  if (e.target.closest(".manual-table")) {
    calculateManualTable();
  }
});

document.addEventListener("DOMContentLoaded", calculateManualTable);


function renderManualArchiveHistory() {

  const container =
    document.getElementById(
      "manualArchiveHistory"
    );

  if (!container) return;

  container.innerHTML = "";

  const archive =
    JSON.parse(
      localStorage.getItem("manualArchiveHistory") || "[]"
    );

  let html = "";

  archive.forEach(block => {

    html += `

      <div class="item">

        <h3>
          📅 Тиждень ${block.week}
          · ${block.month}.${block.year}
        </h3>

        <p>
          ${block.created}
        </p>

        <table class="manual-table">

          <thead>

            <tr>
              <th>Продукт</th>
              <th>Треба</th>
              <th>Ціна</th>
              <th>Куплено</th>
              <th>Різниця</th>
            </tr>

          </thead>

          <tbody>
    `;

    block.rows.forEach(r => {

      html += `

        <tr>

          <td>${r.product}</td>
          <td>${r.need}</td>
          <td>${r.price}</td>
          <td>${r.bought}</td>
          <td>${r.diff}</td>

        </tr>
      `;
    });

    html += `

          </tbody>

        </table>

      </div>
    `;
  });

  container.innerHTML = html;
}

document.addEventListener(
  "DOMContentLoaded",
  renderManualArchiveHistory
);

// ============================================================
// 🗑 ОЧИСТИТИ АРХІВ
// ============================================================

window.clearManualArchiveHistory = function () {

  if (
    !confirm("Очистити весь архів?")
  ) {
    return;
  }

  localStorage.removeItem(
    "manualArchiveHistory"
  );

  renderManualArchiveHistory();

  alert("✅ Архів очищено");
}; 
// ============================================================
// ✅ FIX: РУЧНИЙ АРХІВ РІЗНИЦІ — ПРАЦЮЄ З .main-manual-table
// ============================================================

function getManualTableData() {
  const table = document.querySelector(".main-manual-table");

  if (!table) {
    alert("❌ Не знайдена головна таблиця .main-manual-table");
    return [];
  }

  const rows = table.querySelectorAll("tbody tr");
  const result = [];

  rows.forEach(row => {
    const product = row.cells[0]?.innerText.trim() || "";
    const need = row.cells[1]?.innerText.trim() || "";
    const price = row.cells[2]?.innerText.trim() || "";
    const bought = row.cells[3]?.innerText.trim() || "";
    const diff = row.cells[4]?.innerText.trim() || "";

    if (!product && !need && !price && !bought) return;

    const exists = result.some(item =>
      item.product === product &&
      item.need === need &&
      item.price === price &&
      item.bought === bought
    );

    if (exists) return;

    result.push({
      product,
      need,
      price,
      bought,
      diff
    });
  });

  return result;
}

function clearManualTable() {
  const table = document.querySelector(".main-manual-table");
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");

  rows.forEach(row => {
    if (row.cells[0]) row.cells[0].innerText = "";
    if (row.cells[1]) row.cells[1].innerText = "";
    if (row.cells[2]) row.cells[2].innerText = "";
    if (row.cells[3]) row.cells[3].innerText = "";
    if (row.cells[4]) row.cells[4].innerText = "";
  });
}

window.saveManualArchive = function () {
  const data = getManualTableData();

  if (!data.length) {
    alert("⚠️ Немає даних для збереження");
    return;
  }

  const info = getCurrentWeekInfo();

  const archive = JSON.parse(
    localStorage.getItem("manualArchiveHistory") || "[]"
  );

  archive.unshift({
    week: info.week,
    month: info.month,
    year: info.year,
    created: new Date().toLocaleString("uk-UA"),
    rows: data
  });

  localStorage.setItem(
    "manualArchiveHistory",
    JSON.stringify(archive)
  );

  renderManualArchiveHistory();
  clearManualTable();

  alert("✅ Архів різниці збережено");
};

console.log("✅ saveManualArchive fixed");
// ============================================================
// 💾 АВТОЗБЕРЕЖЕННЯ ТАБЛИЦІ В localStorage
// ============================================================

function saveManualTableToStorage() {
  const table = document.querySelector(".main-manual-table");
  if (!table) return;
  const rows = table.querySelectorAll("tbody tr");
  const data = [];
  rows.forEach(row => {
    data.push([
      row.cells[0]?.innerText || "",
      row.cells[1]?.innerText || "",
      row.cells[2]?.innerText || "",
      row.cells[3]?.innerText || "",
    ]);
  });
  localStorage.setItem("manualTableData", JSON.stringify(data));
}

function loadManualTableFromStorage() {
  const saved = localStorage.getItem("manualTableData");
  if (!saved) return;
  const table = document.querySelector(".main-manual-table");
  if (!table) return;
  const rows = table.querySelectorAll("tbody tr");
  const data = JSON.parse(saved);
  data.forEach((rowData, i) => {
    if (!rows[i]) return;
    if (rows[i].cells[0]) rows[i].cells[0].innerText = rowData[0] || "";
    if (rows[i].cells[1]) rows[i].cells[1].innerText = rowData[1] || "";
    if (rows[i].cells[2]) rows[i].cells[2].innerText = rowData[2] || "";
    if (rows[i].cells[3]) rows[i].cells[3].innerText = rowData[3] || "";
  });
  calculateManualTable();
}

// Слухаємо зміни в таблиці — зберігаємо автоматично
document.addEventListener("input", function(e) {
  if (e.target.closest(".main-manual-table")) {
    saveManualTableToStorage();
  }
});

// type="module" виконується після DOM — викликаємо одразу
loadManualTableFromStorage();

// Очищаємо localStorage при збереженні в архів
const _origSaveManualArchive = window.saveManualArchive;
window.saveManualArchive = function() {
  _origSaveManualArchive();
  localStorage.removeItem("manualTableData");
};

console.log("✅ Автозбереження таблиці підключено");
