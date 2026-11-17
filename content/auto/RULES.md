# Automatické zkušební reely – pravidla

> **Nejdřív si přečti `content/auto/PLAYBOOK.md`** – data z minulých videí mají přednost před tímto souborem.

Účet: Instagram @ondrej_zemanek_finance (Metricool brand id **8031800**, timezone Europe/Prague).
Cílovka: 20–25 let, téma kariéra / podnikání / finance. Cíl: leady pro nábor (komentář s klíčovým slovem).

## Každý den
- **2 reely denně**: 09:30 a 18:00 (Europe/Prague).
  - **TikTok** (@ondrej.zemanek_finance): automaticky přes Metricool, `autoPublish: true`, providers jen `tiktok`.
  - **Instagram: RUČNĚ (od 17. 11.)** – majitel postuje sám, aby mohl přidat trendující písničku. Přes Metricool na IG NIC neplánuj.
    Ke každému videu ulož popisek do `content/auto/captions/<id>.md` (popisek + 5 hashtagů + doporučená trendující písnička pro IG i TT).
    V 9:25 a 17:55 se spouští úloha, která majiteli pošle video (SendUserFile) + popisek ke zkopírování + upozornění.
- **Bez štítku AI** (`isAiGenerated: false`) – výslovné přání majitele účtu.
- Témata vybírej z `TOPICS.md`, nikdy neopakuj téma z posledních 14 dní (`log.md`).
- Jeden reel kariéra/mindset, druhý finance v číslech s kariérním úhlem (střídej).

## Vizuální styl – výchozí `"glow"` + logo (viz sekce „Styl značky + rytmus“ níže); mono jen výjimečně
Inspirace: černobílé minimalistické piktogramové explainery (čisté černé pozadí, bílá + šedá s jemnou září,
široce prostrkané verzálky, malé bílé štítky, jedna myšlenka na scénu, klidné plynulé animace bez třesení).
- Styl podle A/B rozpisu výše, dokud PLAYBOOK nevyhlásí vítěze.
- Preferuj piktogramové scény: `bubbles` (ty vs. řeči ostatních, `mute: true` = umlčení), `spotlight` (jen ty),
  `shield` (názory se odrazí od kruhu), `arrows` (všichni radí, ty jdeš svou cestou), `countdown` (přesýpací hodiny + kalendář),
  `progress` (cesta k cíli se segmenty a hvězdou). Kombinuj s `slam`, `counter`, `list`, `cta`.
- Pole: bubbles {kicker?, title?, center?, words[max 6, krátká], mute?, caption?}; spotlight {title, sub?, caption?};
  shield {kicker?, words[3–5], caption?}; arrows {kicker?, label, caption?}; countdown {kicker?, head?, from, to, caption?};
  progress {title, sub?, steps[4–6 krátkých], goal, caption?}. Všechny mají `dur` a volitelně `foot`.
- Délky: bubbles 120–130, spotlight 100–120, shield 110–130, arrows 100–120, countdown 110–130, progress 130–150.
- `kicker` a `caption` max ~32 znaků. Titulky v mono stylu max ~14 znaků na řádek při size 96.
- Vzor: `content/auto/specs/ukazka-mono-ostatni.json`.

## Formát videa (AutoReel)
- Spec v `content/auto/specs/YYYY-MM-DD-<a|b>-<slug>.json`, `audio`: `auto/<id>.wav`.
- **7–10 scén, celkem 30–40 s** (900–1200 snímků při 30 fps) – podle dat vítězů.
- 1. scéna = háček typu `slam` (ideálně s `emoji`), max 6–8 slov, oslovení „ty“, číslo ze života diváka. Šablona ho zobrazí celý už na 1. snímku.
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
 "providers": [{"network": "tiktok"}],
 "publicationDate": {"dateTime": "YYYY-MM-DDT09:30:00", "timezone": "Europe/Prague"},
 "tiktokData": {"title": "<háček, max ~80 znaků + 1 emoji>", "disableComment": false, "disableDuet": false, "disableStitch": false,
   "privacyOption": "PUBLIC_TO_EVERYONE", "commercialContentThirdParty": false, "commercialContentOwnBrand": true, "autoAddMusic": false, "isAigc": false},
 "shortener": false, "smartLinkData": {"ids": []}, "descendants": [], "hasNotReadNotes": false, "mediaAltText": []}
```
TikTok **vyžaduje `tiktokData.title`** (jinak chyba „TikTok title is required“). `commercialContentOwnBrand: true` = označení „Vaše značka“ (propagace vlastního byznysu).
Video musí být **pushnuté na `main` dřív**, než se plánuje (Metricool si ho stahuje z raw URL).

## Log
Po naplánování připiš do `log.md`: datum, čas, id, téma, klíčové slovo, plannerUrl. Commit + push na `main`.

## Hudba (trendující písničky)
- Ke každému videu vyber přes WebSearch aktuálně trendující skladbu (TikTok/Reels, posledních 14 dní) vhodnou pro motivaci / byznys / kariéru mladých (20–25). Vyhni se vánočním a nesouvisejícím trendům.
- **Instagram (pozastaveno – IG se postuje ručně):** do `instagramData.audioConfiguration` dej `{"audioId": "<název písně + interpret>", "audioVolume": 30, "videoVolume": 100}` (efekty videa musí být slyšet přes hudbu).
  Pokud Metricool vrátí 403 „audio catalog is not available“ (účet zatím není Business + FB stránka), naplánuj stejný příspěvek **bez** `audioConfiguration` a v reportu napiš „hudba na IG zatím nejde – chybí Business účet“.
  Pokud vrátí seznam kandidátů, vyber numerické `audioId` toho správného a zkus znovu.
- **TikTok:** API neumožňuje vybrat zvuk k videu → TikTok jde automaticky bez hudby.
- Doporučenou písničku pro IG zapiš do `content/auto/captions/<id>.md` (název + interpret + proč sedí).
- Do `log.md` zapiš zvolenou písničku.

## Styl značky + rytmus (od 17. 11., přání majitele)
- **Výchozí styl: `"style": "glow"` (zelený glow jako původní videa) + logo vpravo nahoře** (šablona přidá automaticky, `public/brand/logo.png`).
  Piktogramové scény (bubbles, spotlight, shield, arrows, countdown, progress) používej i v glow stylu – titulky jsou zelené.
- **Střih do rytmu písničky:** ke každému videu vyber písničku (viz Hudba), zjisti její **BPM** (WebSearch „<song> BPM“).
  Snímků na úder = 1800 / BPM (100 BPM → 18 snímků). **Délky všech scén = násobky úderu**, háček `hits` na údery
  (např. [7, 25, 43] při 100 BPM s 1. úderem v 0,24 s), CTA tak, aby slovo (CTA start + 18 snímků) padlo na drop.
  Do specu zapiš `"beat": {"song", "bpm", "firstBeatSec", "dropSec"}` a do popisku/balíčku napiš, ať majitel v IG
  vybere úsek písničky tak, aby začátek písničky = začátek videa.
- Default, když BPM nelze zjistit: 100 BPM (18 snímků/úder).
- Hudbu do videa NIKDY nevkládej – jen zvukové efekty, které jsou do rytmu.
