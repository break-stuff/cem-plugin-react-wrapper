/**
 * 
 * @summary My custom component. Here is its [documentation](https://my-site.com/documentation).\n\nUse it like this:\n```html\n<Radio value="1" disabled>Your label</Radio>\n```
 * 
 * @tag radio-group
 * @tagname radio-group
 *
 * @attr {string} value - The value assigned to the radio group
 * @attr {boolean} disabled - Disables the radio button
 * 
 * @slot - add text here to label your radio button
 * 
 */
class Radio extends HTMLElement {}

customElements.define("radio-button", Radio);
