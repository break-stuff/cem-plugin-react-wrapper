import React, { useState } from "react";
import { Radio, RadioGroup } from "../wrapped-components";

export default () => {
  return (
    <div>

      <RadioGroup value="3" size={1}>
        <Radio value="1">Option 1</Radio>
        <Radio value="2">Option 2</Radio>
        <Radio value="3">Option 3</Radio>
      </RadioGroup>

    </div>
  );
};
