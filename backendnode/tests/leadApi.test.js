
import request from "supertest";
import app from "../src/app";

import { sequelize }  from "../src/config/database.js";
import User from "../src/models/User.js";
import Lead  from "../src/models/Lead.js";

let token;
let secondUserToken;

export const registerAndLogin = async (name, email) => {
    await request(app)
        .post("/api/v1/auth/register")
        .send({
            name,
            email,
            password: "TestPassword123!",
        })
        .expect(201);

    const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
            email,
            password: "TestPassword123!",
        })
        .expect(200);

    return response.body.data.token;
};

beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error(
            "Refusing to run tests unless NODE_ENV=test"
        );
    }

    await sequelize.authenticate();

    // Safe only because .env.test points to a dedicated test DB.
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    await Lead.destroy({ where: {} });
    await User.destroy({ where: {} });

    token = await registerAndLogin(
        "Test User",
        "testuser@example.com"
    );

    secondUserToken = await registerAndLogin(
        "Second User",
        "seconduser@example.com"
    );
});

afterAll(async () => {
    await sequelize.close();
});

describe("Lead API", () => {
    test("rejects requests without authentication", async () => {
        await request(app)
            .get("/api/v1/leads")
            .expect(401);
    });

    test("creates a lead for the authenticated user", async () => {
        const response = await request(app)
            .post("/api/v1/leads")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Amit Tiwari",
                email: "amit@example.com",
                company: "GlowbTech",
                message: "Interested in AI automation",
            })
            .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("Amit Tiwari");
        expect(response.body.data.userId).toBeDefined();
    });

    test("rejects invalid lead data", async () => {
        const response = await request(app)
            .post("/api/v1/leads")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "A",
                email: "invalid-email",
                message: "",
            })
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test("does not allow one user to access another user's lead", async () => {
        const created = await request(app)
            .post("/api/v1/leads")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Private Lead",
                email: "private@example.com",
                message: "Private customer information",
            })
            .expect(201);

        const leadId = created.body.data.id;

        await request(app)
            .get(`/api/v1/leads/${leadId}`)
            .set("Authorization", `Bearer ${secondUserToken}`)
            .expect(404);
    });

    test("returns paginated leads", async () => {
        await request(app)
            .post("/api/v1/leads")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Lead One",
                email: "one@example.com",
                message: "First test lead",
            })
            .expect(201);

        const response = await request(app)
            .get("/api/v1/leads?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.total).toBe(1);
        expect(response.body.data).toHaveLength(1);
    });
});