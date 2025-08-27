# WellSwap Platform v2

Revolutionary Web3 Insurance Asset Trading Platform

## 🌟 Overview

WellSwap is an AI-powered insurance asset trading platform that enables secure and efficient trading of insurance products across global markets including Hong Kong, Singapore, UK, and US markets.

## 🚀 Features

- **AI Valuation**: Advanced mathematical models with actuarial science
- **Global Market Access**: Hong Kong, Singapore, UK, US markets
- **Secure Trading**: Blockchain-based multi-signature contracts
- **Document Analysis**: AI-powered OCR for insurance certificate processing
- **Real-time Analytics**: Advanced charts and performance monitoring
- **Multi-language Support**: English, Korean, Chinese, Japanese

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase, AI Server (Render.com)
- **Blockchain**: Ethereum, MetaMask Integration
- **AI/ML**: GPT-4, HuggingFace OCR, Azure Vision
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/taewoongan/wellswap-platform-v2.git
cd wellswap-platform-v2
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp env.example .env.local
```
Fill in your environment variables in `.env.local`

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Server
NEXT_PUBLIC_AI_SERVER_URL=https://wellswaphk.onrender.com

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address

# API Keys
GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_key
AZURE_VISION_API_KEY=your_azure_vision_key
NEXT_PUBLIC_HUGGINGFACE_TOKEN=your_huggingface_token
RESEND_API_KEY=your_resend_key

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🏗 Project Structure

```
wellswap-platform-v2/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── pages/            # Page components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── config.ts         # Environment configuration
│   ├── supabase.ts       # Supabase client
│   ├── api.ts            # API client
│   └── contracts/        # Smart contract ABIs
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import Git repository: `wellswap-platform-v2`
   - Set deployment branch: `vercel-deploy`

2. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure all API keys and URLs are properly configured

3. **Deploy**
   - Vercel will automatically deploy on push to `vercel-deploy` branch

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Security

- Multi-signature authentication required for transactions
- Blockchain-based security
- Environment variable protection
- API key management

## 📊 Performance

- Optimized component splitting
- Dynamic imports for code splitting
- Image optimization
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 Live Demo

- **Production**: [https://global-wellswap-platform-p2sr.vercel.app/](https://global-wellswap-platform-p2sr.vercel.app/)
- **Development**: [http://localhost:3000](http://localhost:3000)

## 📞 Support

- **Email**: concierge@wellswap.com
- **Phone**: +852 1234 5678
- **Operating Hours**: Monday - Friday, 9:00 AM - 6:00 PM (HKT)

---

Built with ❤️ by the WellSwap Team
