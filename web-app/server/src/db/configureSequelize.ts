import { DataTypes, Model, Sequelize } from "sequelize";

type Maybe<T> = T | null;

const configureSequelizeModels = async (sequelize: Sequelize) => {

    interface UserInstance extends Model {
        id: string;
        email: string;
        name: string;
    }

    const User = sequelize.define<UserInstance>("User", {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
        },
        email: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING,
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {
        tableName: "Users",
        updatedAt: false,
        paranoid: true,
    })

    interface FeedbackInstance extends Model {
        id: string;
        letterSubject: string,
        letterData: string,
    }

    const Feedback = sequelize.define<FeedbackInstance>("Feedback", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        letterSubject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        letterData: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        tableName: "Feedbacks",
        updatedAt: false,
        paranoid: true,
    })

    User.hasMany(Feedback);
    Feedback.belongsTo(User, { 
        foreignKey: "userID",
    });

    interface TaskInfoInstance extends Model {
        taskID: string;
        attemptNumber: number;
        type: Maybe<string>;
        status: string;
        phaseName: string;
        currentPhase: number;
        progress: number;
        maxPhase: number;
        errorMsg: Maybe<string>;
        elapsedTime: number;
    }

    const TaskInfo = sequelize.define<TaskInfoInstance>("TaskInfo", {
        taskID: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        attemptNumber: {
            allowNull: false,
            defaultValue: 0,
            type: DataTypes.INTEGER,
        },
        type: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        status: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        phaseName: {
            type: DataTypes.STRING,
        },
        currentPhase: {
            type: DataTypes.INTEGER,
        },
        progress: {
            defaultValue: 0,
            type: DataTypes.FLOAT
        },
        maxPhase: {
            type: DataTypes.INTEGER,
        },
        errorMsg: {
            type: DataTypes.STRING,
        },
        elapsedTime: {
            type: DataTypes.REAL,
        }
    }, {
        tableName: "TasksInfo",
        updatedAt: false,
        paranoid: true,
    });

    User.hasMany(TaskInfo, { foreignKey: "userID" });
    TaskInfo.belongsTo(User, { foreignKey: "userID" });

    interface FileInfoInstance extends Model {
        ID: string;
        isBuiltInDataset: Boolean;
        mimeType: string;
        encoding: string;
        fileName: string;
        originalFileName: string;
        hasHeader: boolean;
        renamedHeader: string;
        rows: number;
        path: string;
        delimiter: string;
    }

    const FileInfo = sequelize.define<FileInfoInstance>('FileInfo', {
        ID: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        isBuiltInDataset: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        mimeType: {
            type: DataTypes.STRING,
        },
        encoding: {
            type: DataTypes.STRING,
        },
        fileName: {
            type: DataTypes.TEXT,
        },
        originalFileName: {
            allowNull: false,
            type: DataTypes.TEXT,
        },
        hasHeader: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
        delimiter: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        renamedHeader: {
            type: DataTypes.TEXT,
        },
        rows: {
            type: DataTypes.INTEGER,
        },
        path: {
            unique: true,
            type: DataTypes.STRING,
        }
    }, {
        paranoid: true,
        updatedAt: false,
        createdAt: false,
        tableName: "FilesInfo"
    })

    interface TaskConfigInstance extends Model {
        algorithmName: string;
        fileID: string;
    }

    const TaskConfig = sequelize.define<TaskConfigInstance>("TaskConfig", {
        taskID: {
            primaryKey: true,
            type: DataTypes.UUID,
        },
        algorithmName: { 
            allowNull: false,
            type: DataTypes.STRING,
        }
    }, {
        tableName: "TasksConfig",
        updatedAt: false,
    });

    TaskInfo.hasOne(TaskConfig, {
        foreignKey: "taskID"
    });
    TaskConfig.belongsTo(TaskInfo, {
        foreignKey: "taskID",
    });

    FileInfo.hasOne(TaskConfig, {
        foreignKey: "fileID"
    });
    TaskConfig.belongsTo(FileInfo, {
        foreignKey: "fileID"
    });

    interface FDTaskConfigInstance extends Model {
        errorThreshold: number,
        maxLHS: number,
        threadsCount: number,
    }

    interface CFDTaskConfigInstance extends Model {
        maxLHS: number,
        minSupport: number,
        minConfidence: number,
    }

    const FDTaskConfig = sequelize.define<FDTaskConfigInstance>("FDTaskConfig", {
        taskID: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        errorThreshold: {
            allowNull: false,
            type: DataTypes.REAL,
        },
        maxLHS: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        threadsCount: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
    }, {
        tableName: "FDTasksConfig",
        updatedAt: false,
    });

    const CFDTaskConfig = sequelize.define<CFDTaskConfigInstance>("CFDTaskConfig", {
        taskID: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        maxLHS: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        minSupport: {
            allowNull: false,
            type: DataTypes.REAL,
        },
        
        minConfidence: {
            allowNull: false,
            type: DataTypes.REAL,
        },
    }, {
        tableName : "CFDTasksConfig",
        updatedAt: false,
    });

    TaskInfo.hasOne(FDTaskConfig, {
        foreignKey: "taskID"
    });
    FDTaskConfig.belongsTo(TaskInfo, {
        foreignKey: "taskID",
    });

    TaskInfo.hasOne(CFDTaskConfig, {
        foreignKey: "taskID"
    });
    CFDTaskConfig.belongsTo(TaskInfo, {
        foreignKey: "taskID",
    });

    interface FDTaskResultInstance extends Model {
        taskID: string;
        PKColumnIndices: string,
        FDs: string,
        pieChartData: string,
    }

    interface CFDTaskResultInstance extends Model {
        taskID: string,
        PKColumnIndices: string,
        CFDs: string,
        pieChartData: string,
    }

    const FDTaskResult = sequelize.define<FDTaskResultInstance>("FDTaskResult", {
        taskID: {
            primaryKey: true,
            type: DataTypes.UUID,
        },
        PKColumnIndices: {
            type: DataTypes.TEXT,
        },
        FDs: {
            type: DataTypes.TEXT,
        },
        pieChartData: {
            type: DataTypes.TEXT,
        }
    }, {
        tableName: "FDTasksResult",
        updatedAt: false,
    });

    const CFDTaskResult = sequelize.define<CFDTaskResultInstance>("CFDTaskResult", {
        taskID: {
            primaryKey: true,
            type: DataTypes.UUID,
        },
        PKColumnIndices: {
            type: DataTypes.TEXT,
        },
        CFDs: {
            type: DataTypes.TEXT,
        },
        pieChartData: {
            type: DataTypes.TEXT,
        }
    }, {
        tableName: "CFDTasksResult",
        updatedAt: false,
    });

    TaskInfo.hasOne(FDTaskResult, {
        foreignKey: "taskID"
    });
    FDTaskResult.belongsTo(TaskInfo, {
        foreignKey: "taskID",
    });

    TaskInfo.hasOne(CFDTaskResult, {
        foreignKey: "taskID"
    });
    CFDTaskResult.belongsTo(TaskInfo, {
        foreignKey: "taskID",
    });


    const force = Boolean(process.env.DB_FORCE_TABLES_RECREATION);
    await sequelize.sync({ force : force });
}

export = configureSequelizeModels;
