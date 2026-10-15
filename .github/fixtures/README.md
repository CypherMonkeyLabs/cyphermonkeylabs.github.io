# Validator fixtures

`labs-pack3.json` is a schema sample for the single manifest described in the redesign contract. The `lastVerified` and `launchedAt` dates are fixture dates so the checker has legal date strings. They are not a claim that every lesson was reviewed on that day.

`labs-invalid.json` must be rejected.

The live catalog remains `/data/labs.json` when the content agent adds it. Until then, CI checks the legacy `/labs.json` URL list.
