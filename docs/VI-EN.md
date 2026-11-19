# ApkStart Vietnamese / English interface

This fork adds Vietnamese (default), English and the original Simplified Chinese interface. Select the language from the top-right dropdown. It is saved as `uiLanguage` in settings and synchronized across open windows. Android's language remains independent under Performance → Android language.

Coverage: all static text in the main/settings, shell and splash HTML; common runtime notifications; app context menus; tray commands; common confirmation dialogs. Unknown backend diagnostics, external Android messages and application names are kept verbatim. This is not a claim that every possible engine error is translated.

## Download / build

The **Vietnamese-English portable** GitHub Actions workflow produces `ApkStart-0.6.1-vi-en-win64-portable.zip` as a build artifact. Extract it into a permanent folder and run `ApkStart.exe`. Android runtime downloads are still required on first use. This is a Windows x64 build, not an APK.

On Windows with Node.js 20.19+ (22 recommended):

```powershell
npm ci
npm run test:i18n
npm start
npm run pack
```

Output: `dist/ApkStart-win64-portable/ApkStart.exe`.

The original runtime and user-data locations are unchanged. UI localization adds no network translation service and sends no content elsewhere. The localized build blocks in-place upstream updates, including pending upstream updates, so they cannot silently remove the translations. Update from this fork's artifacts/releases instead.

## Validation

`npm run test:i18n` checks static catalog coverage, fallback behavior, interpolation, switching, persistence, dynamic DOM changes, preservation of user app names and failed saves. Original `npm test` has an existing retry-matrix duplicate-variant failure on the Linux development host, reproduced on the unchanged base commit. Windows runtime boot and real APK installation must be tested on Windows; the language tests do not start Android.

## Maintenance

Edit `src/i18n/catalog.js` for translations. Keys are normalized original UI strings; unknown strings remain unchanged rather than being guessed or hidden. `src/i18n/translate.js` contains bounded interpolation patterns. `src/ui/i18n.js` observes presentation text only, without changing input values, event handlers or action IDs.
