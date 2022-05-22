import { Code, CodeType } from "../../../db/models/UserData/Code";
import { ApolloError } from "apollo-server-core";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.POSTFIX_HOST,
    port: 25,
    ignoreTLS: true,
});

export const sendVerificationCode = async (
    code: number,
    userEmail: string,
    type: CodeType
) => {
    let text: string | undefined;

    if (type === "EMAIL_VERIFICATION") {
        text = `Your email verification code is: ${code}`;
    } else if (type === "PASSWORD_RECOVERY_PENDING") {
        text = `Your code for password recovery is : ${code}`;
    } else {
        throw new ApolloError("INTERNAL SERVER ERROR");
    }

    return await transporter.sendMail({
        from: `Desbordante Enjoyer <${process.env.POSTFIX_EMAIL}>`,
        to: userEmail,
        subject: "Email verification code",
        text,
    });
};

export const createAndSendVerificationCode = async (
    userID: string,
    deviceID: string,
    userEmail: string,
    type: CodeType,
    logger?: typeof console.log
) => {
    const code = await Code.createVerificationCode(userID, deviceID, type);
    if (process.env.POSTFIX_ENABLED === "true") {
        try {
            await sendVerificationCode(code.value, userEmail, type);
        } catch (e) {
            logger && logger("Problem while sending verification code", e);
            throw new ApolloError("INTERNAL SERVER ERROR");
        }
        logger && logger("Code was sent to email");
    } else {
        logger && logger("Code wasn't sent to email [POSTFIX DISABLED]");
        logger && logger(`Issue new verification code = ${code.value}`);
    }
};
