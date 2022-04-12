import nodemailer from "nodemailer";
import { Code, CodeType } from "../../../db/models/UserInfo/Code";
import { ApolloError } from "apollo-server-core";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PWD,
    },
});

export const sendVerificationCode = async (code: number, userEmail: string, type: CodeType) => {
    let text: string | undefined;

    if (type === "EMAIL_VERIFICATION") {
        text = `Your email verification code is: ${code}`;
    } else if (type === "PASSWORD_RECOVERY_PENDING") {
        text = `Your code for password recovery if : ${code}`;
    } else {
        throw new ApolloError("INTERNAL SERVER ERROR");
    }

    return await transporter.sendMail({
        from: `Desbordante enjoyer <${process.env.NODEMAILER_EMAIL}>`,
        to: userEmail,
        subject: "Email verification code",
        text,
    });
};

export const createAndSendVerificationCode = async (
    userID: string, deviceID: string, userEmail: string, type: CodeType,
    logger?: typeof console.log) => {
    const code = await Code.createVerificationCode(userID, deviceID, type);
    if (process.env.USE_NODEMAILER === "true") {
        try {
            await sendVerificationCode(code.value, userEmail, type);
        } catch (e) {
            logger && logger("Problem while sending verification code", e);
            throw new ApolloError("INTERNAL SERVER ERROR");
        }
        logger && logger("Code was sent to email");
    } else {
        logger && logger("Code wasn't sent to email [NODEMAILER DISABLED]");
        logger && logger(`Issue new verification code = ${code.value}`);
    }
};
