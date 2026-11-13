# Store-copy sources

Current US English source: [metadata/app-store.en-US.json](../../metadata/app-store.en-US.json). Generated copy: [metadata/en-US](../../metadata/en-US). Run `python scripts/release_metadata.py --write` after changes.

[en.md](en.md) is a pointer, not a parallel editable copy. Other language files in this directory are short pointers to the localized listings in [metadata/i18n](../../metadata/i18n). Those are machine translations marked unreviewed; do not submit them until a native review and claims review are complete. The older Golden Moments descriptions that used to be here (before the 2026-11-13 rename) remain in git history only.

Use [screenshots](../specs/screenshots.md), [release gates](../release/1.3.0.md), and [US strategy](../strategy/us-aso.md) together. A merge does not update App Store Connect.
