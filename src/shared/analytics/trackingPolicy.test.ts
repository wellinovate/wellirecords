import test from "node:test";
import assert from "node:assert/strict";
import { isPublicPath } from "./trackingPolicy.ts";

test("public marketing and legal pages may load the pixel", () => {
  for (const p of ["/", "/home", "/how-it-works", "/partners", "/security", "/privacy", "/terms", "/about", "/support", "/blog/some-post", "/privacy/"]) {
    assert.equal(isPublicPath(p), true, p);
  }
});

test("sign-in, signed-in, share and record-link pages never load it", () => {
  for (const p of [
    "/auth/login", "/auth/patient/signup", "/auth/provider/verify-org", "/patient", "/patient/vault", "/patient/overview",
    "/provider/patients/123", "/bridge/abc", "/verify/abc", "/join/abc", "/accept-invite", "/reset-password",
    "/forgot-password", "/verify-email", "/delete-account", "/super-admin/login", "/blog", "/blog/a/b", "/privacy-x", "/unknown",
  ]) {
    assert.equal(isPublicPath(p), false, p);
  }
});
