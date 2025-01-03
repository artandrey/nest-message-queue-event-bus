import { ConfigurableModuleBuilder } from '@nestjs/common';
import { Options } from 'amqplib';

export interface RabbitMqModuleOptions {
  connection: Options.Connect;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, ASYNC_OPTIONS_TYPE, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<RabbitMqModuleOptions>().setClassMethodName('register').build();
