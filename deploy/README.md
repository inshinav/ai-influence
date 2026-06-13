# Деплой «Я-Ферма» на inshinlab.com

Статический сайт (Vite). Целевой адрес — подпапка **https://inshinlab.com/ai-influence/**
(`base` сборки = `/ai-influence/`). Сервер — Beget VPS с nginx; докрут домена —
`/var/www/html`, корень оставлен под будущий лендинг. Поэтому сайт работает **без
правок nginx**: достаточно положить собранные файлы в `/var/www/html/ai-influence/`,
их отдаёт существующий `location /`, а HTTPS уже выдан certbot на домен.

## Первый деплой (на сервере, под root)

```bash
cd /tmp && rm -rf ai-influence
git clone --depth 1 https://github.com/inshinav/ai-influence.git
cd ai-influence
bash deploy/deploy.sh          # npm ci + build + копирование в /var/www/html/ai-influence
```

Открыть: <https://inshinlab.com/ai-influence/>

## Обновление версии

```bash
cd /tmp/ai-influence && git pull && bash deploy/deploy.sh
```

## Что куда

- Сборка кладётся в `/var/www/html/ai-influence/` (переопределяется `DEPLOY_TARGET`).
- `.htaccess` в сборке — для Apache; на nginx он игнорируется (не мешает).
- SPA-фолбэк здесь не нужен: приложение одностраничное, маршрутов-путей нет,
  только якоря (`#console` и т. п.).

## Опционально: выделенный location с кэшем (nginx)

Не обязательно. Если хотите явный location и «вечный» кэш хешированных ассетов —
добавьте в server-блок `inshinlab.com` (тот, что слушает 443 после certbot) и
выполните `nginx -t && systemctl reload nginx`:

```nginx
location /ai-influence/ {
    alias /var/www/html/ai-influence/;
    try_files $uri $uri/ /ai-influence/index.html;
}

# хешированные ассеты можно кэшировать надолго
location ~* ^/ai-influence/assets/ {
    root /var/www/html;
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Корень домена вместо подпапки

Если позже захотите отдавать «Я-Ферму» с корня `inshinlab.com/` (а не из подпапки),
пересоберите с другим base и положите в докрут:

```bash
VITE_BASE_PATH=/ npm run build
DEPLOY_TARGET=/var/www/html bash deploy/deploy.sh   # осторожно: перезапишет докрут
```
