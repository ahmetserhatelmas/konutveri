# Evveri Proje Mimarisi

Bu doküman Evveri platformunun teknik mimarisini açıklar.

## 🏗 Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                      Next.js 15 (React)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Edge Network)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Next.js   │  │  API Routes │  │  Serverless      │   │
│  │   SSR/SSG   │  │  (Proxy)    │  │  Functions       │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐        ┌──────────┐        ┌──────────────┐
    │  Static │        │ Supabase │        │  TCMB EVDS   │
    │  Assets │        │   (DB)   │        │     API      │
    └─────────┘        └──────────┘        └──────────────┘
                             │
                             │ PostgreSQL
                             ▼
                    ┌─────────────────┐
                    │   Data Tables   │
                    │ - housing_price │
                    │ - loan_rates    │
                    │ - inflation     │
                    └─────────────────┘
```

## 📦 Katmanlar

### 1. Presentation Layer (UI)
**Lokasyon:** `app/`, `components/`

**Sorumluluklar:**
- Kullanıcı arayüzü render
- User input handling
- Data visualization (charts)

**Teknolojiler:**
- Next.js 15 App Router
- React Server Components
- TailwindCSS
- Recharts

**Önemli Sayfalar:**
```
app/
├── page.tsx              # Ana sayfa (Hero, Features)
├── calculator/
│   └── page.tsx          # Kira vs Kredi hesaplayıcı
├── analytics/
│   ├── page.tsx          # Analizler listesi
│   └── [city]/           # Şehir detay sayfaları
└── api/                  # API Routes
```

### 2. API Layer
**Lokasyon:** `app/api/`, `lib/api/`

**Sorumluluklar:**
- External API calls (TCMB EVDS)
- Request/Response handling
- Data transformation
- Error handling

**Endpoints:**
```
/api/cron/sync-data        # Cron job - Veri güncelleme
/api/evds/housing-price-index  # HPI verileri proxy
/api/evds/loan-rates       # Kredi faiz oranları proxy
```

**API Client:**
```typescript
// lib/api/evds.ts
class EVDSApiClient {
  fetchHousingPriceIndex()
  fetchLoanInterestRates()
  fetchInflationRates()
  fetchExchangeRates()
}
```

### 3. Business Logic Layer
**Lokasyon:** `lib/utils/`

**Sorumluluklar:**
- Hesaplamalar (calculations.ts)
- Veri işleme
- Business rules

**Önemli Fonksiyonlar:**
```typescript
// lib/utils/calculations.ts
calculateMonthlyMortgage()      # Aylık taksit hesaplama
calculateRentVsMortgage()       # Kira vs Kredi karşılaştırma
calculateInvestmentReturn()     # Yatırım getirisi
calculateRealReturn()           # Enflasyona göre reel getiri
```

### 4. Data Access Layer
**Lokasyon:** `lib/db/`

**Sorumluluklar:**
- Database queries
- Data persistence
- CRUD operations

**Database Client:**
```typescript
// lib/db/supabase.ts
export const supabase = createClient(...)
export function getServiceSupabase() { ... }
```

### 5. Database (Supabase/PostgreSQL)

**Schema:**
```
cities
├── id (uuid)
├── name (varchar)
├── slug (varchar)
└── evds_code (varchar)

housing_price_index
├── id (uuid)
├── date (date)
├── city_id (uuid FK)
├── index_value (decimal)
├── monthly_change (decimal)
└── yearly_change (decimal)

loan_interest_rates
├── id (uuid)
├── date (date)
├── rate_type (varchar)
└── interest_rate (decimal)

inflation_rates
├── id (uuid)
├── date (date)
├── rate_type (varchar)
└── rate_value (decimal)
```

## 🔄 Veri Akışı

### Senaryo 1: Kullanıcı Hesaplama Yapar

```
User Input (Calculator Form)
    ↓
React Component State Update
    ↓
calculateRentVsMortgage() fonksiyonu çağrılır
    ↓
Hesaplama yapılır (pure function)
    ↓
