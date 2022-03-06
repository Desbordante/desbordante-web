import nodemailer from "nodemailer";

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

export const sendVerificationCode = async (code: number, userEmail: string) => {
    return await transporter.sendMail({
        from: "Desbordante enjoyer <sashasmolenfab@gmail.com>",
        to: userEmail,
        subject: "Email verification code",
        text: `Your verification code is: ${code}.`,
    });
};
