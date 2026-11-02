import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";

const DealerProfile = sequelize.define(
    "DealerProfile",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "user_id",
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        agencyName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: "agency_name",
        },
        licenseNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            field: "license_number",
        },
        officeAddress: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: "office_address",
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_verified",
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "dealer_profiles",
        timestamps: true,
    }
);

// Relationships
User.hasOne(DealerProfile, { foreignKey: "userId", as: "dealerProfile" });
DealerProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

export default DealerProfile;