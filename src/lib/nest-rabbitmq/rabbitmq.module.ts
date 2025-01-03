import { DynamicModule, Module } from '@nestjs/common';
import amqplib from 'amqplib';

import { RABBITMQ_CONNECTION } from './constants';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } from './rabbitmq.module-definition';

type Options = typeof OPTIONS_TYPE;

@Module({})
export class RabbitMqModule extends ConfigurableModuleClass {
  static forRoot(options: Options): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [
        {
          provide: RABBITMQ_CONNECTION,
          useFactory: async () => {
            const connection = await amqplib.connect(options.connection);
            return connection;
          },
        },
      ],
      exports: [RABBITMQ_CONNECTION],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [
        {
          provide: RABBITMQ_CONNECTION,
          useFactory: async (options: Options) => {
            const connection = await amqplib.connect(options.connection);
            return connection;
          },
          inject: [MODULE_OPTIONS_TOKEN],
        },
      ],
      exports: [RABBITMQ_CONNECTION],
    };
  }
}
