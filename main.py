# ─── GermanLink Business – eBay Import Backend ───────────────────────────────
# Datei: main.py
# Speicherort: C:\Users\jerem\OneDrive\Desktop\germanlinkbusiness\main.py
#
# Starten mit:
#   uvicorn main:app --reload --port 8000

import re
import json
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="GermanLink Business – eBay Import API")

# ── CORS: erlaubt Anfragen vom Vite Dev Server ────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://germanlinkbusiness.vercel.app",  # falls du auf Vercel hostest
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request/Response Modelle ──────────────────────────────────────────────────
class ImportRequest(BaseModel):
    url: str

class SaveRequest(BaseModel):
    source: str
    source_url: str
    base_price: float
    glb_price: float
    currency: str
    category: str
    images: list
    translations: dict

# ── HTTP Headers (imitiert Browser) ──────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── URL Validierung ───────────────────────────────────────────────────────────
EBAY_PATTERN = re.compile(r"https?://(www\.)?ebay\.[a-z.]{2,6}/itm/\d+", re.IGNORECASE)

def validate_url(url: str) -> str:
    url = url.strip()
    if not EBAY_PATTERN.match(url):
        raise HTTPException(status_code=400, detail=f"Ungültige eBay-URL: {url}")
    # Query-Parameter entfernen
    return url.split("?")[0]

# ── Preis parsen ──────────────────────────────────────────────────────────────
def parse_price(text: str) -> float:
    cleaned = re.sub(r"[^\d.,]", "", text)
    if "," in cleaned and "." in cleaned:
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "," in cleaned:
        cleaned = cleaned.replace(",", ".")
    return float(cleaned)

def extract_currency(text: str) -> str:
    if "€" in text or "EUR" in text:
        return "EUR"
    if "$" in text or "USD" in text:
        return "USD"
    return "EUR"

# ── Bilder extrahieren ────────────────────────────────────────────────────────
def extract_images(soup: BeautifulSoup) -> list:
    images = []

    # Strategie 1: data-zoom-src
    for img in soup.find_all("img", {"data-zoom-src": True}):
        src = img.get("data-zoom-src", "").strip()
        if src and src.startswith("http"):
            images.append(src)

    # Strategie 2: Galerie
    if not images:
        for img in soup.select("div.ux-image-carousel-item img"):
            src = img.get("data-src") or img.get("src", "")
            if src and "ebayimg.com" in src:
                images.append(src)

    # Strategie 3: JSON-LD
    if not images:
        for script in soup.find_all("script", {"type": "application/ld+json"}):
            try:
                data = json.loads(script.string or "")
                ld_images = data.get("image", [])
                if isinstance(ld_images, str):
                    ld_images = [ld_images]
                images.extend([i for i in ld_images if i.startswith("http")])
            except Exception:
                continue

    # Strategie 4: Alle ebayimg.com Bilder
    if not images:
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if "ebayimg.com" in src and src.startswith("http"):
                images.append(src)

    # Duplikate entfernen
    seen = set()
    unique = []
    for url in images:
        if url not in seen:
            seen.add(url)
            unique.append(url)

    return unique[:8]  # max 8 Bilder

# ── HTML parsen ───────────────────────────────────────────────────────────────
def parse_ebay(html: str, source_url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    # Titel
    title = ""
    title_tag = (
        soup.find("h1", class_=re.compile(r"x-item-title", re.I))
        or soup.find("h1", attrs={"itemprop": "name"})
        or soup.find("h1")
    )
    if title_tag:
        title = " ".join(title_tag.get_text().split()).strip()

    if not title:
        page_title = soup.find("title")
        if page_title:
            title = re.sub(r"\s*\|?\s*eBay.*$", "", page_title.get_text(), flags=re.I).strip()

    if not title:
        raise HTTPException(status_code=422, detail="Titel konnte nicht extrahiert werden.")

    # Beschreibung
    description = ""
    meta_desc = soup.find("meta", {"name": "description"})
    if meta_desc:
        description = meta_desc.get("content", "").strip()
    if not description:
        description = title

    # Preis
    base_price = None
    currency = "EUR"

    price_tag = soup.find(attrs={"itemprop": "price"})
    if price_tag:
        try:
            base_price = float(str(price_tag.get("content", "")).replace(",", "."))
        except Exception:
            pass

    if base_price is None:
        for selector in ["span.x-price-primary", "span#prcIsum", "span.notranslate"]:
            el = soup.select_one(selector)
            if el:
                try:
                    text = el.get_text()
                    base_price = parse_price(text)
                    currency = extract_currency(text)
                    break
                except Exception:
                    continue

    if base_price is None:
        for script in soup.find_all("script", {"type": "application/ld+json"}):
            try:
                data = json.loads(script.string or "")
                offers = data.get("offers", {})
                if isinstance(offers, list) and offers:
                    offers = offers[0]
                base_price = float(str(offers.get("price", "")).replace(",", "."))
                currency = offers.get("priceCurrency", "EUR")
                break
            except Exception:
                continue

    if base_price is None:
        raise HTTPException(status_code=422, detail="Preis konnte nicht extrahiert werden.")

    # Kategorie
    category = "Sonstiges"
    breadcrumb = soup.find("nav", {"aria-label": re.compile(r"breadcrumb", re.I)})
    if breadcrumb:
        crumbs = breadcrumb.find_all("a")
        if crumbs:
            category = " ".join(crumbs[-1].get_text().split()).strip()

    # Bilder
    images = extract_images(soup)

    # GLB Preis (+20%)
    glb_price = round(base_price * 1.20, 2)

    return {
        "title": title,
        "description": description,
        "base_price": round(base_price, 2),
        "glb_price": glb_price,
        "currency": currency,
        "category": category,
        "images": images,
        "source_url": source_url,
    }

# ── Übersetzung via MyMemory (kostenlos, kein API-Key) ────────────────────────
def translate(text: str, source: str, target: str) -> str:
    if not text or not text.strip():
        return text
    try:
        # MyMemory API – kostenlos bis 5000 Zeichen/Tag
        r = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text[:500], "langpair": f"{source}|{target}"},
            timeout=10,
        )
        data = r.json()
        translated = data.get("responseData", {}).get("translatedText", "")
        if translated and translated.upper() != text.upper():
            return translated
    except Exception:
        pass
    return text  # Fallback: Original

