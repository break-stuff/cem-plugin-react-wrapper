import React, {useRef} from "react";
import { Radio, RadioGroup } from "../wrapped-components";

export default () => {
  const ref = useRef(null);
  ref.
  return (
    <div>

      <RadioGroup value="3" size={1} ref={ref}>
        <Radio value="1" onClick={
          () => {}
        }>Option 1</Radio>
        <Radio value="2">Option 2</Radio>
        <Radio value="3">Option 3</Radio>
      </RadioGroup>

    </div>
  );
};
