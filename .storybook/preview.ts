import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for component iframe",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const globalTheme = context.globals.theme as
        | "light"
        | "dark"
        | "system"
        | undefined;
      let resolvedTheme: "light" | "dark" = "light";

      if (globalTheme === "dark") {
        resolvedTheme = "dark";
      } else if (globalTheme === "system") {
        const prefersDark =
          typeof window !== "undefined" &&
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolvedTheme = prefersDark ? "dark" : "light";
      }

      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", resolvedTheme);
      }

      return Story();
    },
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
