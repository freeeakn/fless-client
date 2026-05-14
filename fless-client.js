#!/usr/bin/env gjs

imports.gi.versions.Gtk = '4.0';
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

// VLESS URL Parser
function parseVLESSUrl(url) {
    try {
        let parsed = GLib.uri_parse(url, GLib.UriFlags.NONE);
        if (parsed.get_scheme() !== 'vless') return null;

        let config = {
            uuid: parsed.get_userinfo() || '',
            server: parsed.get_host(),
            port: parsed.get_port() || 443,
            network: 'tcp',
            encryption: 'none',
            security: 'none',
            reality: null,
            path: null,
            host: null,
            mode: null,
            remark: decodeURIComponent(parsed.get_fragment() || '')
        };

        let query = parsed.get_query();
        if (query) {
            let params = GLib.uri_parse_params(query, -1, '&', 0);
            config.network = params.type || 'tcp';
            config.encryption = params.encryption || 'none';
            config.security = params.security || 'none';
            config.path = params.path ? decodeURIComponent(params.path) : null;
            config.host = params.host || null;
            config.mode = params.mode || null;

            if (config.security === 'reality') {
                config.reality = {
                    pbk: params.pbk || '',
                    sni: params.sni || '',
                    fp: params.fp || 'chrome',
                    sid: params.sid || null,
                    spx: params.spx ? decodeURIComponent(params.spx) : null
                };
            }
        }

        return config;
    } catch (e) {
        return null;
    }
}

// Generate Xray config
function generateXrayConfig(config, configPath) {
    let outbound = {
        tag: 'proxy',
        protocol: 'vless',
        settings: {
            vnext: [{
                address: config.server,
                port: config.port,
                users: [{
                    id: config.uuid,
                    encryption: config.encryption,
                    level: 0
                }]
            }]
        },
        streamSettings: {
            network: config.network
        }
    };

    if (config.security === 'reality' && config.reality) {
        outbound.streamSettings.security = 'reality';
        outbound.streamSettings.realitySettings = {
            show: false,
            fingerprint: config.reality.fp,
            serverName: config.reality.sni,
            publicKey: config.reality.pbk,
            shortId: config.reality.sid || '',
            spiderX: config.reality.spx || ''
        };
    } else if (config.security === 'tls') {
        outbound.streamSettings.security = 'tls';
        outbound.streamSettings.tlsSettings = {
            serverName: config.reality?.sni || config.server,
            fingerprint: config.reality?.fp || 'chrome',
            allowInsecure: false
        };
    }

    if (config.network === 'xhttp') {
        outbound.streamSettings.xhttpSettings = {
            path: config.path || '/',
            host: config.host || config.server,
            mode: config.mode || 'auto'
        };
    } else if (config.network === 'tcp' && config.path) {
        outbound.streamSettings.tcpSettings = {
            header: {
                type: 'http',
                request: {
                    path: [config.path],
                    headers: {
                        Host: [config.host || config.server]
                    }
                }
            }
        };
    }

    let xrayConfig = {
        log: { loglevel: 'warning' },
        inbounds: [
            {
                tag: 'socks-in',
                protocol: 'socks',
                listen: '127.0.0.1',
                port: 10800,
                settings: { udp: true }
            },
            {
                tag: 'http-in',
                protocol: 'http',
                listen: '127.0.0.1',
                port: 10801
            }
        ],
        outbounds: [
            outbound,
            { tag: 'direct', protocol: 'freedom' },
            { tag: 'block', protocol: 'blackhole' }
        ],
        routing: {
            domainStrategy: 'IPIfNonMatch',
            rules: [
                { domain: ['geosite:category-ads-all'], outboundTag: 'block' },
                { ip: ['geoip:private'], outboundTag: 'direct' }
            ]
        }
    };

    let file = Gio.File.new_for_path(configPath);
    let outputStream = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
    let dataOut = JSON.stringify(xrayConfig, null, 2);
    outputStream.write(dataOut, null);
    outputStream.close(null);
}

// Main Application
let app = new Gtk.Application({
    application_id: 'org.vless.client',
    flags: Gio.ApplicationFlags.FLAGS_NONE
});

let xrayProcess = null;
let statusLabel, urlEntry, serverLabel, connectButton;

app.connect('startup', () => {
    print('DEBUG: app startup');
});

