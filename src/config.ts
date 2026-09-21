/**
 * Master switch for the merch shop.
 *
 * While `false`, the storefront, product pages, cart, and checkout are not
 * routed at all (they 404), and the Merch nav item + cart are hidden. Flip to
 * `true` to bring the shop back — it returns behind sign-in (see RequireAuth).
 *
 * Typed as `boolean` (not the literal) on purpose, so toggling it doesn't trip
 * "constant condition" / unreachable-branch lint on the guards that read it.
 */
export const SHOP_ENABLED: boolean = false;