def translate_to_lingala(text: str) -> str:
    """
    Einfache Lingala-Übersetzung via Wörterbuch-Ersetzung.
    Für bessere Qualität: OpenAI oder Google Translate API einbinden.
    """
    word_map = {
        "tracteur": "masini ya bilanga",
        "tractor": "masini ya bilanga",
        "traktor": "masini ya bilanga",
        "voiture": "motuka",
        "auto": "motuka",
        "car": "motuka",
        "téléphone": "telefone",
        "phone": "telefone",
        "ordinateur": "ordinatɛrɛ",
        "laptop": "ordinatɛrɛ ya mikolo",
        "maison": "ndako",
        "house": "ndako",
        "bon": "malamu",
        "good": "malamu",
        "nouveau": "ya sika",
        "new": "ya sika",
        "utilisé": "esalelaki",
        "used": "esalelaki",
        "prix": "ntalo",
        "price": "ntalo",
        "livraison": "kobɔkɔlɔ",
        "delivery": "kobɔkɔlɔ",
        "qualité": "bolamu",
        "quality": "bolamu",
        "europe": "Eropɛ",
        "allemagne": "Alemani",
        "germany": "Alemani",
        "diesel": "mazutu",
        "essence": "esansi",
    }
    result = text.lower()
    for fr_word, ln_word in word_map.items():
        result = result.replace(fr_word, ln_word)
    return result if result != text.lower() else f"[LN] {text[:100]}"

# ── API Endpunkte ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "GermanLink Business eBay Import API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/import-ebay")
def import_ebay(req: ImportRequest):
    """
    Hauptendpunkt: eBay URL → strukturiertes Produkt-JSON
    """
    # 1. URL validieren
    clean_url = validate_url(req.url)

    # 2. HTML abrufen
    try:
        response = requests.get(clean_url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"eBay nicht erreichbar: {e}")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="eBay-Seite antwortet nicht (Timeout)")
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    # 3. HTML parsen
    data = parse_ebay(response.text, clean_url)

    # 4. Übersetzungen erstellen
    title_de = data["title"]
    desc_de = data["description"]

    title_fr = translate(title_de, "de", "fr")
    desc_fr = translate(desc_de, "de", "fr")

    title_ln = translate_to_lingala(title_fr)
    desc_ln = translate_to_lingala(desc_fr)

    # 5. Fertiges Payload zurückgeben
    return {
        "source": "ebay",
        "source_url": clean_url,
        "base_price": data["base_price"],
        "glb_price": data["glb_price"],
        "currency": data["currency"],
        "category": data["category"],
        "images": data["images"],
        "translations": {
            "de": {"title": title_de, "description": desc_de},
            "fr": {"title": title_fr, "description": desc_fr},
            "ln": {"title": title_ln, "description": desc_ln},
        },
    }

@app.post("/api/products")
def save_product(product: SaveRequest):
    """
    Produkt speichern – hier kannst du Supabase einbinden.
    Aktuell gibt es nur eine Bestätigung zurück.
    """
    print(f"[GLB] Produkt gespeichert: {product.source_url}")
    # TODO: Supabase Python Client einbinden:
    # from supabase import create_client
    # supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    # supabase.table("products").insert(product.dict()).execute()
    return {"status": "saved", "source_url": product.source_url}
