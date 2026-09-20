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

## Review View

Review View opens the first time a reviewer visits, then minimises into the fixed panel at the lower left. Its controls change four complete colour systems and eight finished vector logo compositions instantly, including the header and footer. Each option is a complete design: compact BIT and mark, integrated BIT lettering, or a full company-name signature. Use the small minus button to collapse the controls, or select “Review View” to reopen the explanation.

- Palettes: Canopy, Estuary, Terracotta, Graphite.
- New logo directions: Civic Frame, Neighbourhood II, Shared Structure, Assembly, Public Square, Open Charter. Earlier favourites Open Frame and Neighbourhood remain available. Every choice is a complete signature.
- Visual selections and panel state are saved in this browser on this site. “Reset” restores Canopy, Civic Frame, and the Street level photograph.
- The original SVG files and descriptive manifests are under `assets/brand/`.
- Palette variables are in `assets/css/brand-themes.css`; review interface styling is in `assets/css/review-view.css`.
- `assets/js/review-init.js` restores the visual choice before paint; `assets/js/review-view.js` controls the modal and dock.
- The chooser is part of this review version across all six main pages. It makes local visual changes only and does not publish or send selections.

## International work and pilot building analysis

The website attributes report authorship and convening to Building Insights, and IEA EBC Annex 70 leadership to Ian Hamilton. Primary references are linked alongside the claims. Institutional names describe specific research contributions, not product endorsements.

Whole-building analysis combines Earth observation and an ML-powered, privacy-protective LiDAR premises-scanning app. The app is described as in development / pilot testing, as confirmed by the owner. Specific privacy mechanisms and measured scanning performance are not yet claimed.

### City image alternatives

The picture icon in the review dock flips the controls between brand options and three city visuals: Street level, City & canopy, and City plan. The homepage city-model image has its own flip control with the same choices. Photo options reuse the original site assets; City plan is an original abstract SVG study. Image selection persists with the existing review preferences, with a photograph as the default for older saved settings. Inactive sides are inert, Escape returns to the front, and reduced-motion preferences skip the rotation animation.

### Logo compositions

`assets/brand/institutional/` contains the six new institutional directions, with complete outlined SVG signatures and matching favicon marks. `assets/brand/compositions/` retains the earlier collection; Open Frame and Neighbourhood remain available in Review View as comparisons. `logos.json` describes the eight active choices and their collections. All lettering is outlined, so no installed fonts are required. There is no independent logo-display mode. Older selections for the two favourites are preserved; other retired choices fall back to Civic Frame. Palette, city-image, and panel preferences remain intact.
