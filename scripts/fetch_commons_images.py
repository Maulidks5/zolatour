#!/usr/bin/env python3
"""Download appropriately licensed, non-AI travel photos from Wikimedia Commons."""

import json
import pathlib
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "experiences"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "ZolaToursAndSafaris/1.0 (website image preparation)"

SEARCHES = {
    "hero-zanzibar": "Zanzibar beach ocean",
    "hero-ocean": "Zanzibar dhow ocean",
    "hero-safari": "Tanzania safari elephant",
    "prison-island": "Prison Island Zanzibar tortoise",
    "safari-blue": "Zanzibar traditional dhow",
    "mnemba-island": "tropical coral reef snorkeling",
    "fishing-game-tour": "deep sea fishing Indian Ocean",
    "snapper-fishing": "red snapper fishing boat",
    "jozani-forest": "Jozani red colobus Zanzibar",
    "nungwi-aquarium": "sea turtle sanctuary",
    "salaam-cave": "cave swimming hole",
    "mangapwani-coral-cave": "Mangapwani cave Zanzibar",
    "butterfly-tour": "tropical butterfly nature",
    "spice-tour": "Zanzibar spice farm",
    "village-tour": "Zanzibar local street",
    "swahili-cooking-class": "Swahili cuisine food",
    "kendwa-beach": "Kendwa beach Zanzibar",
    "the-rock-restaurant": "The Rock Restaurant Zanzibar",
    "glass-kayaking": "sea kayaking tropical ocean",
    "stand-up-paddleboarding": "paddleboarding ocean",
    "kitesurfing": "kitesurfing ocean beach",
    "spearfishing": "spearfishing ocean",
    "jet-ski-adventure": "jet ski ocean",
    "water-sports-tour": "water sports beach ocean",
    "tanzania-safaris": "Serengeti Tanzania safari wildlife",
    "cta-zanzibar": "Zanzibar sunset beach",
}


def api(params):
    url = API + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 5:
                raise
            time.sleep(10 * (attempt + 1))


def choose_image(term):
    data = api({
        "action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {term}",
        "gsrnamespace": 6, "gsrlimit": 15, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": 1800, "format": "json", "formatversion": 2,
    })
    candidates = []
    for page in data.get("query", {}).get("pages", []):
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        width, height = info.get("width", 0), info.get("height", 0)
        mime = info.get("mime", "")
        text = " ".join([page.get("title", ""), meta.get("ImageDescription", {}).get("value", "")]).lower()
        if width < 1200 or height < 700 or width <= height or mime not in {"image/jpeg", "image/png", "image/webp"}:
            continue
        if any(word in text for word in ("illustration", "drawing", "painting", "generated", "artificial intelligence", "logo", "map")):
            continue
        license_name = meta.get("LicenseShortName", {}).get("value", "")
        if not license_name or "copyrighted" in license_name.lower():
            continue
        candidates.append((page, info, meta))
    if not candidates:
        raise RuntimeError(f"No suitable landscape photograph found for {term}")
    return candidates[0]


def clean(value):
    return re.sub(r"<[^>]+>", "", value or "").strip()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = OUT / "ATTRIBUTION.json"
    records = json.loads(manifest.read_text()) if manifest.exists() else []
    completed = {record["usage"] for record in records}
    for slug, term in SEARCHES.items():
        if slug in completed:
            print(f"Already downloaded {slug}", flush=True)
            continue
        print(f"Finding {slug}: {term}", flush=True)
        page, info, meta = choose_image(term)
        source_url = info.get("thumburl") or info["url"]
        extension = ".jpg" if info.get("mime") == "image/jpeg" else pathlib.Path(urllib.parse.urlparse(source_url).path).suffix.lower()
        if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
            extension = ".jpg"
        target = OUT / f"{slug}{extension}"
        request = urllib.request.Request(source_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(request, timeout=90) as response:
            target.write_bytes(response.read())
        records.append({
            "file": target.relative_to(ROOT).as_posix(), "usage": slug, "search": term,
            "commons_title": page["title"], "source": info.get("descriptionurl"),
            "author": clean(meta.get("Artist", {}).get("value")),
            "license": clean(meta.get("LicenseShortName", {}).get("value")),
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
        })
        manifest.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
        time.sleep(1.5)
    print(f"Downloaded {len(records)} real photographs to {OUT}")


if __name__ == "__main__":
    main()
