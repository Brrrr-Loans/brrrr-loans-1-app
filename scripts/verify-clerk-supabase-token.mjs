import assert from "node:assert/strict";
import { getClerkSupabaseToken } from "../src/lib/clerk-supabase-token.ts";

function jwt(payload) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.sig`;
}

const authenticated = jwt({
  role: "authenticated",
  sub: "user_123",
  o: { id: "org_123", rol: "admin" },
});
const serviceRole = jwt({ role: "service_role", sub: "user_123" });
const roleLess = jwt({ sub: "user_123", org_id: "org_123" });
const otherRole = jwt({ role: "anon", sub: "user_123" });

assert.equal(
  await getClerkSupabaseToken(undefined),
  null,
  "missing getToken returns null"
);

assert.equal(
  await getClerkSupabaseToken(async () => null),
  null,
  "empty session returns null"
);

assert.equal(
  await getClerkSupabaseToken(async () => ""),
  null,
  "blank token returns null"
);

assert.equal(
  await getClerkSupabaseToken(async () => {
    throw new Error("clerk unavailable");
  }),
  null,
  "getToken errors return null"
);

assert.equal(
  await getClerkSupabaseToken(async () => authenticated),
  authenticated,
  "default session token with role=authenticated is returned"
);

assert.equal(
  await getClerkSupabaseToken(async () => serviceRole),
  serviceRole,
  "role=service_role remains compatible"
);

assert.equal(
  await getClerkSupabaseToken(async () => roleLess),
  null,
  "role-less token is not sent"
);

assert.equal(
  await getClerkSupabaseToken(async () => otherRole),
  null,
  "a non-postgres role is not sent"
);

assert.equal(
  await getClerkSupabaseToken(async () => "not-a-jwt"),
  null,
  "malformed token returns null"
);

let calls = 0;
let received;
const once = await getClerkSupabaseToken(async (options) => {
  calls += 1;
  received = options;
  return roleLess;
});
assert.equal(once, null, "role-less token does not fall back");
assert.equal(calls, 1, "getToken is called once");
assert.equal(received, undefined, "getToken is called with no template");

const templateProbe = [];
await getClerkSupabaseToken(async (options) => {
  templateProbe.push(options);
  return authenticated;
});
assert.deepEqual(
  templateProbe,
  [undefined],
  "the supabase JWT template is not requested"
);

console.log("verify-clerk-supabase-token: ok");
