import React, { useState } from "react";

export default ({ title }) => {
  const [hidden, setDisplay] = useState(false);
  function toggleVisibility() {
     hidden===true?setDisplay(false)
     :setDisplay(true);
  }

  return (
    <div>
      <h3 hidden={hidden}>{title}!</h3>
      <button onClick={toggleVisibility}>Toggle visibility</button>

      
      <RadioGroup value="2" size={3}>
        <span slot="label">My Label</span>
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
        <Radio value="3">Option 3</Radio>
      </RadioGroup>

    </div>
  );
};