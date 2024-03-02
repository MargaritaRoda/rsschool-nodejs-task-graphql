import { GraphQLBoolean, GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";
import { MemberTypeIdEnum } from "./dataloaders.js";


export const createPost = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: ()=>({
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(UUIDType) }
    })
})

export const createProfile = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
        userId: { type: new GraphQLNonNull(UUIDType) },
    })
})

export const createUser = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
    })
})

export const updatePost = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
        title: { type: GraphQLString },
        content: { type: GraphQLString }
    })
})

export const updateProfile = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
        memberTypeId: {type: MemberTypeIdEnum}
    })
})

export const updateUser = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    })
})

// export const createUserSubscribeTo = new GraphQLInputObjectType({
//     name: 'createUserSubscribeToInput',
//     fields: () => ({
//         authorId: { type: UUIDType },
//     })
// })