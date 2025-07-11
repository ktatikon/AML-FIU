# AML Checker - React Native App

A comprehensive Anti-Money Laundering (AML) wallet screening tool built with React Native and Expo. This app allows users to screen cryptocurrency wallet addresses for compliance and risk assessment.

## Features

- **Address Screening**: Screen Ethereum wallet addresses for AML compliance
- **Risk Assessment**: Get detailed risk scores and levels (Low, Medium, High, Extreme)
- **Wallet Type Detection**: Identify hot wallets vs cold wallets
- **Screening History**: View past screening results with caching
- **Risk Indicators**: Visual indicators showing risk factors and flags
- **Address Details**: Comprehensive view of screening results

## Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Icons**: Lucide React Native
- **Styling**: React Native StyleSheet
- **Caching**: In-memory cache with Redis-like interface
- **Backend Ready**: Prepared for Node.js + Redis + PostgreSQL integration

## Color Scheme

- **Primary**: #B1420A (Dark Orange)
- **Background**: #000000 (Black)
- **Secondary Background**: #1C1C1E (Dark Gray)
- **Tertiary Background**: #2C2C2E (Medium Gray)
- **Text**: #FFFFFF (White)
- **Secondary Text**: #8E8E93 (Light Gray)
- **Success**: #34C759 (Green)
- **Danger**: #FF3B30 (Red)
- **Warning**: #FF9500 (Orange)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
├── app/                    # App screens and navigation
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Main AML checker screen
│   ├── screening-history.tsx
│   └── address-details.tsx
├── components/            # Reusable components
│   ├── AddressInput.tsx
│   ├── AmlRiskIndicator.tsx
│   ├── Button.tsx
│   └── ErrorBoundary.tsx
├── constants/             # App constants
│   └── colors.ts
├── hooks/                 # Custom hooks
│   └── useAMLScreening.ts
├── services/              # Business logic
│   └── amlService.ts
├── types/                 # TypeScript types
│   ├── wallet.ts
│   └── aml.ts
├── utils/                 # Utility functions
│   └── amlHelpers.ts
└── config/                # Configuration
    └── redis.ts
```

## Key Components

### AML Service
- Mock AML screening with realistic risk assessment
- In-memory caching with TTL
- Wallet type detection (hot/cold)
- Risk scoring based on address patterns

### Risk Assessment
- **Low Risk (0-39)**: Safe addresses with minimal indicators
- **Medium Risk (40-69)**: Some risk factors requiring attention
- **High Risk (70-89)**: Significant risk factors, proceed with caution
- **Extreme Risk (90-100)**: Should be blocked, extremely high risk

### Wallet Types
- **Hot Wallets**: Connected to internet, frequent transactions
- **Cold Wallets**: Offline storage, enhanced security

## Test Addresses

The app includes pre-configured test addresses:

- **Low Risk**: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` (Cold Wallet)
- **Medium Risk**: `0x8C8D7C46219D9205f056f28fee5950aD564d7465` (Hot Wallet)  
- **High Risk**: `0x6B175474E89094C44Da98b954EedeAC495271d0F` (Exchange Wallet)

## Backend Integration Ready

The app is prepared for backend integration with:

- **Redis Configuration**: Ready for production caching
- **AML Provider Integration**: Structured for real AML APIs (Elliptic, Chainalysis, etc.)
- **Database Schema**: Prepared for PostgreSQL integration
- **API Endpoints**: Ready for REST API integration

## Development

### Adding New AML Providers

1. Update `services/amlService.ts` with provider-specific logic
2. Add provider configuration in `types/aml.ts`
3. Update environment variables for API keys

### Customizing Risk Logic

1. Modify risk scoring in `amlService.mockScreening()`
2. Update risk thresholds in `utils/amlHelpers.ts`
3. Adjust UI indicators in `components/AmlRiskIndicator.tsx`

## Production Deployment

For production deployment:

1. Set up Redis for caching
2. Configure PostgreSQL database
3. Integrate with real AML provider APIs
4. Set up proper environment variables
5. Implement proper authentication and authorization

## License

MIT License - see LICENSE file for details.