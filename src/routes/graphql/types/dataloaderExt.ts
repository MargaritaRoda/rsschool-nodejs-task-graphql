/* eslint-disable @typescript-eslint/no-explicit-any */
import DataLoader from 'dataloader';

declare module 'fastify' {
    export interface FastifyInstance {
        dataloaders: WeakMap<any, DataLoader<any, any>>;
    }
}