module.exports = {
  extends: [
    "stylelint-config-standard-scss"
  ],
  plugins: [
    "stylelint-order"
  ],
  rules: {
    "keyframes-name-pattern": null,
    "order/properties-alphabetical-order": true,
    // Disable the strict naming rules to allow your project's convention
    "selector-class-pattern": null
  }
};