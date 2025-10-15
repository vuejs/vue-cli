# Setup
After installing vue-cli-plugin-workbox-pwa, you can complete wiring up the Auto Update and Manual Update features.

## Auto Update
The auto update uses:
1. /components/app-auto-update.vue
2. /composables/use-service-worker.js
3. /service-worker/register-service-worker.js

We recommend only adding the Auto Update to a Login Page or Landing Page. Keep in mind that it automatically activates
the service worker and reloads the page, so if it is added to a page that disrupts the user's work (like a form) it could
cause an annoying user experience.

To use the Auto Update, follow the example /service-worker/auto-update-example.

Note: The auto update only works with the InjectManifest option.

## Manual Update
The manual update uses:
1. /components/app-manual-update.vue
2. /composables/use-service-worker.js
3. /service-worker/register-service-worker.js

The Manual Update can be added to the App.vue. See the example in /service-worker/manual-update-example. This feature prompts
the user with a banner and an update button whenever there is a new version of the service worker available. This allows
the user to be in control of when the update happens, so it doesn't interrupt their work.

Note: The manual update only works with the InjectManifest option.
