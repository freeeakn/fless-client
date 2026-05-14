# FLESS-CLIENT

GTK-приложение для подключения к VPN по протоколу VLESS с использованием xray-core.

## Возможности

- Парсинг VLESS-ссылок с поддержкой REALITY
- Автоматическая генерация конфигурации xray
- GTK4 графический интерфейс (нативный для GJS)
- Локальные прокси: SOCKS5 (10800) и HTTP (10801)

## Требования

- Linux с установленным GJS
- xray-core (установите через пакетный менеджер)

Проверка GJS:
```bash
gjs --version
```

Установка xray-core:
```bash
# Debian/Ubuntu
sudo apt install xray-core

# Или скачайте с https://github.com/XTLS/Xray-core/releases
```

## Установка

```bash
git clone <repo-url>
cd fless-client
```

## Использование

Запуск приложения:
```bash
gjs fless-client.js
```

1. Вставьте VLESS-ссылку в поле ввода
2. Нажмите "Connect" для подключения к VPN
3. Нажмите "Disconnect" для отключения

## Формат VLESS-ссылки

```
vless://UUID@SERVER:PORT?type=xhttp&encryption=none&path=/PATH&host=HOST&mode=auto&security=reality&fp=chrome&pbk=PUBLIC_KEY&sni=SNI&sid=SID#REMARK
```

Поддерживаемые параметры:
- `type` — тип сети (tcp, xhttp, ws)
- `security` — тип шифрования (none, tls, reality)
- `encryption` — шифрование (none)
- `path` — путь запроса
- `host` — заголовок Host
- `mode` — режим (auto, packet-up, stream-one)
- `pbk` — публичный ключ (для REALITY)
- `sni` — Server Name Indication
- `fp` — fingerprint (chrome, firefox, safari)
- `sid` — short ID
- `spx` — spider X

## Прокси

После подключения доступны:
- SOCKS5: `127.0.0.1:10800`
- HTTP: `127.0.0.1:10801`

## Файлы

- `fless-client.js` — основное приложение (GJS + GTK4)
- `com.fless.Client.yaml` — Flatpak-сборка (runtime 46)
- `com.fless.Client.desktop` — desktop entry

xray-core ищется в `./xray-bin/xray` (если есть) или `/usr/bin/xray`.
