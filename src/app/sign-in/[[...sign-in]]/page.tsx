import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            variables: {
              colorBackground: '#ffffff',
              colorText: '#000000',
              colorInputBackground: '#ffffff',
              colorInputText: '#000000',
              colorInputBorder: 'hsl(var(--border))',
              colorPrimary: '#2563eb',
            },
            elements: {
                    card: "bg-white text-dark border border-border shadow-lg",
      headerTitle: "text-dark",
              headerSubtitle: "text-gray-600",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700",
              // Inputs remain white in dark mode
                      formFieldInput: "bg-white text-dark placeholder:text-gray-600 border-border focus:ring-2 focus:ring-ring focus:border-ring",
        socialButtonsBlockButton: "bg-white text-dark border border-gray-300 hover:bg-gray-50",
        socialButtonsBlockButtonText: "text-dark",
              footer: "text-gray-600",
              formButtonPrimary: "bg-gray-600 hover:bg-gray-700 text-white",
            },
          }}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
} 