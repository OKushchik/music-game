"use client";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import StyledRegistry from "../providers/StyledRegistry";
import { ReduxProvider } from "@/src/providers/ReduxProvider";
import { theme } from "@/src/providers/Theme";
import AuthProvider from "@/src/providers/AuthProvider";
import { SocketProvider } from "@/src/providers/SocketProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyledRegistry>
      <ReduxProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </ReduxProvider>
    </StyledRegistry>
  );
}
