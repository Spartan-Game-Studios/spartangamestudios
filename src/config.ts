/**
 * The single master switch for everything e-commerce (merch).
 *
 * While `false`, ALL shop surfaces are off:
 *   - the storefront, product pages, cart, and checkout aren't routed (they 404),
 *   - the Merch nav item + cart (header) and the footer Merch link are hidden,
 *   - the account page's Orders + tracking section is not rendered.
 *
 * Flip to `true` to bring the shop back — it returns behind sign-in (RequireAuth).
 * Anything e-commerce added later should be gated on this flag too.
 *
 * Typed as `boolean` (not the literal) on purpose, so toggling it doesn't trip
 * "constant condition" / unreachable-branch lint on the guards that read it.
 */
export const SHOP_ENABLED: boolean = false;
