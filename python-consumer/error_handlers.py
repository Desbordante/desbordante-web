import config
import psycopg


def update_error_status(taskID, errorType, error):
    # errorType : INTERNAL SERVER ERROR | RESOURCE LIMIT IS REACHED
    with psycopg.connect(f"dbname={config.POSTGRES_DBNAME} \
    user={config.POSTGRES_USER} password={config.POSTGRES_PASSWORD} \
    host={config.POSTGRES_HOST} port={config.POSTGRES_PORT}") as conn:
        with conn.cursor() as cur:
            sql = f""" UPDATE "{config.DB_TASKS_TABLE_NAME}"
                        SET "errorMsg" = %s, "status" = %s
                        WHERE "taskID" = %s;"""
            error = error.replace("\'", "\'\'")
            cur.execute(sql, (error, errorType, taskID))
            conn.commit()


def update_internal_server_error(taskID, error):
    update_error_status(taskID, "INTERNAL_SERVER_ERROR", error)


def update_resource_limit_error(taskID, error):
    # error: MEMORY LIMIT | TIME LIMIT
    update_error_status(taskID, "RESOURCE_LIMIT_IS_REACHED", error)
