import { canInsert, ProseMirrorTool } from "@dc-extension-rich-text/common";
import FiberNewIcon from "@material-ui/icons/FiberNew";
import React from "react";

export function TestTool(schema: any): ProseMirrorTool {
  return {
    name: "test",
    label: "Insert Test",
    displayIcon: <FiberNewIcon />,
    apply: (state: any, dispatch: any) => {
      dispatch(state.tr.replaceSelectionWith(schema.nodes.test.create()));
    },
    isEnabled: (state: any) => canInsert(state, schema.nodes.test),
  };
}
