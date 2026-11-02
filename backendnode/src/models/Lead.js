import  { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Lead = sequelize.define(
    "Lead",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: true, 
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },

       

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },

        company: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        aiScore: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        aiPriority: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        aiIntent: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        aiSummary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "new",
        },
    },
    {
        tableName: "leads",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default Lead;

