"use client";

import React from "react";
import {
  ClerkProvider,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  UserButton as ClerkUserButton,
  OrganizationSwitcher as ClerkOrganizationSwitcher,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from "@clerk/nextjs";

import type {
  ClientAuthService,
  UseAuthResult,
  UseUserResult,
} from "./types";

const AuthProvider: ClientAuthService["components"]["AuthProvider"] = ({ children, ...rest }) => {
  return <ClerkProvider {...rest}>{children}</ClerkProvider>;
};

function useAuth(): UseAuthResult {
  const { isLoaded, isSignedIn, userId, orgId, signOut } = useClerkAuth();
  return {
    isLoaded: Boolean(isLoaded),
    isSignedIn: Boolean(isSignedIn),
    userId: userId ?? null,
    organizationId: orgId ?? null,
    signOut,
  };
}

function useUser<TUser = unknown>(): UseUserResult<TUser> {
  const { isLoaded, user } = useClerkUser();
  return {
    isLoaded: Boolean(isLoaded),
    user: (user as unknown as TUser) ?? null,
  };
}

const SignIn: ClientAuthService["components"]["SignIn"] = (props) => {
  return <ClerkSignIn {...props} />;
};

const SignUp: ClientAuthService["components"]["SignUp"] = (props) => {
  return <ClerkSignUp {...props} />;
};

const UserButton: ClientAuthService["components"]["UserButton"] = (props) => {
  return <ClerkUserButton {...props} />;
};

const OrganizationSwitcher: ClientAuthService["components"]["OrganizationSwitcher"] = (props) => {
  return <ClerkOrganizationSwitcher {...props} />;
};

export const clerkClientAuthService: ClientAuthService = {
  provider: "CLERK",
  hooks: {
    useAuth,
    useUser,
  },
  components: {
    AuthProvider,
    SignIn,
    SignUp,
    UserButton,
    OrganizationSwitcher,
  },
};


