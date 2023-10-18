import React, { useState } from "react";
import { RadioGroup, Radio } from '../wrapped-components'

export default ({ title }) => {
  const [hidden, setDisplay] = useState(false);
  function toggleVisibility() {
     hidden===true?setDisplay(false)
     :setDisplay(true);
  }

  return (
    <div>
      <h3 hidden={hidden}>{title}!</h3>
      <button onClick={toggleVisibility} key>Toggle visibility</button>

      
      <RadioGroup value="2" size="2">
        <span slot="label">My Label</span>
        <Radio value="1" onMouseOver={toggleVisibility}>Option 1</Radio>
        <Radio value="2">Option 2</Radio>
        <Radio value="3">Option 3</Radio>
      </RadioGroup>

    </div>
  );
};