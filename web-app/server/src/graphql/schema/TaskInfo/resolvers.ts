import {QueryResolvers} from "../../types/types";
import {Pool} from "pg";


const Query: QueryResolvers = {
    taskInfo: async (obj, { id }, { pool } : { pool : Pool}) => {
        let query = `select status, fileName, trim(algName) as algorithmName, errorPercent, progress, currentPhase
                     from ${process.env.DB_TASKS_TABLE_NAME}
                     where taskid = '${id}' and "status" != 'CANCELLED'`;
        return await pool.query(query)
            .then(({ rows }) => {
                if (rows.length !== 1) {
                    console.log('return0');
                    return {
                        __typename: "TaskNotFoundError",
                        msg: `The task with the id ${id} does not exist.`,
                    };
                } else {
                    console.log(rows[0]);
                    const data: any = {
                        ID: id,
                        phaseName: rows[0].phasename,
                        progress: rows[0].progress,
                        currentPhase: rows[0].currentphase,
                        msg: rows[0].status,
                        fileName: rows[0].filename,
                        algorithmName: rows[0].algorithmname,
                        errorThreshold: rows[0].errorpercent
                    };
                    return {
                        __typename: "BaseTaskInfo",
                        ...data
                    };
                }
            })
            .catch(err => {
                throw new Error(err);
            });
    },
    TaskStatus:
}

export default { Query };
