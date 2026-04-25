# 🚋 BKK Villamos Monitor (2 & 2B)

Egy valós idejű térképes webalkalmazás és terminálos Python szkript a budapesti 2-es és 2B villamosok követésére a Müpa és a Közvágóhíd megállókból, **Jászai Mari tér irányába**. 

Mivel a hagyományos térképalkalmazások gyakran nem kezelik elég jól az alternatív járatok (pl. 2-es vs. 2B) közti optimális választást ezen a szakaszon, ez az app egy dedikált felületen mutatja meg a közeledő járatokat. Így mindig tudni fogod, hogy melyik megállóba érdemesebb sétálni a leggyorsabb eljutás érdekében.

## ✨ Funkciók
* **Valós idejű térkép:** Élő GPS pozíciók és haladási irány a térképen.
* **Intelligens időkalkuláció:** Kijelzi a pontos érkezési időket (ETA). Még azokat a járatokat is listázza tervezett időponttal, amelyek még bent állnak a végállomáson és nincs élő GPS jelük.
* **Reszponzív dizájn:** Mobilon Apple Maps-szerű, alul lapozható (snap) kártyákkal működik, asztali gépen pedig letisztult oldalsó panellel.
* **Python CLI kliens:** A webapp mellett egy egyszerű terminálos szkript is elérhető a gyors lekérdezésekhez.

## 🛠 Használt Technológiák
* **Frontend:** [Next.js](https://nextjs.org/) (App Router), React
* **Térkép:** [React Leaflet](https://react-leaflet.js.org/) & [Leaflet.js](https://leafletjs.com/)
* **Stílus:** Custom CSS (Modern, Apple-szerű UI, üveg effektekkel)
* **Adatforrás:** [BKK FUTÁR (Open Data) API](https://bkk.hu/fejlesztenel/nyilt-adatok/)
* **CLI Eszköz:** Python 3

## 📂 Projekt Struktúra

A projekt két fő részre oszlik: a `villamos-monitor` Next.js alkalmazásra és a gyökérkönyvtárban lévő `app.py` szkriptre.

```text
MAPSAPP/
├── .env                  # A Python szkript környezeti változói
├── app.py                # Terminálos Python kliens (csak ETA-t ír ki)
└── villamos-monitor/     # A Next.js Webalkalmazás mappája
    ├── .env.local        # A Next.js app környezeti változói
    ├── package.json      # Node.js függőségek
    ├── src/
    │   └── app/
    │       ├── api/trams/route.js # BKK API lekérdezések és adatfeldolgozás
    │       ├── globals.css        # Globális stílusok és reszponzív UI
    │       ├── layout.js          # Next.js layout
    │       ├── MapComponent.jsx   # A térkép és a kártyák React komponense
    │       └── page.js            # Főoldal
```

## 🚀 Telepítés és Futtatás

### 1. Előfeltételek
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.8+)
* BKK API Kulcs (igényelhető a BKK fejlesztői portálján)

### 2. Környezeti változók beállítása (.env)
A projekt két különálló környezeti fájlt használ. Mindkettőben ugyanúgy kell megadni az API kulcsot.

Hozd létre a `villamos-monitor/.env.local` fájlt a Next.js-hez:
```env
BKK_API_KEY=ide_ird_a_bkk_api_kulcsodat
```

Hozd létre a gyökérkönyvtárban a `.env` fájlt a Python szkripthez:
```env
BKK_API_KEY=ide_ird_a_bkk_api_kulcsodat
```

### 3. A Webalkalmazás futtatása (Next.js)

Lépj be a webalkalmazás mappájába, majd telepítsd a függőségeket:
```bash
cd villamos-monitor
npm install
```

**Fejlesztői környezetben (Development):**
Ez a parancs elindítja a dev servert, ami automatikusan frissül, ha módosítod a kódot.
```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000)

