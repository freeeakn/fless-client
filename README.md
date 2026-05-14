# FLESS Client

> GTK4 application for connecting to VLESS VPN protocol using xray-core.

[![Release](https://img.shields.io/github/v/release/freeeakn/fless-client)](https://github.com/freeeakn/fless-client/releases)

**FLESS Client** is a lightweight native Linux GUI for VLESS protocol connections. It parses VLESS URLs, generates xray configuration on the fly, and manages the xray-core subprocess — all through a simple GTK4 interface built with GJS (GNOME JavaScript).

## Features

- **VLESS URL parsing** — supports REALITY, TLS, and plain connections
- **Auto-configuration** — generates xray JSON config from a single VLESS link
- **Native GTK4 UI** — lightweight, no Electron, no web views
- **Local proxy ports** — SOCKS5 (`127.0.0.1:10800`) and HTTP (`127.0.0.1:10801`)
- **Process lifecycle** — starts/stops xray-core, auto-cleans config on disconnect

## Requirements

- **Linux** with **GJS** (GNOME JavaScript) — preinstalled on Ubuntu/GNOME
- **xray-core** — install via package manager or [download](https://github.com/XTLS/Xray-core/releases)

Check GJS:

```bash
gjs --version
```

Install xray-core:

```bash
# Debian / Ubuntu
sudo apt install xray-core

# Arch Linux
sudo pacman -S xray

# Or download from GitHub releases and place xray in your PATH
```

## Quick start

```bash
git clone https://github.com/freeeakn/fless-client.git
cd fless-client
gjs fless-client.js
```

1. Paste a VLESS URL into the input field
2. Click **Connect**
3. Configure your browser or system to use the local proxy:
   - SOCKS5: `127.0.0.1:10800`
   - HTTP: `127.0.0.1:10801`
4. Click **Disconnect** to stop

## VLESS URL format

```
vless://UUID@SERVER:PORT?type=xhttp&encryption=none&path=/PATH&host=HOST&mode=auto&security=reality&fp=chrome&pbk=PUBLIC_KEY&sni=SNI&sid=SID#REMARK
```

### Query parameters

| Parameter     | Description                                  | Values                              |
|---------------|----------------------------------------------|-------------------------------------|
| `type`        | Transport protocol                           | `tcp`, `xhttp`, `ws`               |
| `security`    | Encryption layer                             | `none`, `tls`, `reality`           |
| `encryption`  | Stream encryption                            | `none`                              |
| `path`        | Request path                                 | any string                          |
| `host`        | Host header                                  | any string                          |
| `mode`        | XHTTP multiplexing mode                      | `auto`, `packet-up`, `stream-one`   |
| `pbk`         | REALITY public key                           | base64 string                       |
| `sni`         | Server Name Indication                       | hostname                            |
| `fp`          | TLS fingerprint                              | `chrome`, `firefox`, `safari`       |
| `sid`         | REALITY short ID                             | hex string                          |
| `spx`         | REALITY spider X path                        | URL-encoded path                    |

## Project structure

```
fless-client/
├── fless-client.js            # Main application (GJS + GTK4, single file)
├── com.fless.Client.yaml      # Flatpak manifest (GNOME Platform 49)
├── com.fless.Client.desktop   # Desktop entry for application menu
├── com.fless.Client.svg       # Application icon
├── README.md                  # English README
├── README.ru.md               # Russian README
├── README.sr.md               # Serbian README
└── .gitignore
```

The app looks for xray-core at `./xray-bin/xray` first (if you place it there), or falls back to `/usr/bin/xray`.

## Flatpak

A Flatpak manifest is included. It bundles xray-core, so no host installation is needed:

```bash
# Build
flatpak-builder --force-clean build-dir com.fless.Client.yaml

# Build and install locally
flatpak-builder --user --install --force-clean build-dir com.fless.Client.yaml

# Run
flatpak run com.fless.Client
```

> **Note:** If you get a `rofiles-fuse` error, add `--disable-rofiles-fuse`.

## Architecture

The application is a single GJS script with three core functions:

- `parseVLESSUrl(url)` — parses a `vless://` URL into a config object with full REALITY support
- `generateXrayConfig(config, configPath)` — writes a complete xray JSON config (inbounds, outbounds, routing) to disk
- `connectVPN(config)` / `disconnectVPN()` — spawns xray-core as a subprocess, monitors it, and cleans up on exit

## License

[MIT](LICENSE)
