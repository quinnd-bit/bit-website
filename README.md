# BIT website

The production website for Building Insights Together. It is a dependency-free static site: no CMS, application server, package installation, or build step is required.

Preview it locally from the repository root:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

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

## Production hosting

The historical CloudFormation stack name remains `bit-website-beta` so the existing private, versioned S3 bucket and CloudFront distribution can be promoted in place. The deployed architecture is production-only static hosting: it has no WordPress runtime, shared-notes service, API, Lambda function, or database.

`infra/deploy-site.sh` creates a clean publication directory and synchronizes it with deletion enabled. This removes retired public paths instead of leaving excluded files in S3. Bucket versioning keeps prior object versions available for operational rollback without serving them publicly.

Deploy using the issued `us-east-1` ACM certificate that covers `building-insights.org` and `*.building-insights.org`:

```sh
CERTIFICATE_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID \
./infra/deploy-site.sh
```

Keep canonical redirects disabled for the initial deployment. Once the apex and `www` DNS records point to the distribution and the live site has been verified, enable permanent redirects from `www` and `beta`:

```sh
CERTIFICATE_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID \
ENABLE_CANONICAL_REDIRECTS=true \
./infra/deploy-site.sh
```

The old WordPress host should remain available for at least the previous DNS TTL after cutover so its A record can be restored quickly if needed.

## Selected identity

The production site uses the Graphite palette, the Neighbourhood identity, and the city-plan image. Alternate identity assets remain under `assets/brand/` as source material, but the production manifest publishes only the selected signature. There is no public identity chooser or review interface.

## International work and Helios

The website attributes report authorship and convening to Building Insights, and IEA EBC Annex 70 leadership to Ian Hamilton. Primary references are linked alongside the claims. Institutional names describe specific research contributions, not product endorsements.

Helios is BIT's internal privacy-protecting building-energy product. It uses on-device machine learning to extract features from LiDAR observations of interior spaces, then combines them through a physics engine with exterior building and neighbourhood indicators served by Core. Helios can use a city foundation model where one is available or operate with broader indicators. The product is described as in development or pilot testing, as confirmed by the owner. Measured scanning and energy-modelling performance are not yet claimed.
