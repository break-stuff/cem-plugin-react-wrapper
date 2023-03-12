/**
 * 
 * @summary Radios buttons allow users to select a single option from a group. Here is its [documentation](https://my-site.com/documentation).\n\nUse it like this:\n```html\n<Radio value="1" disabled>Your label</Radio>\n```
 * 
 * @attr {string} value - The value assigned to the radio button. This will reflect in the radio group when clicked. 
 * @attr {boolean} disabled - Disables the radio button
 * 
 * @slot - add text here to label your radio button
 * 
 */
class Radio extends HTMLElement {}

customElements.define("radio-button", Radio);
