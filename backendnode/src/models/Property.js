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