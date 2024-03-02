import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

import { GraphQLSchema, graphql, parse, validate } from 'graphql';

import { queries } from './/queries.js';
import { mutations } from './mutations.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {

      const queriesSchema = new GraphQLSchema({
        query: queries,
        mutation: mutations
      });

      const errors = validate(queriesSchema, parse(req.body.query), [depthLimit(5)]);

      if(errors.length) {
        return { errors };
      }

      const result = await graphql({
        schema: queriesSchema,
        source: req.body.query,
        contextValue: { prisma,
          dataloaders: new WeakMap(),
        },
        variableValues: req.body.variables,
      });
      return result;
    },
  });
};



export default plugin;
