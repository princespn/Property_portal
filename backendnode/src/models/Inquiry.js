import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";
import Property from "./Property.js";

const Inquiry = sequelize.define(
    "Inquiry",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        propertyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "property_id",
            references: {
                model: Property,
                key: "id",
            },
            onDelete: "CASCADE",
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
        buyerName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "buyer_name",
        },
        buyerEmail: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: "buyer_email",
        },
        buyerPhone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: "buyer_phone",
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "inquiries",
        timestamps: true,
    }
);

// Relationships
Property.hasMany(Inquiry, { foreignKey: "propertyId", as: "inquiries" });
Inquiry.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

User.hasMany(Inquiry, { foreignKey: "dealerId", as: "receivedInquiries" });
Inquiry.belongsTo(User, { foreignKey: "dealerId", as: "dealer" });

export default Inquiry;