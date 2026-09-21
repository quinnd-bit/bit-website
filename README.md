# BIT website

A static, dependency-free website for Building Insights Together. Serve this directory with an HTTP server; no build or package installation is needed.

## Main pages

- `index.html`: company positioning, interactive capabilities, offerings, Mariposa, and principles.
- `capabilities/index.html`: city foundation models, Forge, Core, and the Mariposa experiment.
- `offerings/index.html`: government, climate retrofit, insurance, and real estate applications.
- `about/index.html`: company purpose, research foundations, and working principles.
- `contact/index.html`: enquiry details and an email-draft form.
- `global-status-report-for-buildings-and-construction/index.html`: research background and a link to the UNEP 2025–2026 report.

Shared styling is in `assets/css/site.css`. Shared interactions are in `assets/js/site.js`. Navigation and footers are static HTML shared by convention across the six pages. Original photographs remain under `wp-content/uploads/` and are reused without modifying the source files. The historical WordPress export assets remain available but are not loaded by the redesigned pages.

The site uses absolute paths from the host root, matching its custom-domain deployment. The canonical domain remains `https://beta.building-insights.org/`.

## Contact

The form prepares a `mailto:` draft addressed to `info@building-insights.org`. It does not send or store submissions. The visitor reviews and sends the draft in their email application. Enquiry links preselect the relevant area of interest. A direct email link remains available.

The owner plans to provision this mailbox. Activate and verify it before public use. If a hosted form service is added later, update the form action and script together; do not report successful delivery until the service confirms it.

## Accessibility and motion

The site includes a skip link, labelled navigation and form controls, keyboard-operable product tabs, an Escape-dismissable mobile menu, visible focus states, and reduced-motion support. Content remains readable without scroll effects. Product details are also available on the capabilities page.

## Production identity

The production site uses one consistent visual direction across all six main pages:

- the Graphite colour system is defined directly in `assets/css/site.css`;
- the earlier-favourite Neighbourhood signature is used in every header and footer;
- the homepage City plan artwork is the fixed city-model image.

There is no browser-saved design state, visual chooser, or review interface. The original identity studies remain under `assets/brand/` as design source material, but they are not loaded or selectable at runtime.

## International work and pilot building analysis

The website attributes report authorship and convening to Building Insights, and IEA EBC Annex 70 leadership to Ian Hamilton. Primary references are linked alongside the claims. Institutional names describe specific research contributions, not product endorsements.

Whole-building analysis combines Earth observation and an ML-powered, privacy-protective LiDAR premises-scanning app. The app is described as in development / pilot testing, as confirmed by the owner. Specific privacy mechanisms and measured scanning performance are not yet claimed.

### Production artwork

The City plan is an original abstract SVG study embedded in the homepage so its colours follow the Graphite design tokens. The Neighbourhood signature is an outlined vector composition, so it does not require an installed font. Alternative identity and image studies are retained only as source assets for future design work.
