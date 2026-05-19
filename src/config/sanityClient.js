const { createClient } = require("@sanity/client");

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  useCdn: false, // set to false since we want fresh exam data
  apiVersion: "2023-01-01",
  token: process.env.SANITY_API_TOKEN,
});

module.exports = sanityClient;