app.connect('activate', () => {
    print('DEBUG: activate called');
    let window = new Gtk.ApplicationWindow({
        application: app,
        title: 'FLESS VPN Client',
        default_width: 600,
        default_height: 300
    });

    let box = Gtk.Box.new(Gtk.Orientation.VERTICAL, 10);
    box.set_margin_start(10);
    box.set_margin_end(10);
    box.set_margin_top(10);
    box.set_margin_bottom(10);

    // URL Input Row
    let hbox = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, 10);
    let urlLabel = Gtk.Label.new('VLESS URL:');
    urlLabel.set_halign(Gtk.Align.START);
    hbox.append(urlLabel);
    
    urlEntry = Gtk.Entry.new();
    urlEntry.set_placeholder_text('vless://...');
    urlEntry.set_hexpand(true);
    urlEntry.set_editable(true);
    hbox.append(urlEntry);

    box.append(hbox);

    // Server Info
    serverLabel = Gtk.Label.new('No server configured');
    serverLabel.set_halign(Gtk.Align.START);
    serverLabel.set_hexpand(true);
    box.append(serverLabel);

    // Status
    statusLabel = Gtk.Label.new('Status: Disconnected');
    statusLabel.set_halign(Gtk.Align.START);
    box.append(statusLabel);

    // Connect Button
    connectButton = Gtk.Button.new_with_label('Connect');
    connectButton.connect('clicked', onConnectClicked);
    box.append(connectButton);

    window.set_child(box);
    
    window.connect('map', () => {
        print('DEBUG: Window mapped');
        urlEntry.grab_focus();
    });
    
    window.present();
    print('DEBUG: Window presented');
});

function onConnectClicked() {
    let url = urlEntry.get_text().trim();
    if (!url) {
        statusLabel.set_text('Status: Please enter VLESS URL');
        return;
    }

    let config = parseVLESSUrl(url);
    if (!config) {
        statusLabel.set_text('Status: Invalid VLESS URL');
        return;
    }

    serverLabel.set_text('Server: ' + config.server + ':' + config.port + ' (' + (config.remark || 'No remark') + ')');

    if (xrayProcess) {
        disconnectVPN();
    } else {
        connectVPN(config);
    }
}

function connectVPN(config) {
    let configPath = GLib.get_tmp_dir() + '/vless-xray-config.json';
    generateXrayConfig(config, configPath);

    // Check if xray exists locally
    let xrayPath = './xray-bin/xray';
    let xrayFile = Gio.File.new_for_path(xrayPath);
    if (!xrayFile.query_exists(null)) {
        xrayPath = '/app/xray-bin/xray';
        xrayFile = Gio.File.new_for_path(xrayPath);
    }
    if (!xrayFile.query_exists(null)) {
        xrayPath = '/usr/bin/xray';
        xrayFile = Gio.File.new_for_path(xrayPath);
        if (!xrayFile.query_exists(null)) {
            statusLabel.set_text('Status: xray not found. Install: sudo apt install xray-core');
            return;
        }
    }

    statusLabel.set_text('Status: Connecting...');
    connectButton.set_label('Disconnect');

    try {
        let launcher = new Gio.SubprocessLauncher();
        launcher.set_flags(Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE);
        print('Starting xray:', xrayPath, 'with config:', configPath);
        xrayProcess = launcher.spawnv([xrayPath, 'run', '-c', configPath]);
        print('xray started, pid:', xrayProcess.get_identifier());

        statusLabel.set_text('Status: Connected to ' + config.server);
        connectButton.set_label('Disconnect');
        print('Status set to Connected');

        // Monitor xray process
        xrayProcess.wait_check_async(null, (proc, result) => {
            try {
                proc.wait_check_finish(result);
                print('xray exited normally');
            } catch (e) {
                print('xray process ended:', e.message);
                try {
                    let [ok, stdout, stderr] = proc.communicate_utf8(null, null);
                    if (stderr) print('xray stderr:', stderr);
                } catch(e2) {}
            }
            // Check if this is still our process
            if (xrayProcess === proc) {
                xrayProcess = null;
                statusLabel.set_text('Status: Disconnected');
                connectButton.set_label('Connect');
                print('Status updated to Disconnected');
            }
        });

        // Also check via timeout as backup
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
            if (xrayProcess) {
                print('5s check: xray still running (pid:', xrayProcess.get_identifier(), ')');
            } else {
                print('5s check: xray already exited');
            }
            return GLib.SOURCE_REMOVE;
        });
    } catch (e) {
        statusLabel.set_text('Status: Failed to start xray: ' + e.message);
        connectButton.set_label('Connect');
    }
}

function disconnectVPN() {
    if (xrayProcess) {
        xrayProcess.send_signal(15); // SIGTERM
        xrayProcess = null;
        statusLabel.set_text('Status: Disconnected');
        connectButton.set_label('Connect');
    }
}

app.run([]);
