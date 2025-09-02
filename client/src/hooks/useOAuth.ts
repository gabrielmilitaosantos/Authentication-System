import { useContext } from "react";
import { OAuthContext } from "../context/OAuth-Context";

export function useOAuth() {
  const context = useContext(OAuthContext);
  if (context === undefined) {
    throw new Error("useOAuth must be used within an OAuthProvider");
  }

  return context;
}
