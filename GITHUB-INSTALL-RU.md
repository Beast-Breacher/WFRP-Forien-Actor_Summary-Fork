# Публикация и установка

Целевой репозиторий: [Beast-Breacher/WFRP-Forien-Actor_Summary-Fork](https://github.com/Beast-Breacher/WFRP-Forien-Actor_Summary-Fork).

## Загрузка

Загрузите **содержимое** этой папки в корень указанного репозитория, включая скрытую `.github/workflows/release.yml`. Манифест должен оказаться в корне репозитория. Папки `dist/` и `node_modules/` загружать не требуется. Если репозиторий уже содержит файлы, перенесите изменения в его рабочую копию, сохраняя историю.

## Выпуск

Версии в `module.json` и `package.json` должны совпадать. После загрузки файлов создайте и отправьте тег:

```powershell
git tag v0.1.4-beta.2
git push origin v0.1.4-beta.2
```

Workflow запускается также при загрузке изменений в `main`: он проверит тесты, соберёт пакет и опубликует два release assets: `module.json` и `forien-actors-summary.zip`. Если тега версии ещё нет, GitHub создаст его на публикуемом коммите. Для установки через `/releases/latest/` workflow явно делает этот выпуск latest, включая текущее beta-обозначение версии. Повторный выпуск с тем же тегом не перезаписывается: увеличьте версию и создайте новый тег. Ручной запуск workflow создаёт только скачиваемые артефакты сборки.

Репозиторий/вложения должны быть доступны Foundry без авторизации. В GitHub Actions должны быть разрешены workflows и запись release assets (`contents: write` уже указано).

Если Actions не используется:

```powershell
node --test tests/*.test.mjs
node tools/release.mjs --repo Beast-Breacher/WFRP-Forien-Actor_Summary-Fork
```

Создайте GitHub Release с тегом `v0.1.4-beta.2`, сделайте его latest, приложите **оба файла из `dist/`**. Не используйте автоматический GitHub `Source code.zip`: у него другая структура. При смене репозитория передайте `--repo owner/repository`; ссылки изменятся в обоих артефактах.

## Foundry VTT

После публикации вставьте в **Add-on Modules → Install Module → Manifest URL**:

```text
https://github.com/Beast-Breacher/WFRP-Forien-Actor_Summary-Fork/releases/latest/download/module.json
```

Ссылка заработает после появления release assets на GitHub. Включите модуль через **Manage Modules** в игровом мире. При обновлении установленного оригинала проверьте, что поле Manifest URL указывает на форк. Для перехода при необходимости используйте локальную установку пакета в папку с тем же ID.

В манифесте `verified: 14.369`: проверка выполнена в тестовом мире с WFRP4e 10.1.2. На ядрах 11–13 живой прогон отдельно не выполнялся. Для новых версий ядра пройдите сценарии из `TESTING.md`, увеличьте версию и выпустите новый тег.
