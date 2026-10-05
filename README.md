# BIT beta review website

This branch clones the published production site at commit `3725ed2`, adding the original shared sticky-note interface recovered from the September 21 S3 versions. Production content and assets stay unchanged.

## Review site

URL: https://beta.building-insights.org/

HTTP Basic authentication protects every page, asset and API request. The independent Lambda notes endpoint verifies the same credentials itself. Passwords are never stored in this repository; only the SHA-256 hash of the Authorization header is supplied as a CloudFormation NoEcho parameter and Lambda environment variable.

Use **Site notes → Add a note**, select a place on the page, enter a name and suggestion, and save. Notes are shared across browsers, scoped to the page, anchored to page elements, and refreshed every 30 seconds. Data is stored in a separate encrypted DynamoDB table with point-in-time recovery.

## Isolated deployment

Beta stack: `bit-website-beta-review` in `ca-central-1`. Template: `infra/beta-review.yaml`. This stack has its own S3 bucket, CloudFront distribution, Lambda function and DynamoDB table.

Publish content updates with `./infra/deploy-review.sh`. It refuses the historical production destination. Do not use `infra/deploy-site.sh` for beta changes: that historical script targets production.

The beta hostname is transferred using CloudFront's same-account `update-domain-association` operation. Only that alias is removed from the historical distribution; its production aliases, content, origins and behaviors remain unchanged. DNS should point the beta CNAME to `dj0cbhlehcc04.cloudfront.net` (the old CNAME may still reach beta through CloudFront hostname routing, but should be updated before retiring the old distribution).

The production CloudFormation template on main still lists the beta alias from the prior promotion. Before any future production infrastructure update, remove that retired beta alias from its template to avoid attempting to reclaim the new beta domain.

Robots directives and response headers exclude beta from search indexing. Production canonical URLs are intentionally retained.

## Main pages

- `index.html`: company positioning, capabilities, offerings, Mariposa, and principles.
- `capabilities/index.html`: city foundation models, Forge, Core, Helios, and Mariposa.
- `offerings/index.html`: government, climate retrofit, insurance, and real estate applications.
- `about/index.html`: company purpose, research foundations, and working principles.
- `contact/index.html`: enquiry details and an email-draft form.
- `global-status-report-for-buildings-and-construction/index.html`: research background and the UNEP 2025–2026 report.

Shared styling is in `assets/css/`. Shared interactions are in `assets/js/site.js`, and site imagery is in `assets/images/`. Navigation and footers are static HTML shared by convention across the pages. The canonical production domain is `https://building-insights.org/`.

## Contact

The form prepares a `mailto:` draft addressed to `info@building-insights.org`. It does not send or store submissions. The visitor reviews and sends the draft in their email application. Enquiry links preselect the relevant area of interest, and a direct email link remains available.

## Accessibility and motion

The site includes a skip link, labelled navigation and form controls, keyboard-operable product tabs, an Escape-dismissable mobile menu, visible focus states, and reduced-motion support. Content remains readable without scroll effects. Product details are also available on the capabilities page.
