import {Post, Profile, User} from "@prisma/client";
import {FastifyInstance} from "fastify";
import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from "graphql";
import {UUIDType} from "./uuid.js";
import DataLoader from "dataloader";
import {MemberTypeId} from "../../member-types/schemas.js";


export const MemberTypeIdEnum = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        [MemberTypeId.BASIC]: {value: MemberTypeId.BASIC},
        [MemberTypeId.BUSINESS]: {value: MemberTypeId.BUSINESS},
    },
});

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: {type: new GraphQLNonNull(MemberTypeIdEnum)},
        discount: {type: GraphQLFloat},
        postsLimitPerMonth: {type: GraphQLInt},
    })
});


export const Posts = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        title: {type: GraphQLString},
        content: {type: GraphQLString},

        authorId: {type: UUIDType},

        author: {
            type: Users,
            resolve: async (source: Post, _, {prisma, dataloaders}: FastifyInstance, info) => {
                let newDataLoader = dataloaders.get(info.fieldNodes);
                if (!newDataLoader) {
                    newDataLoader = new DataLoader(async (manyId: readonly string[]) => {
                        const result = await prisma.user.findMany({
                            where: {id: {in: manyId as string[]}},
                        })

                        return manyId.map((id: string) => result.find(post => post.id === id));
                    });
                    dataloaders.set(info.fieldNodes, newDataLoader);
                }
                return newDataLoader.load(source.id);
            },
        },
    }),
});

export const Profiles = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        isMale: {type: GraphQLBoolean},
        yearOfBirth: {type: GraphQLInt},

        user: {
            type: Users,
            resolve: async (source: Profile, _, {prisma, httpErrors}: FastifyInstance) => {
                const result = await prisma.user.findUnique({where: {id: source.userId}});

                if (!result) {
                    throw httpErrors.notFound()
                }
                return result || null;
            },
        },
        userId: {type: UUIDType},
        memberTypeId: {type: MemberTypeIdEnum},
        memberType: {
            type: MemberType,
            resolve: async (source: Profile, _, {prisma, dataloaders}: FastifyInstance, info) => {
                let newDataLoader = dataloaders.get(info.fieldNodes);

                if (!newDataLoader) {
                    newDataLoader = new DataLoader(async (manyId: readonly string[]) => {
                        const result = await prisma.memberType.findMany({
                            where: {id: {in: manyId as string[]}},
                        })

                        return manyId.map((id: string) => result.find(post => post.id === id));
                    });
                    dataloaders.set(info.fieldNodes, newDataLoader);
                }
                return newDataLoader.load(source.memberTypeId);
            },
        },
    })
});

export const Users: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(UUIDType)},
        name: {type: GraphQLString},
        balance: {type: GraphQLFloat},

        profile: {
            type: Profiles,
            resolve: async (source: User, _, {prisma, dataloaders}: FastifyInstance, info) => {

                let dl = dataloaders.get(info.fieldNodes);

                if (!dl) {
                    dl = new DataLoader(async (manyId: readonly string[]) => {
                        const result = await prisma.profile.findMany({
                            where: {userId: {in: manyId as string[]}},
                        })

                        return manyId.map((id: string) => result.find(x => x.userId === id));
                    });
                    dataloaders.set(info.fieldNodes, dl);
                }

                return dl.load(source.id);
            }
        },
        posts: {
            type: new GraphQLList(Posts),
            resolve: async (source: User, _, context: FastifyInstance, info) => {
                const {dataloaders, prisma} = context;

                let newDataLoader = dataloaders.get(info.fieldNodes);

                if (!newDataLoader) {
                    newDataLoader = new DataLoader(async (manyId: readonly string[]) => {
                        const result = await prisma.post.findMany({
                            where: {authorId: {in: manyId as string[]}},
                        })

                        return manyId.map((id: string) => result.filter(post => post.authorId === id));
                    });
                    dataloaders.set(info.fieldNodes, newDataLoader);
                }
                return newDataLoader.load(source.id);
            }
        },

        userSubscribedTo: {
            type: new GraphQLList(Users),

            resolve: async (source: User, _, {prisma, dataloaders}: FastifyInstance, info) => {

                let dl = dataloaders.get(info.fieldNodes);
                if (!dl) {
                    dl = new DataLoader(async (ids: readonly string[]) => {
                        const result = await prisma.user.findMany({
                            where: {
                                subscribedToUser: {
                                    some: {
                                        subscriberId: {in: ids as string[]},
                                    },
                                },
                            },
                            include: {
                                subscribedToUser: true,
                            }
                        });


                        const sortedInIdsOrder = ids.map(id => result
                            .filter(user => user.subscribedToUser.some((x) => x.subscriberId === id)));


                        return sortedInIdsOrder;
                    });
                    dataloaders.set(info.fieldNodes, dl);
                }
                return dl.load(source.id);
            },
        },
        subscribedToUser: {
            type: new GraphQLList(Users),
            resolve: async (source: User, _, {prisma, dataloaders}: FastifyInstance, info) => {


                let dl = dataloaders.get(info.fieldNodes);

                if (!dl) {
                    dl = new DataLoader(async (ids: readonly string[]) => {
                        console.log('ids: ', ids)
                        const result = await prisma.user.findMany({
                            where: {
                                userSubscribedTo: {
                                    some: {
                                        authorId: {in: ids as string[]},
                                    },
                                },
                            },
                            include: {
                                userSubscribedTo: true,
                            }
                        })


                        const mappedResult = ids.map(id => result
                            .filter(user => user.userSubscribedTo.some((x) => x.authorId === id)))


                        return mappedResult
                    });
                    dataloaders.set(info.fieldNodes, dl);
                }

                return dl.load(source.id);

            },
        },

    }),
});


