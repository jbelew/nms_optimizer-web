module.exports = {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-prettier-scss"
  ],
  plugins: [
    "stylelint-order"
  ],
  rules: {
    "order/properties-alphabetical-order": true,
    // Disable the strict naming rules to allow your project's convention
    "selector-class-pattern": null,
    "keyframes-name-pattern": null
  }
};