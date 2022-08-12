import React, { useState } from "react";
import { Radio, RadioGroup } from "../wrapped-components";

export default () => {

  return (
    <div>

      <RadioGroup value="3" size={3}>
        <Radio />
      </RadioGroup>

    </div>
  );
};