Result UI'da gösterilir
```

**Not:** Bu flow tamamen client-side, DB/API kullanmaz.

### Senaryo 2: Şehir Analizi Sayfası

```
User clicks "İstanbul Analizi"
    ↓
Navigate to /analytics/istanbul
    ↓
Server Component render
    ↓
Supabase'den veri çek:
  - housing_price_index WHERE city_id = 'istanbul'
    ↓
Data transformation (format dates, calculate changes)
    ↓
Pass to Client Component (Chart)
    ↓
Recharts renders LineChart
```

### Senaryo 3: Otomatik Veri Güncelleme (Cron)

```
Vercel Cron Trigger (her gün 02:00)
    ↓
/api/cron/sync-data endpoint çağrılır
    ↓
Authorization check (CRON_SECRET)
    ↓
EVDSApiClient.fetchHousingPriceIndex() 
  → Her şehir için API call
    ↓
TCMB EVDS API Response
    ↓
Data transformation (parse dates, numbers)
    ↓
Supabase UPSERT
  → housing_price_index table
    ↓
Response: { success: true, results: ... }
```

## 🔐 Güvenlik

### Environment Variables
```
NEXT_PUBLIC_*  → Client-side erişilebilir
Diğerleri      → Sadece server-side
```

### API Protection
```typescript
// Cron endpoint
const token = authHeader?.replace('Bearer ', '');
if (token !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Rate Limiting
- TCMB EVDS: 30 req/min (API tarafında)
- Uygulama: Caching ile minimize edilir

## 📊 Caching Stratejisi

### Static Generation (SSG)
```typescript
// Şehir listesi (değişmez)
export const dynamic = 'force-static';
```

### Incremental Static Regeneration (ISR)
```typescript
// Analiz sayfaları (günde 1 kez güncelle)
export const revalidate = 86400; // 24 saat
```

### Client-side Cache
```typescript
// React Query kullanılabilir (gelecek)
const { data } = useQuery(['housing-price', city], fetchHousingPrice, {
  staleTime: 1000 * 60 * 60, // 1 saat
});
```

## 🚀 Deployment Flow

```
Code Push to GitHub
    ↓
Vercel Webhook Trigger
    ↓
Vercel Build Process:
  - npm install
  - npm run build (Next.js build)
  - Type check
  - Lint check
    ↓
Deploy to Edge Network
    ↓
Automatic HTTPS & CDN
    ↓
Cron Jobs Configured (vercel.json)
    ↓
Production Ready ✅
```

## 📈 Performans Optimizasyonları

### 1. Server Components
- Default olarak Server Component
- Sadece interaktif parçalar Client Component

### 2. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components

### 3. Image Optimization
```typescript
import Image from 'next/image';
<Image src="..." alt="..." width={100} height={100} />
```

### 4. Database Indexes
```sql
CREATE INDEX idx_hpi_date ON housing_price_index(date DESC);
CREATE INDEX idx_hpi_city ON housing_price_index(city_id);
```

## 🧪 Testing Stratejisi (Gelecek)

```
Unit Tests (Jest)
  ↓ lib/utils/calculations.test.ts
  
Integration Tests (Playwright)
  ↓ tests/calculator.spec.ts
  
E2E Tests (Playwright)
  ↓ tests/user-journey.spec.ts
```

## 📱 Responsive Design

```
Mobile First Approach:
  - Base: Mobile design
  - sm: 640px+
  - md: 768px+ (Tablet)
  - lg: 1024px+ (Desktop)
  - xl: 1280px+
```

## 🔧 Debugging

### Development
```bash
npm run dev
# Logs appear in terminal
```

### Production (Vercel)
```
Vercel Dashboard > Deployments > Function Logs
```

### Database (Supabase)
```
Supabase Dashboard > Table Editor
Supabase Dashboard > SQL Editor (queries)
```

---

**📚 İlgili Dokümantasyon:**
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Kurulum rehberi
- [EVDS_API.md](./docs/EVDS_API.md) - TCMB API dokümantasyonu
- [README.md](./README.md) - Genel bakış
