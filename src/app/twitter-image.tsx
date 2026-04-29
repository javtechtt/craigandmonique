/**
 * Twitter share card. Re-exports the OG image generator so both
 * networks render the same composition. Twitter accepts a 1200×630
 * card just fine, so the dimensions stay aligned.
 */
export {
  default,
  alt,
  size,
  contentType,
} from "./opengraph-image";
