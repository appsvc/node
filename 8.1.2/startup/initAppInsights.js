try {
    // Initialize the Application Insights runtime, using the
    // instrumentation key provided by the environment.
    require("applicationinsights").setup().start();
} catch (error) {
    // Swallow any errors, in order to safeguard the
    // user's app from any unexpected exceptions.
}