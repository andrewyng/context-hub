---
name: material
description: "Material UI component library for React apps using @mui/material with theming, layout, forms, and Emotion-based styling."
metadata:
  languages: "javascript"
  versions: "7.3.9"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "mui,material-ui,react,ui,components,emotion"
---

# Material UI Guide (JavaScript)

## Golden Rule

Use `@mui/material` for React UI components, and install its default styling peer dependencies at the same time: `@emotion/react` and `@emotion/styled`.

For app-wide styling, create one theme with `createTheme`, provide it with `ThemeProvider`, and add `CssBaseline` once near the root.

## Install

Install the package and its default styling dependencies:

```bash
npm install @mui/material @emotion/react @emotion/styled
```

If your project does not already use React:

```bash
npm install react react-dom
```

Optional packages commonly used with Material UI:

```bash
npm install @mui/icons-material
npm install @fontsource/roboto
```

Material UI does not require API keys, secrets, or service client initialization. The only setup is React rendering plus the MUI theme provider.

## Initialize Material UI

Create the theme once and wrap your app with `ThemeProvider`.

```jsx
// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
```

Use Material UI components directly inside your app:

```jsx
// src/App.jsx
import { useState } from "react";
import {
  Alert,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function App() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack component="form" spacing={3} onSubmit={handleSubmit}>
        <Typography component="h1" variant="h4">
          Create account
        </Typography>

        {submitted ? (
          <Alert severity="success">We will contact {email}.</Alert>
        ) : null}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={!email}>
          Sign up
        </Button>
      </Stack>
    </Container>
  );
}
```

## Common Workflows

### Use `sx` for one-off layout and spacing

The `sx` prop is the fastest way to apply theme-aware spacing, color, borders, and responsive layout.

```jsx
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

export function StatusCard() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip label="Production" color="success" size="small" />
        <Chip label="EU region" variant="outlined" size="small" />
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Billing service
      </Typography>

      <Box sx={{ color: "text.secondary" }}>
        Healthy for the last 30 days.
      </Box>
    </Paper>
  );
}
```

### Customize shared design tokens with `createTheme`

Use `createTheme` to centralize palette values, typography, and component defaults.

```jsx
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0057b8",
    },
    secondary: {
      main: "#7b1fa2",
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "small",
      },
    },
  },
});

export function AppProviders({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

### Build reusable themed components with `styled`

Use `styled` when the same UI pattern appears in multiple places and should stay connected to the theme.

```jsx
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const PrimaryAction = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  paddingInline: theme.spacing(3),
  textTransform: "none",
}));

export function CheckoutButton() {
  return <PrimaryAction variant="contained">Checkout</PrimaryAction>;
}
```

### Add Material icons when you need them

Icons are in a separate package.

```bash
npm install @mui/icons-material
```

```jsx
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";

export function SaveButton() {
  return (
    <Button variant="contained" startIcon={<SaveIcon />}>
      Save changes
    </Button>
  );
}
```

## Important Pitfalls

- Install `@emotion/react` and `@emotion/styled` with `@mui/material`. The default Material UI setup depends on them.
- `ThemeProvider` only affects the subtree it wraps. Put it near the top of the app if most screens share the same theme.
- Add `CssBaseline` once, not in every page component.
- If you want Material UI's default typography, install and load `@fontsource/roboto` or provide your own font in the theme.
- `@mui/icons-material` is not included in `@mui/material`; install it separately before importing icons.

## Version Notes

This guide targets `@mui/material` version `7.3.9` and uses the default Emotion-based styling setup from the Material UI docs.
