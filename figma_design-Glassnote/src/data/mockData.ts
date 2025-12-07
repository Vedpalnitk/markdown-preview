import { Note, Folder } from '../App';

export const mockFolders: Folder[] = [
  { id: 'all', name: 'All Notes', parentId: null, icon: 'FileText' },
  { id: 'work', name: 'Work', parentId: null, icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', parentId: null, icon: 'Home' },
  { id: 'projects', name: 'Projects', parentId: 'work', icon: 'Rocket' },
  { id: 'meetings', name: 'Meetings', parentId: 'work', icon: 'Users' },
  { id: 'ideas', name: 'Ideas', parentId: 'personal', icon: 'Lightbulb' },
];

const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;
const oneWeek = 7 * oneDay;

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Veo Trading',
    content: `# Quick Start (Next Time)

## Terminal 1 - Frontend:
\`\`\`bash
cd /Users/opt/run/Documents/GitHub/options-trading/frontend
PORT=3001 npm run dev
\`\`\`

## Terminal 2 - Backend:
\`\`\`bash
cd /Users/opt/run/Documents/GitHub/options-trading/v1
source venv/bin/activate
python python-service/market.py
\`\`\`

## Terminal 3 - Cloudflare Tunnel:
\`\`\`bash
cloudflared tunnel run sparrow-trade-v1
\`\`\`

---

# Phase 4: Data Persistence & Historical Analytics

**Priority:** HIGH | **Impact:** Critical for production use

- **Database Layer:** Store trades, reports, and signals for historical analysis
- **Audit Trail:** Track all system decisions for compliance
- **Analytics Dashboard:** Historical P&L, equity curves, drawdown analysis
- **Report Archive:** Persist all generated reports for retrieval

## Phase 5: Live Trading Integration (Zerodha)

**Priority:** HIGH | **Impact:** Revenue-generating

- **API Broker Connection:** Replace paper trading with live execution
- **Authentication:** Zerodha OAuth integration (noted in git status)
- **Order Management:** Real order placement and tracking
- **Risk Controls:** Hard limits before live trading
- **Circuit Breakers:** Emergency stop-loss mechanisms

## Phase 6: Frontend ML Integration

**Priority:** MEDIUM | **Impact:** User experience

Looking at the git status, there are already partially implemented:
- \`frontend/login/ml\` - ML page structure
- \`frontend/components/ml/\` - ML components
- \`frontend/api/models/\` - Model API endpoints
- \`frontend/lib/store/ml-store.ts\` - State management
- \`frontend/lib/hooks/use-ml.ts\` - React hooks

**Work needed:**
- Complete ML model monitoring dashboard
- Feature importance visualization
- Training progress tracking`,
    folderId: 'projects',
    createdAt: now - oneDay,
    updatedAt: now - oneDay,
    pinned: true,
    tags: ['trading', 'development', 'terminal'],
    deleted: false,
  },
  {
    id: '2',
    title: 'Veo Analytics',
    content: `# ML Model Performance Analysis

## Current Model Metrics
- **Accuracy:** 87.3%
- **Precision:** 0.89
- **Recall:** 0.85
- **F1 Score:** 0.87

## Recent Improvements
1. Added feature engineering for volatility indicators
2. Implemented LSTM for time-series prediction
3. Integrated sentiment analysis from news feeds

## Next Steps
- [ ] Backtesting on 2 years of historical data
- [ ] Implement ensemble methods
- [ ] Add real-time data streaming
- [ ] Deploy model to production environment

## Performance Benchmarks
| Model | Accuracy | Training Time | Inference Time |
|-------|----------|---------------|----------------|
| LSTM  | 87.3%    | 45 min        | 12ms          |
| GRU   | 85.1%    | 38 min        | 10ms          |
| Transformer | 89.2% | 120 min    | 25ms          |

> **Note:** Transformer model shows best accuracy but needs optimization for real-time use.`,
    folderId: 'projects',
    createdAt: now - oneDay,
    updatedAt: now - 2 * 60 * 60 * 1000,
    pinned: true,
    tags: ['ml', 'analytics', 'performance'],
    deleted: false,
  },
  {
    id: '3',
    title: 'Cloudflare & Ngrok',
    content: `# Cloudflare Tunnel Setup

## Installation
\`\`\`bash
brew install cloudflare/cloudflare/cloudflared
\`\`\`

## Authentication
\`\`\`bash
cloudflared tunnel login
\`\`\`

## Create Tunnel
\`\`\`bash
cloudflared tunnel create sparrow-trade-v1
\`\`\`

## Configure DNS
Add CNAME record pointing to the tunnel UUID

## Run Tunnel
\`\`\`bash
cloudflared tunnel run sparrow-trade-v1
\`\`\`

---

# Ngrok Alternative

## Quick Start
\`\`\`bash
ngrok http 3000
\`\`\`

## Custom Domain
\`\`\`bash
ngrok http --domain=myapp.ngrok.io 3000
\`\`\`

## Comparison

| Feature | Cloudflare | Ngrok |
|---------|-----------|-------|
| Free Tier | Unlimited | 1 concurrent tunnel |
| Custom Domain | Yes | Paid only |
| Performance | Better | Good |
| SSL | Automatic | Automatic |`,
    folderId: 'projects',
    createdAt: now - oneDay,
    updatedAt: now - oneDay,
    pinned: false,
    tags: ['devops', 'tunnel', 'deployment'],
    deleted: false,
  },
  {
    id: '4',
    title: 'Weekly Team Sync',
    content: `# Weekly Team Meeting - December 2, 2025

## Attendees
- Sarah Chen (PM)
- Michael Rodriguez (Tech Lead)
- Jessica Park (Designer)
- David Kumar (Backend)

## Agenda Items

### 1. Sprint Review
✅ Completed:
- User authentication flow
- Dashboard redesign
- API rate limiting
- Database migration

🔄 In Progress:
- Mobile responsive views
- Dark mode implementation
- Performance optimization

### 2. Q1 2026 Planning
**Key Objectives:**
1. Launch mobile app (iOS & Android)
2. Implement real-time collaboration
3. Expand to European markets
4. Add 5 new integrations

### 3. Technical Debt
- Refactor legacy payment processing code
- Update dependencies (React 19, Node 20)
- Improve test coverage to 80%+
- Document API endpoints

### 4. Action Items
- [ ] Sarah: Create PRD for mobile app
- [ ] Michael: Architecture review for real-time features
- [ ] Jessica: Mobile app wireframes
- [ ] David: Research WebSocket implementation

**Next Meeting:** December 9, 2025 @ 10:00 AM`,
    folderId: 'meetings',
    createdAt: now - 2 * oneDay,
    updatedAt: now - 2 * oneDay,
    pinned: false,
    tags: ['meeting', 'team', 'sprint'],
    deleted: false,
  },
  {
    id: '5',
    title: 'Home Expenses v2',
    content: `# November 2025 Expenses

## Fixed Costs
- 🏠 Rent: $2,400
- ⚡ Utilities: $180
- 📱 Internet: $60
- 🚗 Car Insurance: $145
- 💳 Subscriptions: $85

**Total Fixed:** $2,870

## Variable Costs
- 🛒 Groceries: $520
- 🍕 Dining Out: $380
- ⛽ Gas: $160
- 🎬 Entertainment: $95
- 👕 Shopping: $240

**Total Variable:** $1,395

## Savings & Investments
- 💰 Emergency Fund: $500
- 📈 Index Funds: $800
- 🏦 Retirement: $1,200

**Total Saved:** $2,500

---

## December Budget Plan
Target to reduce variable costs by 15%:
- Cook more meals at home (target: $450 groceries, $250 dining)
- Limit entertainment to $60
- No non-essential shopping

**Goal:** Save additional $300/month`,
    folderId: 'personal',
    createdAt: now - 3 * oneDay,
    updatedAt: now - 3 * oneDay,
    pinned: false,
    tags: ['finance', 'budget', 'personal'],
    deleted: false,
  },
  {
    id: '6',
    title: 'Deli Analysis V3',
    content: `# Delivery Service Analysis

## Market Research Summary

### Competitors Analysis
1. **DoorDash**
   - Market Share: 58%
   - Avg Delivery Time: 35 min
   - Commission: 25-30%
   - Rating: 4.2/5

2. **Uber Eats**
   - Market Share: 28%
   - Avg Delivery Time: 32 min
   - Commission: 25-35%
   - Rating: 4.3/5

3. **Grubhub**
   - Market Share: 14%
   - Avg Delivery Time: 40 min
   - Commission: 20-25%
   - Rating: 4.0/5

## Our Differentiators
- ⚡ **15-minute guarantee** for nearby restaurants
- 💵 **Flat $2.99 delivery fee** (no surge pricing)
- 🎯 **Zero commission** for first 100 restaurant partners
- 🌱 **Carbon-neutral delivery** (electric vehicles & bikes)

## Financial Projections

| Month | Orders | Revenue | Costs | Profit |
|-------|--------|---------|-------|--------|
| 1     | 500    | $7,500  | $12,000 | -$4,500 |
| 3     | 2,000  | $30,000 | $35,000 | -$5,000 |
| 6     | 5,500  | $82,500 | $70,000 | $12,500 |
| 12    | 15,000 | $225,000| $160,000| $65,000 |

## Next Steps
1. Secure seed funding ($500K target)
2. Recruit 50 restaurant partners
3. Hire 25 delivery drivers
4. Launch beta in downtown area`,
    folderId: 'projects',
    createdAt: now - 4 * oneDay,
    updatedAt: now - 4 * oneDay,
    pinned: false,
    tags: ['business', 'analysis', 'startup'],
    deleted: false,
  },
  {
    id: '7',
    title: 'Expenses Portal',
    content: `# Expense Tracking Portal - Feature Spec

## Core Features

### 1. Receipt Scanning
- 📸 OCR technology for automatic data extraction
- 🔍 Support for multiple formats (PDF, JPG, PNG)
- ✅ Manual verification and editing
- 🏷️ Auto-categorization using ML

### 2. Reporting
- 📊 Real-time expense dashboard
- 📈 Monthly/Quarterly/Annual reports
- 💼 Per-project expense tracking
- 📧 Automated report emails

### 3. Integrations
- 💳 Connect to bank accounts
- 🏦 QuickBooks/Xero sync
- 📱 Mobile app (iOS & Android)
- 🔔 Slack/Teams notifications

### 4. Approval Workflow
\`\`\`
Employee → Manager → Finance → Approved
           ↓          ↓
        Reject    Request More Info
\`\`\`

## Technical Stack
- **Frontend:** React + TypeScript + Tailwind
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Storage:** AWS S3
- **OCR:** Google Vision API

## Timeline
- Week 1-2: UI/UX Design
- Week 3-5: Core Development
- Week 6: Integrations
- Week 7: Testing
- Week 8: Launch

## Budget: $45,000`,
    folderId: 'projects',
    createdAt: now - 5 * oneDay,
    updatedAt: now - 5 * oneDay,
    pinned: false,
    tags: ['project', 'expenses', 'portal'],
    deleted: false,
  },
  {
    id: '8',
    title: 'Database Details',
    content: `# Database Architecture Documentation

## Schema Design

### Users Table
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Projects Table
\`\`\`sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Tasks Table
\`\`\`sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'todo',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Indexing Strategy
- B-tree indexes on foreign keys
- GIN index on full-text search columns
- Partial indexes for active records
- Composite indexes for common queries

## Backup & Recovery
- Daily automated backups
- Point-in-time recovery enabled
- 30-day retention policy
- Quarterly disaster recovery drills

## Performance Optimization
- Connection pooling (max 100 connections)
- Query caching with Redis
- Read replicas for analytics
- Partitioning for large tables`,
    folderId: 'projects',
    createdAt: now - 6 * oneDay,
    updatedAt: now - 6 * oneDay,
    pinned: false,
    tags: ['database', 'architecture', 'postgresql'],
    deleted: false,
  },
  {
    id: '9',
    title: 'Veo - AI Models',
    content: `# AI/ML Models Documentation

## Current Models in Production

### 1. Price Prediction Model (LSTM)
**Purpose:** Predict next-day stock/options prices

**Architecture:**
- Input Layer: 50 timesteps x 20 features
- LSTM Layer 1: 128 units, dropout 0.2
- LSTM Layer 2: 64 units, dropout 0.2
- Dense Layer: 32 units, ReLU activation
- Output Layer: 1 unit (price prediction)

**Performance:**
- Training MAE: 0.023
- Validation MAE: 0.031
- Test MAE: 0.029

### 2. Sentiment Analysis Model (BERT)
**Purpose:** Analyze market sentiment from news/social media

**Configuration:**
- Base Model: bert-base-uncased
- Fine-tuning: Financial news corpus (500K articles)
- Classification: Bullish / Neutral / Bearish

**Metrics:**
- Accuracy: 91.2%
- Precision: 0.89
- Recall: 0.93

### 3. Anomaly Detection (Isolation Forest)
**Purpose:** Detect unusual trading patterns

**Parameters:**
- n_estimators: 200
- contamination: 0.05
- max_samples: 1000

**Use Cases:**
- Flash crash detection
- Volume spike alerts
- Unusual option flows

## Model Monitoring
\`\`\`python
# Daily monitoring script
def monitor_model_drift():
    current_performance = evaluate_model(test_data)
    baseline_performance = load_baseline()
    
    if current_performance['mae'] > baseline_performance['mae'] * 1.15:
        trigger_retrain_alert()
        log_drift_event()
\`\`\`

## Retraining Schedule
- **Weekly:** Incremental training with new data
- **Monthly:** Full retraining with hyperparameter tuning
- **Quarterly:** Architecture review and update`,
    folderId: 'projects',
    createdAt: now - 7 * oneDay,
    updatedAt: now - 7 * oneDay,
    pinned: false,
    tags: ['ai', 'ml', 'models', 'trading'],
    deleted: false,
  },
  {
    id: '10',
    title: 'AI/India',
    content: `# AI Industry Analysis - India Market

## Market Overview (2025)

### Market Size
- Total AI Market: $7.8 billion
- Expected Growth: 28% CAGR
- Projected 2030 Value: $28 billion

### Key Sectors Adopting AI

1. **BFSI (Banking & Financial Services)**
   - 🏦 Fraud detection systems
   - 💳 Credit scoring automation
   - 📊 Risk assessment models
   - 💰 Investment Advisory (Robo-advisors)

2. **Healthcare**
   - 🏥 Medical image analysis
   - 💊 Drug discovery
   - 🔬 Predictive diagnostics
   - 📱 Telemedicine AI assistants

3. **Retail & E-commerce**
   - 🛍️ Personalized recommendations
   - 📦 Inventory optimization
   - 🤖 Chatbots for customer service
   - 📈 Demand forecasting

4. **Agriculture**
   - 🌾 Crop yield prediction
   - 🚜 Precision farming
   - 🐛 Pest detection
   - 💧 Water management

## Leading Indian AI Companies

| Company | Focus Area | Funding |
|---------|-----------|---------|
| Niramai | Healthcare AI | $18M |
| Kalaari AI | Enterprise AI | $45M |
| SigTuple | Medical diagnostics | $19M |
| Niki.ai | Conversational AI | $25M |

## Government Initiatives
- **NITI Aayog:** National AI Strategy
- **AI for All:** Skill development program
- **RAISE 2025:** Annual AI summit
- **Funding:** ₹4,000 crore allocated

## Challenges
- ⚠️ Data privacy regulations
- 🎓 Talent shortage
- 💰 High infrastructure costs
- 🔒 Cybersecurity concerns

## Opportunities
- 🌏 Large talent pool
- 📊 Vast datasets
- 💡 Growing startup ecosystem
- 🏛️ Government support`,
    folderId: 'ideas',
    createdAt: now - 8 * oneDay,
    updatedAt: now - 8 * oneDay,
    pinned: false,
    tags: ['ai', 'india', 'market', 'analysis'],
    deleted: false,
  },
  {
    id: '11',
    title: 'Deployment Steps',
    content: `# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review approved
- [ ] No critical vulnerabilities (npm audit)
- [ ] Lighthouse score > 90
- [ ] Performance benchmarks met

### Configuration
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] CDN configured
- [ ] Monitoring tools setup

## Deployment Process

### Step 1: Database Migration
\`\`\`bash
# Backup current database
pg_dump -U postgres -d production > backup_$(date +%Y%m%d).sql

# Run migrations
npm run migrate:production
\`\`\`

### Step 2: Build Application
\`\`\`bash
# Install dependencies
npm ci --production

# Build assets
npm run build

# Run post-build checks
npm run verify:build
\`\`\`

### Step 3: Deploy to Staging
\`\`\`bash
# Deploy to staging environment
npm run deploy:staging

# Run smoke tests
npm run test:smoke
\`\`\`

### Step 4: Production Deployment
\`\`\`bash
# Create deployment tag
git tag -a v1.2.3 -m "Release v1.2.3"

# Deploy with zero-downtime
npm run deploy:production --strategy=rolling

# Monitor deployment
npm run monitor:deploy
\`\`\`

## Post-Deployment

### Verification
- [ ] Health check endpoint responding
- [ ] Critical user flows working
- [ ] Error rates within threshold
- [ ] Performance metrics normal
- [ ] Database connections stable

### Monitoring
\`\`\`bash
# Watch error logs
tail -f /var/log/app/error.log

# Monitor metrics
npm run dashboard:production
\`\`\`

### Rollback Plan
\`\`\`bash
# If issues detected
npm run rollback:previous

# Restore database if needed
psql -U postgres -d production < backup_YYYYMMDD.sql
\`\`\`

## Communication
- [ ] Notify team of deployment start
- [ ] Update status page
- [ ] Send completion announcement
- [ ] Document any issues encountered`,
    folderId: 'projects',
    createdAt: now - 9 * oneDay,
    updatedAt: now - 9 * oneDay,
    pinned: false,
    tags: ['deployment', 'devops', 'production'],
    deleted: false,
  },
  {
    id: '12',
    title: 'Open VPN',
    content: `# OpenVPN Setup Guide

## Server Installation (Ubuntu 22.04)

### Install OpenVPN
\`\`\`bash
sudo apt update
sudo apt install openvpn easy-rsa
\`\`\`

### Setup CA and Certificates
\`\`\`bash
make-cadir ~/openvpn-ca
cd ~/openvpn-ca
source vars
./clean-all
./build-ca
./build-key-server server
./build-dh
openvpn --genkey --secret keys/ta.key
\`\`\`

### Configure Server
\`\`\`bash
sudo cp ~/openvpn-ca/keys/{server.crt,server.key,ca.crt,dh2048.pem,ta.key} /etc/openvpn/
sudo gunzip -c /usr/share/doc/openvpn/examples/sample-config-files/server.conf.gz | sudo tee /etc/openvpn/server.conf
\`\`\`

### Server Configuration
\`\`\`conf
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh2048.pem
server 10.8.0.0 255.255.255.0
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
keepalive 10 120
tls-auth ta.key 0
cipher AES-256-CBC
user nobody
group nogroup
persist-key
persist-tun
status openvpn-status.log
verb 3
\`\`\`

### Enable IP Forwarding
\`\`\`bash
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
\`\`\`

### Start Service
\`\`\`bash
sudo systemctl start openvpn@server
sudo systemctl enable openvpn@server
\`\`\`

## Client Setup

### Generate Client Certificates
\`\`\`bash
cd ~/openvpn-ca
source vars
./build-key client1
\`\`\`

### Client Configuration
\`\`\`conf
client
dev tun
proto udp
remote your-server-ip 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
tls-auth ta.key 1
cipher AES-256-CBC
verb 3
\`\`\`

## Troubleshooting

### Check Status
\`\`\`bash
sudo systemctl status openvpn@server
sudo tail -f /var/log/openvpn.log
\`\`\`

### Test Connection
\`\`\`bash
ping 10.8.0.1
traceroute google.com
\`\`\``,
    folderId: 'projects',
    createdAt: now - 10 * oneDay,
    updatedAt: now - 10 * oneDay,
    pinned: false,
    tags: ['vpn', 'security', 'networking'],
    deleted: false,
  },
  {
    id: '13',
    title: 'Recipe: Thai Green Curry',
    content: `# Authentic Thai Green Curry 🍛

## Ingredients

### For the Curry Paste
- 10-15 green Thai chilies
- 4 shallots, chopped
- 6 garlic cloves
- 2 lemongrass stalks (white part only)
- 1 inch galangal, sliced
- 2 tsp coriander seeds
- 1 tsp cumin seeds
- 1 tsp shrimp paste
- Zest of 1 lime
- Handful of cilantro (roots and stems)

### For the Curry
- 2 cans (800ml) coconut milk
- 500g chicken thigh, cubed
- 1 cup Thai eggplant, quartered
- 1 cup bamboo shoots
- 4-5 kaffir lime leaves
- 2 tbsp fish sauce
- 1 tbsp palm sugar
- Thai basil leaves
- Red chilies for garnish

## Instructions

### 1. Make Curry Paste
Blend all paste ingredients until smooth. Add a splash of water if needed.

### 2. Cook Curry Base
1. Heat 1/2 cup coconut cream in wok
2. Add 3-4 tbsp curry paste
3. Fry until fragrant and oil separates (5 mins)

### 3. Add Protein
1. Add chicken, stir to coat
2. Cook until chicken is sealed

### 4. Add Liquid
1. Pour in remaining coconut milk
2. Add kaffir lime leaves
3. Bring to simmer

### 5. Add Vegetables
1. Add eggplant and bamboo shoots
2. Cook for 10 minutes
3. Season with fish sauce and palm sugar

### 6. Finish
1. Tear in Thai basil leaves
2. Garnish with sliced red chilies
3. Serve with jasmine rice

## Chef's Tips
💡 Toast coriander and cumin seeds before grinding
💡 Use coconut cream from top of can for frying paste
💡 Don't overcook vegetables - they should have a bite
💡 Adjust spice level by varying chilies

**Prep Time:** 30 min | **Cook Time:** 25 min | **Serves:** 4`,
    folderId: 'personal',
    createdAt: now - 15 * oneDay,
    updatedAt: now - 15 * oneDay,
    pinned: false,
    tags: ['recipe', 'cooking', 'thai'],
    deleted: false,
  },
  {
    id: '14',
    title: 'Book Notes: Atomic Habits',
    content: `# Atomic Habits by James Clear

## Key Concepts

### The Four Laws of Behavior Change

1. **Make it Obvious**
   - Use implementation intentions: "I will [BEHAVIOR] at [TIME] in [LOCATION]"
   - Habit stacking: "After [CURRENT HABIT], I will [NEW HABIT]"
   - Design your environment for success

2. **Make it Attractive**
   - Temptation bundling
   - Join a culture where desired behavior is normal
   - Reframe your mindset

3. **Make it Easy**
   - Reduce friction for good habits
   - Increase friction for bad habits
   - Two-minute rule: downscale habits
   - Automate your habits

4. **Make it Satisfying**
   - Use reinforcement
   - Make "doing nothing" enjoyable
   - Use habit tracker
   - Never miss twice

## The Aggregation of Marginal Gains

> "If you get 1% better each day for one year, you'll end up 37 times better."

### The Compound Effect
- Day 1: 1.00
- Day 30: 1.34
- Day 365: 37.78

## Identity-Based Habits

Don't focus on outcomes, focus on identity:
- ❌ "I want to run a marathon"
- ✅ "I am a runner"

## The Habit Loop

\`\`\`
Cue → Craving → Response → Reward
\`\`\`

## Practical Applications

### Morning Routine
1. Wake up at 6 AM (cue)
2. Drink water immediately
3. 10-minute meditation
4. 30-minute exercise
5. Healthy breakfast
6. Review daily goals

### Breaking Bad Habits
- Remove cues from environment
- Make it unattractive (reframe)
- Make it difficult (increase friction)
- Make it unsatisfying (accountability partner)

## Favorite Quotes

> "You do not rise to the level of your goals. You fall to the level of your systems."

> "Every action you take is a vote for the type of person you wish to become."

> "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game."

## My Action Items
- [ ] Set up habit tracker
- [ ] Design environment for success
- [ ] Implement 2-minute rule for reading
- [ ] Find accountability partner
- [ ] Review identity-based goals monthly`,
    folderId: 'personal',
    createdAt: now - 20 * oneDay,
    updatedAt: now - 20 * oneDay,
    pinned: true,
    tags: ['books', 'productivity', 'habits'],
    deleted: false,
  },
];