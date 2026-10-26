import test from "node:test";
import assert from "node:assert/strict";
import { digitsOnly, groupSecret, isFresh, isStepUpCode, STEP_UP_KEY, stepUpStore, tokenExpiry, type KeyValueStore } from "./stepUp.ts";

const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwtWith = (exp: number) => `${b64url({ alg: "HS256" })}.${b64url({ exp })}.sig`;
const NOW = 1_800_000_000_000;

const fakeStore = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
};

test("tokenExpiry reads exp and rejects junk", () => {
  assert.equal(tokenExpiry(jwtWith(1234)), 1234);
  assert.equal(tokenExpiry("not-a-token"), null);
  assert.equal(tokenExpiry(""), null);
  assert.equal(tokenExpiry(null), null);
  assert.equal(tokenExpiry(`a.${Buffer.from("{bad").toString("base64url")}.c`), null);
});

test("isFresh needs more than the skew left", () => {
  const exp = NOW / 1000 + 3600;
  assert.equal(isFresh(jwtWith(exp), NOW), true);
  assert.equal(isFresh(jwtWith(NOW / 1000 + 10), NOW), false);
  assert.equal(isFresh(jwtWith(NOW / 1000 - 5), NOW), false);
  assert.equal(isFresh("garbage", NOW), false);
});

test("store returns a fresh token and drops a stale one", () => {
  const s = fakeStore();
  const api = stepUpStore(s);
  api.set(jwtWith(NOW / 1000 + 3600));
  assert.ok(api.get(NOW));
  assert.equal(api.get(NOW + 2 * 3600 * 1000), null);
  assert.equal(s.data.has(STEP_UP_KEY), false);
});

test("store clear removes the token", () => {
  const s = fakeStore();
  const api = stepUpStore(s);
  api.set(jwtWith(NOW / 1000 + 3600));
  api.clear();
  assert.equal(api.get(NOW), null);
});

test("store survives storage that throws or is missing", () => {
  const boom: KeyValueStore = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  for (const st of [stepUpStore(boom), stepUpStore(null), stepUpStore(undefined)]) {
    st.set("x");
    assert.equal(st.get(), null);
    st.clear();
  }
});

test("isStepUpCode matches only the two step-up codes", () => {
  assert.equal(isStepUpCode("mfa_required"), true);
  assert.equal(isStepUpCode("mfa_enrol_required"), true);
  assert.equal(isStepUpCode("mfa_bad_code"), false);
  assert.equal(isStepUpCode(undefined), false);
});

test("groupSecret and digitsOnly", () => {
  assert.equal(groupSecret("ABCDEFGHIJKLMNOP"), "ABCD EFGH IJKL MNOP");
  assert.equal(groupSecret("ABCDEFGHIJ"), "ABCD EFGH IJ");
  assert.equal(digitsOnly("12 34-56789"), "123456");
  assert.equal(digitsOnly("abc"), "");
});
