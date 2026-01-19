# Apple Sign-In Setup Guide for Clerk

## 1. Apple Developer Account Setup
1. Log in to [Apple Project Developer](https://developer.apple.com/account/).
2. Go to **Certificates, Identifiers & Profiles**.
3. **Identifiers**: Create a new **App ID** for your app if you haven't.
4. **Services ID**: 
   - Create a new **Services ID**.
   - Identifier example: `com.cruxly.app.auth`
   - Enable "Sign In with Apple".
   - Configure it:
     - Domains: Your Clerk Frontend API domain (e.g., `clerk.cruxly.com` or the provided Vercel/Clerk domain without `https://`).
     - Return URLs: `https://<YOUR_CLERK_DOMAIN>/v1/oauth/callback` (Find this in Clerk Dashboard > Social Connections > Apple).
5. **Keys**:
   - Create a new Key.
   - Enable "Sign In with Apple" and associate it with your primary App ID.
   - Download the `.p8` file (Private Key). **Save this securely!**
   - Note the **Key ID** and your **Team ID**.

## 2. Clerk Dashboard Configuration
1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Navigate to **Configure > Social Connections**.
3. Toggle on **Apple**.
4. Fill in the required fields:
   - **Service ID**: The identifier you created (e.g., `com.cruxly.app.auth`).
   - **Team ID**: Your Apple Team ID.
   - **Key ID**: The ID of the key you created.
   - **Private Key**: Paste the contents of the `.p8` file.
   - **Redirect URL**: Copy this URL and add it to your Apple Services ID configuration if you haven't already.

## 3. Environment Variables
No new environment variables are needed in your local `.env` file for Apple Sign-In specifically, as it is handled by the Clerk instance. Ensure your standard Clerk keys are set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 4. Testing
- Restart your development server.
- Open the Sign In modal.
- You should now see the **"Continue with Apple"** button automatically appearing alongside Google.
