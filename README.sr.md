# FLESS Client

> GTK4 aplikacija za povezivanje na VPN putem VLESS protokola koristeći xray-core.

**FLESS Client** je laki native Linux GUI za VLESS konekcije. Aplikacija parsira VLESS URL-ove, generiše xray konfiguraciju u hodu i upravlja xray-core podprocesom kroz jednostavan GTK4 interfejs napravljen u GJS-u (GNOME JavaScript).

## Funkcionalnosti

- **Parsiranje VLESS URL-ova** — podržava REALITY, TLS i obične konekcije
- **Auto-konfiguracija** — generiše xray JSON konfig iz jedne VLESS veze
- **Native GTK4 UI** — lagan, bez Electrona i web prikaza
- **Lokalni proksi portovi** — SOCKS5 (`127.0.0.1:10800`) i HTTP (`127.0.0.1:10801`)
- **Upravljanje procesom** — pokreće/zaustavlja xray-core, automatski briše konfig pri isključenju

## Zahtevi

- **Linux** sa **GJS** (GNOME JavaScript) — predinstaliran na Ubuntu/GNOME
- **xray-core** — instalirajte putem menadžera paketa ili [preuzmite](https://github.com/XTLS/Xray-core/releases)

Provera GJS:

```bash
gjs --version
```

Instalacija xray-core:

```bash
# Debian / Ubuntu
sudo apt install xray-core

# Arch Linux
sudo pacman -S xray

# Ili preuzmite sa GitHub Releases i stavite xray u PATH
```

## Brzi početak

```bash
git clone https://github.com/freeeakn/fless-client.git
cd fless-client
gjs fless-client.js
```

1. Nalepite VLESS URL u polje za unos
2. Kliknite **Connect**
3. Podesite pretraživač ili sistem da koristi lokalni proksi:
   - SOCKS5: `127.0.0.1:10800`
   - HTTP: `127.0.0.1:10801`
4. Kliknite **Disconnect** da prekinete vezu

## VLESS URL format

```
vless://UUID@SERVER:PORT?type=xhttp&encryption=none&path=/PATH&host=HOST&mode=auto&security=reality&fp=chrome&pbk=PUBLIC_KEY&sni=SNI&sid=SID#REMARK
```

### Parametri upita

| Parametar    | Opis                                      | Vrednosti                            |
|--------------|-------------------------------------------|--------------------------------------|
| `type`       | Transportni protokol                      | `tcp`, `xhttp`, `ws`                |
| `security`   | Sloj enkripcije                           | `none`, `tls`, `reality`            |
| `encryption` | Enkripcija toka                           | `none`                               |
| `path`       | Putanja zahteva                           | bilo koji string                     |
| `host`       | Host header                               | bilo koji string                     |
| `mode`       | XHTTP multipleksiranje                    | `auto`, `packet-up`, `stream-one`    |
| `pbk`        | REALITY javni ključ                       | base64 string                        |
| `sni`        | Server Name Indication                    | naziv hosta                          |
| `fp`         | TLS otisak (fingerprint)                  | `chrome`, `firefox`, `safari`        |
| `sid`        | REALITY short ID                          | hex string                           |
| `spx`        | REALITY spider X putanja                  | URL-encoded putanja                  |

## Struktura projekta

```
fless-client/
├── fless-client.js            # Glavna aplikacija (GJS + GTK4, jedan fajl)
├── com.fless.Client.yaml      # Flatpak manifest (GNOME Platform 49)
├── com.fless.Client.desktop   # Desktop entry za meni aplikacija
├── com.fless.Client.svg       # Ikonica aplikacije
├── README.md                  # README na engleskom
├── README.ru.md               # README na ruskom
├── README.sr.md               # README na srpskom (ovaj fajl)
└── .gitignore
```

Aplikacija traži xray-core prvo u `./xray-bin/xray`, zatim u `/usr/bin/xray`.

## Flatpak

U repozitorijumu se nalazi Flatpak manifest. xray-core je uključen u build — nije potrebna instalacija na host sistemu:

```bash
# Build
flatpak-builder --force-clean build-dir com.fless.Client.yaml

# Build i lokalna instalacija
flatpak-builder --user --install --force-clean build-dir com.fless.Client.yaml

# Pokretanje
flatpak run com.fless.Client
```

> **Napomena:** Ako dobijete `rofiles-fuse` grešku, dodajte `--disable-rofiles-fuse`.

## Arhitektura

Aplikacija je jedan GJS skript sa tri ključne funkcije:

- `parseVLESSUrl(url)` — parsira `vless://` URL u konfiguracioni objekat sa punom REALITY podrškom
- `generateXrayConfig(config, configPath)` — upisuje kompletan JSON konfig na disk (inbounds, outbounds, routing)
- `connectVPN(config)` / `disconnectVPN()` — pokreće xray-core kao podproces, prati ga i čisti konfig pri zaustavljanju

## Licenca

[MIT](LICENSE)
