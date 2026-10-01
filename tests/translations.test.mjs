import test from "node:test";
import assert from "node:assert/strict";
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "../src/lib/translations.js";

function getLeafKeys(obj, prefix = "") {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys = keys.concat(getLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

test("Translations dictionary includes 'id' and 'en'", () => {
  assert.ok(translations.id, "Indonesian translations must be defined");
  assert.ok(translations.en, "English translations must be defined");
  assert.ok(SUPPORTED_LANGUAGES.includes("id"));
  assert.ok(SUPPORTED_LANGUAGES.includes("en"));
  assert.equal(DEFAULT_LANGUAGE, "id");
});

test("Translation keys are completely symmetrical between ID and EN", () => {
  const idKeys = new Set(getLeafKeys(translations.id));
  const enKeys = new Set(getLeafKeys(translations.en));

  const missingInEn = [...idKeys].filter((k) => !enKeys.has(k));
  const missingInId = [...enKeys].filter((k) => !idKeys.has(k));

  if (missingInEn.length > 0) {
    assert.fail(`Keys present in Indonesian but missing in English: \n${missingInEn.join("\n")}`);
  }
  if (missingInId.length > 0) {
    assert.fail(`Keys present in English but missing in Indonesian: \n${missingInId.join("\n")}`);
  }

  assert.equal(missingInEn.length, 0);
  assert.equal(missingInId.length, 0);
});

test("No translation values are empty or undefined", () => {
  const checkValues = (obj, lang, path = "") => {
    for (const [k, v] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${k}` : k;
      if (typeof v === "object" && v !== null) {
        checkValues(v, lang, fullPath);
      } else {
        assert.ok(
          typeof v === "string" && v.trim().length > 0,
          `Translation value at [${lang}]: ${fullPath} must be a non-empty string`
        );
      }
    }
  };

  checkValues(translations.id, "id");
  checkValues(translations.en, "en");
});
