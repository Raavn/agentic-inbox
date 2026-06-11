export function getAuthErrorMessage(errorCode: string | undefined): string {
  switch (errorCode) {
    case "AccessDenied":
      return "You need an invite to access Agentic Inbox.";
    case "Configuration":
      return "There is a configuration issue with authentication.";
    case "Verification":
      return "Email verification failed. Please try signing in again.";
    default:
      return "We were unable to sign you in. Please try again.";
  }
}
