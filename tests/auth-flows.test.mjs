import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

// Helper password validator function matching API rules
function validatePasswordStrength(password) {
  if (!password || password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  return hasLetter && hasNumberOrSymbol;
}

test("Password strength rejects weak passwords", () => {
  assert.equal(validatePasswordStrength("123"), false);
  assert.equal(validatePasswordStrength("short1!"), false); // < 8
  assert.equal(validatePasswordStrength("onlyletters"), false); // no number/symbol
  assert.equal(validatePasswordStrength("1234567890"), false); // no letters
});

test("Password strength accepts compliant passwords", () => {
  assert.equal(validatePasswordStrength("SenaKids2026!"), true);
  assert.equal(validatePasswordStrength("Belajar123"), true);
  assert.equal(validatePasswordStrength("Keluarga_Hebat9"), true);
});

test("Password hashing with bcrypt produces verifiable hash", async () => {
  const password = "FamilySecret2026!";
  const hash = await bcrypt.hash(password, 10);
  assert.ok(hash.startsWith("$2"));
  const match = await bcrypt.compare(password, hash);
  assert.equal(match, true);
  const wrongMatch = await bcrypt.compare("WrongPassword", hash);
  assert.equal(wrongMatch, false);
});
