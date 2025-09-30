import { SignIn } from "@/components/auth";

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
                    card: "bg-white text-black border border-gray-200 shadow-lg",
      headerTitle: "text-black",
              headerSubtitle: "text-gray-600",
              dividerLine: "bg-gray-200",
              dividerText: "text-black",
              formFieldLabel: "text-black",
              // Inputs remain white in dark mode
                      formFieldInput: "bg-white text-black placeholder:text-gray-500 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        socialButtonsBlockButton: "bg-white text-black border border-gray-300 hover:bg-gray-50",
        socialButtonsBlockButtonText: "text-black",
              footer: "text-black",
              formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
            },
          }}
          fallbackRedirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
} 