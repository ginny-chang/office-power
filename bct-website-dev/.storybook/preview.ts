import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { default: "paper", values: [{ name: "paper", value: "#f7f4ef" }] },
    layout: "padded",
  },
};

export default preview;
