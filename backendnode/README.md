npm init -y

npm install express dotenv cors helmet morgan

npm install --save-dev nodemon

mkdir -p src/{config,controllers,middleware,models,routes,services,utils}
mkdir -p tests

npm install sequelize pg pg-hstore


PostGreSql

sudo -u postgres psql

CREATE DATABASE node_ai_leads;

CREATE USER node_ai_user WITH PASSWORD 'node_ai_password';

GRANT ALL PRIVILEGES ON DATABASE node_ai_leads TO node_ai_user;

\c node_ai_leads

GRANT ALL ON SCHEMA public TO node_ai_user;

\q

sudo -u postgres psql node_ai_leads

CREATE INDEX IF NOT EXISTS idx_leads_status
ON leads (status);

CREATE INDEX IF NOT EXISTS idx_leads_created_at
ON leads ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_leads_status_created_at
ON leads (status, "createdAt" DESC);

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS "userId" INTEGER
REFERENCES users(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_leads_user_created
ON leads ("userId", "createdAt" DESC);


CREATE DATABASE node_ai_leads_test OWNER node_ai_user;
\q

npm install bcryptjs jsonwebtoken

7. PostgreSQL optimization
        ↓
8. AI Lead Analyzer
        ↓
9. Redis caching
        ↓
10. RabbitMQ background jobs
        ↓
11. Unit + integration testing
        ↓
12. Docker
        ↓
13. AWS deployment
        ↓
14. Microservice architecture

----
React / Postman

 npm install --save-dev jest supertest
 npm install multer

 GRANT ALL PRIVILEGES ON TABLE users TO node_ai_user;

GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO node_ai_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO node_ai_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO node_ai_user;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';

-- Check existing enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

-- If needed, add missing values:
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dealer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS price_breakup VARCHAR(100),
ADD COLUMN IF NOT EXISTS property_sub_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS project_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS locality VARCHAR(150),
ADD COLUMN IF NOT EXISTS carpet_area_sqft NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS balconies INTEGER,
ADD COLUMN IF NOT EXISTS furnishing VARCHAR(50),
ADD COLUMN IF NOT EXISTS facing VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS availability VARCHAR(50),
ADD COLUMN IF NOT EXISTS construction_age VARCHAR(100),
ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS parking_spaces INTEGER,
ADD COLUMN IF NOT EXISTS parking_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS rera_registered BOOLEAN,
ADD COLUMN IF NOT EXISTS rera_number VARCHAR(100);


ALTER TABLE users 
ADD COLUMN is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'agent';