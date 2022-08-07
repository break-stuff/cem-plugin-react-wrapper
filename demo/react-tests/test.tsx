import React, { useState } from "react";
import { MyElement } from "../wrapped-components/";

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
      <MyElement />
    </div>
  );
};