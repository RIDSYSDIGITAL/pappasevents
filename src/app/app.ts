/*import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('pappas-catering');
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}*/

import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { COPY, Copy, LANGUAGES, Lang } from "./i18n";

type ErrorKey = keyof Copy["errors"];
type PublicReview = {
  id: string;
  kind: "review" | "question";
  name: string;
  rating: number;
  text: string;
  answer: string | null;
  createdAt: string;
};
const STORE = { lang: "pappas-lang", theme: "pappas-theme" };
const LOCALES: Record<Lang, string> = { fr: "fr-FR", en: "en-GB", ta: "ta-IN" };
function readStore(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {
  scrolled = false;
  heroIndex = 0;
  galleryFilter = "all";
  apiConnected = false;
  submitted = false;
  sending = false;
  formError: "" | ErrorKey = "";
  lightbox: string | null = null;
  serviceId: string | null = null;
  vinIndex: number | null = null;
  selectedMenu = "";
  selectedServices = ["planning"];
  today = new Date().toLocaleDateString("en-CA");
  form = {
    name: "",
    email: "",
    phone: "",
    event: "wedding",
    date: "",
    guests: 100,
    location: "",
    message: "",
    consent: false,
    website: "",
  };
  languages = LANGUAGES;
  lang: Lang = "fr";
  t: Copy = COPY.fr;
  theme: "light" | "dark" = "light";
  // Text-free data; display copy for each id comes from the active language in i18n.ts.
  heroSlides = ["hero/venue.jpg", "hero/hero.jpg", "hero/entertainment.jpg"];
  heroTimer?: ReturnType<typeof setInterval>;
  heroPaused = false;
  services = [
    { id: "planning", image: "events/venue.jpg", icon: "✧" },
    { id: "decoration", image: "events/flowers.jpg", icon: "✳" },
    { id: "photography", image: "events/hero.jpg", icon: "◎" },
    { id: "video", image: "events/photography.jpg", icon: "▷" },
    { id: "catering", image: "vegetarian.jpg", icon: "♧" },
    { id: "entertainment", image: "events/entertainment.jpg", icon: "♫" },
    { id: "rentals", image: "wedding.jpg", icon: "◇" },
    { id: "activities", image: "events/celebration.jpg", icon: "✺" },
  ] as const;
  occasions = [
    { id: "wedding", image: "events/hero.jpg" },
    { id: "private", image: "events/celebration.jpg" },
    { id: "corporate", image: "corporate.jpg" },
    { id: "cultural", image: "table.jpg" },
  ] as const;
  // Instagram reels for the Vin d'honneur section. TODO: replace the profile placeholder with the owner's reel URLs.
  reels = [
    { image: "events/venue.jpg", url: "https://www.instagram.com/" },
    { image: "vegetarian.jpg", url: "https://www.instagram.com/" },
    { image: "events/hero.jpg", url: "https://www.instagram.com/" },
  ];
  // Sample dishes per Vin d'honneur menu card, in vinUi.categories order. TODO: replace with the owner's menu.
  vinMenu = [
    ["Tomato rasam", "Sweet corn soup", "Mutton soup"],
    ["Samosa", "Paneer tikka", "Chicken 65"],
    ["Idli", "Masala dosa", "Medu vada"],
    ["Veg biryani", "Sambar rice", "Curd rice"],
    ["Poriyal", "Avial", "Kootu"],
    ["Chicken biryani", "Mutton biryani", "Fish meals"],
    ["Pepper chicken", "Mutton chukka", "Fish fry"],
    ["Butter naan", "Garlic naan", "Parotta"],
    ["Paneer butter masala", "Dal tadka", "Chicken curry"],
    ["Coconut chutney", "Tomato chutney", "Mint chutney"],
    ["Onion raita", "Cucumber raita", "Boondi raita"],
    ["Gulab jamun", "Payasam", "Rasmalai"],
    ["Mango lassi", "Masala chai", "Virgin mojito"],
    ["Papad", "Pickle", "Sweet paan"],
  ];
  menus = [
    { id: "signature", image: "feast.jpg" },
    { id: "vegetarian", image: "vegetarian.jpg" },
    { id: "south", image: "dosa.jpg" },
    { id: "mocktails", image: "pappas-flyer.png" },
  ] as const;
  // Menu cards, Annachi-style: dish names stay in English in every language; titles come from i18n menuCardsUi.
  menuCards: {
    id: keyof Copy["menuCardsUi"]["titles"];
    image: string;
    diet: "" | "veg" | "nonveg" | "both";
    dishes: string[];
  }[] = [
    {
      id: "soup",
      image: "menu/soup.jpg",
      diet: "both",
      dishes: [
        "Chicken Soup",
        "Mutton Soup",
        "Veg Soup",
        "Mushroom Soup",
        "Sweet Corn Soup",
      ],
    },
    {
      id: "starter",
      image: "menu/starter.jpg",
      diet: "",
      dishes: [
        "Cutlet",
        "Samosa",
        "Spring Roll",
        "Bread Roll",
        "Corn Bhel",
        "Mysore Bonda",
        "Onion Pakoda",
        "Bajji",
        "Air Fryer Chickpeas",
        "Pani Puri",
        "Bhel Puri",
        "Paneer 65",
        "Mozzarella Sticks",
        "Grilled Sandwich",
        "Sandwich",
        "Mini Quiche",
      ],
    },
    {
      id: "tiffin",
      image: "menu/tiffin.jpg",
      diet: "",
      dishes: [
        "Idly",
        "Dosai",
        "Poori",
        "Pongal",
        "Vada",
        "Kesari Bhath",
        "Chappati / Roti",
        "String Hopper (Idiyappam)",
        "All Types of Sauces / Dips",
      ],
    },
    {
      id: "vegRice",
      image: "menu/veg-rice.jpg",
      diet: "veg",
      dishes: [
        "Veg Thali Meals",
        "Veg Biryani",
        "Veg Pulao",
        "Veg Fried Rice",
        "Paneer Fried Rice",
        "Jeera Rice",
      ],
    },
    {
      id: "vegSides",
      image: "menu/veg-sides.jpg",
      diet: "",
      dishes: [
        "Aloo Gobi",
        "Paneer Tikka",
        "Aloo Matar",
        "Potato Sabzi",
        "Stir-fried Carrot Beans (Poriyal)",
        "Stir-fried Spinach (Keerai Poriyal)",
        "Stir-fried Mixed Veg (Kootu Poriyal)",
        "Baby Corn Manchurian",
        "Corn Bhel",
        "Chilli Paneer",
        "Rava Dhokla",
        "Fried Potato",
        "Gobi 65",
      ],
    },
    {
      id: "nonvegRice",
      image: "menu/nonveg-rice.jpg",
      diet: "nonveg",
      dishes: [
        "Non-Veg Thali Meals",
        "Mutton Biryani",
        "Chicken Biryani",
        "Egg Biryani",
        "Fish Biryani",
        "Prawn Biryani",
        "Non-Veg Fried Rice",
      ],
    },
    {
      id: "nonvegSides",
      image: "menu/nonveg-sides.jpg",
      diet: "",
      dishes: [
        "Chicken 65",
        "Tandoori Chicken",
        "Tandoori Fish",
        "Tandoori Fish Tikka",
        "Chicken Tikka",
        "Chicken Seekh Kebab",
        "Butter Chicken",
        "Chicken / Mutton Ghee Roast",
        "Chicken / Mutton Masala",
        "Chicken / Mutton Chettinad",
        "Chicken / Mutton Fry",
        "Chicken / Mutton Kheema",
        "Non-Veg Curry (Mutton, Chicken, Fish, Prawn)",
      ],
    },
    {
      id: "breads",
      image: "menu/breads.jpg",
      diet: "",
      dishes: [
        "Plain Naan",
        "Garlic Naan",
        "Butter Naan",
        "Plain Paratha",
        "Aloo Paratha",
        "Paneer Paratha",
        "Roti",
      ],
    },
    {
      id: "curries",
      image: "menu/curries.jpg",
      diet: "",
      dishes: [
        "Dal Tadka",
        "Dal Fry",
        "Sambar",
        "Spicy Curry (Kara Kuzhambu)",
        "Buttermilk Curry (Mor Kuzhambu)",
        "Veg Kurma",
        "Dal Makhani",
        "Chana Masala",
        "Rajma Masala",
        "Paneer Tikka Masala",
        "Kaale Chane Ki Kadhi",
        "Rasam",
      ],
    },
    {
      id: "chutneys",
      image: "menu/chutneys.jpg",
      diet: "",
      dishes: [
        "Coriander Chutney",
        "Mint Chutney",
        "Tamarind Chutney",
        "Coconut Chutney",
        "Red Chilli Coconut Chutney",
        "Peanut Chutney",
      ],
    },
    {
      id: "raita",
      image: "menu/raita.jpg",
      diet: "",
      dishes: [
        "Grated Cucumber Raita",
        "Boondi Raita",
        "Onion Raita",
        "Cucumber-Tomato Raita",
      ],
    },
    {
      id: "desserts",
      image: "menu/desserts.jpg",
      diet: "",
      dishes: [
        "Gulab Jamun",
        "Rasgulla",
        "Rasmalai",
        "Bread Halwa",
        "Carrot Halwa",
        "Fig & Walnut Halwa",
        "Kheer",
        "Dry Fruits Kheer",
        "Rice Kheer",
        "Kesar Kheer",
        "Sev Kheer",
        "Fruit Custard",
        "Kulfi",
        "Ice Cream",
        "Jalebi",
        "Payasam",
        "Ladoos",
      ],
    },
    {
      id: "drinks",
      image: "menu/drinks.jpg",
      diet: "",
      dishes: [
        "Rose Milk",
        "Nannari Sarbath",
        "Lemonade",
        "Mango / Strawberry Lassi",
        "Sweet Lassi",
      ],
    },
    { id: "services", image: "menu/services.jpg", diet: "", dishes: [] },
  ];
  // Client review videos (files in public/videos/, optional poster in public/images/). The row is hidden while empty.
  reviewVideos: { file: string; poster?: string; name?: string }[] = [];
  // Approved reviews and answered questions from the API; new posts wait for approval on admin.html.
  reviews: PublicReview[] = [];
  reviewForm = {
    kind: "review" as "review" | "question",
    name: "",
    rating: 0,
    text: "",
    website: "",
  };
  reviewSending = false;
  reviewSent = false;
  reviewError: "" | "offline" | "failed" = "";

  gallery = [
    { image: "events/hero.jpg", category: "weddings" },
    { image: "events/flowers.jpg", category: "decoration" },
    { image: "events/entertainment.jpg", category: "celebrations" },
    { image: "wedding.jpg", category: "decoration" },
    { image: "events/photography.jpg", category: "photography" },
    { image: "vegetarian.jpg", category: "cuisine" },
  ] as const;
  galleryFilters = [
    "all",
    "weddings",
    "decoration",
    "photography",
    "cuisine",
  ] as const;
  serviceList = this.buildServices();
  occasionList = this.buildOccasions();
  menuList = this.buildMenus();
  galleryList = this.buildGallery();
  // "At a glance" figures are counted from the site's own data so they stay true; the last is one team.
  statTargets = [
    this.services.length,
    this.occasions.length,
    this.menuCards.length,
    1,
  ];
  statShown = this.statTargets.map(() => 0);
  // Social profiles shown in the footer. Instagram, Facebook and X are placeholders until the owner's profile links are supplied.
  socials = [
    {
      name: "WhatsApp",
      url: "https://wa.me/33652527567",
      path: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/",
      path: "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm6.1-8.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.9 8c0-1.7-.5-3.2-1.7-4.4S17.7 2 16 1.9C14.3 1.8 9.7 1.8 8 1.9c-1.7.1-3.2.5-4.4 1.7S2 6.3 1.9 8c-.1 1.7-.1 6.3 0 8 .1 1.7.5 3.2 1.7 4.4s2.7 1.6 4.4 1.7c1.7.1 6.3.1 8 0 1.7-.1 3.2-.5 4.4-1.7s1.6-2.7 1.7-4.4c.1-1.7.1-6.3 0-8Zm-2.2 9.8a3.3 3.3 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.8s-.1-4.6.4-5.8a3.3 3.3 0 0 1 1.8-1.9c1.3-.5 4.3-.4 5.9-.4s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.8 1.9c.5 1.2.4 4.2.4 5.8s.1 4.5-.4 5.8Z",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/",
      path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z",
    },
    {
      name: "X",
      url: "https://x.com/",
      path: "M17.8 2.5h3.1l-6.7 7.7 7.9 10.4h-6.2l-4.8-6.3-5.5 6.3H2.5l7.2-8.2L2.1 2.5h6.3l4.4 5.8 5-5.8Zm-1.1 16.3h1.7L7.4 4.2H5.6l11.1 14.6Z",
    },
  ];
  // Lists are rebuilt only when the language changes so *ngFor keeps stable item identities.
  private buildServices() {
    return this.services.map((s) => ({ ...s, ...this.t.services[s.id] }));
  }
  private buildOccasions() {
    return this.occasions.map((o) => ({ ...o, ...this.t.occasions[o.id] }));
  }
  private buildMenus() {
    return this.menus.map((m) => ({ ...m, ...this.t.menus[m.id] }));
  }
  private buildGallery() {
    return this.gallery.map((g, i) => ({
      ...g,
      title: this.t.galleryTitles[i],
    }));
  }
  get hero() {
    return {
      image: this.heroSlides[this.heroIndex],
      ...this.t.hero[this.heroIndex],
    };
  }
  get galleryItems() {
    return this.galleryList.filter(
      (g) => this.galleryFilter === "all" || g.category === this.galleryFilter,
    );
  }
  get reviewList() {
    return this.reviews.filter((r) => r.kind === "review");
  }
  get questionList() {
    return this.reviews.filter((r) => r.kind === "question");
  }
  get averageRating() {
    const list = this.reviewList;
    return (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(
      1,
    );
  }
  stars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }
  reviewDate(iso: string) {
    return new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  }
  get serviceDetail() {
    return this.serviceList.find((s) => s.id === this.serviceId);
  }
  serviceName(id: string, copy = this.t) {
    return copy.services[id as keyof Copy["services"]]?.name ?? id;
  }
  occasionName(id: string, copy = this.t) {
    return id === "other"
      ? copy.occasionsUi.other
      : (copy.occasions[id as keyof Copy["occasions"]]?.name ?? id);
  }
  menuName(id: string, copy = this.t) {
    return copy.menus[id as keyof Copy["menus"]]?.name ?? "";
  }
  get selectedServiceNames() {
    return this.selectedServices.map((id) => this.serviceName(id)).join(", ");
  }
  get whatsapp() {
    const m = this.t.whatsappMessage;
    return (
      "https://wa.me/33652527567?text=" +
      encodeURIComponent(
        m.hello +
          "\n" +
          m.occasion +
          ": " +
          this.occasionName(this.form.event) +
          "\n" +
          m.services +
          ": " +
          this.selectedServiceNames +
          "\n" +
          m.guests +
          ": " +
          this.form.guests +
          "\n" +
          m.date +
          ": " +
          this.form.date +
          "\n" +
          m.location +
          ": " +
          this.form.location +
          "\n" +
          m.menu +
          ": " +
          this.menuName(this.selectedMenu) +
          "\n" +
          m.name +
          ": " +
          this.form.name +
          "\n" +
          m.email +
          ": " +
          this.form.email +
          "\n" +
          m.phone +
          ": " +
          this.form.phone +
          "\n" +
          m.notes +
          ": " +
          this.form.message,
      )
    );
  }
  openWhatsApp(message: string): void {
    // Use the same Pappa's Events contact number shown in the header and contact section.
    //const phoneNumber = "919080343044";
    const phoneNumber = "33652527567";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.assign(whatsappUrl);
  }

  // Enquiry calendar: weeks start on Monday (France); names come from Intl in the active language.
  calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  weekdays: string[] = [];
  calDays: ({
    iso: string;
    day: number;
    past: boolean;
    today: boolean;
    weekend: boolean;
    label: string;
  } | null)[] = [];
  calTitle = "";
  private get locale() {
    return LOCALES[this.lang];
  }
  private buildCalendar() {
    const y = this.calMonth.getFullYear(),
      m = this.calMonth.getMonth(),
      lead = (this.calMonth.getDay() + 6) % 7,
      count = new Date(y, m + 1, 0).getDate();
    const label = new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    this.calTitle = new Intl.DateTimeFormat(this.locale, {
      month: "long",
      year: "numeric",
    }).format(this.calMonth);
    this.weekdays = Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(this.locale, { weekday: "short" }).format(
        new Date(2024, 0, 1 + i),
      ),
    );
    this.calDays = [
      ...Array(lead).fill(null),
      ...Array.from({ length: count }, (_, i) => {
        const d = new Date(y, m, i + 1),
          iso = d.toLocaleDateString("en-CA");
        return {
          iso,
          day: i + 1,
          past: iso < this.today,
          today: iso === this.today,
          weekend: d.getDay() === 0 || d.getDay() === 6,
          label: label.format(d),
        };
      }),
    ];
  }
  get canPrevMonth() {
    const now = new Date();
    return this.calMonth > new Date(now.getFullYear(), now.getMonth(), 1);
  }
  moveMonth(delta: number) {
    this.calMonth = new Date(
      this.calMonth.getFullYear(),
      this.calMonth.getMonth() + delta,
      1,
    );
    this.buildCalendar();
  }
  pickDate(iso: string) {
    this.form.date = iso;
  }
  syncCalendar(iso: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || iso < this.today) return;
    const [y, m] = iso.split("-").map(Number);
    this.calMonth = new Date(y, m - 1, 1);
    this.buildCalendar();
  }
  get selectedDateLabel() {
    if (!this.form.date) return "";
    const [y, m, d] = this.form.date.split("-").map(Number);
    return new Intl.DateTimeFormat(this.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  }
  focusForm() {
    const input = document.querySelector<HTMLInputElement>(
      ".form-wrap input[name=name]",
    );
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
  }
  constructor() {
    const saved = readStore(STORE.lang) as Lang | null;
    this.setLang(saved && saved in COPY ? saved : "fr", false);
    this.theme =
      document.documentElement.dataset["theme"] === "dark" ? "dark" : "light";
  }
  setLang(lang: Lang, remember = true) {
    this.lang = lang;
    this.t = COPY[lang];
    this.serviceList = this.buildServices();
    this.occasionList = this.buildOccasions();
    this.menuList = this.buildMenus();
    this.galleryList = this.buildGallery();
    this.buildCalendar();
    document.documentElement.lang = lang;
    document.title = this.t.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", this.t.meta.description);
    if (remember) writeStore(STORE.lang, lang);
  }
  toggleTheme() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset["theme"] = this.theme;
    writeStore(STORE.theme, this.theme);
  }
  ngAfterViewInit() {
    this.startTracks();
    this.animateLogo();
    const card = document.querySelector(".stats-card");
    if (
      !card ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTimeout(() => (this.statShown = [...this.statTargets]));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / 1400),
            ease = 1 - Math.pow(1 - p, 3);
          this.statShown = this.statTargets.map((v) => Math.round(v * ease));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(card);
  }
  ngOnInit() {
    // This version sends form submissions directly to WhatsApp; no backend API is used.
    this.apiConnected = false;
    this.startHero();
  }
  setReviewKind(kind: "review" | "question") {
    this.reviewForm.kind = kind;
    this.reviewSent = false;
    this.reviewError = "";
  }
  submitReview() {
    this.reviewError = "";

    // Ignore automated submissions caught by the hidden honeypot field.
    if (this.reviewForm.website) return;

    const kindLabel = this.reviewForm.kind === "review" ? "Review" : "Question";
    const message = [
      `Pappa's Events - New ${kindLabel}`,
      `Name: ${this.reviewForm.name}`,
      ...(this.reviewForm.kind === "review"
        ? [`Rating: ${this.reviewForm.rating}/5`]
        : []),
      `${kindLabel}: ${this.reviewForm.text}`,
    ].join("\n");

    // Redirect directly to WhatsApp. No backend API/database request.
    this.openWhatsApp(message);
  }
  changeHero(delta: number) {
    this.heroIndex =
      (this.heroIndex + delta + this.heroSlides.length) %
      this.heroSlides.length;
  }
  // Auto-advance the hero every 2s (matches the .hero-progress fill); paused on hover and for reduced motion.
  startHero() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.heroTimer = setInterval(() => {
      if (!this.heroPaused && !document.hidden) this.changeHero(1);
    }, 2000);
  }
  pauseHero(paused: boolean) {
    this.heroPaused = paused;
  }
  // Service and Vin d'honneur cards advance one card every 3.5s and loop; paused while hovered, focused or recently touched.
  private trackTimer?: ReturnType<typeof setInterval>;
  startTracks() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracks = Array.from(
      document.querySelectorAll<HTMLElement>(".auto-track"),
    );
    let touched = 0;
    tracks.forEach((el) =>
      el.addEventListener("pointerdown", () => (touched = Date.now())),
    );
    this.trackTimer = setInterval(() => {
      if (document.hidden || Date.now() - touched < 8000) return;
      for (const el of tracks) {
        const card = el.firstElementChild as HTMLElement | null;
        if (
          !card ||
          el.matches(":hover") ||
          el.contains(document.activeElement)
        )
          continue;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5)
          el.scrollTo({ left: 0, behavior: "smooth" });
        else
          el.scrollBy({
            left:
              card.offsetWidth +
              parseFloat(getComputedStyle(el).columnGap || "0"),
            behavior: "smooth",
          });
      }
    }, 3500);
  }
  // The logo in the about seal replays its entrance each time it scrolls into view, and tilts with scroll speed while visible.
  animateLogo() {
    const seal = document.querySelector<HTMLElement>(".about-seal");
    if (!seal || !("IntersectionObserver" in window)) return;
    let visible = false,
      last = scrollY,
      reset: ReturnType<typeof setTimeout> | undefined;
    new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          visible = e.isIntersecting;
          seal.classList.toggle("in", visible);
        }),
      { threshold: 0.5 },
    ).observe(seal);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    addEventListener(
      "scroll",
      () => {
        const delta = scrollY - last;
        last = scrollY;
        if (!visible) return;
        seal.style.setProperty(
          "--tilt",
          Math.max(-28, Math.min(28, delta * 1.4)) + "deg",
        );
        clearTimeout(reset);
        reset = setTimeout(() => seal.style.setProperty("--tilt", "0deg"), 140);
      },
      { passive: true },
    );
  }
  ngOnDestroy() {
    clearInterval(this.heroTimer);
    clearInterval(this.trackTimer);
  }
  @HostListener("window:scroll") onScroll() {
    this.scrolled = window.scrollY > 30;
  }
  toggleService(id: string) {
    this.selectedServices = this.selectedServices.includes(id)
      ? this.selectedServices.filter((s) => s !== id)
      : [...this.selectedServices, id];
    this.formError = "";
  }
  addService(id: string) {
    if (!this.selectedServices.includes(id))
      this.selectedServices = [...this.selectedServices, id];
    this.closeDialog();
    this.goToEnquiry();
  }
  goToEnquiry() {
    document
      .getElementById("enquire")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }
  chooseMenu() {
    if (!this.selectedServices.includes("catering"))
      this.selectedServices = [...this.selectedServices, "catering"];
    this.goToEnquiry();
  }
  scrollTrack(id: string, delta: number) {
    const el = document.getElementById(id),
      card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step =
        card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0"),
      end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    el.scrollTo({
      left:
        delta > 0 && end
          ? 0
          : delta < 0 && el.scrollLeft < 5
            ? el.scrollWidth
            : el.scrollLeft + delta * step,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  private previousFocus: HTMLElement | null = null;
  openDialog(kind: string, value: string) {
    this.previousFocus = document.activeElement as HTMLElement;
    if (kind === "service") this.serviceId = value;
    else if (kind === "vin") this.vinIndex = Number(value);
    else this.lightbox = value;
    document.body.style.overflow = "hidden";
    setTimeout(() =>
      document.querySelector<HTMLButtonElement>(".dialog-close")?.focus(),
    );
  }
  closeDialog() {
    this.lightbox = null;
    this.serviceId = null;
    this.vinIndex = null;
    document.body.style.overflow = "";
    this.previousFocus?.focus();
  }
  @HostListener("document:keydown", ["$event"]) dialogKeys(
    event: KeyboardEvent,
  ) {
    if (event.key === "Escape") {
      if (this.lightbox || this.serviceId || this.vinIndex !== null)
        this.closeDialog();
    }
    if (
      event.key === "Tab" &&
      (this.lightbox || this.serviceId || this.vinIndex !== null)
    ) {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(".modal button,.modal a[href]"),
      ).filter((el) => el.offsetParent !== null);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }
  submit() {
    this.formError = "";

    if (!this.selectedServices.length) {
      this.formError = "service";
      return;
    }
    if (!this.form.consent) {
      this.formError = "consent";
      return;
    }
    if (this.form.date < this.today) {
      this.formError = "date";
      return;
    }
    window.location.assign(this.whatsapp);
  }
}
