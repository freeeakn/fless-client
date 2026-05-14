# FLESS Client

> GTK4-приложение для подключения к VPN по протоколу VLESS с использованием xray-core.

**FLESS Client** — это лёгкий нативный Linux-клиент для VLESS-подключений. Приложение парсит VLESS-ссылки, генерирует конфигурацию xray на лету и управляет процессом xray-core через простой интерфейс GTK4 на GJS (GNOME JavaScript).

## Возможности

- **Парсинг VLESS-ссылок** — поддержка REALITY, TLS и обычных подключений
- **Автоконфигурация** — генерация JSON-конфига xray из одной VLESS-ссылки
- **Нативный GTK4** — легко, без Electron и браузерных движков
- **Локальные прокси** — SOCKS5 (`127.0.0.1:10800`) и HTTP (`127.0.0.1:10801`)
- **Управление процессом** — запуск и остановка xray-core, автоочистка конфига

## Требования

- **Linux** с **GJS** (GNOME JavaScript) — предустановлен в Ubuntu/GNOME
- **xray-core** — установите через пакетный менеджер или [скачайте](https://github.com/XTLS/Xray-core/releases)

Проверка GJS:

```bash
gjs --version
```

Установка xray-core:

```bash
# Debian / Ubuntu
sudo apt install xray-core

# Arch Linux
sudo pacman -S xray

# Или скачайте с GitHub Releases и поместите xray в PATH
```

## Быстрый старт

```bash
git clone https://github.com/freeeakn/fless-client.git
cd fless-client
gjs fless-client.js
```

1. Вставьте VLESS-ссылку в поле ввода
2. Нажмите **Connect**
3. Настройте браузер или систему на использование локального прокси:
   - SOCKS5: `127.0.0.1:10800`
   - HTTP: `127.0.0.1:10801`
4. Нажмите **Disconnect** для отключения

## Формат VLESS-ссылки

```
vless://UUID@SERVER:PORT?type=xhttp&encryption=none&path=/PATH&host=HOST&mode=auto&security=reality&fp=chrome&pbk=PUBLIC_KEY&sni=SNI&sid=SID#REMARK
```

### Параметры запроса

| Параметр     | Описание                                  | Значения                             |
|--------------|-------------------------------------------|--------------------------------------|
| `type`       | Транспортный протокол                     | `tcp`, `xhttp`, `ws`                |
| `security`   | Уровень шифрования                        | `none`, `tls`, `reality`            |
| `encryption` | Шифрование потока                         | `none`                               |
| `path`       | Путь запроса                              | любая строка                         |
| `host`       | Заголовок Host                            | любая строка                         |
| `mode`       | Режим XHTTP-мультиплексирования           | `auto`, `packet-up`, `stream-one`    |
| `pbk`        | Публичный ключ REALITY                    | строка base64                        |
| `sni`        | Server Name Indication                    | доменное имя                         |
| `fp`         | TLS-отпечаток (fingerprint)               | `chrome`, `firefox`, `safari`        |
| `sid`        | REALITY short ID                          | строка hex                           |
| `spx`        | REALITY spider X path                     | URL-закодированный путь              |

## Структура проекта

```
fless-client/
├── fless-client.js            # Основное приложение (GJS + GTK4, один файл)
├── com.fless.Client.yaml      # Flatpak-манифест (GNOME Platform 49)
├── com.fless.Client.desktop   # Desktop entry для меню приложений
├── com.fless.Client.svg       # Иконка приложения
├── README.md                  # README на английском
├── README.ru.md               # README на русском (этот файл)
├── README.sr.md               # README на сербском
└── .gitignore
```

Приложение ищет xray-core сначала в `./xray-bin/xray`, затем в `/usr/bin/xray`.

## Flatpak

В репозитории есть манифест для Flatpak-сборки. xray-core входит в сборку — устанавливать на хост не нужно:

```bash
# Сборка
flatpak-builder --force-clean build-dir com.fless.Client.yaml

# Сборка и локальная установка
flatpak-builder --user --install --force-clean build-dir com.fless.Client.yaml

# Запуск
flatpak run com.fless.Client
```

> **Примечание:** Если возникает ошибка `rofiles-fuse`, добавьте флаг `--disable-rofiles-fuse`.

## Архитектура

Приложение — один GJS-скрипт с тремя ключевыми функциями:

- `parseVLESSUrl(url)` — парсит `vless://` URL в объект конфигурации с полной поддержкой REALITY
- `generateXrayConfig(config, configPath)` — записывает на диск полный JSON-конфиг xray (inbounds, outbounds, routing)
- `connectVPN(config)` / `disconnectVPN()` — запускает xray-core как подпроцесс, отслеживает его и очищает конфиг при остановке

## Лицензия

[MIT](LICENSE)
