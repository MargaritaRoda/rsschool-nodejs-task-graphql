import {GraphQLList, GraphQLObjectType} from 'graphql';
import {UUIDType} from './types/uuid.js';
import {FastifyInstance} from 'fastify';

import {Users, Posts, Profiles, MemberType, MemberTypeIdEnum} from './types/dataloaders.js';

export const queries = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        users: {
            type: new GraphQLList(Users),
            resolve: async (_, args, {prisma}: FastifyInstance) => (
                await prisma.user.findMany()
            )
        },
        user: {
            type: Users,
            args: {id: {type: UUIDType}},
            resolve: async (_, args: { id: string }, {prisma}: FastifyInstance) => {
                const result = await prisma.user.findUnique({where: {id: args.id}});

                return result || null;
            }
        },

        posts: {
            type: new GraphQLList(Posts),
            resolve: async (_, args, {prisma}: FastifyInstance) => (await prisma.post.findMany())
        },
        post: {
            type: Posts,
            args: {id: {type: UUIDType}},
            resolve: async (_, args: { id: string }, {prisma}: FastifyInstance) => {
                const result = await prisma.post.findUnique({where: {id: args.id}});
                return result || null;
            }
        },

        profiles: {
            type: new GraphQLList(Profiles),
            resolve: async (_, args, {prisma}: FastifyInstance) => (await prisma.profile.findMany())
        },
        profile: {
            type: Profiles,
            args: {id: {type: UUIDType}},
            resolve: async (_, args: { id: string }, {prisma}: FastifyInstance) => {
                const result = await prisma.profile.findUnique({where: {id: args.id}});
                return result || null;
            }
        },

        memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async (_, args, {prisma}: FastifyInstance) =>
                (await prisma.memberType.findMany())

        },
        memberType: {
            type: MemberType,
            args: {id: {type: MemberTypeIdEnum}},
            resolve: async (_, args: { id: string }, {prisma, httpErrors}: FastifyInstance) => {
                const result = await prisma.memberType.findUnique({where: {id: args.id}});
                if (!result) {
                    throw httpErrors.notFound()
                }
                return result || null;
            }
        }
    }
})