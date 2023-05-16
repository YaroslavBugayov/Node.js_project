import {Invite, PrismaClient, Status, User} from "@prisma/client";
import {ApiError} from "../errors/api.error";
import SentInviteDto from "../dtos/sentInvite.dto";
import ReceivedInviteDto from "../dtos/receivedInvite.dto";

const prisma = new PrismaClient();

export const inviteService = {
    async send(senderId: number, recipient: string) : Promise<SentInviteDto> {
        const senderDb: User | null = await prisma.user.findUnique({
            where: {
                id: senderId
            }
        });

        const recipientDb: User | null = await prisma.user.findUnique({
            where: {
                username: recipient
            }
        });

        if (senderDb?.username == recipient) {
            throw ApiError.BadRequest("Sender coincides with recipient")
        }

        if (!senderDb) {
            throw ApiError.BadRequest("Sender not found");
        }
        if (!recipientDb) {
            throw ApiError.BadRequest("Recipient not found");
        }

        const existingInvite = await prisma.invite.findFirst({
            where: {
                senderId: senderDb.id,
                recipientId: recipientDb.id
            }
        });
        if (existingInvite != null) {
            throw ApiError.BadRequest("Invite already exists");
        }

        const invite = await prisma.invite.create({
            data: {
                senderId: senderDb.id,
                recipientId: recipientDb.id,
                status: Status.SENT
            }
        });

        return new SentInviteDto(recipientDb.username, invite.status);
    },

    async getReceived(id: number) : Promise<ReceivedInviteDto[]> {
        const invites: Invite[] = await prisma.invite.findMany({
            where: {
                recipientId: id
            }
        });
        const inviteDTOs: ReceivedInviteDto[] = await Promise.all(invites.map(async invite => {
            const sender: User | null = await prisma.user.findUnique({
                where: {
                    id: invite.senderId
                }
            });
            const senderUsername = sender ? sender.username : 'Unknown user';
            return new ReceivedInviteDto(senderUsername, invite.status);
        }));
        return inviteDTOs;
    },

    async answer(id: number, sender: string, status: string) : Promise<ReceivedInviteDto> {
        if (!(status in Status)) {
            throw ApiError.BadRequest("Unknown status");
        }
        const senderDb: User | null = await prisma.user.findUnique({
            where: {
                username: sender
            }
        });
        if (!senderDb) {
            throw ApiError.BadRequest("Sender not found");
        }

        const inviteDb: Invite | null = await prisma.invite.findFirst({
            where: {
                senderId: senderDb.id
            }
        });

        if (!inviteDb) {
            throw ApiError.BadRequest("Invite not found");
        }

        const invite: Invite = await prisma.invite.update({
            where: {
                id: inviteDb?.id
            },
            data: {
                status: status as Status
            }
        })

        return new ReceivedInviteDto(sender, invite.status);
    }
}