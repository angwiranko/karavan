# Google Apps Script beállítás a Starfort felülethez

Az alábbi lépések azt mutatják be, hogyan tudod engedélyezni, hogy a `starfort.html` oldalról közvetlenül szerkeszd a kapcsolódó Google Sheet-et.

## 1. Apps Script projekt létrehozása
1. Nyisd meg a Google Sheet-et, amelyet jelenleg adatforrásként használsz.
2. A menüsorban válaszd a **Bővítmények → Apps Script** lehetőséget. Ez megnyit egy új Apps Script projektet, amely automatikusan ehhez a táblázathoz kapcsolódik.

## 2. A webhook kód bemásolása
1. Töröld a `Code.gs` alapértelmezett tartalmát.
2. Nyisd meg a repóban található [`apps-script/starfort_webhook.gs`](apps-script/starfort_webhook.gs) fájlt, és másold át a teljes tartalmát az Apps Script szerkesztőbe.
3. A fájl tetején állítsd be a `CONFIG.sheetName` értékét arra a munkalapra, amelyben a Starfort adatai találhatók (alapértelmezés: `Starfort`).
4. Ha a Google Sheet-ben eltérő fejlécneveket használsz, bővítsd a `CONFIG.headerSynonyms` objektumot további elnevezésekkel. A script automatikusan felismeri a `location`, `sector`, `category`, `item`, `status` és `updatedAt` oszlopokat.

## 3. Mit intéz a script automatikusan?
- **Hozzáadás (`add-item`)** – új sort hoz létre (vagy frissíti a meglévőt) az `itemId` alapján, és kitölti a helyszín/szektor/kategória metaadatokat, valamint az `updatedAt` időbélyeget, ha létezik ilyen oszlop.
- **Státusz frissítése (`update-status`)** – megkeresi az `itemId`-hez tartozó sort, átírja a státuszt `info`/`insider` értékre, és opcionálisan időbélyeget ment az `updatedAt` oszlopba.
- **Törlés (`remove-item`)** – az `itemId`-t használva beazonosítja a sort, majd eltávolítja a munkalapról.

A webes felület minden kérésnél elküldi a helyszín, szektor és kategória nevét, illetve sorrendjét, így a táblázatban lévő oszlopokat nem kell kézzel módosítanod. Elég, ha a fejlécben szerepelnek a megfelelő mezők (például `Location`, `Sector`, `Kategória`, `Tartalom`, `Státusz`, `Item ID`).

## 4. Webalkalmazásként történő publikálás
1. Kattints a **Deploy → New deployment** menüpontra.
2. A megjelenő ablakban válaszd a **Web app** típust.
3. Adj meg egy tetszőleges leírást, majd az **Execute as** résznél hagyd `Me` beállításon.
4. A **Who has access** opciót állítsd `Anyone with the link` értékre.
5. Kattints a **Deploy** gombra, és ha szükséges, engedélyezd a script hozzáférését a Google fiókodban.
6. A publikálás végén kapsz egy URL-t – másold ki ezt, és illeszd be a `starfort.html` fájl `SHEET_API_URL` konstansához.

## 5. A kapcsolat tesztelése
1. Frissítsd a `starfort.html` oldalt a böngésződben.
2. Próbálj meg egy új elemet hozzáadni vagy meglévőt törölni. A felület a megadott webhook URL-re küld JSON alapú kéréseket (`action`, `itemId`, stb.).
3. Ellenőrizd a Google Sheet-ben, hogy megjelent-e a módosítás. Hibás válasz esetén a felület visszaállítja a változtatást és figyelmeztetést jelenít meg.

## 6. Jogosultságok finomhangolása (opcionális)
Ha nem szeretnéd, hogy bárki, aki ismeri az URL-t, módosítsa a táblázatot, limitálhatod a hozzáférést "Anyone within <szervezet>" szintre, vagy készíthetsz egy biztonsági réteget (például API-kulcs ellenőrzését) a `doPost` függvény elején.

---
Ezekkel a lépésekkel beállíthatod a Google Apps Script Web App-ot, és a `SHEET_API_URL` kitöltésével engedélyezheted az írási műveleteket a Starfort felületről.
