"use client";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import StyledRegistry from "../providers/StyledRegistry";
import { ReduxProvider } from "@/src/providers/ReduxProvider";
import { theme } from "@/src/providers/Theme";
import AuthProvider from "@/src/providers/AuthProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledRegistry>
      <ReduxProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </StyledRegistry>
  );
}
