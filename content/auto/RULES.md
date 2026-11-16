# Automatické zkušební reely – pravidla

Účet: Instagram @ondrej_zemanek_finance (Metricool brand id **8031800**, timezone Europe/Prague).
Cílovka: 20–25 let, téma kariéra / podnikání / finance. Cíl: leady pro nábor (komentář s klíčovým slovem).

## Každý den
- **2 reely denně**: 09:30 a 18:00 (Europe/Prague), `autoPublish: true`, **jedním příspěvkem na Instagram (TRIAL_REEL) i TikTok** (@ondrej.zemanek_finance, veřejně).
- **Bez štítku AI** (`isAiGenerated: false`) – výslovné přání majitele účtu.
- Témata vybírej z `TOPICS.md`, nikdy neopakuj téma z posledních 14 dní (`log.md`).
- Jeden reel kariéra/mindset, druhý finance v číslech s kariérním úhlem (střídej).

## Formát videa (AutoReel)
- Spec v `content/auto/specs/YYYY-MM-DD-<a|b>-<slug>.json`, `audio`: `auto/<id>.wav`.
- 4–6 scén, celkem **18–35 s** (540–1050 snímků při 30 fps).
- 1. scéna = háček typu `slam` nebo `counter`, max ~8 slov, okamžitě čitelný (žádné pomalé intro).
- Poslední scéna = `cta` s klíčovým slovem v komentáři (START, NÁPAD, TÝM, PLÁN, KARIÉRA, INFO – střídej).
- Texty VERZÁLKAMI, česky s diakritikou. Řádek v `slam` max ~16 znaků při size 100, ~24 znaků při size 70.
- `list`: 3–5 položek, každá max ~32 znaků. `compare`: 3–4 položky na stranu, max ~22 znaků.
- Doporučené délky scén: slam 70–90, counter 110–130, list 30 + 16×položky + 30, compare 130–150, bars 120–140, cta 150.
- Render: `scripts/auto_render.sh <spec>` → `published/auto/<id>.mp4` + náhled `out/sheet-<id>.jpg`.
- **Vždy si prohlédni náhled** (Read na sheet) – žádný přetékající text, nic mimo obraz. Když něco nesedí, uprav spec a renderuj znovu.

## Bezpečnost (ČNB, pověst)
- Žádné sliby výdělku, žádné konkrétní příjmy. Kdekoli je řeč o příjmu/kariéře, do `foot` nebo popisku:
  „Spolupráce na živnostenský list. Příjem závisí na výkonu a není zaručen.“
- Investice/penze: „Modelový výpočet. Nejde o investiční doporučení. Výnos není zaručen.“
- **Žádná nová čísla bez zdroje.** Používej fakta z `TOPICS.md`, nebo nové číslo ověř přes WebSearch na oficiálním/renomovaném zdroji (ČSÚ, ČSSZ, MPSV, ČNB, APS ČR, studie) a uveď zdroj ve `foot` i v popisku.
- Nepoužívej interní čísla z kariérního plánu Partners (€/BJ, objemy BJ, minimální roční příjem).
- Nejmenuj jiné lidi ani konkurenci. Neslibuj „zbohatnutí“, „pasivní příjem“, „jistotu“.

## Popisek (caption)
1. řádek = háček (stejná myšlenka jako 1. scéna). Pak 3–6 krátkých řádků obsahu.
CTA: „Napiš do komentáře <SLOVO> 👇“. Poté případný disclaimer/zdroj. Na konec **přesně 5 hashtagů** (s `#`).

## Metricool – createScheduledPost
`blogId` "8031800", `date` ISO s offsetem Prahy, `info` JSON:
```json
{"autoPublish": true, "draft": false, "text": "<caption>", "firstCommentText": "",
 "media": ["https://raw.githubusercontent.com/ardno100-ops/ond-ej-reels/main/published/auto/<id>.mp4"],
 "providers": [{"network": "instagram"}, {"network": "tiktok"}],
 "publicationDate": {"dateTime": "YYYY-MM-DDT09:30:00", "timezone": "Europe/Prague"},
 "instagramData": {"type": "TRIAL_REEL", "showReelOnFeed": true, "isAiGenerated": false},
 "tiktokData": {"title": "<háček, max ~80 znaků + 1 emoji>", "disableComment": false, "disableDuet": false, "disableStitch": false,
   "privacyOption": "PUBLIC_TO_EVERYONE", "commercialContentThirdParty": false, "commercialContentOwnBrand": true, "autoAddMusic": false, "isAigc": false},
 "shortener": false, "smartLinkData": {"ids": []}, "descendants": [], "hasNotReadNotes": false, "mediaAltText": []}
```
TikTok **vyžaduje `tiktokData.title`** (jinak chyba „TikTok title is required“). `commercialContentOwnBrand: true` = označení „Vaše značka“ (propagace vlastního byznysu).
Video musí být **pushnuté na `main` dřív**, než se plánuje (Metricool si ho stahuje z raw URL).

## Log
Po naplánování připiš do `log.md`: datum, čas, id, téma, klíčové slovo, plannerUrl. Commit + push na `main`.
