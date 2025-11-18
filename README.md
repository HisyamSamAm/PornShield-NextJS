# PornShield

A Next.js application that provides image content analysis using NSFW.js to detect and filter inappropriate content. The application automatically blurs images containing adult content and provides visual warnings to users.

## Features

PornShield offers comprehensive image analysis with the following capabilities:

- Real-time image upload and analysis
- NSFW content detection using machine learning
- Automatic image blurring for sensitive content
- Visual alerts for detected inappropriate material
- Secure image storage with Vercel Blob
- Responsive design with dark mode support

## NSFW.JS Integration

This application utilizes NSFW.js, a JavaScript library that employs TensorFlow.js for client-side image classification. The library analyzes images across five content categories:

- Neutral: Safe, everyday content
- Drawing: Animated or illustrated material
- Hentai: Anime-style adult content
- Porn: Explicit adult material
- Sexy: Suggestive or sensual content

### Implementation Details

The NSFW detection works through the following process:

1. Images are processed locally in the browser using TensorFlow.js
2. The MobileNetV2 model analyzes image content at 224x224 pixel resolution
3. Classification results provide probability scores for each category
4. Content with high-risk categories (Sexy, Porn, Hentai) above 50% threshold triggers safety measures
5. Detected inappropriate content is automatically blurred with visual warnings

### Model Loading

The NSFW.js model is loaded once when the application starts:

```javascript
import * as nsfwjs from 'nsfwjs';

const model = await nsfwjs.load();
const predictions = await model.classify(imageElement);
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: NSFW.js with TensorFlow.js
- **Storage**: Vercel Blob Storage
- **Deployment**: Vercel Platform

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pornshield-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env.local` file:
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Navigate to the application in your web browser
2. Click "Select Image" to choose an image file
3. The application will automatically analyze the uploaded image
4. View the classification results and any safety warnings
5. Images containing inappropriate content will be blurred with alerts

## Project Structure

```
pornshield-nextjs/
├── app/
│   ├── api/analyze/route.ts    # Image upload endpoint
│   ├── components/
│   │   └── ImageUploadForm.tsx # Main upload component
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── public/                     # Static assets
└── package.json                # Dependencies
```

## Environment Variables

The application requires the following environment variable:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token for image uploads

## Deployment

This application is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add the `BLOB_READ_WRITE_TOKEN` environment variable in Vercel dashboard
3. Deploy the application

## License

This project is licensed under the MIT License.
