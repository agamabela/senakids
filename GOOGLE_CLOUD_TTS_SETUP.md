# Google Cloud Text-to-Speech Setup Guide

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Text-to-Speech API

## Step 2: Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill in the details and click **Create and Continue**
4. Grant the **Cloud Text-to-Speech Client** role
5. Click **Continue** and then **Done**

## Step 3: Create JSON Key
1. Click on the created service account
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create** - this downloads the key file

## Step 4: Configure Environment
1. Save the downloaded JSON key to your project directory
   ```bash
   # Example: save to project root
   cp ~/Downloads/your-key.json ./google-cloud-key.json
   ```

2. Update your `.env.local` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./google-cloud-key.json"
   ```

3. **Important**: Add `google-cloud-key.json` to `.gitignore` to prevent exposing credentials:
   ```bash
   echo "google-cloud-key.json" >> .gitignore
   ```

## Step 5: Test the Integration
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/belajar-membaca` page
3. Click on a word - it should now use Google Cloud Text-to-Speech with native Indonesian voice

## Voices Used
- **Indonesian**: `id-ID-Neural2-C` (Neural2 voice - high quality)
- **English**: `en-US-Neural2-C` (Neural2 voice)

## Pricing
Google Cloud Text-to-Speech offers:
- Free: 1 million characters per month
- Paid: $16 per 1 million characters after free tier

Check [Google Cloud Pricing](https://cloud.google.com/text-to-speech/pricing) for details.

## Troubleshooting

### "GOOGLE_APPLICATION_CREDENTIALS not found"
- Ensure the JSON key file path is correct in `.env.local`
- Restart the development server after changing `.env.local`

### Audio not playing
- Check browser console for errors
- Verify the API response contains audio data
- Make sure your Google Cloud project has billing enabled

### Slow response time
- Audio is cached in memory - subsequent requests should be faster
- Consider implementing persistent caching (e.g., in a database) for production
