import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";

const Property = sequelize.define(
    "Property",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        dealerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "dealer_id",
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        propertyType: {
            type: DataTypes.ENUM(
                "apartment",
                "house",
                "plot",
                "commercial"
            ),
            allowNull: false,
            field: "property_type",
        },

        listingType: {
            type: DataTypes.ENUM("sale", "rent"),
            allowNull: false,
            field: "listing_type",
        },

        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },

        areaSqft: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: "area_sqft",
        },

        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        bathrooms: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        pincode: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
        },

        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
        },

        amenities: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
        },

        status: {
            type: DataTypes.ENUM(
                "draft",
                "pending_approval",
                "active",
                "sold",
                "rejected"
            ),
            allowNull: false,
            defaultValue: "pending_approval",
        },
    
    
priceBreakup: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "price_breakup",
},

// Property subtype: Villa, Independent House, etc.
propertySubType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "property_sub_type",
},

// Project information
projectName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: "project_name",
},

locality: {
    type: DataTypes.STRING(150),
    allowNull: true,
},

// Area details
carpetAreaSqft: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: "carpet_area_sqft",
},

// Property specifications
balconies: {
    type: DataTypes.INTEGER,
    allowNull: true,
},

furnishing: {
    type: DataTypes.STRING(50),
    allowNull: true,
},

facing: {
    type: DataTypes.STRING(50),
    allowNull: true,
},

// Transaction and construction
transactionType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "transaction_type",
},

availability: {
    type: DataTypes.STRING(50),
    allowNull: true,
},

constructionAge: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "construction_age",
},

ownershipType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "ownership_type",
},


parkingSpaces: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "parking_spaces",
},

parkingType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: "parking_type",
},


reraRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: "rera_registered",
},

reraNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: "rera_number",
},
    },
    {
        tableName: "properties",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

User.hasMany(Property, {
    foreignKey: "dealerId",
    as: "properties",
});

Property.belongsTo(User, {
    foreignKey: "dealerId",
    as: "dealer",
});

export default Property;